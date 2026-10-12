-- Scenario tests for 20261015000000_apple_tokens.sql. Runs after challenges.test.sql.
\set QUIET on
reset role;
create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;

insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000c1');
insert into public.apple_tokens (user_id, refresh_token) values ('00000000-0000-0000-0000-0000000000c1', 'r1');

set role authenticated;
do $$ begin
  perform count(*) from public.apple_tokens;
  raise exception 'FAILED: signed-in users read Apple tokens';
exception when insufficient_privilege then raise notice 'ok - Apple tokens can''t be read through the API';
end $$;
reset role;
set role anon;
do $$ begin
  perform count(*) from public.apple_tokens;
  raise exception 'FAILED: anon read Apple tokens';
exception when insufficient_privilege then raise notice 'ok - signed-out requests can''t read them either';
end $$;
reset role;

delete from auth.users where id = '00000000-0000-0000-0000-0000000000c1';
select pg_temp.check(not exists (select 1 from public.apple_tokens), 'a deleted account takes its Apple token with it');
