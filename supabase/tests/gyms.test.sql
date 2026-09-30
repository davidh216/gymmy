-- Scenario tests for the gyms migration. Run on plain Postgres after stubs.sql
-- and the migration: psql -v ON_ERROR_STOP=1 -f stubs.sql -f ../migrations/*.sql -f gyms.test.sql
\set QUIET on

-- Three users: alice and bob are established accounts, newbie signed up today.
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', '{"username":"Alice","companion_id":"rex"}'),
  ('00000000-0000-0000-0000-00000000000b', '{"username":"bob"}'),
  ('00000000-0000-0000-0000-00000000000c', '{"username":"newbie"}'),
  ('00000000-0000-0000-0000-00000000000d', '{"username":"carol"}'),
  ('00000000-0000-0000-0000-00000000000e', '{"username":"dave"}');
update public.profiles set created_at = now() - interval '30 days' where username <> 'newbie';

create function pg_temp.act_as(name text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', (select id::text from public.profiles where username = name), false);
  execute 'set role authenticated';
end $$;

create function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;

select pg_temp.check((select username from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'alice',
  'sign-up creates a lowercase profile');

-- Alice creates a public gym and a private gym.
select pg_temp.act_as('alice');
insert into public.gyms (kind, name, area) values ('public', ' Iron Temple ', 'Downtown');
insert into public.gyms (kind, name) values ('private', 'Alice Garage') returning name;
select pg_temp.check((select count(*) from public.gym_members) = 2, 'creator joins their gyms');
select pg_temp.check((select invite_code from public.gyms where kind = 'private') ~ '^[0-9A-F]{6}$', 'private gym gets a code');
select pg_temp.check((select name from public.gyms where kind = 'public') = 'Iron Temple', 'gym names are trimmed');

-- Duplicate public gym is rejected.
do $$ begin
  insert into public.gyms (kind, name, area) values ('public', 'iron temple', 'downtown');
  raise exception 'FAILED: duplicate public gym accepted';
exception when unique_violation then raise notice 'ok - duplicate public gym rejected';
end $$;
reset role;

-- Bob can see the public gym but not the private one; joins public, then private by code.
select pg_temp.act_as('bob');
select pg_temp.check((select count(*) from public.gyms) = 1, 'private gym hidden from non-members');
insert into public.gym_members (gym_id) select id from public.gyms where kind = 'public';
do $$ begin
  insert into public.gym_members (gym_id)
    select id from public.gyms where name = 'Alice Garage';
  if found then raise exception 'FAILED: joined private gym without code'; end if;
  raise notice 'ok - cannot join private gym without code';
exception when insufficient_privilege then raise notice 'ok - cannot join private gym without code';
end $$;
reset role;
select set_config('test.code', (select invite_code from public.gyms where kind = 'private'), false);
select pg_temp.act_as('bob');
select pg_temp.check(public.join_gym_by_invite(lower(current_setting('test.code'))) is not null, 'join by invite code');
select pg_temp.check((select count(*) from public.gyms) = 2, 'private gym visible after joining');
reset role;

-- Entries: must be a member, must point into your own video folder.
select pg_temp.act_as('alice');
insert into public.entries (gym_id, challenge_id, value, bodyweight_kg, video_path, status)
  select id, 'bench_1rm', 100, 80, auth.uid()::text || '/a1.mp4', 'removed' from public.gyms where kind = 'public';
select pg_temp.check((select status from public.entries limit 1) = 'live', 'server sets entry status');
do $$ begin
  insert into public.entries (gym_id, challenge_id, value, video_path)
    select id, 'bench_1rm', 100, 'someone-else/x.mp4' from public.gyms where kind = 'public';
  raise exception 'FAILED: foreign video path accepted';
exception when insufficient_privilege then raise notice 'ok - video must be in your own folder';
end $$;
reset role;

select pg_temp.act_as('newbie');
do $$ begin
  insert into public.entries (gym_id, challenge_id, value, video_path)
    select id, 'bench_1rm', 120, auth.uid()::text || '/n.mp4' from public.gyms where kind = 'public';
  raise exception 'FAILED: non-member posted';
exception when insufficient_privilege then raise notice 'ok - only members can post';
end $$;
reset role;

-- Reports: newbie's report does not count; three established invalid reports hide the entry.
select pg_temp.act_as('newbie');
insert into public.gym_members (gym_id) select id from public.gyms where kind = 'public';
insert into public.reports (entry_id, kind, reason) select id, 'invalid', 'depth' from public.entries;
reset role;
select pg_temp.check(not (select counted from public.reports limit 1), 'new account reports do not count');

select pg_temp.act_as('bob');
insert into public.reports (entry_id, kind, reason) select id, 'invalid', 'depth' from public.entries;
reset role;
select pg_temp.act_as('carol');
insert into public.gym_members (gym_id) select id from public.gyms where kind = 'public';
insert into public.reports (entry_id, kind, reason) select id, 'invalid', 'lockout' from public.entries;
reset role;
select pg_temp.check((select status from public.entries limit 1) = 'live', 'two counted reports keep it live');
select pg_temp.act_as('dave');
insert into public.gym_members (gym_id) select id from public.gyms where kind = 'public';
insert into public.reports (entry_id, kind, reason) select id, 'invalid', 'weight' from public.entries;
reset role;
select pg_temp.check((select status from public.entries limit 1) = 'hidden', 'three counted reports hide the entry');

-- Hidden entries disappear for others, owner still sees theirs.
select pg_temp.act_as('bob');
select pg_temp.check((select count(*) from public.entries) = 0, 'hidden entry not visible to others');
reset role;
select pg_temp.act_as('alice');
select pg_temp.check((select count(*) from public.entries) = 1, 'owner still sees hidden entry');
-- Alice cannot report her own entry.
do $$ begin
  insert into public.reports (entry_id, kind, reason) select id, 'invalid', 'x' from public.entries;
  raise exception 'FAILED: self report accepted';
exception when insufficient_privilege then raise notice 'ok - cannot report own entry';
end $$;
-- Alice cannot change her strikes.
do $$ begin
  update public.profiles set strikes = 0 where id = auth.uid();
  raise exception 'FAILED: strikes editable';
exception when insufficient_privilege then raise notice 'ok - strikes not editable';
end $$;
reset role;

-- One inappropriate report hides an entry; blocked users disappear from boards.
select pg_temp.act_as('bob');
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'squat_1rm', 150, auth.uid()::text || '/b1.mp4' from public.gyms where kind = 'public';
reset role;
select pg_temp.act_as('carol');
select pg_temp.check((select count(*) from public.entries where challenge_id = 'squat_1rm') = 1, 'carol sees bob squat');
insert into public.blocks (blocked_id) select id from public.profiles where username = 'bob';
select pg_temp.check((select count(*) from public.entries where challenge_id = 'squat_1rm') = 0, 'blocked user hidden');
reset role;
select pg_temp.act_as('dave');
insert into public.reports (entry_id, kind, reason)
  select id, 'inappropriate', 'spam' from public.entries where challenge_id = 'squat_1rm';
reset role;
select pg_temp.check((select status from public.entries where challenge_id = 'squat_1rm') = 'hidden',
  'one inappropriate report hides the entry');

-- Storage: upload into own folder only; others can read videos of visible entries.
select pg_temp.act_as('alice');
insert into storage.objects (bucket_id, name) values ('attempts', auth.uid()::text || '/a2.mp4');
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'deadlift_1rm', 200, auth.uid()::text || '/a2.mp4' from public.gyms where kind = 'public';
do $$ begin
  insert into storage.objects (bucket_id, name) values ('attempts', 'not-mine/x.mp4');
  raise exception 'FAILED: upload outside own folder';
exception when insufficient_privilege then raise notice 'ok - upload only into own folder';
end $$;
reset role;
select pg_temp.act_as('bob');
select pg_temp.check((select count(*) from storage.objects) = 1, 'member can read visible entry video');
reset role;

select pg_temp.check(public.username_available('Alice') = false and public.username_available('zed'),
  'username availability check');
\echo ALL GYMS DB TESTS PASSED
