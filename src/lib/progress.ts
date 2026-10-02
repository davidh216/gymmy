import { getExercise, type ExerciseKind } from './exercises';
import { e1rm, topSet } from './records';
import type { SetEntry, Workout } from './types';

export type ProgressRange = '1m' | '3m' | '1y' | 'all';

export const RANGES: { id: ProgressRange; label: string; days: number }[] = [
  { id: '1m', label: '1M', days: 31 },
  { id: '3m', label: '3M', days: 92 },
  { id: '1y', label: '1Y', days: 366 },
  { id: 'all', label: 'All', days: Infinity },
];

export type ProgressPoint = {
  workoutId: string;
  endedAt: number;
  /** kg (estimated 1RM) for weight; reps; minutes; or km. */
  value: number;
  /** The set that produced the value. */
  set: SetEntry;
  /** A new best compared with every earlier session. */
  pr: boolean;
};

/** What a chart of this exercise shows. */
export function progressMetric(kind: ExerciseKind): { label: string; short: string } {
  switch (kind) {
    case 'weight':
      return { label: 'Estimated 1-rep max', short: 'Est. 1RM' };
    case 'reps':
      return { label: 'Most reps in a set', short: 'Reps' };
    case 'duration':
      return { label: 'Longest set', short: 'Time' };
    case 'distance':
      return { label: 'Longest distance', short: 'Distance' };
  }
}

function valueOf(kind: ExerciseKind, s: SetEntry): number | null {
  if (kind === 'weight') return s.weight && s.reps ? e1rm(s.weight, s.reps) : null;
  if (kind === 'reps') return s.reps ?? null;
  if (kind === 'duration') return s.minutes ?? null;
  return s.distance ?? null;
}

/** Best set per session for an exercise, oldest first, with PRs marked across all history. */
export function progressSeries(exerciseId: string, workouts: Workout[]): ProgressPoint[] {
  const kind = getExercise(exerciseId).kind;
  const points: ProgressPoint[] = [];
  for (const w of [...workouts].sort((a, b) => a.endedAt - b.endedAt)) {
    const sets = w.exercises.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets.filter((s) => s.done && !s.warmup));
    let best: { value: number; set: SetEntry } | null = null;
    for (const s of sets) {
      const v = valueOf(kind, s);
      if (v !== null && v > 0 && (!best || v > best.value)) best = { value: v, set: s };
    }
    if (!best) continue;
    // Weighted lifts: show the heaviest set alongside the e1RM it implies.
    const set = kind === 'weight' ? (topSet(kind, sets) ?? best.set) : best.set;
    const previous = points.reduce((m, p) => Math.max(m, p.value), 0);
    points.push({ workoutId: w.id, endedAt: w.endedAt, value: best.value, set, pr: points.length > 0 && best.value > previous });
  }
  return points;
}

export function inRange(points: ProgressPoint[], range: ProgressRange, now: number): ProgressPoint[] {
  const days = RANGES.find((r) => r.id === range)!.days;
  return days === Infinity ? points : points.filter((p) => p.endedAt >= now - days * 86400_000);
}

/** Headline: best in the range and the change from the range's first session to its best. */
export function progressSummary(points: ProgressPoint[]): { best: ProgressPoint; change: number; sessions: number } | null {
  if (points.length === 0) return null;
  const best = points.reduce((a, b) => (b.value > a.value ? b : a));
  return { best, change: best.value - points[0].value, sessions: points.length };
}

/** Exercises you've logged, most recently trained first. */
export function trainedExercises(workouts: Workout[]): { exerciseId: string; lastAt: number; sessions: number }[] {
  const map = new Map<string, { lastAt: number; sessions: number }>();
  for (const w of workouts) {
    for (const id of new Set(w.exercises.filter((e) => e.sets.some((s) => s.done)).map((e) => e.exerciseId))) {
      const cur = map.get(id);
      map.set(id, { lastAt: Math.max(cur?.lastAt ?? 0, w.endedAt), sessions: (cur?.sessions ?? 0) + 1 });
    }
  }
  return [...map].map(([exerciseId, v]) => ({ exerciseId, ...v })).sort((a, b) => b.lastAt - a.lastAt);
}
