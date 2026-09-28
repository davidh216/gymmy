import { useMemo } from 'react';

import { useNow } from '@/hooks/use-now';

import { levelFromXp } from '@/lib/progression';
import { activeDaysThisWeek, countInWeek, daysSince, weekStreak } from '@/lib/streaks';

import { useGymmy } from './gymmy';

/** Derived progress numbers shared by several screens. */
export function useProgress() {
  const workouts = useGymmy((s) => s.workouts);
  const xp = useGymmy((s) => s.xp);
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);

  const now = useNow(60_000);

  return useMemo(() => {
    const times = workouts.map((w) => w.endedAt);
    return {
      ...levelFromXp(xp),
      thisWeek: countInWeek(times, now),
      activeDays: activeDaysThisWeek(times, now),
      streak: weekStreak(times, goal, now),
      daysSince: daysSince(times, now),
      goal,
    };
  }, [workouts, xp, goal, now]);
}
