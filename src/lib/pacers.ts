import type { Challenge } from './challenges';
import type { RankableEntry } from './leaderboard';

/**
 * Baseline rows shown on every board so new boards aren't empty and people have a
 * first target. They're clearly labelled, have no video, can't be reported and never
 * win crowns or medals.
 */
export type Pacer = {
  /** Shown as the row's name, e.g. "1 plate". */
  label: string;
  /** kg, reps or seconds, like a real entry. */
  value: number;
  reps?: number;
};

export const PACER_PREFIX = 'pacer:';

/** A typical lifter's bodyweight, so pacers also rank on bodyweight % boards. */
export const PACER_BODYWEIGHT_KG = 80;

const LB = 0.45359237;
const lb = (pounds: number) => Math.round(pounds * LB * 1000) / 1000;

// Lifts are all sets of 5, so each tier is heavier on every board: total, max and bodyweight %.
const PACERS: Record<string, Pacer[]> = {
  bench_1rm: [
    { label: '1 plate', value: lb(135), reps: 5 },
    { label: '1 plate + 25s', value: lb(185), reps: 5 },
    { label: '2 plates', value: lb(225), reps: 5 },
  ],
  squat_1rm: [
    { label: '1 plate', value: lb(135), reps: 5 },
    { label: '2 plates', value: lb(225), reps: 5 },
    { label: '3 plates', value: lb(315), reps: 5 },
  ],
  deadlift_1rm: [
    { label: '1 plate', value: lb(135), reps: 5 },
    { label: '2 plates', value: lb(225), reps: 5 },
    { label: '3 plates', value: lb(315), reps: 5 },
  ],
  ohp_1rm: [
    { label: 'Bar + 25s', value: lb(95), reps: 5 },
    { label: '1 plate', value: lb(135), reps: 5 },
  ],
  farmers_carry: [
    { label: 'Starter', value: lb(50) },
    { label: 'Solid', value: lb(70) },
    { label: 'Strong', value: lb(100) },
  ],
  pullups_max: [
    { label: 'Starter', value: 5 },
    { label: 'Solid', value: 10 },
    { label: 'Strong', value: 15 },
  ],
  pushups_1min: [
    { label: 'Starter', value: 20 },
    { label: 'Solid', value: 35 },
    { label: 'Strong', value: 50 },
  ],
  plank_hold: [
    { label: 'Starter', value: 60 },
    { label: 'Solid', value: 120 },
    { label: 'Strong', value: 180 },
  ],
  row_500m: [
    { label: 'Starter', value: 120 },
    { label: 'Solid', value: 105 },
    { label: 'Strong', value: 95 },
  ],
  row_2k: [
    { label: 'Starter', value: 540 },
    { label: 'Solid', value: 480 },
    { label: 'Strong', value: 435 },
  ],
  run_1mi: [
    { label: 'Starter', value: 600 },
    { label: 'Solid', value: 480 },
    { label: 'Strong', value: 390 },
  ],
  run_5k: [
    { label: 'Starter', value: 1800 },
    { label: 'Solid', value: 1500 },
    { label: 'Strong', value: 1260 },
  ],
};

export function pacersFor(challengeId: string): Pacer[] {
  return PACERS[challengeId] ?? [];
}

export function isPacerId(id: string): boolean {
  return id.startsWith(PACER_PREFIX);
}

/**
 * Pacers as board entries. They're stamped `now` so they sit in every season and
 * real entries posted earlier win ties against them.
 */
export function pacerEntries(challenge: Challenge, now: number): (RankableEntry & { pacer: Pacer })[] {
  return pacersFor(challenge.id).map((pacer, i) => ({
    id: `${PACER_PREFIX}${challenge.id}:${i}`,
    userId: `${PACER_PREFIX}${i}`,
    value: pacer.value,
    reps: pacer.reps,
    bodyweightKg: PACER_BODYWEIGHT_KG,
    createdAt: now,
    pacer,
  }));
}
