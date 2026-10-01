-- Gymmy: gyms linked to real places from OpenStreetMap.
-- Safe to re-run. Included in supabase/setup.sql.

alter table public.gyms
  add column if not exists place_id text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- One Gymmy gym per map place.
create unique index if not exists gyms_place_id on public.gyms (place_id) where place_id is not null;

-- Name+area uniqueness only applies to hand-added gyms; map places can share a name
-- (two branches of the same chain in one city).
drop index if exists public.gyms_public_name_area;
create unique index if not exists gyms_public_name_area_manual
  on public.gyms (lower(btrim(name)), lower(coalesce(btrim(area), '')))
  where kind = 'public' and place_id is null;

-- Only join_place_gym (running as the table owner) may link a gym to a map place;
-- direct inserts from the app can't claim a place under a made-up name.
create or replace function public.before_gym_insert() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.created_by := auth.uid();
  new.name := btrim(new.name);
  new.area := nullif(btrim(coalesce(new.area, '')), '');
  if current_user in ('authenticated', 'anon') then
    new.place_id := null;
    new.lat := null;
    new.lng := null;
  end if;
  if new.kind = 'private' then
    new.invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    new.place_id := null;
  else
    new.invite_code := null;
  end if;
  return new;
end;
$$;

-- Joins the Gymmy gym for a map place, creating it on first use. Returns the gym id.
create or replace function public.join_place_gym(
  p_place_id text,
  p_name text,
  p_area text,
  p_lat double precision,
  p_lng double precision
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  gym_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  if p_place_id !~ '^osm:(node|way|relation)/[0-9]+$' then
    raise exception 'Invalid place id' using errcode = '22023';
  end if;

  select id into gym_id from public.gyms where place_id = p_place_id;
  if gym_id is null then
    insert into public.gyms (kind, name, area, place_id, lat, lng)
    values ('public', left(btrim(p_name), 40), left(nullif(btrim(p_area), ''), 40), p_place_id, p_lat, p_lng)
    on conflict (place_id) where place_id is not null do nothing
    returning id into gym_id;
    if gym_id is null then
      select id into gym_id from public.gyms where place_id = p_place_id;
    end if;
  end if;

  insert into public.gym_members (gym_id, user_id) values (gym_id, auth.uid())
  on conflict do nothing;
  return gym_id;
end;
$$;

revoke execute on function public.join_place_gym(text, text, text, double precision, double precision) from public, anon;
grant execute on function public.join_place_gym(text, text, text, double precision, double precision) to authenticated;
