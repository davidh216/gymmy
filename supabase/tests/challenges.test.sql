-- Scenario tests for 20261008000000_more_challenges.sql. Runs after analytics.test.sql.
\set QUIET on
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;

insert into public.entries (gym_id, challenge_id, user_id, value, video_path)
select (select id from public.gyms limit 1), c, (select id from public.profiles limit 1), 300, 'x/y.mp4'
from unnest(array['row_2k', 'run_1mi', 'run_5k', 'farmers_carry']) as c;
select pg_temp.check((select count(*) from public.entries
  where challenge_id in ('row_2k', 'run_1mi', 'run_5k', 'farmers_carry')) = 4, 'new challenges accept entries');

do $$ begin
  insert into public.entries (gym_id, challenge_id, user_id, value, video_path)
  values ((select id from public.gyms limit 1), 'marathon_pb', (select id from public.profiles limit 1), 1, 'x/z.mp4');
  raise exception 'FAILED: unknown challenge accepted';
exception when check_violation then raise notice 'ok - unknown challenges are still refused';
end $$;

-- 20261009000000_sync_custom_plans.sql: custom plans sync.
select set_config('request.jwt.claim.sub', (select id::text from public.profiles where username = 'alice'), false);
set role authenticated;
select pg_temp.check(public.sync_push('[{"kind":"custom_program","id":"custom-1","data":{"name":"PPL"},"updated_at":"2026-10-02T10:00:00Z"}]') = 1,
  'custom plans sync');
select pg_temp.check(public.sync_push('[{"kind":"template","id":"tpl-1","data":{"name":"Arm day"},"updated_at":"2026-10-03T10:00:00Z"}]') = 1,
  'templates sync');
reset role;

-- 20261010000000_places_cache.sql: only the Edge Function (service role) touches the cache.
insert into public.places_cache (key, elements) values ('40.71,-74.01', '[]');
set role authenticated;
do $$ begin
  perform count(*) from public.places_cache;
  raise exception 'FAILED: users can read the places cache';
exception when insufficient_privilege then raise notice 'ok - users can''t read the places cache';
end $$;
reset role;
do $$ begin
  insert into public.places_cache (key) values ('not a key');
  raise exception 'FAILED: bad cache key accepted';
exception when check_violation then raise notice 'ok - cache keys are grid cells';
end $$;

-- 20261011000000_biceps_triceps.sql: "arms" is split.
do $$ begin
  insert into public.exercise_submissions (user_id, name, muscle_group, kind)
  values ((select id from public.profiles limit 1), 'Old Curl', 'arms', 'weight');
  raise exception 'FAILED: arms still accepted';
exception when check_violation then raise notice 'ok - arms is now biceps or triceps';
end $$;
-- 20261013000000_entry_reps.sql: lifts carry reps, within reason.
do $$ begin
  insert into public.entries (gym_id, challenge_id, user_id, value, reps, video_path)
  values ((select id from public.gyms limit 1), 'bench_1rm', (select id from public.profiles limit 1), 100, 0, 'x/y.mp4');
  raise exception 'FAILED: zero reps accepted';
exception when check_violation then raise notice 'ok - reps must be 1 to 100';
end $$;
\echo ALL CHALLENGE DB TESTS PASSED
