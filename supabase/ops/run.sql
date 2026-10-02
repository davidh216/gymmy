-- One-off SQL run by the Supabase workflow on a commit containing [db sql].
-- Replace the contents with what needs to run; git history keeps a record of everything run.
--
-- 2026-10-02: remove sleep hours from check-ins synced before Apple Health sleep stayed on the
-- phone (the app can't tell which were from Health). The sync trigger is paused for this update
-- so server_updated_at doesn't move and phones don't pull the stripped copies over their own.
begin;

select count(*) as check_ins_with_sleep_before
from public.sync_records
where kind = 'check_in' and not deleted and data ? 'sleepHours';

alter table public.sync_records disable trigger sync_records_before_write;

update public.sync_records
set data = data - 'sleepHours' - 'sleepSource'
where kind = 'check_in' and not deleted and data ? 'sleepHours';

alter table public.sync_records enable trigger sync_records_before_write;

select count(*) as check_ins_with_sleep_after
from public.sync_records
where kind = 'check_in' and not deleted and data ? 'sleepHours';

commit;
