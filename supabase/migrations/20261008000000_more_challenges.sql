-- More challenges: 2 km row, mile run, 5K run and farmers carry. Safe to re-run.
alter table public.entries drop constraint if exists entries_challenge_id_check;
alter table public.entries add constraint entries_challenge_id_check check (challenge_id in (
  'bench_1rm', 'squat_1rm', 'deadlift_1rm', 'ohp_1rm',
  'pullups_max', 'pushups_1min', 'plank_hold', 'row_500m',
  'row_2k', 'run_1mi', 'run_5k', 'farmers_carry'));
