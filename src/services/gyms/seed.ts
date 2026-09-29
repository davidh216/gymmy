import { CHALLENGES } from '@/lib/challenges';

import type { Athlete } from './types';

export type StoredGym = {
  id: string;
  kind: 'public' | 'private';
  name: string;
  area?: string;
  inviteCode?: string;
  sample?: boolean;
  members: string[];
};

export type StoredEntry = {
  id: string;
  gymId: string;
  challengeId: string;
  userId: string;
  value: number;
  bodyweightKg?: number;
  videoUri?: string;
  status: 'processing' | 'live' | 'hidden' | 'removed';
  createdAt: number;
};

const RIVALS: [string, string, number][] = [
  // username, companion, bodyweight kg
  ['ironmaiden', 'kaiju', 63],
  ['benchbro99', 'kong', 102],
  ['squatqueen', 'rex', 71],
  ['deadlift_dan', 'orca', 118],
  ['chalkdust', 'blaze', 84],
  ['plate_ape', 'kong', 95],
  ['rowgirl', 'talon', 66],
  ['zen.lifts', 'zen', 77],
  ['steadyeddie', 'steady', 88],
  ['hoot_at_5am', 'hoot', 74],
  ['mochi_mode', 'mochi', 59],
  ['sprout_strong', 'sprout', 81],
];

const KG_PER_LB = 0.45359237;

/** Typical result ranges, used to fake believable boards (lifts in lb). */
const BASE: Record<string, [number, number]> = {
  bench_1rm: [135, 345],
  squat_1rm: [185, 485],
  deadlift_1rm: [225, 585],
  ohp_1rm: [85, 225],
  pullups_max: [5, 28],
  pushups_1min: [25, 75],
  plank_hold: [60, 300],
  row_500m: [125, 88],
};

// Small deterministic PRNG so the sample world is the same on every device.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function seedWorld(now: number) {
  const rand = rng(42);
  const athletes: Athlete[] = RIVALS.map(([username, companionId], i) => ({
    id: `rival-${i}`,
    username,
    companionId,
    sample: true,
  }));
  const bodyweight = new Map(RIVALS.map(([, , bw], i) => [`rival-${i}`, bw]));

  const gyms: StoredGym[] = [
    { id: 'iron-temple', kind: 'public', name: 'Iron Temple', area: 'Downtown', sample: true, members: [] },
    { id: 'summit', kind: 'public', name: 'Summit Fitness', area: 'Westside', sample: true, members: [] },
    { id: 'northside', kind: 'public', name: 'Northside Barbell Club', area: 'North End', sample: true, members: [] },
    { id: 'harbor', kind: 'public', name: 'Harbor Strength Co.', area: 'Waterfront', sample: true, members: [] },
  ];

  const entries: StoredEntry[] = [];
  gyms.forEach((gym, g) => {
    // Each gym gets a different slice of rivals.
    const roster = athletes.filter((_, i) => (i + g) % 6 !== 0);
    gym.members = roster.map((a) => a.id);
    for (const challenge of CHALLENGES) {
      const [lo, hi] = BASE[challenge.id];
      for (const athlete of roster) {
        if (rand() < 0.15) continue; // not everyone attempts everything
        const raw = lo + (hi - lo) * rand();
        // Lifts land on 5 lb jumps like real plates, stored in kg.
        const value = challenge.metric === 'weight' ? Math.round(raw / 5) * 5 * KG_PER_LB : Math.round(raw);
        entries.push({
          id: `seed-${gym.id}-${challenge.id}-${athlete.id}`,
          gymId: gym.id,
          challengeId: challenge.id,
          userId: athlete.id,
          value,
          bodyweightKg: challenge.metric === 'weight' ? bodyweight.get(athlete.id) : undefined,
          status: 'live',
          createdAt: now - Math.floor(rand() * 60) * 24 * 60 * 60 * 1000,
        });
      }
    }
  });

  return { athletes, gyms, entries };
}
