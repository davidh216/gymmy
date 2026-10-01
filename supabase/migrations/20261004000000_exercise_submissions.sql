-- Gymmy: custom exercises submitted for review. Approved ones are added to everyone's exercise list.
-- Safe to re-run.

create table if not exists public.exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  muscle_group text not null check (muscle_group in ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio')),
  kind text not null check (kind in ('weight', 'reps', 'duration')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists exercise_submissions_user on public.exercise_submissions (user_id);
-- One approved exercise per name.
create unique index if not exists exercise_submissions_approved_name
  on public.exercise_submissions (lower(name)) where status = 'approved';

-- Submissions always start pending; banned accounts can't submit; ten a day at most.
create or replace function public.before_exercise_submission_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.profiles where id = new.user_id and banned_at is not null) then
    raise exception 'This account can no longer submit exercises.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.exercise_submissions s
      where s.user_id = new.user_id and s.created_at > now() - interval '1 day') >= 10 then
    raise exception 'Too many submissions today. Try again tomorrow.' using errcode = 'P0001';
  end if;
  new.name := btrim(regexp_replace(new.name, '\s+', ' ', 'g'));
  new.status := 'pending';
  new.created_at := now();
  new.reviewed_at := null;
  return new;
end;
$$;

drop trigger if exists exercise_submissions_before_insert on public.exercise_submissions;
create trigger exercise_submissions_before_insert
  before insert on public.exercise_submissions
  for each row execute function public.before_exercise_submission_insert();

alter table public.exercise_submissions enable row level security;

-- Approved exercises are public; you can see your own submissions; admins see everything.
drop policy if exists "exercise submissions visible" on public.exercise_submissions;
create policy "exercise submissions visible" on public.exercise_submissions
  for select to authenticated using (
    status = 'approved' or user_id = auth.uid() or public.is_admin()
  );
drop policy if exists "approved exercises public" on public.exercise_submissions;
create policy "approved exercises public" on public.exercise_submissions
  for select to anon using (status = 'approved');

drop policy if exists "exercise submissions create" on public.exercise_submissions;
create policy "exercise submissions create" on public.exercise_submissions
  for insert to authenticated with check (user_id = auth.uid());

-- Pending submissions, oldest first.
drop function if exists public.admin_exercise_submissions();
create or replace function public.admin_exercise_submissions()
returns table (id uuid, name text, muscle_group text, kind text, username text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return query
    select s.id, s.name, s.muscle_group, s.kind, p.username, s.created_at
    from public.exercise_submissions s
    join public.profiles p on p.id = s.user_id
    where s.status = 'pending'
    order by s.created_at;
end;
$$;

-- Approve (optionally fixing the name) or reject a submission.
create or replace function public.admin_resolve_exercise(p_id uuid, p_decision text, p_name text default null)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if p_decision not in ('approve', 'reject') then
    raise exception 'Unknown decision %', p_decision;
  end if;
  update public.exercise_submissions
    set status = case when p_decision = 'approve' then 'approved' else 'rejected' end,
        name = case when p_decision = 'approve' and nullif(btrim(p_name), '') is not null
                    then btrim(regexp_replace(p_name, '\s+', ' ', 'g')) else name end,
        reviewed_at = now()
    where id = p_id and status = 'pending';
  if not found then
    raise exception 'Submission not found or already reviewed';
  end if;
exception when unique_violation then
  raise exception 'An approved exercise already has that name.' using errcode = 'P0001';
end;
$$;

revoke execute on function public.admin_exercise_submissions(), public.admin_resolve_exercise(uuid, text, text)
  from public, anon;
grant execute on function public.admin_exercise_submissions(), public.admin_resolve_exercise(uuid, text, text)
  to authenticated;
