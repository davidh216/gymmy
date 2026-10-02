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
\echo ALL CHALLENGE DB TESTS PASSED
