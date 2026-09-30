-- Gymmy: admin review, strikes and bans, Sign in with Apple usernames, account deletion.
-- Run once in the Supabase SQL Editor after 20260930000000_gyms.sql.

-- ---------------------------------------------------------------------------
-- Profile flags
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column is_admin boolean not null default false,
  -- False for generated handles (Sign in with Apple has no username); the app asks the user to pick one.
  add column username_set boolean not null default true,
  -- Rejected reports: three and your reports stop counting.
  add column report_rejections int not null default 0,
  -- Set after three strikes for removed entries; banned accounts can't post or report.
  add column banned_at timestamptz;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Accounts without a chosen username (e.g. Sign in with Apple) get a placeholder.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  chosen text := lower(new.raw_user_meta_data ->> 'username');
begin
  if chosen is null or chosen !~ '^[a-z0-9_.]{3,20}$'
     or exists (select 1 from public.profiles where username = chosen) then
    insert into public.profiles (id, username, companion_id, username_set)
    values (
      new.id,
      'lifter_' || substr(md5(new.id::text), 1, 8),
      coalesce(new.raw_user_meta_data ->> 'companion_id', 'kong'),
      false
    );
  else
    insert into public.profiles (id, username, companion_id)
    values (new.id, chosen, coalesce(new.raw_user_meta_data ->> 'companion_id', 'kong'));
  end if;
  return new;
end;
$$;

-- Picking a new username marks it as chosen.
create function public.before_profile_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.username := lower(new.username);
  if new.username is distinct from old.username then
    new.username_set := true;
  end if;
  return new;
end;
$$;

create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.before_profile_update();

-- ---------------------------------------------------------------------------
-- Enforcement: banned accounts can't post; rejected reporters stop counting.
-- ---------------------------------------------------------------------------

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
  -- Becomes 'processing' once the video moderation scan is connected (docs/gyms-spec.md).
  new.status := 'live';
  new.created_at := now();
  return new;
end;
$$;

create or replace function public.before_report_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  reporter public.profiles;
begin
  select * into reporter from public.profiles where id = new.reporter_id;
  new.counted := reporter.created_at <= now() - interval '7 days'
    and reporter.report_rejections < 3
    and reporter.banned_at is null;
  new.resolved := false;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin review
-- ---------------------------------------------------------------------------

-- Hidden entries waiting for a decision, inappropriate-content reports first.
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
  reasons text[]
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return query
    select e.id, g.name, e.challenge_id, p.username, e.value, e.bodyweight_kg, e.video_path, e.created_at,
      count(*) filter (where r.kind = 'inappropriate')::int,
      count(*) filter (where r.kind = 'invalid')::int,
      array_agg(distinct r.reason)
    from public.entries e
    join public.gyms g on g.id = e.gym_id
    join public.profiles p on p.id = e.user_id
    join public.reports r on r.entry_id = e.id and not r.resolved
    where e.status = 'hidden'
    group by e.id, g.name, p.username
    order by count(*) filter (where r.kind = 'inappropriate') desc, e.created_at;
end;
$$;

-- 'restore' puts the entry back and counts a rejection against each reporter.
-- 'remove' takes it down for good and gives the poster a strike (three strikes bans).
create function public.admin_resolve(p_entry uuid, p_decision text) returns void
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

revoke execute on function public.admin_review_queue(), public.admin_resolve(uuid, text) from public, anon;
grant execute on function public.admin_review_queue(), public.admin_resolve(uuid, text) to authenticated;

-- Admins can watch videos of hidden entries to review them.
drop policy "attempts read" on storage.objects;
create policy "attempts read" on storage.objects
  for select to authenticated using (
    bucket_id = 'attempts'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1 from public.entries e
        where e.video_path = storage.objects.name
          and e.status = 'live'
          and public.can_view_gym(e.gym_id)
      )
    )
  );

-- Banned accounts can't file reports.
drop policy "reports file" on public.reports;
create policy "reports file" on public.reports
  for insert to authenticated with check (
    reporter_id = auth.uid()
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.banned_at is not null)
    and exists (
      select 1 from public.entries e
      where e.id = entry_id and e.user_id <> auth.uid() and public.can_view_gym(e.gym_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Account deletion (App Store requirement). Entries, reports, memberships and
-- blocks cascade from the profile; the app deletes the user's videos first.
-- ---------------------------------------------------------------------------

create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
