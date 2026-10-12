/**
 * Follow-up setup prompts on Today, one at a time after the first few workouts, so onboarding
 * stays short: reminders, then Apple Health, then body details for calorie estimates.
 */

export type NudgeId = 'reminders' | 'health' | 'body';

/** Workouts logged before each prompt appears. */
const AFTER: Record<NudgeId, number> = { reminders: 1, health: 2, body: 3 };
const ORDER: NudgeId[] = ['reminders', 'health', 'body'];
/** After answering one, the next waits at least this long. */
export const NUDGE_GAP_MS = 20 * 3_600_000;

export function nextNudge(input: {
  workouts: number;
  /** When each prompt was answered or dismissed. */
  seen: Partial<Record<NudgeId, number>>;
  now: number;
  /** Prompts that apply on this phone (reminders and Health need iPhone and this build). */
  available: Record<NudgeId, boolean>;
  /** Already set up, so there's nothing to ask. */
  done: Record<NudgeId, boolean>;
}): NudgeId | null {
  const last = Math.max(0, ...Object.values(input.seen).map((t) => t ?? 0));
  if (input.now - last < NUDGE_GAP_MS) return null;
  return (
    ORDER.find(
      (id) => input.available[id] && !input.done[id] && input.seen[id] === undefined && input.workouts >= AFTER[id],
    ) ?? null
  );
}

/**
 * Weekdays (0 = Sunday) to suggest for training reminders: the days you've trained most,
 * as many as your weekly goal, topped up with evenly spaced weekdays.
 */
export function suggestTrainingDays(workoutTimes: number[], goal: number): number[] {
  const want = Math.max(1, Math.min(7, goal));
  const counts = new Map<number, number>();
  for (const t of workoutTimes) {
    const d = new Date(t).getDay();
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const days = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, want)
    .map(([d]) => d);
  const fill = [1, 3, 5, 6, 2, 4, 0];
  for (const d of fill) {
    if (days.length >= want) break;
    if (!days.includes(d)) days.push(d);
  }
  return days.sort((a, b) => a - b);
}
