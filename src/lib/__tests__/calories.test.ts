import { cardioMet, estimateCalories, restingPerDay, weightOn } from '../calories';
import type { Workout, WorkoutExercise } from '../types';

const end = new Date(2026, 9, 10, 19).getTime();
const workout = (minutes: number, exercises: WorkoutExercise[]): Workout =>
  ({
    id: 'w',
    name: 'W',
    startedAt: end - minutes * 60_000,
    endedAt: end,
    exercises,
    companionId: 'c',
    xp: 0,
    gems: 0,
    prs: [],
  }) as Workout;
const lifts = (count: number, exerciseId = 'squat'): WorkoutExercise => ({
  id: exerciseId,
  exerciseId,
  sets: Array.from({ length: count }, (_, i) => ({ id: `${exerciseId}${i}`, weight: 100, reps: 5, done: true })),
});
const run = (km: number, minutes: number): WorkoutExercise => ({
  id: 'r',
  exerciseId: 'run',
  sets: [{ id: 'r1', distance: km, minutes, done: true }],
});

describe('restingPerDay', () => {
  it('uses Mifflin-St Jeor when height is known', () => {
    expect(restingPerDay(80, { heightCm: 180, birthYear: 1996, sex: 'male' }, end)).toBe(1780);
    expect(restingPerDay(60, { heightCm: 165, birthYear: 1996, sex: 'female' }, end)).toBeCloseTo(1320.25);
    // No sex: halfway between the two.
    expect(restingPerDay(80, { heightCm: 180 }, end)).toBe(1697);
  });

  it('falls back to 1 kcal per kg per hour', () => {
    expect(restingPerDay(80, undefined, end)).toBe(1920);
  });
});

describe('cardioMet', () => {
  it('follows the ACSM running and walking equations', () => {
    expect(cardioMet('run', 10, 60)).toBeCloseTo((0.2 * 166.67 + 3.5) / 3.5, 1);
    expect(cardioMet('walk', 5, 60)).toBeCloseTo((0.1 * 83.33 + 3.5) / 3.5, 1);
  });

  it('uses typical values without a pace', () => {
    expect(cardioMet('run', undefined, 30)).toBe(9.8);
    expect(cardioMet('bike', 25, 60)).toBe(12.0);
  });
});

describe('estimateCalories', () => {
  it('rates an hour of steady lifting at 5 METs', () => {
    expect(estimateCalories(workout(60, [lifts(20)]), 80, undefined)).toEqual({ active: 320, total: 400, minutes: 60 });
  });

  it('puts a run close to 1 kcal per kg per km', () => {
    const { total } = estimateCalories(workout(32, [run(5, 30)]), 80, undefined);
    expect(total).toBeGreaterThan(380);
    expect(total).toBeLessThan(440);
  });

  it('times lifting from the clock left after cardio', () => {
    const e = estimateCalories(workout(60, [run(3, 20), lifts(12)]), 80, undefined);
    expect(e.minutes).toBe(60);
  });

  it('assumes a few minutes a set when the workout was logged afterwards', () => {
    expect(estimateCalories(workout(2, [lifts(10)]), 80, undefined).minutes).toBe(30);
  });

  it('caps a timer left running', () => {
    expect(estimateCalories(workout(12 * 60, [lifts(10)]), 80, undefined).minutes).toBe(240);
  });

  it('scales with the person', () => {
    const w = workout(60, [lifts(20)]);
    const small = estimateCalories(w, 55, { heightCm: 160, birthYear: 1980, sex: 'female' });
    const big = estimateCalories(w, 100, { heightCm: 190, birthYear: 2000, sex: 'male' });
    expect(big.active).toBeGreaterThan(small.active * 1.5);
  });
});

describe('weightOn', () => {
  const weighIns = {
    '2026-10-01': { date: '2026-10-01', kg: 82, at: 0 },
    '2026-10-08': { date: '2026-10-08', kg: 81, at: 0 },
  };

  it('uses the latest weigh-in on or before the day, else the first one after', () => {
    expect(weightOn(weighIns, new Date(2026, 9, 5).getTime())).toBe(82);
    expect(weightOn(weighIns, new Date(2026, 9, 8, 20).getTime())).toBe(81);
    expect(weightOn(weighIns, new Date(2026, 8, 1).getTime())).toBe(82);
    expect(weightOn({}, end)).toBeUndefined();
  });
});
