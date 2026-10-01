-- Gymmy: cloud backup and sync of each user's training data. Safe to re-run.
--
-- One row per synced record (a workout, a check-in, a companion, ...), stored as JSON.
-- Clients push changes with the time they were made and pull everything changed since
-- their last pull. The newest edit of a record wins.

create table if not exists public.sync_records (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('meta', 'workout', 'check_in', 'custom_exercise', 'companion', 'milestone')),
  id text not null check (char_length(id) between 1 and 100),
  data jsonb,
  deleted boolean not null default false,
  -- When the change was made on the device (decides which edit wins).
  updated_at timestamptz not null,
  -- When the server stored it (the pull cursor).
  server_updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, kind, id),
  constraint sync_records_size check (octet_length(coalesce(data::text, '')) <= 65536)
);

create index if not exists sync_records_pull on public.sync_records (user_id, server_updated_at);

create or replace function public.before_sync_record_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.server_updated_at := clock_timestamp();
  -- Clocks drift; don't let a device claim a time far in the future.
  if new.updated_at > now() + interval '1 day' then
    new.updated_at := now();
  end if;
  if new.deleted then
    new.data := null;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_records_before_write on public.sync_records;
create trigger sync_records_before_write
  before insert or update on public.sync_records
  for each row execute function public.before_sync_record_write();

alter table public.sync_records enable row level security;

drop policy if exists "sync records own" on public.sync_records;
create policy "sync records own" on public.sync_records
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.sync_records from anon;

-- Saves a batch of changes. A record is only overwritten by a newer edit.
-- Returns how many records changed.
create or replace function public.sync_push(p_records jsonb) returns int
language plpgsql security invoker set search_path = '' as $$
declare
  changed int;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  if jsonb_typeof(p_records) <> 'array' or jsonb_array_length(p_records) > 500 then
    raise exception 'Send up to 500 records at a time' using errcode = '22023';
  end if;
  insert into public.sync_records as s (user_id, kind, id, data, deleted, updated_at)
    select auth.uid(), r.kind, r.id, r.data, coalesce(r.deleted, false), r.updated_at
    from jsonb_to_recordset(p_records) as r(kind text, id text, data jsonb, deleted boolean, updated_at timestamptz)
  on conflict (user_id, kind, id) do update
    set data = excluded.data, deleted = excluded.deleted, updated_at = excluded.updated_at
    where s.updated_at <= excluded.updated_at;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke execute on function public.sync_push(jsonb) from public, anon;
grant execute on function public.sync_push(jsonb) to authenticated;
