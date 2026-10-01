import { exerciseNamed, getExercise, searchExercises, setExtraExercises, type Exercise } from '../exercises';
import { formatAgo, formatSet } from '../format';
import { bestSet, exerciseInUse, lastSession, lastSessions, topSet } from '../records';
import type { Workout, WorkoutExercise } from '../types';

const set = (weight: number, reps: number, done = true) => ({ id: `${weight}x${reps}${done}`, weight, reps, done });

const workout = (id: string, endedAt: number, exercises: WorkoutExercise[]): Workout => ({
  id,
  name: id,
  startedAt: endedAt - 3600_000,
  endedAt,
  exercises,
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
});

describe('topSet', () => {
  it('picks the heaviest weight, more reps breaking a tie, and ignores unfinished sets', () => {
    expect(topSet('weight', [set(100, 8), set(120, 3), set(120, 5), set(200, 1, false)])).toMatchObject({ weight: 120, reps: 5 });
  });
  it('picks most reps or longest time for other kinds', () => {
    expect(topSet('reps', [{ id: 'a', reps: 8, done: true }, { id: 'b', reps: 12, done: true }])?.reps).toBe(12);
    expect(topSet('duration', [{ id: 'a', minutes: 20, done: true }, { id: 'b', minutes: 5, done: true }])?.minutes).toBe(20);
    expect(topSet('weight', [])).toBeNull();
  });
});

describe('lastSession / bestSet', () => {
  const history = [
    workout('old', 1000, [{ id: '1', exerciseId: 'squat', sets: [set(140, 3)] }]),
    workout('new', 2000, [{ id: '2', exerciseId: 'squat', sets: [set(100, 5), set(120, 5), set(130, 1, false)] }]),
    workout('skipped', 3000, [{ id: '3', exerciseId: 'squat', sets: [set(150, 1, false)] }]),
  ];

  it('uses the latest session with a finished set', () => {
    const last = lastSession('squat', history);
    expect(last?.endedAt).toBe(2000);
    expect(last?.top).toMatchObject({ weight: 120, reps: 5 });
    expect(last?.sets).toHaveLength(2);
  });
  it('finds the best set ever', () => {
    expect(bestSet('squat', history)).toMatchObject({ weight: 140, reps: 3 });
    expect(lastSession('deadlift', history)).toBeNull();
    expect(lastSessions(history).get('squat')?.endedAt).toBe(2000);
  });
  it('knows when an exercise is in use', () => {
    expect(exerciseInUse('squat', history)).toBe(true);
    expect(exerciseInUse('deadlift', history, { exercises: [{ id: 'x', exerciseId: 'deadlift', sets: [] }] })).toBe(true);
    expect(exerciseInUse('deadlift', history)).toBe(false);
  });
});

describe('custom exercises', () => {
  const mine: Exercise = { id: 'custom_1', name: 'Landmine Press', group: 'shoulders', kind: 'weight', source: 'custom' };
  const shared: Exercise[] = [
    { id: 'community_1', name: 'Landmine Press', group: 'shoulders', kind: 'weight', source: 'community' },
    { id: 'community_2', name: 'Tire Flip', group: 'legs', kind: 'reps', source: 'community' },
  ];
  afterEach(() => setExtraExercises([]));

  it('lists yours first and hides the shared copy of the same name', () => {
    const results = searchExercises('', 'shoulders', [mine, ...shared]);
    expect(results[0].id).toBe('custom_1');
    expect(results.some((e) => e.id === 'community_1')).toBe(false);
    expect(searchExercises('tire', null, [mine, ...shared]).map((e) => e.id)).toEqual(['community_2']);
  });
  it('resolves names and catches duplicates in any case', () => {
    setExtraExercises([mine]);
    expect(getExercise('custom_1').name).toBe('Landmine Press');
    expect(exerciseNamed('  landmine   PRESS ')?.id).toBe('custom_1');
    expect(exerciseNamed('Landmine Press', 'custom_1')).toBeUndefined();
    expect(exerciseNamed('bench press')?.id).toBe('bench_press');
  });
});

describe('formatting', () => {
  it('formats sets', () => {
    expect(formatSet(set(100, 5), 'weight', 'kg')).toBe('100 kg × 5');
    expect(formatSet(set(100, 5), 'weight', 'lb')).toBe('220.5 lb × 5');
    expect(formatSet({ id: 'a', reps: 12, done: true }, 'reps', 'lb')).toBe('12 reps');
    expect(formatSet({ id: 'a', minutes: 20, done: true }, 'duration', 'lb')).toBe('20 min');
  });
  it('formats how long ago', () => {
    const now = new Date(2026, 9, 1, 12).getTime();
    expect(formatAgo(new Date(2026, 9, 1, 7).getTime(), now)).toBe('today');
    expect(formatAgo(new Date(2026, 8, 30, 22).getTime(), now)).toBe('yesterday');
    expect(formatAgo(new Date(2026, 8, 27).getTime(), now)).toBe('4d ago');
    expect(formatAgo(new Date(2026, 8, 3).getTime(), now)).toBe('4w ago');
  });
});
