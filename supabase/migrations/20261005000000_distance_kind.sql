-- Gymmy: custom exercises can be tracked by distance + time. Safe to re-run.
alter table public.exercise_submissions drop constraint if exists exercise_submissions_kind_check;
alter table public.exercise_submissions
  add constraint exercise_submissions_kind_check check (kind in ('weight', 'reps', 'duration', 'distance'));
