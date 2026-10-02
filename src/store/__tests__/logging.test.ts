/* eslint-disable @typescript-eslint/no-require-imports -- inside a jest.mock factory */
import { fromDisplayWeight, toDisplayWeight } from '@/lib/format';
import { lighterLoad, useGymmy } from '@/store/gymmy';

// Hoisted above the import by Jest.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const store = () => useGymmy.getState();

beforeEach(() => {
  store().reset();
  useGymmy.setState({ profile: { name: 'Alex', username: 'alex', weeklyGoal: 3, units: 'kg' } });
});

it('carries warm-ups, notes and rest times into the next workout, but not RPE', () => {
  store().startWorkout({ exerciseIds: ['squat'] });
  const e = store().active!.exercises[0];
  store().updateExercise(e.id, { note: 'Belt on', rest: 180 });
  store().updateSet(e.id, e.sets[0].id, { weight: 60, reps: 5, done: true, warmup: true });
  store().updateSet(e.id, e.sets[1].id, { weight: 100, reps: 5, done: true, rpe: 8 });
  const finished = store().finishWorkout()!;
  expect(finished.exercises[0]).toMatchObject({ note: 'Belt on', rest: 180 });

  store().startWorkout({ exerciseIds: ['squat'] });
  const next = store().active!.exercises[0];
  expect(next).toMatchObject({ note: 'Belt on', rest: 180 });
  expect(next.sets.map((s) => [s.weight, s.warmup ?? false, s.done, s.rpe])).toEqual([
    [60, true, false, undefined],
    [100, false, false, undefined],
  ]);
});

it('reorders exercises and stops at the ends', () => {
  store().startWorkout({ exerciseIds: ['squat', 'bench_press', 'deadlift'] });
  const ids = () => store().active!.exercises.map((e) => e.exerciseId);
  const [squat, , deadlift] = store().active!.exercises;
  store().moveExercise(deadlift.id, -1);
  expect(ids()).toEqual(['squat', 'deadlift', 'bench_press']);
  store().moveExercise(squat.id, -1);
  store().moveExercise(deadlift.id, 1);
  store().moveExercise(deadlift.id, 1);
  expect(ids()).toEqual(['squat', 'bench_press', 'deadlift']);
});

it('loads about 90% on lighter plan days, in steps the plates can make', () => {
  expect(lighterLoad(100, 'kg')).toBe(90);
  expect(lighterLoad(102.5, 'kg')).toBe(90);
  // 225 lb → 202.5 → 200 lb
  expect(toDisplayWeight(lighterLoad(fromDisplayWeight(225, 'lb'), 'lb'), 'lb')).toBe(200);
  expect(lighterLoad(1, 'kg')).toBe(2.5);
});
