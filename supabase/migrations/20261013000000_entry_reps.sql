-- Barbell lift entries log weight × reps. Boards rank them by total (weight × reps),
-- max weight or bodyweight %, computed in the app. Older entries have no reps and
-- count as singles.

alter table public.entries
  add column if not exists reps integer check (reps between 1 and 100);

comment on column public.entries.reps is
  'Reps in the set for weight × reps lifts (bench, squat, deadlift, overhead press); null means a single.';
