-- Scenario tests for 20261006000000_sync.sql. Runs after exercises.test.sql.
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

select pg_temp.act_as('alice');
select pg_temp.check(public.sync_push('[
  {"kind":"workout","id":"w1","data":{"name":"Leg day"},"updated_at":"2026-10-01T10:00:00Z"},
  {"kind":"meta","id":"main","data":{"gems":100},"updated_at":"2026-10-01T10:00:00Z"}
]') = 2, 'pushes new records');

-- An older edit doesn't overwrite a newer one; a newer one does.
select public.sync_push('[{"kind":"workout","id":"w1","data":{"name":"Old"},"updated_at":"2026-10-01T09:00:00Z"}]');
select pg_temp.check((select data->>'name' from public.sync_records where id = 'w1') = 'Leg day', 'older edits lose');
select public.sync_push('[{"kind":"workout","id":"w1","data":{"name":"Leg day 2"},"updated_at":"2026-10-01T11:00:00Z"}]');
select pg_temp.check((select data->>'name' from public.sync_records where id = 'w1') = 'Leg day 2', 'newer edits win');

-- Deletes keep a tombstone without the data.
select public.sync_push('[{"kind":"workout","id":"w1","deleted":true,"updated_at":"2026-10-01T12:00:00Z"}]');
select pg_temp.check((select deleted and data is null from public.sync_records where id = 'w1'), 'deletes leave a tombstone');

-- Pull cursor moves forward on every write.
select pg_temp.check((select count(*) from public.sync_records where server_updated_at > now() - interval '1 minute') = 2,
  'server times are set on write');

do $$ begin
  perform public.sync_push('[{"kind":"secrets","id":"x","data":{},"updated_at":"2026-10-01T12:00:00Z"}]');
  raise exception 'FAILED: unknown kind accepted';
exception when check_violation then raise notice 'ok - only known kinds are stored';
end $$;

-- Others can't see or overwrite your data.
select pg_temp.act_as('carol');
select pg_temp.check((select count(*) from public.sync_records) = 0, 'other users see nothing');
select public.sync_push('[{"kind":"meta","id":"main","data":{"gems":999999},"updated_at":"2030-01-01T00:00:00Z"}]');
reset role;
select pg_temp.check((select data->>'gems' from public.sync_records
  where user_id = (select id from public.profiles where username = 'alice') and kind = 'meta') = '100',
  'pushing only ever writes your own rows');
select pg_temp.check((select updated_at < now() + interval '2 days' from public.sync_records
  where user_id = (select id from public.profiles where username = 'carol')), 'far-future device clocks are clamped');

set role anon;
do $$ begin
  perform count(*) from public.sync_records;
  raise exception 'FAILED: anon read sync records';
exception when insufficient_privilege then raise notice 'ok - signed-out users have no access';
end $$;
reset role;

-- Deleting the account removes the backup.
delete from auth.users where id = (select id from public.profiles where username = 'carol');
select pg_temp.check(not exists (select 1 from public.sync_records r
  where not exists (select 1 from public.profiles p where p.id = r.user_id)), 'account deletion removes synced data');

-- The app's own "Delete account" call takes the backup and custom-exercise submissions with it.
select pg_temp.act_as('dave');
select public.sync_push('[{"kind":"workout","id":"d1","data":{"name":"Push"},"updated_at":"2026-10-01T10:00:00Z"}]');
insert into public.exercise_submissions (name, muscle_group, kind) values ('Dave Curl', 'arms', 'weight');
reset role;
select set_config('test.dave', (select id::text from public.profiles where username = 'dave'), false);
select pg_temp.act_as('dave');
select public.delete_my_account();
reset role;
select pg_temp.check(not exists (select 1 from public.sync_records where user_id = current_setting('test.dave')::uuid)
  and not exists (select 1 from public.exercise_submissions where user_id = current_setting('test.dave')::uuid)
  and not exists (select 1 from auth.users where id = current_setting('test.dave')::uuid),
  'delete_my_account wipes the account, its backup and submissions');
\echo ALL SYNC DB TESTS PASSED
