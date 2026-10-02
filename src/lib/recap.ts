import { getExercise } from './exercises';
import { formatDistanceKm, formatVolume } from './format';
import { completedSets, volume } from './records';
import { dayKeyTime, type CheckIn } from './recovery';
import { weekStart } from './streaks';
import type { PersonalRecord, Units, Workout } from './types';

export type WeekTotals = {
  /** Days with at least one workout. */
  days: number;
  workouts: number;
  sets: number;
  /** kg × reps across weighted sets. */
  volumeKg: number;
  distanceKm: number;
  /** Time spent training, from workout start to finish. */
  minutes: number;
};

export type WeekRecap = WeekTotals & {
  /** Local midnight on the Monday that starts the week. */
  start: number;
  /** Local midnight on the following Monday. */
  end: number;
  goal: number;
  goalHit: boolean;
  /** The best new record per exercise, biggest jump first. */
  prs: PersonalRecord[];
  /** The exercise with the most completed sets. */
  topExercise?: { exerciseId: string; sets: number };
  milestones: number;
  restDays: number;
  checkIns: number;
  sleepAvg?: number;
  energyAvg?: number;
  previous: WeekTotals;
};

/** Monday midnight `weeks` weeks before the week of `ts` (DST-safe). */
export function shiftWeek(start: number, weeks: number): number {
  const d = new Date(start);
  d.setDate(d.getDate() + weeks * 7);
  return weekStart(d.getTime() + 12 * 3_600_000);
}

function totals(workouts: Workout[]): WeekTotals {
  const days = new Set(workouts.map((w) => new Date(w.endedAt).toDateString()));
  let sets = 0;
  let volumeKg = 0;
  let distanceKm = 0;
  let minutes = 0;
  for (const w of workouts) {
    sets += completedSets(w.exercises);
    volumeKg += volume(w.exercises);
    minutes += Math.max(0, w.endedAt - w.startedAt) / 60_000;
    for (const e of w.exercises) for (const s of e.sets) if (s.done && s.distance) distanceKm += s.distance;
  }
  return {
    days: days.size,
    workouts: workouts.length,
    sets,
    volumeKg,
    distanceKm,
    minutes: Math.round(minutes),
  };
}

const inWeek = (ts: number, start: number) => ts >= start && ts < shiftWeek(start, 1);

/** Everything you did in the week starting `start` (a Monday from `weekStart`). */
export function weekRecap(input: {
  start: number;
  workouts: Workout[];
  checkIns: Record<string, CheckIn>;
  claimedMilestones: Record<string, number>;
  weeklyGoal: number;
}): WeekRecap {
  const { start, weeklyGoal } = input;
  const end = shiftWeek(start, 1);
  const week = input.workouts.filter((w) => inWeek(w.endedAt, start));
  const prevStart = shiftWeek(start, -1);
  const current = totals(week);

  const bestPr = new Map<string, PersonalRecord>();
  for (const w of [...week].sort((a, b) => a.endedAt - b.endedAt)) {
    for (const pr of w.prs) {
      const seen = bestPr.get(pr.exerciseId);
      // Keep the week's starting point and its final best, so the jump covers the whole week.
      bestPr.set(pr.exerciseId, seen ? { ...pr, previous: seen.previous } : pr);
    }
  }
  const gain = (p: PersonalRecord) => (p.previous > 0 ? (p.value - p.previous) / p.previous : 1);
  const prs = [...bestPr.values()].sort((a, b) => gain(b) - gain(a));

  const setCounts = new Map<string, number>();
  for (const w of week) {
    for (const e of w.exercises) {
      const n = completedSets([e]);
      if (n) setCounts.set(e.exerciseId, (setCounts.get(e.exerciseId) ?? 0) + n);
    }
  }
  let topExercise: WeekRecap['topExercise'];
  for (const [exerciseId, sets] of setCounts)
    if (!topExercise || sets > topExercise.sets) topExercise = { exerciseId, sets };

  const checks = Object.values(input.checkIns).filter((c) => inWeek(dayKeyTime(c.date), start));
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);

  return {
    ...current,
    start,
    end,
    goal: weeklyGoal,
    goalHit: current.days >= weeklyGoal,
    prs,
    topExercise,
    milestones: Object.values(input.claimedMilestones).filter((t) => inWeek(t, start)).length,
    restDays: checks.filter((c) => c.rest).length,
    checkIns: checks.length,
    sleepAvg: avg(checks.flatMap((c) => (c.sleepHours !== undefined ? [c.sleepHours] : []))),
    energyAvg: avg(checks.flatMap((c) => (c.energy !== undefined ? [c.energy] : []))),
    previous: totals(input.workouts.filter((w) => inWeek(w.endedAt, prevStart))),
  };
}

/** True when there's anything worth recapping. */
export function hasActivity(r: WeekRecap): boolean {
  return r.workouts > 0 || r.checkIns > 0;
}

/** Change against last week as "+12%", or undefined when there's nothing to compare. */
export function change(now: number, before: number): string | undefined {
  if (before <= 0 || now === before) return undefined;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return undefined;
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`;
}

/** "Sep 21 – 27" or "Sep 28 – Oct 4". */
export function weekLabel(start: number): string {
  const last = new Date(shiftWeek(start, 1) - 12 * 3_600_000);
  const first = new Date(start);
  const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  const tail = first.getMonth() === last.getMonth() ? `${last.getDate()}` : `${month(last)} ${last.getDate()}`;
  return `${month(first)} ${first.getDate()} – ${tail}`;
}

/** A short, upbeat headline for the week. */
export function recapHeadline(r: WeekRecap): string {
  if (r.workouts === 0) return r.restDays ? 'A recovery week' : 'A quiet week';
  if (r.goalHit && r.prs.length) return 'Goal smashed, records broken';
  if (r.goalHit) return r.days > r.goal ? 'Above and beyond' : 'Weekly goal hit';
  if (r.prs.length) return 'New records set';
  return 'Kept it moving';
}

/** The recap as a message to share. Only totals: no body data like sleep. */
export function recapShareText(r: WeekRecap, units: Units): string {
  const lines = [`My Gymmy week · ${weekLabel(r.start)}`, recapHeadline(r)];
  lines.push(`🔥 ${r.days}/${r.goal} training days${r.goalHit ? ' ✅' : ''}`);
  if (r.workouts) lines.push(`🏋️ ${r.workouts} workout${r.workouts === 1 ? '' : 's'} · ${r.sets} sets`);
  if (r.volumeKg) lines.push(`💪 ${formatVolume(r.volumeKg, units)} moved`);
  if (r.distanceKm) lines.push(`🏃 ${formatDistanceKm(r.distanceKm, units)}`);
  if (r.prs.length) {
    const names = r.prs.slice(0, 3).map((p) => getExercise(p.exerciseId).name);
    lines.push(
      `🏆 ${r.prs.length} new best${r.prs.length === 1 ? '' : 's'}: ${names.join(', ')}${r.prs.length > 3 ? '…' : ''}`,
    );
  }
  if (r.milestones) lines.push(`💎 ${r.milestones} milestone${r.milestones === 1 ? '' : 's'} earned`);
  return lines.join('\n');
}
