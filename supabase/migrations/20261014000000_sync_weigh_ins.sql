-- Typed-in weigh-ins sync like check-ins. Weights from Apple Health stay on the phone. Safe to re-run.
alter table public.sync_records drop constraint if exists sync_records_kind_check;
alter table public.sync_records add constraint sync_records_kind_check check (kind in (
  'meta', 'workout', 'check_in', 'custom_exercise', 'custom_program', 'template', 'weigh_in', 'companion', 'milestone'));
