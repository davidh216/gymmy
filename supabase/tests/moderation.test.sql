-- Scenario tests for 20261001000000_moderation_accounts.sql. Runs after gyms.test.sql.
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

-- Apple-style sign-up without a username gets a placeholder; choosing one marks it set.
insert into auth.users (id, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000f1', '{}');
select pg_temp.check(
  (select username ~ '^lifter_[0-9a-f]{8}$' and not username_set from public.profiles
   where id = '00000000-0000-0000-0000-0000000000f1'),
  'apple sign-up gets a placeholder username');
insert into auth.users (id, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000f2', '{"username":"alice"}');
select pg_temp.check(
  (select not username_set from public.profiles where id = '00000000-0000-0000-0000-0000000000f2'),
  'taken username at sign-up falls back to a placeholder');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f1', false);
set role authenticated;
update public.profiles set username = 'AppleLifter' where id = auth.uid();
reset role;
select pg_temp.check(
  (select username = 'applelifter' and username_set from public.profiles where id = '00000000-0000-0000-0000-0000000000f1'),
  'choosing a username lowercases it and marks it set');

-- Users can't make themselves admin or unban themselves.
select pg_temp.act_as('bob');
do $$ begin
  update public.profiles set is_admin = true where id = auth.uid();
  raise exception 'FAILED: self-promotion to admin';
exception when insufficient_privilege then raise notice 'ok - cannot make yourself admin';
end $$;
do $$ begin
  perform public.admin_review_queue();
  raise exception 'FAILED: non-admin read the queue';
exception when insufficient_privilege then raise notice 'ok - review queue is admin only';
end $$;
reset role;

-- Carol becomes admin and reviews the queue from gyms.test.sql (alice's bench, bob's squat).
update public.profiles set is_admin = true where username = 'carol';
select set_config('test.alice_bench', (select e.id::text from public.entries e join public.profiles p on p.id = e.user_id
  where p.username = 'alice' and e.challenge_id = 'bench_1rm'), false);
select set_config('test.bob_squat', (select e.id::text from public.entries e join public.profiles p on p.id = e.user_id
  where p.username = 'bob' and e.challenge_id = 'squat_1rm'), false);
select pg_temp.act_as('carol');
select pg_temp.check((select count(*) from public.admin_review_queue()) = 2, 'queue lists hidden entries');
select pg_temp.check(
  (select username from public.admin_review_queue() limit 1) = 'bob',
  'inappropriate reports are reviewed first');
select pg_temp.check((select count(*) from storage.objects) >= 1, 'admin can read attempt videos');

-- Restore alice's bench: back on the board, reporters get a rejection.
select public.admin_resolve(current_setting('test.alice_bench')::uuid, 'restore');
reset role;
select pg_temp.check(
  (select status from public.entries e join public.profiles p on p.id = e.user_id
   where p.username = 'alice' and e.challenge_id = 'bench_1rm') = 'live',
  'restore puts the entry back');
select pg_temp.check(
  (select report_rejections from public.profiles where username = 'dave') = 1,
  'restoring counts a rejection against reporters');

-- Remove bob's squat: strike for bob; the queue empties.
select pg_temp.act_as('carol');
select public.admin_resolve(current_setting('test.bob_squat')::uuid, 'remove');
select pg_temp.check((select count(*) from public.admin_review_queue()) = 0, 'queue is empty after decisions');
reset role;
select pg_temp.check((select strikes from public.profiles where username = 'bob') = 1, 'removal gives a strike');

-- Third strike bans; banned accounts can't post or report.
update public.profiles set strikes = 2 where username = 'bob';
select pg_temp.act_as('bob');
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'ohp_1rm', 60, auth.uid()::text || '/b2.mp4' from public.gyms where kind = 'public';
reset role;
insert into public.reports (entry_id, reporter_id, kind, reason)
  select e.id, p.id, 'inappropriate', 'spam'
  from public.entries e, public.profiles p where e.challenge_id = 'ohp_1rm' and p.username = 'dave';
select set_config('test.bob_ohp', (select id::text from public.entries where challenge_id = 'ohp_1rm'), false);
select pg_temp.act_as('carol');
select public.admin_resolve(current_setting('test.bob_ohp')::uuid, 'remove');
reset role;
select pg_temp.check((select banned_at is not null from public.profiles where username = 'bob'), 'third strike bans');
select pg_temp.act_as('bob');
do $$ begin
  insert into public.entries (gym_id, challenge_id, value, video_path)
    select id, 'ohp_1rm', 60, auth.uid()::text || '/b3.mp4' from public.gyms where kind = 'public';
  raise exception 'FAILED: banned user posted';
exception when raise_exception then raise notice 'ok - banned accounts cannot post';
end $$;
do $$ begin
  insert into public.reports (entry_id, kind, reason)
    select id, 'invalid', 'x' from public.entries where challenge_id = 'bench_1rm' limit 1;
  raise exception 'FAILED: banned user reported';
exception when insufficient_privilege then raise notice 'ok - banned accounts cannot report';
end $$;
reset role;

-- Rejected reporters stop counting after three rejections.
update public.profiles set report_rejections = 3 where username = 'dave';
insert into auth.users (id, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000f3', '{"username":"erin"}');
select pg_temp.act_as('erin');
insert into public.gym_members (gym_id) select id from public.gyms where kind = 'public';
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'plank_hold', 90, auth.uid()::text || '/e.mp4' from public.gyms where kind = 'public';
reset role;
select pg_temp.act_as('dave');
insert into public.reports (entry_id, kind, reason) select id, 'inappropriate', 'spam' from public.entries where challenge_id = 'plank_hold';
reset role;
select pg_temp.check((select status from public.entries where challenge_id = 'plank_hold') = 'live',
  'reports from repeatedly rejected reporters do not count');

-- Deleting your account removes your profile and entries.
select pg_temp.act_as('erin');
select public.delete_my_account();
reset role;
select pg_temp.check(not exists (select 1 from public.profiles where username = 'erin')
  and not exists (select 1 from public.entries where challenge_id = 'plank_hold'),
  'account deletion removes profile and entries');

\echo ALL MODERATION DB TESTS PASSED
