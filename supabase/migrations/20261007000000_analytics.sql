-- Gymmy: privacy-safe, first-party product analytics. Safe to re-run.
--
-- Events carry a random per-install id (never the account id), a name from a fixed set of
-- shapes, and a few small typed properties chosen by the app (no free text, no health or
-- workout values, numbers bucketed). Clients can only add events through track_events;
-- nobody can read them through the API. Events older than 180 days are removed.

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  install_id uuid not null,
  event text not null check (event ~ '^[a-z][a-z_]{1,39}$'),
  props jsonb not null default '{}' check (jsonb_typeof(props) = 'object' and octet_length(props::text) <= 1024),
  app_version text check (char_length(app_version) <= 40),
  platform text check (platform in ('ios', 'android', 'web')),
  client_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index if not exists analytics_events_received on public.analytics_events (received_at);
create index if not exists analytics_events_event on public.analytics_events (event, received_at);
create index if not exists analytics_events_install on public.analytics_events (install_id, received_at);

alter table public.analytics_events enable row level security;
-- No policies: the API can't read or write the table directly; track_events is the only way in.
revoke all on public.analytics_events from anon, authenticated;

-- Adds up to 50 events. Each install can send up to 1,000 events a day; extra ones are dropped.
create or replace function public.track_events(p_install uuid, p_events jsonb) returns int
language plpgsql security definer set search_path = '' as $$
declare
  today int;
  room int;
  added int;
begin
  if p_install is null or jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 50 then
    raise exception 'Send up to 50 events at a time' using errcode = '22023';
  end if;

  select count(*) into today from public.analytics_events
    where install_id = p_install and received_at > now() - interval '1 day';
  room := greatest(0, 1000 - today);
  if room = 0 then
    return 0;
  end if;

  insert into public.analytics_events (install_id, event, props, app_version, platform, client_at)
    select p_install, e.event, coalesce(e.props, '{}'), e.app_version, e.platform,
           -- Clocks drift; keep client times within a sane window.
           least(greatest(coalesce(e.client_at, now()), now() - interval '7 days'), now())
    from jsonb_to_recordset(p_events)
      as e(event text, props jsonb, app_version text, platform text, client_at timestamptz)
    where e.event ~ '^[a-z][a-z_]{1,39}$'
    limit room;
  get diagnostics added = row_count;

  -- Retention: now and then, clear out events older than 180 days.
  if random() < 0.01 then
    delete from public.analytics_events
      where id in (select id from public.analytics_events
                   where received_at < now() - interval '180 days' limit 5000);
  end if;
  return added;
end;
$$;

revoke execute on function public.track_events(uuid, jsonb) from public;
grant execute on function public.track_events(uuid, jsonb) to anon, authenticated;
