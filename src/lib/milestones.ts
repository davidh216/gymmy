import { COMPANIONS } from './companions';
import { getExercise } from './exercises';
import { formatDistanceKm, formatMinutes, formatVolume } from './format';
import { completedPrograms } from './programs';
import { setLogged, volume } from './records';
import { bestWeekStreak } from './streaks';
import type { Units, Workout } from './types';

export type MilestoneStats = {
  workouts: number;
  bestStreak: number;
  prs: number;
  volumeKg: number;
  sets: number;
  cardioMinutes: number;
  longestCardio: number;
  /** km across every distance exercise */
  distanceKm: number;
  /** Longest single run, km */
  longestRun: number;
  exercisesTried: number;
  customExercises: number;
  buddies: number;
  planSessions: number;
  plansCompleted: number;
  earlyBirds: number;
  nightOwls: number;
};

type Format = 'count' | 'weeks' | 'kg' | 'minutes' | 'km';

type Track = {
  id: string;
  category: string;
  icon: string;
  metric: keyof MilestoneStats;
  format: Format;
  tiers: number[];
  /** One name per tier. */
  names: string[];
  /** `{n}` is replaced with the formatted target. */
  detail: string;
  /** Wording when the target is 1. */
  first?: string;
  /** Wording per tier, overriding `detail`. */
  details?: string[];
  rewards?: { xp: number; gems: number }[];
};

export type Milestone = {
  id: string;
  trackId: string;
  category: string;
  icon: string;
  metric: keyof MilestoneStats;
  format: Format;
  target: number;
  title: string;
  detail: string;
  xp: number;
  gems: number;
};

// Bigger milestones pay more. Indexed by tier.
const TIER_XP = [50, 100, 200, 350, 500, 800, 1200, 2000];
const TIER_GEMS = [25, 50, 75, 100, 150, 250, 400, 600];

const TRACKS: Track[] = [
  {
    id: 'workouts',
    category: 'Consistency',
    icon: '🏋️',
    metric: 'workouts',
    format: 'count',
    tiers: [1, 5, 10, 25, 50, 100, 250, 500],
    names: ['First Rep', 'Getting Started', 'Double Digits', 'Regular', 'Committed', 'Centurion', 'Iron Addict', 'Legend'],
    detail: 'Finish {n} workouts',
    first: 'Finish your first workout',
  },
  {
    id: 'streak',
    category: 'Consistency',
    icon: '🔥',
    metric: 'bestStreak',
    format: 'weeks',
    tiers: [2, 4, 8, 12, 26, 52],
    names: ['Two in a Row', 'Month Strong', 'Unbreakable', 'Quarter Beast', 'Half-Year Hero', 'Year of Iron'],
    detail: 'Hit your weekly goal {n} in a row',
  },
  {
    id: 'early',
    category: 'Consistency',
    icon: '🌅',
    metric: 'earlyBirds',
    format: 'count',
    tiers: [1, 10],
    names: ['Early Bird', 'Sunrise Club'],
    detail: 'Start {n} workouts before 7 am',
    first: 'Start a workout before 7 am',
  },
  {
    id: 'night',
    category: 'Consistency',
    icon: '🌙',
    metric: 'nightOwls',
    format: 'count',
    tiers: [1, 10],
    names: ['Night Owl', 'Midnight Iron'],
    detail: 'Start {n} workouts after 10 pm',
    first: 'Start a workout after 10 pm',
  },
  {
    id: 'prs',
    category: 'Strength',
    icon: '🏆',
    metric: 'prs',
    format: 'count',
    tiers: [1, 10, 25, 50, 100],
    names: ['First PR', 'PR Hunter', 'Record Breaker', 'PR Machine', 'Limitless'],
    detail: 'Set {n} personal records',
    first: 'Set your first personal record',
  },
  {
    id: 'volume',
    category: 'Strength',
    icon: '🏗️',
    metric: 'volumeKg',
    format: 'kg',
    tiers: [5_000, 25_000, 100_000, 250_000, 500_000, 1_000_000],
    names: ['Heavy Lifting', 'Pickup Truck', 'Blue Whale', 'Jumbo Jet', 'Space Station', 'Moved a Mountain'],
    detail: 'Lift {n} in total',
  },
  {
    id: 'sets',
    category: 'Strength',
    icon: '💪',
    metric: 'sets',
    format: 'count',
    tiers: [100, 500, 1000, 2500, 5000],
    names: ['Set Starter', 'Volume Dealer', 'Thousand Sets', 'Set Lord', 'Five K Club'],
    detail: 'Log {n} sets',
  },
  {
    id: 'cardio',
    category: 'Endurance',
    icon: '🫀',
    metric: 'cardioMinutes',
    format: 'minutes',
    tiers: [60, 300, 1000, 3000, 10_000],
    names: ['Heart Starter', 'Engine Builder', 'Endurance Engine', 'Iron Lungs', 'Ultra'],
    detail: 'Log {n} of cardio',
  },
  {
    id: 'long',
    category: 'Endurance',
    icon: '🏃',
    metric: 'longestCardio',
    format: 'minutes',
    tiers: [30, 60, 120, 180],
    names: ['Half-Hour Hero', 'The Hour', 'Long Hauler', 'Marathoner'],
    detail: 'Do {n} of cardio in one workout',
  },
  {
    id: 'distance',
    category: 'Endurance',
    icon: '🗺️',
    metric: 'distanceKm',
    format: 'km',
    tiers: [10, 50, 100, 250, 500, 1000],
    names: ['First Ten', 'Fifty Club', 'Century', 'Road Warrior', 'Five Hundred', 'Thousand Club'],
    detail: 'Cover {n} running, riding, rowing and more',
  },
  {
    id: 'race',
    category: 'Endurance',
    icon: '🏅',
    metric: 'longestRun',
    format: 'km',
    // A little under the race distances so 3.1 mi counts as a 5K and 26.2 mi as a marathon.
    tiers: [4.9, 9.9, 21, 42],
    names: ['5K', '10K', 'Half Marathon', 'Marathon'],
    detail: 'Run {n} in one go',
    details: ['Run a 5K in one go', 'Run 10K in one go', 'Run a half marathon in one go', 'Run a marathon in one go'],
    rewards: [
      { xp: 100, gems: 50 },
      { xp: 250, gems: 100 },
      { xp: 600, gems: 250 },
      { xp: 1500, gems: 600 },
    ],
  },
  {
    id: 'plan-sessions',
    category: 'Training plans',
    icon: '📋',
    metric: 'planSessions',
    format: 'count',
    tiers: [1, 10, 25, 50],
    names: ['On a Plan', 'Plan Follower', 'Programmed', 'Coach’s Favorite'],
    detail: 'Finish {n} training plan sessions',
    first: 'Finish a training plan session',
  },
  {
    id: 'plans',
    category: 'Training plans',
    icon: '🎖️',
    metric: 'plansCompleted',
    format: 'count',
    tiers: [1, 3],
    names: ['Plan Complete', 'Program Graduate'],
    detail: 'Finish every session of {n} training plans',
    first: 'Finish every session of a training plan',
    rewards: [
      { xp: 1000, gems: 500 },
      { xp: 2500, gems: 1000 },
    ],
  },
  {
    id: 'variety',
    category: 'Explorer',
    icon: '🧭',
    metric: 'exercisesTried',
    format: 'count',
    tiers: [5, 15, 30],
    names: ['Explorer', 'Well Rounded', 'Jack of All Lifts'],
    detail: 'Try {n} different exercises',
  },
  {
    id: 'custom',
    category: 'Explorer',
    icon: '✏️',
    metric: 'customExercises',
    format: 'count',
    tiers: [1],
    names: ['Inventor'],
    detail: 'Create a custom exercise',
  },
  {
    id: 'buddies',
    category: 'Squad',
    icon: '🐾',
    metric: 'buddies',
    format: 'count',
    tiers: [3, 6, 10, COMPANIONS.length],
    names: ['Squad Up', 'Pack Leader', 'Collector', 'Gotta Lift ’Em All'],
    detail: 'Collect {n} buddies',
  },
];

export const MILESTONES: Milestone[] = TRACKS.flatMap((t) =>
  t.tiers.map((target, i) => ({
    id: `${t.id}-${target}`,
    trackId: t.id,
    category: t.category,
    icon: t.icon,
    metric: t.metric,
    format: t.format,
    target,
    title: t.names[i],
    detail: t.details?.[i] ?? (target === 1 && t.first ? t.first : t.detail),
    xp: t.rewards?.[i].xp ?? TIER_XP[i],
    gems: t.rewards?.[i].gems ?? TIER_GEMS[i],
  })),
);

export const MILESTONE_CATEGORIES = [...new Set(TRACKS.map((t) => t.category))];

const BY_ID = new Map(MILESTONES.map((m) => [m.id, m]));

export function getMilestone(id: string): Milestone | undefined {
  return BY_ID.get(id);
}

export function milestoneStats(input: {
  workouts: Workout[];
  weeklyGoal: number;
  buddies: number;
  customExercises: number;
}): MilestoneStats {
  const { workouts } = input;
  let sets = 0;
  let cardioMinutes = 0;
  let longestCardio = 0;
  let distanceKm = 0;
  let longestRun = 0;
  const tried = new Set<string>();
  for (const w of workouts) {
    let cardio = 0;
    for (const e of w.exercises) {
      const exercise = getExercise(e.exerciseId);
      const timed = exercise.group === 'cardio' && (exercise.kind === 'duration' || exercise.kind === 'distance');
      for (const s of e.sets) {
        if (!setLogged(e.exerciseId, s)) continue;
        tried.add(e.exerciseId);
        sets++;
        if (timed) cardio += s.minutes ?? 0;
        if (exercise.kind === 'distance') distanceKm += s.distance ?? 0;
        if (e.exerciseId === 'run') longestRun = Math.max(longestRun, s.distance ?? 0);
      }
    }
    cardioMinutes += cardio;
    longestCardio = Math.max(longestCardio, cardio);
  }
  const hour = (t: number) => new Date(t).getHours();
  return {
    workouts: workouts.length,
    bestStreak: bestWeekStreak(
      workouts.map((w) => w.endedAt),
      input.weeklyGoal,
    ),
    prs: workouts.reduce((n, w) => n + w.prs.length, 0),
    volumeKg: workouts.reduce((n, w) => n + volume(w.exercises), 0),
    sets,
    cardioMinutes,
    longestCardio,
    distanceKm,
    longestRun,
    exercisesTried: tried.size,
    customExercises: input.customExercises,
    buddies: input.buddies,
    planSessions: workouts.filter((w) => w.plan).length,
    plansCompleted: completedPrograms(workouts).length,
    earlyBirds: workouts.filter((w) => hour(w.startedAt) < 7 && hour(w.startedAt) >= 3).length,
    nightOwls: workouts.filter((w) => hour(w.startedAt) >= 22).length,
  };
}

export type MilestoneState = Milestone & {
  value: number;
  achieved: boolean;
  claimedAt?: number;
};

/** Every milestone with progress; claimable ones (achieved, unclaimed) first. */
export function milestoneStates(stats: MilestoneStats, claimed: Record<string, number>): MilestoneState[] {
  return MILESTONES.map((m) => ({
    ...m,
    value: stats[m.metric],
    achieved: stats[m.metric] >= m.target,
    claimedAt: claimed[m.id],
  }));
}

/**
 * What to show: everything ready to claim, plus the next goal on each track.
 * Tracks that are fully earned show nothing here.
 */
export function visibleMilestones(states: MilestoneState[]): MilestoneState[] {
  const nextShown = new Set<string>();
  return states.filter((m) => {
    if (m.achieved) return !m.claimedAt;
    if (nextShown.has(m.trackId)) return false;
    nextShown.add(m.trackId);
    return true;
  });
}

export function formatMilestoneValue(format: Format, n: number, units: Units): string {
  switch (format) {
    case 'kg':
      return formatVolume(n, units);
    case 'minutes':
      return formatMinutes(n * 60_000);
    case 'km':
      return formatDistanceKm(n, units);
    case 'weeks':
      return `${n} ${n === 1 ? 'week' : 'weeks'}`;
    default:
      return n.toLocaleString('en-US');
  }
}

export function milestoneDetail(m: Milestone, units: Units): string {
  return m.detail.replace('{n}', formatMilestoneValue(m.format, m.target, units));
}
