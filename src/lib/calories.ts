import { getExercise } from './exercises';
import { dayKey } from './recovery';
import type { SetEntry, Workout } from './types';
import type { WeighIn } from './weight';

/**
 * Calorie estimates from MET values (multiples of resting burn). Cardio uses the ACSM walking
 * and running equations or pace bands from the Compendium of Physical Activities; lifting is
 * timed from the workout and rated by how densely sets were done. Resting burn comes from
 * Mifflin-St Jeor when height is known, otherwise the textbook 1 kcal per kg per hour.
 */

export type Sex = 'female' | 'male';

export type Body = {
  heightCm?: number;
  birthYear?: number;
  sex?: Sex;
};

export type CalorieEstimate = {
  /** Above resting: what Apple calls active energy. */
  active: number;
  /** Including what you'd have burned at rest. */
  total: number;
  minutes: number;
};

/** Age assumed for resting burn when no birth year is given. */
export const DEFAULT_AGE = 30;

/** Resting kcal per day (Mifflin-St Jeor). Without sex, the midpoint of the two formulas. */
export function restingPerDay(kg: number, body: Body | undefined, now: number): number {
  if (!body?.heightCm) return kg * 24;
  const age = body.birthYear ? Math.max(14, new Date(now).getFullYear() - body.birthYear) : DEFAULT_AGE;
  const base = 10 * kg + 6.25 * body.heightCm - 5 * age;
  const offset = body.sex === 'male' ? 5 : body.sex === 'female' ? -161 : -78;
  return Math.max(800, base + offset);
}

/** Lifting MET by set density (Compendium: light 3.5, general 5.0, vigorous 6.0). */
function liftingMet(setsPerHour: number): number {
  if (setsPerHour < 15) return 3.5;
  if (setsPerHour <= 25) return 5.0;
  return 6.0;
}

/** Conditioning moves done hard and fast, like circuit training. */
const CONDITIONING = new Set([
  'sled_push',
  'sled_pull',
  'sandbag_lunge',
  'wall_ball',
  'farmers_carry',
  'burpee_broad_jump',
]);
const CONDITIONING_MET = 8.0;

/** Minutes per km when a cardio set has a distance but no time. */
const DEFAULT_PACE: Record<string, number> = { run: 6, walk: 12, bike: 3, rower: 5, ski_erg: 5.5, swim: 25 };

/** MET for a cardio set from its speed, or a typical value when there's no pace. */
export function cardioMet(exerciseId: string, km: number | undefined, minutes: number): number {
  const mPerMin = km && minutes ? (km * 1000) / minutes : undefined;
  switch (exerciseId) {
    case 'run':
      // ACSM running: VO2 = 0.2 × speed + 3.5 (ml/kg/min).
      return mPerMin ? Math.max(6, (0.2 * mPerMin + 3.5) / 3.5) : 9.8;
    case 'walk':
      // ACSM walking: VO2 = 0.1 × speed + 3.5.
      return mPerMin ? Math.max(2, Math.min(7, (0.1 * mPerMin + 3.5) / 3.5)) : 3.5;
    case 'bike': {
      if (!mPerMin) return 7.0;
      const kmh = (mPerMin * 60) / 1000;
      return kmh < 16 ? 4.0 : kmh < 19 ? 6.8 : kmh < 22 ? 8.0 : kmh < 25 ? 10.0 : 12.0;
    }
    case 'rower':
    case 'ski_erg':
      // 2:30/500 m is 200 m/min; 2:00/500 m is 250.
      if (!mPerMin) return 7.0;
      return mPerMin < 200 ? 6.0 : mPerMin < 222 ? 7.0 : mPerMin < 250 ? 8.5 : 11.0;
    case 'swim':
      if (!mPerMin) return 7.0;
      return mPerMin < 40 ? 6.0 : mPerMin < 60 ? 8.3 : 10.0;
    case 'stair_climber':
      return 9.0;
    case 'jump_rope':
      return 11.0;
    default:
      return getExercise(exerciseId).group === 'cardio' ? 7.0 : 3.8;
  }
}

/** Minutes a timed or distance set took, estimating from a typical pace when only distance is logged. */
function setMinutes(exerciseId: string, s: SetEntry): number {
  if (s.minutes) return s.minutes;
  if (s.distance) return s.distance * (DEFAULT_PACE[exerciseId] ?? 6);
  return 0;
}

/** Longest stretch a workout counts for, so a timer left running doesn't add hours. */
const MAX_MINUTES = 4 * 60;
/** Typical time per lifting set, rest included, when the workout's clock is too short to cover them. */
const MINUTES_PER_SET = 3;
/** Less clock than this per set means the workout wasn't timed live. */
const MIN_MINUTES_PER_SET = 1.5;

export function estimateCalories(workout: Workout, kg: number, body: Body | undefined): CalorieEstimate {
  const restingPerMin = restingPerDay(kg, body, workout.endedAt) / 1440;
  const duration = Math.min(MAX_MINUTES, Math.max(0, (workout.endedAt - workout.startedAt) / 60_000));

  let cardioMinutes = 0;
  let cardioMetMinutes = 0;
  const liftingSets: string[] = [];
  for (const e of workout.exercises) {
    const kind = getExercise(e.exerciseId).kind;
    for (const s of e.sets) {
      if (!s.done) continue;
      if (kind === 'distance' || kind === 'duration') {
        const m = setMinutes(e.exerciseId, s);
        cardioMinutes += m;
        cardioMetMinutes += cardioMet(e.exerciseId, s.distance, m) * m;
      } else {
        liftingSets.push(e.exerciseId);
      }
    }
  }

  let liftMinutes = 0;
  let liftMet = 0;
  if (liftingSets.length) {
    // Lifting fills the rest of the workout's clock, unless that's too short to have done the sets
    // (say, logged afterwards), in which case each set counts a typical few minutes.
    const clock = duration - cardioMinutes;
    liftMinutes = clock >= liftingSets.length * MIN_MINUTES_PER_SET ? clock : liftingSets.length * MINUTES_PER_SET;
    const base = liftingMet((liftingSets.length / liftMinutes) * 60);
    liftMet =
      liftingSets.reduce((sum, id) => sum + (CONDITIONING.has(id) ? CONDITIONING_MET : base), 0) / liftingSets.length;
  }

  const minutes = cardioMinutes + liftMinutes;
  const metMinutes = cardioMetMinutes + liftMet * liftMinutes;
  const total = metMinutes * restingPerMin;
  const active = Math.max(0, (metMinutes - minutes) * restingPerMin);
  return { active: Math.round(active), total: Math.round(total), minutes: Math.round(minutes) };
}

/** The weight that applies to a day: the latest weigh-in on or before it, else the first one after. */
export function weightOn(weighIns: Record<string, WeighIn>, ts: number): number | undefined {
  const day = dayKey(ts);
  const all = Object.values(weighIns).sort((a, b) => a.date.localeCompare(b.date));
  let best: WeighIn | undefined;
  for (const w of all) {
    if (w.date <= day) best = w;
    else break;
  }
  return (best ?? all[0])?.kg;
}

/** "320 kcal". */
export function formatKcal(kcal: number): string {
  return `${kcal.toLocaleString('en-US')} kcal`;
}

/** A workout's estimate at the weight you were then; undefined until you've logged a weight. */
export function workoutCalories(
  workout: Workout,
  weighIns: Record<string, WeighIn>,
  body: Body | undefined,
): CalorieEstimate | undefined {
  const kg = weightOn(weighIns, workout.endedAt);
  return kg === undefined ? undefined : estimateCalories(workout, kg, body);
}

/** Active kcal across workouts; undefined until you've logged a weight. */
export function activeCalories(
  workouts: Workout[],
  weighIns: Record<string, WeighIn>,
  body: Body | undefined,
): number | undefined {
  let sum = 0;
  for (const w of workouts) {
    const e = workoutCalories(w, weighIns, body);
    if (!e) return undefined;
    sum += e.active;
  }
  return sum;
}
