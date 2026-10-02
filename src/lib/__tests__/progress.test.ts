import { inRange, progressSeries, progressSummary, trainedExercises } from '../progress';
import type { SetEntry, Workout } from '../types';

const DAY = 86400_000;
const now = new Date(2026, 9, 2, 12).getTime();
const w = (id: string, daysAgo: number, exerciseId: string, sets: SetEntry[]): Workout => ({
  id,
  name: id,
  startedAt: now - daysAgo * DAY - 3600_000,
  endedAt: now - daysAgo * DAY,
  exercises: [{ id: `${id}e`, exerciseId, sets }],
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
});
const s = (weight: number, reps: number, done = true): SetEntry => ({ id: `${weight}x${reps}`, weight, reps, done });

describe('progressSeries', () => {
  const history = [
    w('a', 60, 'squat', [s(100, 5), s(110, 3)]),
    w('b', 30, 'squat', [s(100, 8)]),
    w('c', 10, 'squat', [s(120, 5, false)]),
    w('d', 5, 'squat', [s(105, 5)]),
    w('e', 1, 'bench_press', [s(80, 5)]),
  ];

  it('takes each session’s best estimated max and marks new bests', () => {
    const pts = progressSeries('squat', history);
    expect(pts.map((p) => p.workoutId)).toEqual(['a', 'b', 'd']);
    expect(pts[0].value).toBeCloseTo(121, 0);
    expect(pts[1].value).toBeCloseTo(126.7, 1);
    expect(pts.map((p) => p.pr)).toEqual([false, true, false]);
    expect(pts[0].set).toMatchObject({ weight: 110, reps: 3 });
  });

  it('handles distance and reps exercises', () => {
    const runs = [
      w('r1', 3, 'run', [{ id: 'x', distance: 5, minutes: 30, done: true }]),
      w('r2', 2, 'run', [{ id: 'y', minutes: 40, done: true }]),
      w('r3', 1, 'run', [{ id: 'z', distance: 8, minutes: 45, done: true }]),
    ];
    expect(progressSeries('run', runs).map((p) => [p.value, p.pr])).toEqual([
      [5, false],
      [8, true],
    ]);
    expect(progressSeries('push_up', [w('p', 1, 'push_up', [{ id: 'q', reps: 30, done: true }])])[0].value).toBe(30);
  });

  it('filters by range and summarises', () => {
    const pts = progressSeries('squat', history);
    expect(inRange(pts, '1m', now).map((p) => p.workoutId)).toEqual(['b', 'd']);
    expect(inRange(pts, 'all', now)).toHaveLength(3);
    const sum = progressSummary(inRange(pts, '1m', now))!;
    expect(sum.best.workoutId).toBe('b');
    expect(sum.change).toBe(0);
    expect(progressSummary([])).toBeNull();
  });

  it('lists trained exercises, most recent first', () => {
    expect(trainedExercises(history)).toEqual([
      { exerciseId: 'bench_press', lastAt: now - DAY, sessions: 1 },
      { exerciseId: 'squat', lastAt: now - 5 * DAY, sessions: 3 },
    ]);
  });
});
