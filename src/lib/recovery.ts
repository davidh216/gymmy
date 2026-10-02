import { getExercise, type MuscleGroup } from './exercises';
import { setLogged } from './records';
import type { Workout } from './types';

const HOUR = 3_600_000;

/** A 1–5 rating. For soreness and stress 1 is best; for energy 5 is best. */
export type Rating = 1 | 2 | 3 | 4 | 5;

export type CheckIn = {
  /** Local date, YYYY-MM-DD. */
  date: string;
  at: number;
  sleepHours?: number;
  /** Set when the sleep came from Apple Health; that sleep stays on the phone and never syncs. */
  sleepSource?: 'health';
  soreness?: Rating;
  energy?: Rating;
  stress?: Rating;
  /** A planned rest day. */
  rest: boolean;
  activities: string[];
};

export const RECOVERY_ACTIVITIES = [
  { id: 'stretch', label: 'Stretching', emoji: '🧘' },
  { id: 'mobility', label: 'Mobility', emoji: '🤸' },
  { id: 'foam', label: 'Foam rolling', emoji: '🧽' },
  { id: 'walk', label: 'Easy walk', emoji: '🚶' },
  { id: 'yoga', label: 'Yoga', emoji: '🪷' },
  { id: 'massage', label: 'Massage', emoji: '💆' },
  { id: 'sauna', label: 'Sauna', emoji: '🔥' },
  { id: 'cold', label: 'Cold plunge', emoji: '🧊' },
  { id: 'nap', label: 'Nap', emoji: '😴' },
] as const;

export const RATING_LABELS = {
  soreness: ['None', 'Light', 'Some', 'Sore', 'Very sore'],
  energy: ['Drained', 'Low', 'Okay', 'Good', 'Great'],
  stress: ['Calm', 'Low', 'Some', 'High', 'Maxed'],
} as const;

/** Local calendar day for a timestamp, e.g. "2026-10-01". */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Noon on a "YYYY-MM-DD" local date. */
export function dayKeyTime(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}

/** Days in a row with a workout, ending today (or yesterday if today has none yet). */
export function trainingDaysInRow(workouts: Workout[], now: number): number {
  const days = new Set(workouts.map((w) => dayKey(w.endedAt)));
  const d = new Date(now);
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d.getTime()))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Hours for a muscle group to recover from hard work. */
const RECOVERY_HOURS: Record<Exclude<MuscleGroup, 'cardio'>, number> = {
  legs: 72,
  back: 72,
  chest: 60,
  shoulders: 60,
  arms: 48,
  core: 48,
};

export type MuscleState = {
  group: Exclude<MuscleGroup, 'cardio'>;
  /** 0 = wrecked, 1 = fresh. */
  recovered: number;
};

/** Sets that fully fatigue a muscle group. */
const FATIGUE_SETS = 15;

/**
 * Rough recovery per muscle group: each hard set adds fatigue that fades out over the
 * group's recovery window. Long runs and rides count toward legs.
 */
export function muscleRecovery(workouts: Workout[], now: number): MuscleState[] {
  const load = new Map<string, number>();
  for (const w of workouts) {
    const hours = (now - w.endedAt) / HOUR;
    if (hours < 0 || hours > 96) continue;
    for (const e of w.exercises) {
      const ex = getExercise(e.exerciseId);
      const done = e.sets.filter((s) => setLogged(e.exerciseId, s));
      if (done.length === 0) continue;
      // Cardio: roughly one leg set per 10 minutes.
      const group = ex.group === 'cardio' ? 'legs' : ex.group;
      const sets =
        ex.group === 'cardio' ? done.reduce((n, s) => n + (s.minutes ?? (s.distance ?? 0) * 6) / 10, 0) * 0.5 : done.length;
      const window = RECOVERY_HOURS[group as keyof typeof RECOVERY_HOURS];
      const fade = Math.max(0, 1 - hours / window);
      load.set(group, (load.get(group) ?? 0) + sets * fade);
    }
  }
  return (Object.keys(RECOVERY_HOURS) as MuscleState['group'][]).map((group) => ({
    group,
    recovered: Math.max(0, 1 - (load.get(group) ?? 0) / FATIGUE_SETS),
  }));
}

export type Readiness = {
  score: number;
  label: string;
  emoji: string;
  advice: string;
  /** False when there's no check-in today, so the score is from training only. */
  checkedIn: boolean;
  factors: { label: string; score: number }[];
};

function sleepScore(hours: number): number {
  if (hours >= 8) return 100;
  if (hours >= 7) return 85;
  if (hours >= 6) return 65;
  if (hours >= 5) return 40;
  return 20;
}

const fromRating = (r: Rating, highIsGood: boolean) => (highIsGood ? r - 1 : 5 - r) * 20 + 20;

/** How ready you are to train today, from your check-in and recent training. */
export function readiness(
  checkIn: CheckIn | undefined,
  workouts: Workout[],
  now: number,
  /** Heart signals from Apple Health (see heartScore), when connected. */
  heart?: number,
): Readiness {
  const inRow = trainingDaysInRow(workouts, now);
  const muscles = muscleRecovery(workouts, now);
  const avgRecovered = muscles.reduce((n, m) => n + m.recovered, 0) / muscles.length;
  const rowScore = [100, 100, 85, 70, 55][inRow] ?? 40;
  const loadScore = Math.round(rowScore * 0.5 + avgRecovered * 100 * 0.5);

  const factors: Readiness['factors'] = [{ label: 'Training load', score: loadScore }];
  const weighted: [number, number][] = [[loadScore, 0.2]];
  if (checkIn?.sleepHours !== undefined) {
    const s = sleepScore(checkIn.sleepHours);
    factors.push({ label: 'Sleep', score: s });
    weighted.push([s, 0.3]);
  }
  if (heart !== undefined) {
    factors.push({ label: 'Heart (HRV)', score: heart });
    weighted.push([heart, 0.3]);
  }
  if (checkIn?.soreness) {
    const s = fromRating(checkIn.soreness, false);
    factors.push({ label: 'Soreness', score: s });
    weighted.push([s, 0.2]);
  }
  if (checkIn?.energy) {
    const s = fromRating(checkIn.energy, true);
    factors.push({ label: 'Energy', score: s });
    weighted.push([s, 0.2]);
  }
  if (checkIn?.stress) {
    const s = fromRating(checkIn.stress, false);
    factors.push({ label: 'Stress', score: s });
    weighted.push([s, 0.1]);
  }
  const total = weighted.reduce((n, [, w]) => n + w, 0);
  const score = Math.round(weighted.reduce((n, [s, w]) => n + s * w, 0) / total);

  const band =
    score >= 80
      ? { label: 'Ready to push', emoji: '🟢', advice: 'Good day for a hard session or a PR attempt.' }
      : score >= 60
        ? { label: 'Train as planned', emoji: '🟡', advice: 'You’re good to go. Listen to your body on the last sets.' }
        : score >= 40
          ? { label: 'Go light', emoji: '🟠', advice: 'Keep it easy: technique, mobility or a zone 2 cardio session.' }
          : { label: 'Rest day', emoji: '🔴', advice: 'Recovery is training too. Rest, sleep and eat well today.' };

  return { score, ...band, checkedIn: Boolean(checkIn), factors };
}

/** Check-ins from the last `days` days, newest first. */
export function recentCheckIns(checkIns: Record<string, CheckIn>, now: number, days = 7): CheckIn[] {
  const out: CheckIn[] = [];
  const d = new Date(now);
  for (let i = 0; i < days; i++) {
    const c = checkIns[dayKey(d.getTime())];
    if (c) out.push(c);
    d.setDate(d.getDate() - 1);
  }
  return out;
}
