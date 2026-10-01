import {
  formatClock,
  formatDistanceKm,
  formatPace,
  formatSet,
  formatTarget,
  fromDisplayDistance,
  parseClock,
  toDisplayDistance,
} from '../format';
import { milestoneStats } from '../milestones';
import { completedSets, detectPRs, setLogged, topSet } from '../records';
import type { SetEntry, Workout } from '../types';

const run = (distance?: number, minutes?: number, done = true): SetEntry => ({ id: `${distance}-${minutes}`, distance, minutes, done });

const workout = (id: string, endedAt: number, sets: SetEntry[]): Workout => ({
  id,
  name: id,
  startedAt: endedAt - 3600_000,
  endedAt,
  exercises: [{ id: 'r', exerciseId: 'run', sets }],
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
});

describe('distance formatting', () => {
  it('converts between km and miles', () => {
    expect(toDisplayDistance(5, 'kg')).toBe(5);
    expect(toDisplayDistance(5, 'lb')).toBe(3.11);
    expect(fromDisplayDistance(26.2, 'lb')).toBeCloseTo(42.16, 2);
    expect(formatDistanceKm(42.195, 'kg')).toBe('42.2 km');
    expect(formatDistanceKm(1609.344, 'lb')).toBe('1,000 mi');
  });

  it('reads and writes race clocks', () => {
    expect(parseClock('25:30')).toBe(25.5);
    expect(parseClock('1:05:00')).toBe(65);
    expect(parseClock('30')).toBe(30);
    expect(parseClock('25:')).toBeUndefined();
    expect(parseClock('abc')).toBeUndefined();
    expect(formatClock(25.5)).toBe('25:30');
    expect(formatClock(65)).toBe('1:05:00');
  });

  it('shows pace and sets', () => {
    expect(formatPace(5, 25.5, 'kg')).toBe('5:06/km');
    expect(formatPace(fromDisplayDistance(3.1, 'lb'), 24.8, 'lb')).toBe('8:00/mi');
    expect(formatSet(run(5, 25.5), 'distance', 'kg')).toBe('5 km · 25:30');
    expect(formatSet(run(5, 25.5), 'distance', 'kg', { pace: true })).toBe('5 km · 25:30 · 5:06/km');
    expect(formatSet(run(undefined, 30), 'distance', 'kg')).toBe('30 min');
    expect(formatTarget({ sets: 1, distance: 5 }, 'lb')).toBe('3.11 mi');
  });
});

describe('distance records', () => {
  it('picks the longest distance, falling back to time-only sets', () => {
    expect(topSet('distance', [run(5, 30), run(10, 55), run(undefined, 90)])?.distance).toBe(10);
    expect(topSet('distance', [run(undefined, 20), run(undefined, 45)])?.minutes).toBe(45);
  });

  it('counts time-only runs as logged and awards distance PRs', () => {
    expect(setLogged('run', run(undefined, 30))).toBe(true);
    expect(setLogged('run', run(undefined, 30, false))).toBe(false);
    expect(completedSets([{ id: 'x', exerciseId: 'run', sets: [run(5, 25), run(undefined, 20)] }])).toBe(2);
    const prs = detectPRs([{ id: 'x', exerciseId: 'run', sets: [run(10, 50)] }], [workout('a', 1, [run(5, 25)])]);
    expect(prs).toEqual([{ exerciseId: 'run', value: 10, previous: 5 }]);
  });

  it('feeds distance milestones', () => {
    const stats = milestoneStats({
      workouts: [workout('a', 1, [run(5, 25)]), workout('b', 2, [run(21.1, 120)]), workout('c', 3, [run(undefined, 30)])],
      weeklyGoal: 3,
      buddies: 1,
      customExercises: 0,
    });
    expect(stats.distanceKm).toBeCloseTo(26.1);
    expect(stats.longestRun).toBe(21.1);
    expect(stats.cardioMinutes).toBe(175);
  });
});
