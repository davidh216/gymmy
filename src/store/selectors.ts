import { useMemo } from 'react';

import { useNow } from '@/hooks/use-now';

import { freshVitals, heartScore } from '@/lib/health';
import { milestoneStates, milestoneStats } from '@/lib/milestones';
import { levelFromXp } from '@/lib/progression';
import {
  getProgram,
  isCustomProgram,
  planAdvice,
  programFromCustom,
  type PlanAdvice,
  type PlanProgress,
  type Program,
} from '@/lib/programs';
import { dayKey, readiness } from '@/lib/recovery';
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

/** Every milestone with progress, plus how many are ready to claim. */
export function useMilestones() {
  const workouts = useGymmy((s) => s.workouts);
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);
  const buddies = useGymmy((s) => Object.keys(s.collection).length);
  const customExercises = useGymmy((s) => s.customExercises.length);
  const claimed = useGymmy((s) => s.claimedMilestones);
  const checkIns = useGymmy((s) => s.checkIns);

  return useMemo(() => {
    const stats = milestoneStats({
      workouts,
      weeklyGoal: goal,
      buddies,
      customExercises,
      checkIns: Object.values(checkIns),
    });
    const all = milestoneStates(stats, claimed);
    const ready = all.filter((m) => m.achieved && !m.claimedAt);
    return { all, ready, earned: all.filter((m) => m.claimedAt).length };
  }, [workouts, goal, buddies, customExercises, claimed, checkIns]);
}

/** Today's check-in (if any) and readiness score. */
export function useReadiness() {
  const workouts = useGymmy((s) => s.workouts);
  const checkIns = useGymmy((s) => s.checkIns);
  const vitals = useGymmy((s) => s.health.vitals);
  const now = useNow(60_000);
  return useMemo(() => {
    const today = checkIns[dayKey(now)];
    const fresh = freshVitals(vitals, now);
    return { today, now, vitals: fresh, ...readiness(today, workouts, now, fresh && heartScore(fresh)) };
  }, [workouts, checkIns, vitals, now]);
}

/** How to adapt your plan's next session to today (lighter day, comeback, behind schedule). */
export function usePlanAdvice(program: Program | undefined, progress: PlanProgress | null): PlanAdvice | null {
  const plan = useGymmy((s) => s.plan);
  const workouts = useGymmy((s) => s.workouts);
  const r = useReadiness();
  if (!program || !progress || plan?.programId !== program.id) return null;
  return planAdvice({ program, plan, progress, workouts, readiness: r.score, now: r.now });
}

/**
 * A plan by id that updates when a custom plan is edited or deleted. (Reading the custom list
 * here, rather than only calling getProgram, is what makes screens re-render.)
 */
export function useProgram(id: string | undefined): Program | undefined {
  const custom = useGymmy((s) => s.customPrograms);
  if (!id) return undefined;
  const mine = custom.find((p) => p.id === id);
  if (mine) return mine.days.length ? programFromCustom(mine) : undefined;
  return isCustomProgram(id) ? undefined : getProgram(id);
}
