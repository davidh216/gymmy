import { dayKey, dayKeyTime } from './recovery';

/** One body-weight reading per day. Typed in, or read from Apple Health (stays on the phone). */
export type WeighIn = {
  /** Local day, YYYY-MM-DD. */
  date: string;
  kg: number;
  source?: 'health';
  /** When it was logged, ms. */
  at: number;
};

export type WeightDirection = 'lose' | 'maintain' | 'gain';

export type WeightGoal = {
  direction: WeightDirection;
  /** Target change per week in kg, always positive; ignored for maintain. */
  ratePerWeekKg: number;
};

/** The weekly weigh-in review, off until the user turns it on. */
export type WeightReviewSettings = {
  enabled: boolean;
  goal?: WeightGoal;
};

/** Gains or losses within this much per week count as maintaining. */
export const MAINTAIN_BAND_KG = 0.25;
/** Weeks of history the trend uses. */
export const TREND_WEEKS = 4;
const DAY = 86_400_000;

/** Local midnight on the Sunday that starts the week of `ts` (DST-safe). */
export function sundayStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

/** Sunday `weeks` weeks after `start` (negative goes back). */
export function shiftSunday(start: number, weeks: number): number {
  const d = new Date(start);
  d.setDate(d.getDate() + weeks * 7);
  return sundayStart(d.getTime() + 12 * 3_600_000);
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);

/** Average weight for each of the last `weeks` weeks ending with the week of `now`, oldest first. */
export function weeklyAverages(
  weighIns: Record<string, WeighIn>,
  weeks: number,
  now: number,
): { start: number; avgKg?: number; count: number }[] {
  const current = sundayStart(now);
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = shiftSunday(current, -i);
    const end = shiftSunday(start, 1);
    const kgs = Object.values(weighIns)
      .filter((w) => {
        const t = dayKeyTime(w.date);
        return t >= start && t < end;
      })
      .map((w) => w.kg);
    out.push({ start, avgKg: avg(kgs), count: kgs.length });
  }
  return out;
}

/**
 * Change per week from a least-squares line through daily readings over the last few weeks.
 * Needs readings on at least two days a week apart; undefined otherwise.
 */
export function trendPerWeek(weighIns: Record<string, WeighIn>, now: number, weeks = TREND_WEEKS): number | undefined {
  const since = shiftSunday(sundayStart(now), -(weeks - 1));
  const until = shiftSunday(sundayStart(now), 1);
  // Readings sit at noon on their day, so today's counts even in the morning.
  const points = Object.values(weighIns)
    .map((w) => ({ x: dayKeyTime(w.date) / DAY, y: w.kg }))
    .filter((p) => p.x * DAY >= since && p.x * DAY < until);
  if (points.length < 2) return undefined;
  const xs = points.map((p) => p.x);
  if (Math.max(...xs) - Math.min(...xs) < 7) return undefined;
  const mx = avg(xs)!;
  const my = avg(points.map((p) => p.y))!;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  return den === 0 ? undefined : (num / den) * 7;
}

export type GoalStatus = 'on_track' | 'ahead' | 'behind' | 'wrong_way';

/** How the trend compares with the goal. Ahead means faster than planned. */
export function goalStatus(goal: WeightGoal, perWeek: number): GoalStatus {
  if (goal.direction === 'maintain') return Math.abs(perWeek) <= MAINTAIN_BAND_KG ? 'on_track' : 'wrong_way';
  const signed = goal.direction === 'lose' ? -perWeek : perWeek;
  if (signed <= 0) return 'wrong_way';
  const target = Math.max(goal.ratePerWeekKg, 0.05);
  if (signed < target * 0.6) return 'behind';
  if (signed > target * 1.5) return 'ahead';
  return 'on_track';
}

export type WeeklyReview = {
  weekStart: number;
  thisWeekKg?: number;
  lastWeekKg?: number;
  /** This week's average minus last week's. */
  changeKg?: number;
  perWeekKg?: number;
  status?: GoalStatus;
  /** Weekly averages for the chart, oldest first. */
  weeks: { start: number; avgKg?: number }[];
};

export function weeklyReview(
  weighIns: Record<string, WeighIn>,
  goal: WeightGoal | undefined,
  now: number,
): WeeklyReview {
  const weeks = weeklyAverages(weighIns, 8, now);
  const thisWeekKg = weeks[weeks.length - 1].avgKg;
  // The week just finished is the comparison point until this week has readings.
  const lastWeekKg = weeks[weeks.length - 2].avgKg;
  const perWeekKg = trendPerWeek(weighIns, now);
  return {
    weekStart: sundayStart(now),
    thisWeekKg,
    lastWeekKg,
    changeKg: thisWeekKg !== undefined && lastWeekKg !== undefined ? thisWeekKg - lastWeekKg : undefined,
    perWeekKg,
    status: goal && perWeekKg !== undefined ? goalStatus(goal, perWeekKg) : undefined,
    weeks,
  };
}

/** The review card shows once a week for people who turned it on. */
export function shouldPromptReview(settings: WeightReviewSettings | undefined, seenWeek: number, now: number): boolean {
  return Boolean(settings?.enabled) && seenWeek < sundayStart(now);
}

/** Best guess for today's weight: a fresh Health reading, else your latest weigh-in. */
export function suggestedWeight(
  weighIns: Record<string, WeighIn>,
  health: { kg?: number; at?: number } | undefined,
  now: number,
): number | undefined {
  if (health?.kg && health.at && now - health.at < 3 * DAY) return health.kg;
  const latest = Object.values(weighIns).sort((a, b) => b.date.localeCompare(a.date))[0];
  return latest?.kg ?? health?.kg;
}

/** Health readings by day (latest each day), skipping days you typed in yourself. */
export function mergeHealthWeights(
  weighIns: Record<string, WeighIn>,
  samples: { kg: number; at: number }[],
): Record<string, WeighIn> {
  const byDay = new Map<string, { kg: number; at: number }>();
  for (const s of samples) {
    const key = dayKey(s.at);
    const seen = byDay.get(key);
    if (!seen || s.at > seen.at) byDay.set(key, s);
  }
  let changed = false;
  const next = { ...weighIns };
  for (const [date, s] of byDay) {
    const mine = next[date];
    if (mine && !mine.source) continue;
    if (mine && mine.kg === s.kg) continue;
    next[date] = { date, kg: Math.round(s.kg * 100) / 100, source: 'health', at: s.at };
    changed = true;
  }
  return changed ? next : weighIns;
}
