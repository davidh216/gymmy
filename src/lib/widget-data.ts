import { activeDaysThisWeek, countInWeek, weekStart, weekStreak } from './streaks';

/** What the home-screen widget shows. Plain values only: the widget can't read the app's data. */
export type WidgetProps = {
  buddy: string;
  /** Weeks in a row at the weekly goal. */
  streak: number;
  /** Training days this week, and the goal. */
  done: number;
  goal: number;
  /** Monday-first flags for the days trained this week. */
  week: boolean[];
  /** The next session, e.g. "Upper A" or "Push"; empty when there's nothing to suggest. */
  next: string;
  /** Where it comes from, e.g. "Strength · 4 days" or "Kong’s pick". */
  nextFrom: string;
};

/**
 * The widget's content now and at the start of next week, when this week's count resets and the
 * streak either holds (goal met) or ends. The widget switches over on its own.
 */
export function widgetTimeline(input: {
  workoutTimes: number[];
  goal: number;
  buddy: string;
  next: string;
  nextFrom: string;
  now: number;
}): { date: Date; props: WidgetProps }[] {
  const at = (now: number): WidgetProps => {
    const days = activeDaysThisWeek(input.workoutTimes, now);
    return {
      buddy: input.buddy,
      streak: weekStreak(input.workoutTimes, input.goal, now),
      done: countInWeek(input.workoutTimes, now),
      goal: input.goal,
      week: Array.from({ length: 7 }, (_, i) => days.has(i)),
      next: input.next,
      nextFrom: input.nextFrom,
    };
  };
  const nextWeek = new Date(weekStart(input.now));
  nextWeek.setDate(nextWeek.getDate() + 7);
  return [
    { date: new Date(input.now), props: at(input.now) },
    { date: nextWeek, props: at(nextWeek.getTime() + 60_000) },
  ];
}
