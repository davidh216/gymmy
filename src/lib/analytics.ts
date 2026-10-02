import type { ActiveWorkout, Units, Workout } from './types';

/**
 * Every analytics event the app can send, with its properties. Properties are coarse on
 * purpose: categories and buckets, never names, free text, exact numbers or health data.
 */
export type AnalyticsEvent =
  | { event: 'app_open' }
  | { event: 'screen'; props: { name: string } }
  | { event: 'onboarding_complete'; props: { goal: number; units: Units } }
  | { event: 'workout_start'; props: { source: 'empty' | 'template' | 'plan' } }
  | { event: 'workout_finish'; props: { sets: string; minutes: string; exercises: string; pr: boolean; plan: boolean } }
  | { event: 'workout_discard'; props: { sets: string } }
  | { event: 'plan_start'; props: { program: string } }
  | { event: 'plan_leave'; props: { program: string; done: string } }
  | { event: 'milestone_claim'; props: { count: string } }
  | { event: 'check_in'; props: { first: boolean; rest: boolean; activities: string } }
  | { event: 'custom_exercise_create'; props: { submitted: boolean } }
  | { event: 'custom_exercise_submit' }
  | { event: 'recap_share' }
  | { event: 'summon'; props: { count: 1 | 10 } }
  | { event: 'health_connect'; props: { imported: string } }
  | { event: 'gym_join'; props: { via: 'gym' | 'nearby' | 'invite' | 'create' } }
  | { event: 'entry_post'; props: { challenge: string; status: string } }
  | { event: 'account'; props: { action: 'sign_up' | 'sign_in' } };

export type EventName = AnalyticsEvent['event'];

/** "0", "1-4", "5-9", ... "60+": a count without the exact value. */
export function bucket(n: number, edges: number[] = [1, 5, 10, 20, 40, 60]): string {
  if (n < edges[0]) return '0';
  for (let i = 0; i < edges.length - 1; i++) {
    if (n < edges[i + 1]) return edges[i + 1] - 1 === edges[i] ? String(edges[i]) : `${edges[i]}-${edges[i + 1] - 1}`;
  }
  return `${edges[edges.length - 1]}+`;
}

/** Route segments as a screen name, e.g. ["gym", "[id]"] -> "gym/[id]". Ids never appear. */
export function screenName(segments: string[]): string {
  const name = segments.filter((s) => !/^\(.*\)$/.test(s)).join('/');
  return name || 'today';
}

type WorkoutState = { profile: { weeklyGoal: number; units: Units } | null; active: ActiveWorkout | null; workouts: Workout[] };

const doneSets = (w: { exercises: { sets: { done: boolean }[] }[] }) =>
  w.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);

/**
 * Events implied by a local state change: finishing onboarding and starting, finishing or
 * discarding a workout. (Data pulled by cloud sync never changes the active workout.)
 */
export function eventsFromStateChange(prev: WorkoutState, next: WorkoutState): AnalyticsEvent[] {
  const out: AnalyticsEvent[] = [];
  if (!prev.profile && next.profile) {
    out.push({ event: 'onboarding_complete', props: { goal: next.profile.weeklyGoal, units: next.profile.units } });
  }
  if (!prev.active && next.active) {
    const source = next.active.plan ? 'plan' : next.active.exercises.length ? 'template' : 'empty';
    out.push({ event: 'workout_start', props: { source } });
  }
  if (prev.active && !next.active) {
    const finished = next.workouts.find((w) => w.id === prev.active!.id);
    if (finished) {
      out.push({
        event: 'workout_finish',
        props: {
          sets: bucket(doneSets(finished)),
          minutes: bucket((finished.endedAt - finished.startedAt) / 60000, [1, 15, 30, 60, 90, 120]),
          exercises: bucket(finished.exercises.length, [1, 2, 4, 7, 10]),
          pr: finished.prs.length > 0,
          plan: Boolean(finished.plan),
        },
      });
    } else {
      out.push({ event: 'workout_discard', props: { sets: bucket(doneSets(prev.active)) } });
    }
  }
  return out;
}
