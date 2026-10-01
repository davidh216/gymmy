/** XP required to go from `level` to `level + 1`. */
export function xpToNext(level: number): number {
  return 100 + 50 * (level - 1);
}

export function levelFromXp(totalXp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  return { level, into: remaining, needed: xpToNext(level) };
}

export type RewardInput = {
  completedSets: number;
  prCount: number;
  /** Consecutive weeks the weekly goal has been hit. */
  streakWeeks: number;
  /** Fractional bonus from the active companion, e.g. 0.1 for +10%. */
  companionBonus: number;
  /** True when this workout is the one that hits this week's goal. */
  hitsWeeklyGoal: boolean;
  /** Name of the training plan, when this was a plan session. */
  plan?: string;
};

export type RewardLine = { label: string; xp?: number; gems?: number };

export type Rewards = { xp: number; gems: number; lines: RewardLine[] };

export const STREAK_BONUS_PER_WEEK = 0.1;
export const STREAK_BONUS_CAP = 0.5;
export const SUMMON_COST = 100;
export const SUMMON_10_COST = 900;
export const STARTING_GEMS = 100;

export function workoutRewards(input: RewardInput): Rewards {
  const lines: RewardLine[] = [];
  lines.push({ label: 'Workout complete', xp: 50, gems: 25 });
  if (input.completedSets > 0) {
    lines.push({ label: `${input.completedSets} sets logged`, xp: input.completedSets * 8 });
  }
  if (input.prCount > 0) {
    lines.push({
      label: `${input.prCount} personal record${input.prCount > 1 ? 's' : ''}`,
      xp: input.prCount * 40,
      gems: input.prCount * 15,
    });
  }
  if (input.plan) lines.push({ label: `${input.plan} session`, xp: 30, gems: 10 });
  if (input.hitsWeeklyGoal) lines.push({ label: 'Weekly goal smashed', gems: 100 });

  const baseXp = lines.reduce((n, l) => n + (l.xp ?? 0), 0);
  const streakBonus = Math.min(STREAK_BONUS_CAP, input.streakWeeks * STREAK_BONUS_PER_WEEK);
  const streakXp = Math.round(baseXp * streakBonus);
  if (streakXp > 0) lines.push({ label: `${input.streakWeeks}-week streak`, xp: streakXp });
  const companionXp = Math.round(baseXp * input.companionBonus);
  if (companionXp > 0) lines.push({ label: 'Companion bonus', xp: companionXp });

  return {
    xp: lines.reduce((n, l) => n + (l.xp ?? 0), 0),
    gems: lines.reduce((n, l) => n + (l.gems ?? 0), 0),
    lines,
  };
}
