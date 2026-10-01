-- Scenario tests for 20261003000000_map_places.sql. Runs after scan.test.sql.
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
select set_config('test.g1', public.join_place_gym('osm:node/111', 'Planet Fitness', 'Main St, Springfield', 40.1, -75.1)::text, false);
reset role;
select pg_temp.check((select place_id = 'osm:node/111' and kind = 'public' and lat = 40.1
  from public.gyms where id = current_setting('test.g1')::uuid), 'joining a place creates a linked public gym');
select pg_temp.check((select count(*) from public.gym_members where gym_id = current_setting('test.g1')::uuid) = 1,
  'the joiner becomes a member');

-- A second lifter joins the same place: same gym, no duplicate.
select pg_temp.act_as('carol');
select pg_temp.check(public.join_place_gym('osm:node/111', 'Planet Fitness', 'Main St, Springfield', 40.1, -75.1)
  = current_setting('test.g1')::uuid, 'the same place maps to the same gym');
reset role;
select pg_temp.check((select count(*) from public.gyms where place_id = 'osm:node/111') = 1, 'no duplicate gym for a place');

-- Another branch with the same name and area is a separate gym.
select pg_temp.act_as('carol');
select pg_temp.check(public.join_place_gym('osm:way/222', 'Planet Fitness', 'Main St, Springfield', 40.2, -75.2)
  <> current_setting('test.g1')::uuid, 'two branches with the same name stay separate');
-- Joining twice is harmless.
select public.join_place_gym('osm:way/222', 'Planet Fitness', 'Main St, Springfield', 40.2, -75.2);
do $$ begin
  perform public.join_place_gym('drop table gyms', 'x', 'y', 0, 0);
  raise exception 'FAILED: bad place id accepted';
exception when invalid_parameter_value then raise notice 'ok - malformed place ids are rejected';
end $$;
reset role;

-- Direct inserts can't claim a map place.
select pg_temp.act_as('alice');
insert into public.gyms (kind, name, area, place_id) values ('public', 'Fake Gym', 'Nowhere', 'osm:node/999');
reset role;
select pg_temp.check((select place_id is null from public.gyms where name = 'Fake Gym'),
  'direct inserts cannot set a place id');
\echo ALL PLACES DB TESTS PASSED
