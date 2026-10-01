-- Scenario tests for 20261007000000_analytics.sql. Runs after sync.test.sql.
\set QUIET on
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;

-- Signed-out installs can send events.
set role anon;
select pg_temp.check(public.track_events('00000000-0000-0000-0000-0000000000a1', '[
  {"event":"app_open","props":{},"app_version":"1.0.0","platform":"ios","client_at":"2026-10-01T10:00:00Z"},
  {"event":"workout_finish","props":{"sets":"10-19","minutes":"30-59"},"platform":"ios","client_at":"2026-10-01T10:00:00Z"},
  {"event":"Bad Name!","props":{}}
]') = 2, 'valid events are stored, malformed names dropped');

do $$ begin
  perform count(*) from public.analytics_events;
  raise exception 'FAILED: anon read events';
exception when insufficient_privilege then raise notice 'ok - events can''t be read through the API';
end $$;
do $$ begin
  insert into public.analytics_events (install_id, event, client_at) values (gen_random_uuid(), 'x_y', now());
  raise exception 'FAILED: direct insert';
exception when insufficient_privilege then raise notice 'ok - events can only be added through track_events';
end $$;
reset role;

select pg_temp.check((select client_at <= now() from public.analytics_events where event = 'app_open'),
  'client times are kept sane');
select pg_temp.check((select count(*) from public.analytics_events where client_at > now()) = 0, 'no future events');

-- Oversized props are refused.
set role anon;
do $$ begin
  perform public.track_events(gen_random_uuid(),
    jsonb_build_array(jsonb_build_object('event', 'big_one', 'props', jsonb_build_object('x', repeat('a', 2000)))));
  raise exception 'FAILED: big props accepted';
exception when check_violation then raise notice 'ok - large properties are refused';
end $$;

-- Daily cap per install.
select public.track_events('00000000-0000-0000-0000-0000000000b2',
  (select jsonb_agg(jsonb_build_object('event', 'screen', 'props', '{}'::jsonb)) from generate_series(1, 50)))
  from generate_series(1, 20);
select pg_temp.check(public.track_events('00000000-0000-0000-0000-0000000000b2', '[{"event":"screen","props":{}}]') = 0,
  'each install is capped at 1,000 events a day');
reset role;
select pg_temp.check((select count(*) from public.analytics_events
  where install_id = '00000000-0000-0000-0000-0000000000b2') = 1000, 'exactly 1,000 kept');

do $$ begin
  perform public.track_events(gen_random_uuid(), (select jsonb_agg('{"event":"x_y"}'::jsonb) from generate_series(1, 51)));
  raise exception 'FAILED: oversized batch';
exception when invalid_parameter_value then raise notice 'ok - batches are capped at 50';
end $$;
\echo ALL ANALYTICS DB TESTS PASSED
