import { getExercise } from "./exercises";
import { fromDisplayWeight, toDisplayWeight } from "./format";
import type { SetEntry, Units, Workout } from "./types";

/**
 * The coach's call for a lift's next session (double progression):
 * - up: every working set hit the top of the rep range, so add one plate step.
 * - reps: same weight, one more rep than last time (still inside the range).
 * - repeat: reps were missed (or it was max effort), so own this weight first.
 * - deload: missed twice in a row at the same weight, so drop about 10% and build back.
 */
export type CoachCall = "up" | "reps" | "repeat" | "deload";

export type CoachTarget = {
  call: CoachCall;
  /** kg */
  weight: number;
  reps: number;
  /** The weight it replaces, kg, for "was 225". */
  from: number;
};

/** Sets at or above this RPE count as max effort, which holds the weight. */
export const MAX_EFFORT_RPE = 9.5;

/** One plate step: 5 lb or 2.5 kg. */
export const plateStep = (units: Units) => (units === "lb" ? 5 : 2.5);

/** About 90% of a load, rounded down to what plates make (5 lb or 2.5 kg steps), for lighter days. */
export function lighterLoad(kg: number, units: Units): number {
  const step = plateStep(units);
  const display = toDisplayWeight(kg, units) * 0.9;
  const rounded = Math.floor(display / step) * step;
  // Never heavier than last time (a 2 kg dumbbell stays 2 kg rather than rounding up).
  return rounded > 0 ? fromDisplayWeight(rounded, units) : kg;
}

/** One plate step up from a load, snapped to the step grid in your units. */
export function heavierLoad(kg: number, units: Units): number {
  const step = plateStep(units);
  const display = toDisplayWeight(kg, units);
  return fromDisplayWeight(Math.round(display / step) * step + step, units);
}

/** "8–10" → [8, 10], "5" → [5, 5]; undefined when it isn't a rep count. */
export function repRange(reps?: string): [number, number] | undefined {
  const m = reps?.match(/^(\d+)(?:\s*[–-]\s*(\d+))?$/);
  if (!m) return undefined;
  const lo = Number(m[1]);
  const hi = m[2] ? Number(m[2]) : lo;
  return lo > 0 && hi >= lo ? [lo, hi] : undefined;
}

type Session = { endedAt: number; weight: number; sets: SetEntry[] };

/** Working sets at the heaviest weight from each session with this lift, newest first. */
function recentTopSets(
  exerciseId: string,
  history: Workout[],
  count: number,
): Session[] {
  const sessions: Session[] = [];
  for (const w of history) {
    const sets = w.exercises
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets)
      .filter((s) => s.done && !s.warmup && s.weight && s.reps);
    if (!sets.length) continue;
    const weight = Math.max(...sets.map((s) => s.weight!));
    sessions.push({
      endedAt: w.endedAt,
      weight,
      sets: sets.filter((s) => s.weight === weight),
    });
  }
  return sessions.sort((a, b) => b.endedAt - a.endedAt).slice(0, count);
}

const sameWeight = (a: number, b: number) => Math.abs(a - b) < 0.01;

/**
 * Next session's weight and reps for a weighted lift, from its last two sessions.
 * `range` is the plan's rep range; without one the goal is the best set's reps last time.
 * Null for lifts with no weighted history (or that aren't weighted).
 */
export function nextTarget(
  exerciseId: string,
  history: Workout[],
  units: Units,
  range?: [number, number],
): CoachTarget | null {
  if (getExercise(exerciseId).kind !== "weight") return null;
  const [last, before] = recentTopSets(exerciseId, history, 2);
  if (!last) return null;
  const reps = last.sets.map((s) => s.reps!);
  const goal = range ? range[1] : Math.max(...reps);
  const floor = range ? range[0] : goal;
  const hitAll = reps.every((r) => r >= goal);
  const maxEffort = last.sets.some((s) => (s.rpe ?? 0) >= MAX_EFFORT_RPE);
  const from = last.weight;

  if (hitAll && !maxEffort)
    return { call: "up", weight: heavierLoad(from, units), reps: floor, from };

  const missed = reps.some((r) => r < floor);
  if (missed && before && sameWeight(before.weight, from)) {
    const beforeReps = before.sets.map((s) => s.reps!);
    const missedBefore = beforeReps.some(
      (r) => r < (range ? range[0] : Math.max(...beforeReps, goal)),
    );
    // Stalled: missed both times with no more total reps than before.
    const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    if (missedBefore && total(reps) <= total(beforeReps)) {
      const weight = lighterLoad(from, units);
      if (weight < from) return { call: "deload", weight, reps: floor, from };
    }
  }

  if (!missed && range && !hitAll) {
    return {
      call: "reps",
      weight: from,
      reps: Math.min(range[1], Math.min(...reps) + 1),
      from,
    };
  }
  return { call: "repeat", weight: from, reps: floor, from };
}

/** Prefill a session's sets with the coach's target: working sets at last time's top weight move together. */
export function applyTarget(sets: SetEntry[], target: CoachTarget): SetEntry[] {
  return sets.map((s) =>
    !s.warmup && (s.weight === undefined || sameWeight(s.weight, target.from))
      ? { ...s, weight: target.weight, reps: target.reps }
      : s,
  );
}
