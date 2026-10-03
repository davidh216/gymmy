-- Saved workout templates sync like custom plans. Safe to re-run.
alter table public.sync_records drop constraint if exists sync_records_kind_check;
alter table public.sync_records add constraint sync_records_kind_check check (kind in (
  'meta', 'workout', 'check_in', 'custom_exercise', 'custom_program', 'template', 'companion', 'milestone'));
