import type { Units } from './types';
import { toDisplayWeight } from './format';

export type Metric = 'weight' | 'reps' | 'seconds';

export type Challenge = {
  id: string;
  name: string;
  /** Short description of what is measured. */
  measure: string;
  metric: Metric;
  /** Whether a higher value ranks better (false for fastest-time challenges). */
  higherIsBetter: boolean;
  /** Standards the poster confirms and reporters judge against. */
  standards: string[];
};

const LIFT_STANDARDS = ['Plates and bar visible', 'Full range of motion', 'Controlled lockout, no spotter help'];

export const CHALLENGES: Challenge[] = [
  {
    id: 'bench_1rm',
    name: 'Bench Press',
    measure: 'Heaviest single',
    metric: 'weight',
    higherIsBetter: true,
    standards: [...LIFT_STANDARDS, 'Bar touches chest, no bounce'],
  },
  {
    id: 'squat_1rm',
    name: 'Back Squat',
    measure: 'Heaviest single',
    metric: 'weight',
    higherIsBetter: true,
    standards: [...LIFT_STANDARDS, 'Hip crease below the knee'],
  },
  {
    id: 'deadlift_1rm',
    name: 'Deadlift',
    measure: 'Heaviest single',
    metric: 'weight',
    higherIsBetter: true,
    standards: [...LIFT_STANDARDS, 'Hips and knees locked out at the top'],
  },
  {
    id: 'ohp_1rm',
    name: 'Overhead Press',
    measure: 'Heaviest single',
    metric: 'weight',
    higherIsBetter: true,
    standards: [...LIFT_STANDARDS, 'Strict press, no leg drive'],
  },
  {
    id: 'pullups_max',
    name: 'Pull-ups',
    measure: 'Max reps',
    metric: 'reps',
    higherIsBetter: true,
    standards: ['Dead hang at the bottom', 'Chin over the bar', 'No kipping'],
  },
  {
    id: 'pushups_1min',
    name: 'Push-ups',
    measure: 'Max reps in 1 minute',
    metric: 'reps',
    higherIsBetter: true,
    standards: ['Timer visible or audible', 'Chest near the floor', 'Arms locked at the top'],
  },
  {
    id: 'plank_hold',
    name: 'Plank',
    measure: 'Longest hold',
    metric: 'seconds',
    higherIsBetter: true,
    standards: ['Forearms and toes only', 'Straight line from head to heels', 'One continuous clip'],
  },
  {
    id: 'row_500m',
    name: '500 m Row',
    measure: 'Fastest time',
    metric: 'seconds',
    higherIsBetter: false,
    standards: ['Monitor visible at start and finish', 'Distance set to 500 m', 'One continuous clip'],
  },
];

const BY_ID = new Map(CHALLENGES.map((c) => [c.id, c]));

export function getChallenge(id: string): Challenge {
  const challenge = BY_ID.get(id);
  if (!challenge) throw new Error(`Unknown challenge: ${id}`);
  return challenge;
}

/** Pound-for-pound ranking only makes sense for loaded lifts. */
export function supportsPoundForPound(challenge: Challenge): boolean {
  return challenge.metric === 'weight';
}

/** "m:ss.s" for times, e.g. 1:42.5. */
export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  const sec = Number.isInteger(s) ? String(s) : s.toFixed(1);
  return m > 0 ? `${m}:${sec.padStart(sec.includes('.') ? 4 : 2, '0')}` : `${sec}s`;
}

/** Parses "95", "1:42" or "1:42.5" into seconds; null if invalid. */
export function parseSeconds(text: string): number | null {
  const parts = text.trim().split(':');
  if (parts.length > 2 || parts.some((p) => p === '' || isNaN(Number(p)))) return null;
  const value = parts.length === 2 ? Number(parts[0]) * 60 + Number(parts[1]) : Number(parts[0]);
  return value > 0 ? Math.round(value * 10) / 10 : null;
}

export function formatResult(challenge: Challenge, value: number, units: Units): string {
  switch (challenge.metric) {
    case 'weight':
      return `${toDisplayWeight(value, units)} ${units}`;
    case 'reps':
      return `${value} reps`;
    case 'seconds':
      return formatSeconds(value);
  }
}
