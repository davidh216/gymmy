import { getExercise } from './exercises';
import type { ExerciseKind } from './exercises';
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
    case 'distance':
      return set.distance ? set.distance : null;
  }
}

/** A finished set with something logged. Distance sets can be time-only (e.g. older runs). */
export function setLogged(exerciseId: string, set: SetEntry): boolean {
  if (setScore(exerciseId, set) !== null) return true;
  return set.done && getExercise(exerciseId).kind === 'distance' && Boolean(set.minutes);
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
    (n, ex) => n + ex.sets.filter((s) => setLogged(ex.exerciseId, s)).length,
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
  return lastSession(exerciseId, history)?.sets ?? null;
}

/**
 * The set to headline: heaviest weight (more reps breaks a tie) for weighted lifts,
 * most reps or longest time otherwise.
 */
export function topSet(kind: ExerciseKind, sets: SetEntry[]): SetEntry | null {
  let top: SetEntry | null = null;
  for (const s of sets) {
    if (!s.done) continue;
    if (kind === 'weight') {
      if (!s.weight || !s.reps) continue;
      if (!top || s.weight > top.weight! || (s.weight === top.weight && s.reps > top.reps!)) top = s;
    } else if (kind === 'distance') {
      // Longest distance; time-only sets only when nothing has a distance.
      if (s.distance) {
        if (!top?.distance || s.distance > top.distance) top = s;
      } else if (s.minutes && !top?.distance && (!top || s.minutes > top.minutes!)) {
        top = s;
      }
    } else {
      const v = kind === 'reps' ? s.reps : s.minutes;
      const best = top ? (kind === 'reps' ? top.reps : top.minutes) : undefined;
      if (v && (best === undefined || v > best)) top = s;
    }
  }
  return top;
}

export type SessionStats = { endedAt: number; sets: SetEntry[]; top: SetEntry };

/** Latest finished session of an exercise and its top set. */
export function lastSession(exerciseId: string, history: Workout[]): SessionStats | null {
  const kind = getExercise(exerciseId).kind;
  let latest: SessionStats | null = null;
  for (const w of history) {
    if (latest && w.endedAt <= latest.endedAt) continue;
    for (const e of w.exercises) {
      if (e.exerciseId !== exerciseId) continue;
      const top = topSet(kind, e.sets);
      if (top) latest = { endedAt: w.endedAt, sets: e.sets.filter((s) => s.done), top };
    }
  }
  return latest;
}

/** Top set ever logged for an exercise. */
export function bestSet(exerciseId: string, history: Workout[]): SetEntry | null {
  const kind = getExercise(exerciseId).kind;
  const all = history.flatMap((w) => w.exercises.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets));
  return topSet(kind, all);
}

/** Latest session per exercise, for showing stats in lists. */
export function lastSessions(history: Workout[]): Map<string, SessionStats> {
  const ids = new Set(history.flatMap((w) => w.exercises.map((e) => e.exerciseId)));
  const out = new Map<string, SessionStats>();
  for (const id of ids) {
    const s = lastSession(id, history);
    if (s) out.set(id, s);
  }
  return out;
}

/** Whether any saved or in-progress workout uses this exercise. */
export function exerciseInUse(exerciseId: string, history: Workout[], active?: { exercises: WorkoutExercise[] } | null) {
  return [...history, ...(active ? [active] : [])].some((w) => w.exercises.some((e) => e.exerciseId === exerciseId));
}
