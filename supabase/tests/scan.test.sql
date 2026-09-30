-- Scenario tests for 20261002000000_video_scan.sql. Runs after moderation.test.sql.
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

-- Scan off: entries go live as before.
select pg_temp.act_as('alice');
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'pullups_max', 12, auth.uid()::text || '/s1.mp4' from public.gyms where kind = 'public';
reset role;
select pg_temp.check((select status from public.entries where challenge_id = 'pullups_max') = 'live',
  'scan off: entries go live');

-- Scan on: entries wait in processing and are invisible to others.
update public.app_settings set value = 'true' where key = 'moderation_enabled';
select pg_temp.act_as('alice');
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'pushups_1min', 40, auth.uid()::text || '/s2.mp4' from public.gyms where kind = 'public';
select pg_temp.check((select status from public.entries where challenge_id = 'pushups_1min') = 'processing',
  'scan on: new entries wait for the scan');
reset role;
select pg_temp.act_as('carol');
select pg_temp.check((select count(*) from public.entries where challenge_id = 'pushups_1min') = 0,
  'processing entries are hidden from others');
-- Users can't read scan results or settings.
select pg_temp.check((select count(*) from public.moderation_results) = 0
  and (select count(*) from public.app_settings) = 0, 'scan tables are server-only');
reset role;

-- The Edge Function (service role) flags the video: it lands in the admin queue.
insert into public.moderation_results (entry_id, provider, flagged, flag_class, flag_score)
  select id, 'hive', true, 'general_nsfw', 0.97 from public.entries where challenge_id = 'pushups_1min';
update public.entries set status = 'hidden' where challenge_id = 'pushups_1min';
select pg_temp.act_as('carol');
select pg_temp.check(
  (select scan_flag from public.admin_review_queue() where challenge_id = 'pushups_1min') = 'general_nsfw',
  'scan-flagged entries appear in the review queue');
select pg_temp.check(
  (select challenge_id from public.admin_review_queue() limit 1) = 'pushups_1min',
  'scan-flagged entries are reviewed first');
reset role;

-- Entries stuck in processing surface after 15 minutes.
select pg_temp.act_as('alice');
insert into public.entries (gym_id, challenge_id, value, video_path)
  select id, 'row_500m', 95, auth.uid()::text || '/s3.mp4' from public.gyms where kind = 'public';
reset role;
select pg_temp.act_as('carol');
select pg_temp.check(
  not exists (select 1 from public.admin_review_queue() where challenge_id = 'row_500m'),
  'fresh processing entries are not queued yet');
reset role;
update public.entries set created_at = now() - interval '20 minutes' where challenge_id = 'row_500m';
select pg_temp.act_as('carol');
select pg_temp.check(
  (select status from public.admin_review_queue() where challenge_id = 'row_500m') = 'processing',
  'stuck scans show up for review');
select public.admin_resolve((select entry_id from public.admin_review_queue() where challenge_id = 'row_500m'), 'restore');
reset role;
select pg_temp.check((select status from public.entries where challenge_id = 'row_500m') = 'live',
  'admin can publish a stuck entry');
update public.app_settings set value = 'false' where key = 'moderation_enabled';
\echo ALL SCAN DB TESTS PASSED
