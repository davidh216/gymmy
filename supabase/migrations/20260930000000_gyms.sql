-- Gymmy: gyms, leaderboards, video entries and reports.
-- Run once in the Supabase SQL Editor (or `supabase db push`). See docs/gyms-spec.md.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  companion_id text not null default 'kong' check (char_length(companion_id) <= 20),
  strikes int not null default 0,
  created_at timestamptz not null default now()
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('public', 'private')),
  name text not null check (char_length(btrim(name)) between 3 and 40),
  area text check (char_length(area) <= 40),
  invite_code text unique,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- One shared entry per public gym, so "Gold's Downtown" isn't added five times.
create unique index gyms_public_name_area on public.gyms (lower(btrim(name)), lower(coalesce(btrim(area), '')))
  where kind = 'public';

create table public.gym_members (
  gym_id uuid not null references public.gyms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  joined_at timestamptz not null default now(),
  primary key (gym_id, user_id)
);

create index gym_members_user on public.gym_members (user_id);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms (id) on delete cascade,
  challenge_id text not null check (challenge_id in (
    'bench_1rm', 'squat_1rm', 'deadlift_1rm', 'ohp_1rm',
    'pullups_max', 'pushups_1min', 'plank_hold', 'row_500m')),
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  value numeric not null check (value > 0 and value < 100000),
  bodyweight_kg numeric check (bodyweight_kg between 20 and 400),
  video_path text not null,
  status text not null default 'live' check (status in ('processing', 'live', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);

create index entries_board on public.entries (gym_id, challenge_id) where status = 'live';
create index entries_global on public.entries (challenge_id) where status = 'live';
create index entries_user on public.entries (user_id);

create table public.reports (
  entry_id uuid not null references public.entries (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('invalid', 'inappropriate')),
  reason text not null check (char_length(reason) <= 200),
  -- Set by trigger: only established, trusted accounts move the needle.
  counted boolean not null default false,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (entry_id, reporter_id)
);

create table public.blocks (
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_id),
  check (user_id <> blocked_id)
);

-- ---------------------------------------------------------------------------
-- Helpers (security definer so policies can use them without recursion)
-- ---------------------------------------------------------------------------

create function public.is_member(p_gym uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.gym_members m where m.gym_id = p_gym and m.user_id = auth.uid()
  );
$$;

create function public.can_view_gym(p_gym uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.gyms g
    where g.id = p_gym and (g.kind = 'public' or public.is_member(g.id))
  );
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Profile row for every new account, using the username chosen at sign-up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, companion_id)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'companion_id', 'kong')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Private gyms get an invite code; creators always join their own gym.
create function public.before_gym_insert() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.created_by := auth.uid();
  new.name := btrim(new.name);
  new.area := nullif(btrim(coalesce(new.area, '')), '');
  if new.kind = 'private' then
    new.invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  else
    new.invite_code := null;
  end if;
  return new;
end;
$$;

create trigger gyms_before_insert
  before insert on public.gyms
  for each row execute function public.before_gym_insert();

create function public.after_gym_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.created_by is not null then
    insert into public.gym_members (gym_id, user_id) values (new.id, new.created_by)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger gyms_after_insert
  after insert on public.gyms
  for each row execute function public.after_gym_insert();

-- New entries: server decides status, and posting is rate limited.
create function public.before_entry_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
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

create trigger entries_before_insert
  before insert on public.entries
  for each row execute function public.before_entry_insert();

-- Reports: decide whether the report counts, then hide the entry at the threshold.
create function public.before_report_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  reporter public.profiles;
begin
  select * into reporter from public.profiles where id = new.reporter_id;
  new.counted := reporter.created_at <= now() - interval '7 days' and reporter.strikes < 3;
  new.resolved := false;
  return new;
end;
$$;

create trigger reports_before_insert
  before insert on public.reports
  for each row execute function public.before_report_insert();

create function public.after_report_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  invalid_count int;
  inappropriate_count int;
begin
  select
    count(*) filter (where kind = 'invalid' and counted),
    count(*) filter (where kind = 'inappropriate' and counted)
  into invalid_count, inappropriate_count
  from public.reports where entry_id = new.entry_id;

  if invalid_count >= 3 or inappropriate_count >= 1 then
    update public.entries set status = 'hidden' where id = new.entry_id and status = 'live';
  end if;
  return new;
end;
$$;

create trigger reports_after_insert
  after insert on public.reports
  for each row execute function public.after_report_insert();

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Private gyms are invisible to non-members, so joining by code needs a definer function.
create function public.join_gym_by_invite(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  gym_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  select id into gym_id from public.gyms where invite_code = upper(btrim(p_code));
  if gym_id is not null then
    insert into public.gym_members (gym_id, user_id) values (gym_id, auth.uid())
    on conflict do nothing;
  end if;
  return gym_id;
end;
$$;

-- Lets the sign-up form check a username before creating the account.
create function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;

revoke execute on function public.join_gym_by_invite(text) from public, anon;
grant execute on function public.join_gym_by_invite(text) to authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
revoke execute on function public.is_member(uuid), public.can_view_gym(uuid) from public, anon;
grant execute on function public.is_member(uuid), public.can_view_gym(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.gym_members enable row level security;
alter table public.entries enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- Profiles: usernames are public to signed-in users; you can edit your handle and buddy.
create policy "profiles readable" on public.profiles
  for select to authenticated using (true);
create policy "profiles self update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (username, companion_id) on public.profiles to authenticated;

-- Gyms: public ones are visible to everyone signed in, private ones to members.
-- created_by covers insert-then-read, which runs before the creator's membership row exists.
create policy "gyms visible" on public.gyms
  for select to authenticated using (kind = 'public' or created_by = auth.uid() or public.is_member(id));
create policy "gyms create" on public.gyms
  for insert to authenticated with check (auth.uid() is not null);

-- Memberships: visible for gyms you can see (member counts); join public gyms, leave any.
create policy "members visible" on public.gym_members
  for select to authenticated using (user_id = auth.uid() or public.can_view_gym(gym_id));
create policy "members join public" on public.gym_members
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.gyms g where g.id = gym_id and g.kind = 'public')
  );
create policy "members leave" on public.gym_members
  for delete to authenticated using (user_id = auth.uid());

-- Entries: live entries in gyms you can see, minus blocked users and content you reported
-- as inappropriate. You always see your own. Post only to gyms you belong to.
create policy "entries visible" on public.entries
  for select to authenticated using (
    user_id = auth.uid()
    or (
      status = 'live'
      and public.can_view_gym(gym_id)
      and not exists (
        select 1 from public.blocks b where b.user_id = auth.uid() and b.blocked_id = entries.user_id
      )
      and not exists (
        select 1 from public.reports r
        where r.entry_id = entries.id and r.reporter_id = auth.uid() and r.kind = 'inappropriate'
      )
    )
  );
create policy "entries post" on public.entries
  for insert to authenticated with check (
    user_id = auth.uid()
    and public.is_member(gym_id)
    and video_path like auth.uid()::text || '/%'
  );
create policy "entries delete own" on public.entries
  for delete to authenticated using (user_id = auth.uid());

-- Reports: file on entries you can see (not your own); read your own reports.
create policy "reports file" on public.reports
  for insert to authenticated with check (
    reporter_id = auth.uid()
    and exists (
      select 1 from public.entries e
      where e.id = entry_id and e.user_id <> auth.uid() and public.can_view_gym(e.gym_id)
    )
  );
create policy "reports own" on public.reports
  for select to authenticated using (reporter_id = auth.uid());

-- Blocks: yours only.
create policy "blocks own" on public.blocks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Video storage: private bucket, one folder per user, readable when the entry is.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attempts', 'attempts', false, 104857600, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

create policy "attempts upload own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'attempts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "attempts read" on storage.objects
  for select to authenticated using (
    bucket_id = 'attempts'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.entries e
        where e.video_path = storage.objects.name
          and e.status = 'live'
          and public.can_view_gym(e.gym_id)
      )
    )
  );
create policy "attempts delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'attempts' and (storage.foldername(name))[1] = auth.uid()::text
  );
