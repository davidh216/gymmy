-- Gymmy: automatic video scan (Hive) before entries go live.
-- Run once in the Supabase SQL Editor after the earlier migrations.
-- The scan stays off until you deploy the `moderate-entry` Edge Function, add the
-- HIVE_API_KEY secret, then run:
--   update public.app_settings set value = 'true' where key = 'moderation_enabled';

create table public.app_settings (
  key text primary key,
  value jsonb not null
);
alter table public.app_settings enable row level security; -- no policies: server-side only

insert into public.app_settings (key, value) values ('moderation_enabled', 'false');

create table public.moderation_results (
  entry_id uuid primary key references public.entries (id) on delete cascade,
  provider text not null,
  flagged boolean not null default false,
  flag_class text,
  flag_score numeric,
  -- Set when the scan couldn't run; the entry then waits for a person.
  error text,
  created_at timestamptz not null default now()
);
alter table public.moderation_results enable row level security; -- written by the Edge Function only

-- New entries wait in 'processing' for the scan when it's switched on.
create or replace function public.before_entry_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.profiles where id = new.user_id and banned_at is not null) then
    raise exception 'This account can no longer post.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.entries e
      where e.user_id = new.user_id and e.created_at > now() - interval '1 day') >= 30 then
    raise exception 'Too many attempts today. Try again tomorrow.' using errcode = 'P0001';
  end if;
  new.status := case
    when coalesce((select value = 'true'::jsonb from public.app_settings where key = 'moderation_enabled'), false)
      then 'processing'
    else 'live'
  end;
  new.created_at := now();
  return new;
end;
$$;

-- The review queue now also holds entries the scan flagged or couldn't check,
-- and entries stuck waiting for a scan for more than 15 minutes.
drop function public.admin_review_queue();
create function public.admin_review_queue()
returns table (
  entry_id uuid,
  gym_name text,
  challenge_id text,
  username text,
  value numeric,
  bodyweight_kg numeric,
  video_path text,
  created_at timestamptz,
  inappropriate_reports int,
  invalid_reports int,
  reasons text[],
  scan_flag text,
  scan_score numeric,
  scan_error text,
  status text
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return query
    select e.id, g.name, e.challenge_id, p.username, e.value, e.bodyweight_kg, e.video_path, e.created_at,
      (count(r.*) filter (where r.kind = 'inappropriate'))::int,
      (count(r.*) filter (where r.kind = 'invalid'))::int,
      coalesce(array_remove(array_agg(distinct r.reason), null), '{}'),
      m.flag_class, m.flag_score, m.error, e.status
    from public.entries e
    join public.gyms g on g.id = e.gym_id
    join public.profiles p on p.id = e.user_id
    left join public.reports r on r.entry_id = e.id and not r.resolved
    left join public.moderation_results m on m.entry_id = e.id
    where (e.status = 'hidden' and (r.entry_id is not null or m.flagged or m.error is not null))
       or (e.status = 'processing' and e.created_at < now() - interval '15 minutes')
    group by e.id, g.name, p.username, m.flag_class, m.flag_score, m.error, m.flagged
    order by (m.flagged is true) desc,
      count(r.*) filter (where r.kind = 'inappropriate') desc,
      e.created_at;
end;
$$;

revoke execute on function public.admin_review_queue() from public, anon;
grant execute on function public.admin_review_queue() to authenticated;

-- Resolving also clears entries still waiting for a scan.
create or replace function public.admin_resolve(p_entry uuid, p_decision text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  owner uuid;
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if p_decision not in ('restore', 'remove') then
    raise exception 'Unknown decision %', p_decision;
  end if;

  select user_id into owner from public.entries where id = p_entry;
  if owner is null then
    raise exception 'Entry not found';
  end if;

  if p_decision = 'restore' then
    update public.entries set status = 'live' where id = p_entry;
    update public.profiles set report_rejections = report_rejections + 1
      where id in (select reporter_id from public.reports where entry_id = p_entry and not resolved);
  else
    update public.entries set status = 'removed' where id = p_entry;
    update public.profiles
      set strikes = strikes + 1,
          banned_at = case when strikes + 1 >= 3 then coalesce(banned_at, now()) else banned_at end
      where id = owner;
  end if;
  update public.reports set resolved = true where entry_id = p_entry;
end;
$$;
