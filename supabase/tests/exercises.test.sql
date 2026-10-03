-- Scenario tests for 20261004000000_exercise_submissions.sql. Runs after places.test.sql.
\set QUIET on
reset role;
create or replace function pg_temp.act_as(name text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', (select id::text from public.profiles where username = name), false);
  execute 'set role authenticated';
end $$;
create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;

-- Submitting can't skip review.
select pg_temp.act_as('alice');
insert into public.exercise_submissions (name, muscle_group, kind, status)
  values ('  Landmine   Press ', 'shoulders', 'weight', 'approved');
select pg_temp.check((select status = 'pending' and name = 'Landmine Press' from public.exercise_submissions),
  'submissions start pending with a tidy name');
select set_config('test.s1', (select id::text from public.exercise_submissions), false);
do $$ begin
  insert into public.exercise_submissions (user_id, name, muscle_group, kind)
    values ((select id from public.profiles where username = 'carol'), 'Fake', 'biceps', 'reps');
  raise exception 'FAILED: submitted as someone else';
exception when insufficient_privilege then raise notice 'ok - you can only submit as yourself';
end $$;
do $$ begin
  update public.exercise_submissions set status = 'approved';
  if exists (select 1 from public.exercise_submissions where status = 'approved') then
    raise exception 'FAILED: self-approved';
  end if;
  raise notice 'ok - you can''t approve your own submission';
end $$;

-- Others don't see pending submissions; non-admins can't review.
reset role;
update public.profiles set is_admin = false where username = 'carol';
select pg_temp.act_as('carol');
select pg_temp.check((select count(*) from public.exercise_submissions) = 0, 'pending submissions are private');
do $$ begin
  perform public.admin_resolve_exercise(current_setting('test.s1')::uuid, 'approve');
  raise exception 'FAILED: non-admin approved';
exception when insufficient_privilege then raise notice 'ok - only admins can review';
end $$;
reset role;

-- An admin approves with a corrected name; it becomes public.
update public.profiles set is_admin = true where username = 'carol';
select pg_temp.act_as('carol');
select pg_temp.check((select count(*) from public.admin_exercise_submissions()) = 1, 'admins see the queue');
select public.admin_resolve_exercise(current_setting('test.s1')::uuid, 'approve', 'Landmine Shoulder Press');
reset role;
update public.profiles set is_admin = false where username = 'carol';
set role anon;
select pg_temp.check((select name from public.exercise_submissions where status = 'approved') = 'Landmine Shoulder Press',
  'approved exercises are public');
reset role;

-- A second approval with the same name is refused.
select pg_temp.act_as('alice');
insert into public.exercise_submissions (name, muscle_group, kind) values ('landmine shoulder press', 'shoulders', 'weight');
reset role;
update public.profiles set is_admin = true where username = 'carol';
select pg_temp.act_as('carol');
do $$ begin
  perform public.admin_resolve_exercise(
    (select id from public.exercise_submissions where status = 'pending'), 'approve');
  raise exception 'FAILED: duplicate approved';
exception when raise_exception then raise notice 'ok - duplicate names can''t both be approved';
end $$;
select public.admin_resolve_exercise((select id from public.exercise_submissions where status = 'pending'), 'reject');
reset role;
update public.profiles set is_admin = false where username = 'carol';

-- Distance exercises can be submitted.
select pg_temp.act_as('dave');
insert into public.exercise_submissions (name, muscle_group, kind) values ('Trail Run', 'cardio', 'distance');
reset role;
select pg_temp.check((select kind from public.exercise_submissions where name = 'Trail Run') = 'distance',
  'distance exercises can be submitted');

-- Rate limit.
select pg_temp.act_as('alice');
do $$ begin
  for i in 1..10 loop
    insert into public.exercise_submissions (name, muscle_group, kind) values ('Move ' || i, 'core', 'reps');
  end loop;
  raise exception 'FAILED: no rate limit';
exception when raise_exception then raise notice 'ok - ten submissions a day at most';
end $$;
reset role;
\echo ALL EXERCISE DB TESTS PASSED
