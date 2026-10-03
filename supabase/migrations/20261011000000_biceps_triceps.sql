-- Split the "arms" muscle group into biceps and triceps (same rule as fixGroup in
-- src/lib/exercises.ts). Safe to re-run.
alter table public.exercise_submissions drop constraint if exists exercise_submissions_muscle_group_check;

update public.exercise_submissions
set muscle_group = case
  when name ~* '(tri|push ?down|skull|extension|kickback|dip|close.?grip)' then 'triceps'
  else 'biceps'
end
where muscle_group = 'arms';

alter table public.exercise_submissions add constraint exercise_submissions_muscle_group_check check (
  muscle_group in ('chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'cardio'));
