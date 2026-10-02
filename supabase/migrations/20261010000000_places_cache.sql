-- Shared cache for the gym-places Edge Function: one row per ~1 km grid cell, refreshed
-- weekly. Only the function (service role) reads or writes it. Safe to re-run.
create table if not exists public.places_cache (
  key text primary key check (key ~ '^-?[0-9]{1,2}\.[0-9]{2},-?[0-9]{1,3}\.[0-9]{2}$'),
  elements jsonb not null default '[]',
  fetched_at timestamptz not null default now()
);

alter table public.places_cache enable row level security;
revoke all on public.places_cache from anon, authenticated;
