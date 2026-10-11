import { getExercise } from './exercises';
import type { SetEntry, Workout, WorkoutExercise } from './types';

const MINUTE = 60_000;
const DAY = 86_400_000;
/** Longest workout an edit can save. */
export const MAX_EDIT_MINUTES = 12 * 60;

export type WorkoutEdit = Pick<Workout, 'name' | 'startedAt' | 'endedAt' | 'exercises'>;

/** A set worth keeping: weight lifts need weight and reps, distance needs a distance or a time. */
export function setHasData(exerciseId: string, s: SetEntry): boolean {
  const kind = getExercise(exerciseId).kind;
  if (kind === 'weight') return Boolean(s.weight && s.reps);
  if (kind === 'reps') return Boolean(s.reps);
  if (kind === 'distance') return Boolean(s.distance || s.minutes);
  return Boolean(s.minutes);
}

/** What a saved edit keeps: sets with numbers (all marked done) and exercises with sets. */
export function cleanExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises
    .map((e) => ({ ...e, sets: e.sets.filter((s) => setHasData(e.exerciseId, s)).map((s) => ({ ...s, done: true })) }))
    .filter((e) => e.sets.length > 0);
}

/** Why an edit can't be saved, or null when it can. */
export function editProblem(edit: WorkoutEdit, now: number): string | null {
  const minutes = (edit.endedAt - edit.startedAt) / MINUTE;
  if (!edit.name.trim()) return 'Give the workout a name.';
  if (minutes < 1) return 'A workout needs at least a minute.';
  if (minutes > MAX_EDIT_MINUTES) return 'That’s longer than 12 hours.';
  if (edit.endedAt > now + MINUTE) return 'That ends in the future.';
  if (cleanExercises(edit.exercises).length === 0) return 'Log at least one set.';
  return null;
}

/** Same time of day, `days` days later (DST-safe). */
export function shiftDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Whole minutes between start and end. */
export function durationMinutes(w: Pick<Workout, 'startedAt' | 'endedAt'>): number {
  return Math.max(0, Math.round((w.endedAt - w.startedAt) / MINUTE));
}

export { DAY, MINUTE };
