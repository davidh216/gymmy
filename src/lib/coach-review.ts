import { getExercise, type MuscleGroup } from './exercises';
import { shiftWeek } from './recap';
import { dayKeyTime, type CheckIn } from './recovery';
import type { Workout, WorkoutExercise } from './types';

export type CoachNote = {
  id: 'plan' | 'targets' | 'neglected' | 'deload' | 'tired';
  emoji: string;
  text: string;
  tone: 'good' | 'tip' | 'warn';
};

export type CoachReview = {
  /** Working sets per muscle group this week. */
  setsByGroup: Partial<Record<MuscleGroup, number>>;
  /** Lifts with a coach target that you met or beat, out of those with one. */
  targets: { met: number; total: number };
  notes: CoachNote[];
};

/** Groups worth flagging when they go untrained; arms and core get work from the big lifts. */
const MAJOR: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders'];
const GROUP_NAMES: Record<MuscleGroup, string> = {
  chest: 'chest',
  back: 'back',
  legs: 'legs',
  shoulders: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  core: 'core',
  cardio: 'cardio',
};
/** Weeks of steady training before the coach suggests an easier week. */
export const DELOAD_AFTER_WEEKS = 6;
/** A week counts as training with at least this many workouts. */
const TRAINING_WEEK = 2;

const inWeek = (ts: number, start: number) => ts >= start && ts < shiftWeek(start, 1);
const working = (e: WorkoutExercise) => e.sets.filter((s) => s.done && !s.warmup);

/** Every working set reached the coach's weight and reps. */
export function metTarget(e: WorkoutExercise): boolean {
  if (!e.coach) return false;
  const sets = working(e).filter((s) => s.weight !== undefined);
  return sets.length > 0 && sets.every((s) => s.weight! >= e.coach!.weight - 0.01 && (s.reps ?? 0) >= e.coach!.reps);
}

function setsByGroup(workouts: Workout[]): Partial<Record<MuscleGroup, number>> {
  const out: Partial<Record<MuscleGroup, number>> = {};
  for (const w of workouts) {
    for (const e of w.exercises) {
      const n = working(e).length;
      if (!n) continue;
      const g = getExercise(e.exerciseId).group;
      out[g] = (out[g] ?? 0) + n;
    }
  }
  return out;
}

const list = (xs: string[]) =>
  xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

/**
 * The coach's read on the week starting `start` (a Monday): plan sessions done, targets met,
 * muscles left out, and whether it's time for an easier week.
 */
export function coachReview(input: {
  start: number;
  workouts: Workout[];
  checkIns: Record<string, CheckIn>;
  plan?: { programId: string; daysPerWeek: number; name: string } | null;
}): CoachReview {
  const { start, workouts } = input;
  const week = workouts.filter((w) => inWeek(w.endedAt, start));
  const lastWeek = workouts.filter((w) => inWeek(w.endedAt, shiftWeek(start, -1)));
  const groups = setsByGroup(week);
  const notes: CoachNote[] = [];

  if (input.plan) {
    const done = week.filter((w) => w.plan?.programId === input.plan!.programId).length;
    const all = done >= input.plan.daysPerWeek;
    notes.push({
      id: 'plan',
      emoji: all ? '✅' : '📋',
      text: `${done} of ${input.plan.daysPerWeek} ${input.plan.name} sessions${all ? '. Right on plan.' : '.'}`,
      tone: all ? 'good' : 'tip',
    });
  }

  const withTarget = week.flatMap((w) => w.exercises.filter((e) => e.coach && working(e).length));
  const met = withTarget.filter(metTarget).length;
  if (withTarget.length) {
    notes.push({
      id: 'targets',
      emoji: '🎯',
      text: `Hit ${met} of ${withTarget.length} coach targets.${met === withTarget.length ? ' Weights go up next time.' : ''}`,
      tone: met * 2 >= withTarget.length ? 'good' : 'tip',
    });
  }

  // Only worth saying for someone lifting regularly.
  const liftingSets = Object.entries(groups)
    .filter(([g]) => g !== 'cardio')
    .reduce((a, [, n]) => a + (n ?? 0), 0);
  if (liftingSets >= 12) {
    const before = setsByGroup(lastWeek);
    const missing = MAJOR.filter((g) => !groups[g] && !before[g]);
    if (missing.length) {
      notes.push({
        id: 'neglected',
        emoji: '🧭',
        text: `No ${list(missing.map((g) => GROUP_NAMES[g]))} work in two weeks. Add a lift or two.`,
        tone: 'warn',
      });
    }
  }

  // Easier week: after weeks of steady training, or when check-ins say you're worn down.
  let streak = 0;
  for (let s = start; ; s = shiftWeek(s, -1)) {
    if (workouts.filter((w) => inWeek(w.endedAt, s)).length < TRAINING_WEEK) break;
    streak++;
    if (streak > 52) break;
  }
  const checks = Object.values(input.checkIns).filter((c) => inWeek(dayKeyTime(c.date), start));
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);
  const energy = avg(checks.flatMap((c) => (c.energy ? [c.energy] : [])));
  const soreness = avg(checks.flatMap((c) => (c.soreness ? [c.soreness] : [])));
  if (checks.length >= 3 && ((energy !== undefined && energy <= 2) || (soreness !== undefined && soreness >= 4))) {
    notes.push({
      id: 'tired',
      emoji: '🪫',
      text: 'Your check-ins say you’re worn down. Take next week easier: same lifts, about 10% lighter.',
      tone: 'warn',
    });
  } else if (streak >= DELOAD_AFTER_WEEKS) {
    notes.push({
      id: 'deload',
      emoji: '🔋',
      text: `${streak} solid weeks in a row. Plan an easier week soon: same lifts, about 10% lighter.`,
      tone: 'tip',
    });
  }

  return { setsByGroup: groups, targets: { met, total: withTarget.length }, notes };
}

export type CoachPick =
  | { kind: 'session'; id: string; name: string; exerciseIds: string[]; fresh: MuscleGroup[]; sore: MuscleGroup[] }
  | { kind: 'rest'; sore: MuscleGroup[] };

/** Below this average recovery the coach suggests resting instead. */
const REST_BELOW = 0.5;

/**
 * Today's session when you're not on a plan: the template whose muscles are most recovered.
 * Ties go to the earlier template, so built-ins order the preference.
 */
export function coachPick(
  templates: { id: string; name: string; exerciseIds: string[] }[],
  recovery: { group: MuscleGroup; recovered: number }[],
): CoachPick | null {
  const level = new Map(recovery.map((r) => [r.group, r.recovered]));
  const sore = recovery.filter((r) => r.recovered < 0.6).map((r) => r.group);
  let best: { t: (typeof templates)[number]; score: number; groups: MuscleGroup[] } | null = null;
  for (const t of templates) {
    const groups = t.exerciseIds.map((id) => getExercise(id).group).filter((g) => level.has(g));
    if (!groups.length) continue;
    const score = groups.reduce((a, g) => a + level.get(g)!, 0) / groups.length;
    if (!best || score > best.score + 1e-9) best = { t, score, groups };
  }
  if (!best) return null;
  if (best.score < REST_BELOW) return { kind: 'rest', sore };
  const fresh = [...new Set(best.groups)].filter((g) => level.get(g)! >= 0.9);
  return {
    kind: 'session',
    id: best.t.id,
    name: best.t.name,
    exerciseIds: best.t.exerciseIds,
    fresh,
    sore: sore.filter((g) => !best!.groups.includes(g)),
  };
}

/** "Chest, back and legs" for a coach line. */
export function groupList(groups: MuscleGroup[]): string {
  const s = list(groups.map((g) => GROUP_NAMES[g]));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
