import { bestsByExercise, detectPRs, e1rm, lastPerformance, volume } from '../records';
import type { Workout, WorkoutExercise } from '../types';

const set = (weight: number, reps: number, done = true) => ({ id: `${weight}x${reps}`, weight, reps, done });

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

describe('e1rm', () => {
  it('uses Epley and returns the weight for singles', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(100, 10)).toBeCloseTo(133.33, 1);
    expect(e1rm(0, 5)).toBe(0);
  });
});

describe('detectPRs', () => {
  const history = [workout('a', 1, [{ id: 'x', exerciseId: 'bench_press', sets: [set(100, 5)] }])];

  it('awards a PR when e1RM beats history', () => {
    const prs = detectPRs([{ id: 'y', exerciseId: 'bench_press', sets: [set(100, 6)] }], history);
    expect(prs).toHaveLength(1);
    expect(prs[0].exerciseId).toBe('bench_press');
  });

  it('ignores ties, unfinished sets and first-time exercises', () => {
    expect(detectPRs([{ id: 'y', exerciseId: 'bench_press', sets: [set(100, 5)] }], history)).toEqual([]);
    expect(detectPRs([{ id: 'y', exerciseId: 'bench_press', sets: [set(200, 5, false)] }], history)).toEqual([]);
    expect(detectPRs([{ id: 'y', exerciseId: 'squat', sets: [set(200, 5)] }], history)).toEqual([]);
  });

  it('tracks bodyweight reps', () => {
    const h = [workout('a', 1, [{ id: 'x', exerciseId: 'pull_up', sets: [{ id: '1', reps: 8, done: true }] }])];
    const prs = detectPRs([{ id: 'y', exerciseId: 'pull_up', sets: [{ id: '2', reps: 10, done: true }] }], h);
    expect(prs[0]).toMatchObject({ value: 10, previous: 8 });
  });
});

describe('helpers', () => {
  it('computes volume from completed weighted sets only', () => {
    expect(
      volume([
        { id: '1', exerciseId: 'squat', sets: [set(100, 5), set(100, 5, false)] },
        { id: '2', exerciseId: 'pull_up', sets: [{ id: 'p', reps: 10, done: true }] },
      ]),
    ).toBe(500);
  });

  it('finds bests and the latest performance', () => {
    const h = [
      workout('old', 1, [{ id: 'a', exerciseId: 'squat', sets: [set(140, 3)] }]),
      workout('new', 2, [{ id: 'b', exerciseId: 'squat', sets: [set(120, 5)] }]),
    ];
    expect(bestsByExercise(h).get('squat')).toBeCloseTo(e1rm(140, 3));
    expect(lastPerformance('squat', h)?.[0].weight).toBe(120);
    expect(lastPerformance('deadlift', h)).toBeNull();
  });
});
