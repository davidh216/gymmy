import { getExercise } from './exercises';
import type { PersonalRecord, SetEntry, Workout, WorkoutExercise } from './types';

/** Estimated one-rep max (Epley). */
export function e1rm(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Comparable score for a completed set, or null if it doesn't count. */
export function setScore(exerciseId: string, set: SetEntry): number | null {
  if (!set.done) return null;
  switch (getExercise(exerciseId).kind) {
    case 'weight':
      return set.weight && set.reps ? e1rm(set.weight, set.reps) : null;
    case 'reps':
      return set.reps ? set.reps : null;
    case 'duration':
      return set.minutes ? set.minutes : null;
  }
}

export function bestScore(exercise: WorkoutExercise): number | null {
  let best: number | null = null;
  for (const set of exercise.sets) {
    const score = setScore(exercise.exerciseId, set);
    if (score !== null && (best === null || score > best)) best = score;
  }
  return best;
}

/** Best historical score per exercise across finished workouts. */
export function bestsByExercise(history: Workout[]): Map<string, number> {
  const bests = new Map<string, number>();
  for (const workout of history) {
    for (const exercise of workout.exercises) {
      const score = bestScore(exercise);
      if (score === null) continue;
      const prev = bests.get(exercise.exerciseId);
      if (prev === undefined || score > prev) bests.set(exercise.exerciseId, score);
    }
  }
  return bests;
}

/**
 * PRs are only awarded when there is prior history for the exercise,
 * so the very first session of a lift doesn't spam records.
 */
export function detectPRs(exercises: WorkoutExercise[], history: Workout[]): PersonalRecord[] {
  const bests = bestsByExercise(history);
  const prs: PersonalRecord[] = [];
  for (const exercise of exercises) {
    const previous = bests.get(exercise.exerciseId);
    const score = bestScore(exercise);
    if (previous === undefined || score === null || score <= previous) continue;
    if (prs.some((p) => p.exerciseId === exercise.exerciseId)) continue;
    prs.push({ exerciseId: exercise.exerciseId, value: score, previous });
  }
  return prs;
}

export function completedSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => setScore(ex.exerciseId, s) !== null).length,
    0,
  );
}

/** Total kg moved (weight × reps) across completed weighted sets. */
export function volume(exercises: WorkoutExercise[]): number {
  let total = 0;
  for (const ex of exercises) {
    if (getExercise(ex.exerciseId).kind !== 'weight') continue;
    for (const s of ex.sets) if (s.done && s.weight && s.reps) total += s.weight * s.reps;
  }
  return total;
}

/** The most recent finished performance of an exercise, for "previous" hints. */
export function lastPerformance(exerciseId: string, history: Workout[]): SetEntry[] | null {
  let latest: Workout | null = null;
  for (const w of history) {
    if (w.exercises.some((e) => e.exerciseId === exerciseId && bestScore(e) !== null)) {
      if (!latest || w.endedAt > latest.endedAt) latest = w;
    }
  }
  const match = latest?.exercises.find((e) => e.exerciseId === exerciseId);
  return match ? match.sets.filter((s) => s.done) : null;
}
