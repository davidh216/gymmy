import { bucket, eventsFromStateChange, screenName } from '../analytics';
import type { ActiveWorkout, Workout } from '../types';

const profile = { weeklyGoal: 4, units: 'kg' as const };
const active: ActiveWorkout = {
  id: 'w1',
  name: 'Leg day',
  startedAt: 0,
  exercises: [{ id: 'e', exerciseId: 'squat', sets: [{ id: 's', weight: 140, reps: 5, done: true }] }],
};
const finished: Workout = { ...active, endedAt: 45 * 60000, companionId: 'kong', xp: 1, gems: 1, prs: [] };

describe('bucket', () => {
  it('hides exact numbers', () => {
    expect(bucket(0)).toBe('0');
    expect(bucket(3)).toBe('1-4');
    expect(bucket(12)).toBe('10-19');
    expect(bucket(500)).toBe('60+');
    expect(bucket(45, [1, 15, 30, 60])).toBe('30-59');
  });
});

describe('screenName', () => {
  it('uses route patterns, never ids', () => {
    expect(screenName(['(tabs)', 'gyms'])).toBe('gyms');
    expect(screenName(['gym', '[id]'])).toBe('gym/[id]');
    expect(screenName(['(tabs)'])).toBe('today');
  });
});

describe('eventsFromStateChange', () => {
  const base = { profile, active: null, workouts: [] as Workout[] };

  it('sees onboarding and workout starts by source', () => {
    expect(eventsFromStateChange({ ...base, profile: null }, base)).toEqual([
      { event: 'onboarding_complete', props: { goal: 4, units: 'kg' } },
    ]);
    expect(eventsFromStateChange(base, { ...base, active: { ...active, exercises: [] } })[0]).toEqual({
      event: 'workout_start',
      props: { source: 'empty' },
    });
    expect(eventsFromStateChange(base, { ...base, active })[0]).toEqual({ event: 'workout_start', props: { source: 'template' } });
    expect(
      eventsFromStateChange(base, { ...base, active: { ...active, plan: { programId: 'hyrox', week: 1, session: 1 } } })[0],
    ).toEqual({ event: 'workout_start', props: { source: 'plan' } });
  });

  it('tells finishing from discarding, with only bucketed details', () => {
    expect(eventsFromStateChange({ ...base, active }, { ...base, workouts: [finished] })).toEqual([
      { event: 'workout_finish', props: { sets: '1-4', minutes: '30-59', exercises: '1', pr: false, plan: false } },
    ]);
    expect(eventsFromStateChange({ ...base, active }, base)).toEqual([{ event: 'workout_discard', props: { sets: '1-4' } }]);
  });

  it('ignores workouts that arrive from sync or Apple Health', () => {
    expect(eventsFromStateChange(base, { ...base, workouts: [finished] })).toEqual([]);
  });
});
