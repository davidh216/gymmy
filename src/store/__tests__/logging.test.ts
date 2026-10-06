/* eslint-disable @typescript-eslint/no-require-imports -- inside a jest.mock factory */
import { fromDisplayWeight, toDisplayWeight } from '@/lib/format';
import { getProgram } from '@/lib/programs';
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
  expect(lighterLoad(1, 'kg')).toBe(1);
});

it('saves custom plans that work like built-in ones, and leaves them when deleted', () => {
  const id = store().saveCustomProgram({
    name: '  Push Pull Legs ',
    emoji: '💪',
    weeks: 6,
    days: [
      { name: 'Push', focus: '', exercises: [{ exerciseId: 'bench_press', sets: 4, reps: '6–8' }] },
      { name: 'Legs', focus: '', exercises: [{ exerciseId: 'squat', sets: 5, reps: '5' }] },
    ],
  });
  const program = getProgram(id)!;
  expect(program).toMatchObject({ name: 'Push Pull Legs', weeks: 6, daysPerWeek: 2 });
  expect(program.week(3)[1].name).toBe('Legs');

  store().startPlan(id);
  store().startPlanSession({ programId: id, week: 1, session: 2 });
  expect(store().active).toMatchObject({ name: 'Push Pull Legs · Legs', exercises: [{ exerciseId: 'squat' }] });
  expect(store().active!.exercises[0].sets).toHaveLength(5);
  store().discardWorkout();

  store().saveCustomProgram({ name: 'PPL', emoji: '🔥', weeks: 8, days: program.week(1) }, id);
  expect(getProgram(id)?.name).toBe('PPL');
  expect(store().customPrograms).toHaveLength(1);

  store().deleteCustomProgram(id);
  expect(getProgram(id)).toBeUndefined();
  expect(store().plan).toBeNull();
});

it('never makes a lighter day heavier, and carries notes from warm-up-only sessions', () => {
  expect(lighterLoad(2, 'kg')).toBe(2);
  store().startWorkout({ exerciseIds: ['squat'] });
  const e = store().active!.exercises[0];
  store().updateExercise(e.id, { note: 'Knee sleeves' });
  store().updateSet(e.id, e.sets[0].id, { weight: 40, reps: 5, done: true, warmup: true });
  store().finishWorkout();
  store().startWorkout({ exerciseIds: ['squat'] });
  expect(store().active!.exercises[0].note).toBe('Knee sleeves');
});

it('saves workout templates that start the same exercises', () => {
  const id = store().saveTemplate({ name: ' Arm day ', exerciseIds: ['barbell_curl', 'tricep_pushdown', 'barbell_curl'] });
  expect(store().templates[0]).toMatchObject({ id, name: 'Arm day', exerciseIds: ['barbell_curl', 'tricep_pushdown'] });
  store().startWorkout({ name: 'Arm day', exerciseIds: store().templates[0].exerciseIds });
  expect(store().active!.exercises.map((e) => e.exerciseId)).toEqual(['barbell_curl', 'tricep_pushdown']);
  store().discardWorkout();
  store().deleteTemplate(id);
  expect(store().templates).toEqual([]);
});

it('records where a workout happened, and lets you change it afterwards', () => {
  store().startWorkout({ exerciseIds: ['squat'] });
  store().setWorkoutLocation({ name: 'Iron Temple', gymId: 'g1' });
  const e = store().active!.exercises[0];
  store().updateSet(e.id, e.sets[0].id, { weight: 100, reps: 5, done: true });
  const finished = store().finishWorkout()!;
  expect(finished.location).toEqual({ name: 'Iron Temple', gymId: 'g1' });

  store().setWorkoutLocation({ name: 'Garage' }, finished.id);
  expect(store().workouts[0].location).toEqual({ name: 'Garage' });
  store().setWorkoutLocation(null, finished.id);
  expect('location' in store().workouts[0]).toBe(false);
});

it('logs weigh-ins, keeps typed ones over Health readings, and marks the weekly review seen', () => {
  store().logWeight(80.456, '2026-10-04');
  expect(store().weighIns['2026-10-04']).toMatchObject({ date: '2026-10-04', kg: 80.46 });
  expect(store().weighIns['2026-10-04'].source).toBeUndefined();

  const at = new Date(2026, 9, 4, 8).getTime();
  store().importHealthWeights([
    { kg: 79, at },
    { kg: 81, at: at + 86_400_000 },
  ]);
  expect(store().weighIns['2026-10-04'].kg).toBe(80.46);
  expect(store().weighIns['2026-10-05']).toMatchObject({ kg: 81, source: 'health' });

  store().deleteWeighIn('2026-10-04');
  expect(store().weighIns['2026-10-04']).toBeUndefined();

  store().seeWeightReview(100);
  store().seeWeightReview(50);
  expect(store().weightReviewSeen).toBe(100);
});
