import type { Workout } from './types';

/** Gymmy's bundle id; workouts we saved to Apple Health aren't imported back. */
export const APP_BUNDLE_ID = 'com.davidh216.gymmy';

/** HealthKit workout activity types we read or write (HKWorkoutActivityType raw values). */
export const ACTIVITY = {
  cycling: 13,
  hiking: 24,
  rowing: 35,
  running: 37,
  swimming: 46,
  traditionalStrengthTraining: 50,
  walking: 52,
} as const;

/** Apple Health workouts we import, as Gymmy exercises. */
const IMPORTED: Record<number, { exerciseId: string; name: string }> = {
  [ACTIVITY.running]: { exerciseId: 'run', name: 'Run' },
  [ACTIVITY.walking]: { exerciseId: 'walk', name: 'Walk' },
  [ACTIVITY.hiking]: { exerciseId: 'walk', name: 'Hike' },
  [ACTIVITY.cycling]: { exerciseId: 'bike', name: 'Ride' },
  [ACTIVITY.rowing]: { exerciseId: 'rower', name: 'Row' },
  [ACTIVITY.swimming]: { exerciseId: 'swim', name: 'Swim' },
};

/** What we need from a HealthKit workout (plain data, so this stays testable). */
export type HealthWorkout = {
  uuid: string;
  activityType: number;
  start: number;
  end: number;
  durationSeconds: number;
  distanceMeters?: number;
  sourceBundleId: string;
};

/** A Gymmy workout for an Apple Health one, or null for types we don't import or our own exports. */
export function workoutFromHealth(h: HealthWorkout, companionId: string): Workout | null {
  const mapped = IMPORTED[h.activityType];
  if (!mapped || h.sourceBundleId === APP_BUNDLE_ID || h.durationSeconds < 60) return null;
  return {
    id: `health_${h.uuid}`,
    name: `${mapped.name} · Apple Health`,
    startedAt: h.start,
    endedAt: h.end,
    exercises: [
      {
        id: `health_${h.uuid}_0`,
        exerciseId: mapped.exerciseId,
        sets: [
          {
            id: `health_${h.uuid}_s`,
            minutes: Math.round((h.durationSeconds / 60) * 10) / 10,
            distance: h.distanceMeters ? Math.round(h.distanceMeters) / 1000 : undefined,
            done: true,
          },
        ],
      },
    ],
    companionId,
    xp: 0,
    gems: 0,
    prs: [],
    source: 'health',
  };
}

/** How to save a Gymmy workout to Apple Health: its activity type and total distance in meters. */
export function healthExport(workout: Workout): { activityType: number; distanceMeters?: number } {
  const exercises = workout.exercises.filter((e) => e.sets.some((s) => s.done));
  const only = exercises.length === 1 ? exercises[0].exerciseId : undefined;
  const type = only
    ? Number(Object.entries(IMPORTED).find(([, v]) => v.exerciseId === only && v.name !== 'Hike')?.[0])
    : NaN;
  if (Number.isFinite(type)) {
    const km = exercises[0].sets.reduce((n, s) => n + (s.done ? (s.distance ?? 0) : 0), 0);
    return { activityType: type, distanceMeters: km ? Math.round(km * 1000) : undefined };
  }
  return { activityType: ACTIVITY.traditionalStrengthTraining };
}

/** HealthKit sleep values that count as asleep (core, deep, REM, unspecified). */
const ASLEEP = new Set([1, 3, 4, 5]);

export type SleepSample = { start: number; end: number; value: number };

/** The window for "last night": 6 pm yesterday until now. */
export function sleepWindow(now: number): { start: number; end: number } {
  const d = new Date(now);
  d.setHours(18, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return { start: d.getTime(), end: now };
}

/**
 * Hours asleep from HealthKit sleep samples, merging overlaps (an iPhone and a Watch
 * often both record the same night). Rounded to 0.1 h; null when there's no data.
 */
export function sleepHours(samples: SleepSample[], window: { start: number; end: number }): number | null {
  const spans = samples
    .filter((s) => ASLEEP.has(s.value))
    .map((s) => [Math.max(s.start, window.start), Math.min(s.end, window.end)] as const)
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0]);
  if (spans.length === 0) return null;
  let total = 0;
  let [curStart, curEnd] = spans[0];
  for (const [a, b] of spans.slice(1)) {
    if (a <= curEnd) curEnd = Math.max(curEnd, b);
    else {
      total += curEnd - curStart;
      [curStart, curEnd] = [a, b];
    }
  }
  total += curEnd - curStart;
  return Math.round((total / 3_600_000) * 10) / 10;
}
