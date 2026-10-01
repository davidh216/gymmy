import { milestoneStats } from '../milestones';
import { dayKey, dayKeyTime, muscleRecovery, readiness, recentCheckIns, trainingDaysInRow, type CheckIn } from '../recovery';
import type { Workout, WorkoutExercise } from '../types';

const HOUR = 3_600_000;
const now = new Date(2026, 9, 1, 18).getTime();

const sets = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `s${i}`, weight: 100, reps: 5, done: true }));
const workout = (endedAt: number, exercises: WorkoutExercise[] = [{ id: 'x', exerciseId: 'squat', sets: sets(3) }]): Workout => ({
  id: String(endedAt),
  name: 'w',
  startedAt: endedAt - HOUR,
  endedAt,
  exercises,
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
});
const checkIn = (patch: Partial<CheckIn> = {}): CheckIn => ({ date: dayKey(now), at: now, rest: false, activities: [], ...patch });

describe('days', () => {
  it('formats and parses local day keys', () => {
    expect(dayKey(now)).toBe('2026-10-01');
    expect(dayKey(dayKeyTime('2026-02-28'))).toBe('2026-02-28');
  });

  it('counts training days in a row', () => {
    const days = (n: number) => now - n * 24 * HOUR;
    expect(trainingDaysInRow([workout(days(1)), workout(days(2)), workout(days(4))], now)).toBe(2);
    expect(trainingDaysInRow([workout(days(0)), workout(days(1))], now)).toBe(2);
    expect(trainingDaysInRow([workout(days(3))], now)).toBe(0);
  });
});

describe('muscleRecovery', () => {
  it('fatigues trained groups and fades over time', () => {
    const heavy = [{ id: 'x', exerciseId: 'squat', sets: sets(12) }];
    const fresh = muscleRecovery([workout(now - 2 * HOUR, heavy)], now);
    const legs = fresh.find((m) => m.group === 'legs')!.recovered;
    expect(legs).toBeLessThan(0.3);
    expect(fresh.find((m) => m.group === 'chest')!.recovered).toBe(1);
    const later = muscleRecovery([workout(now - 60 * HOUR, heavy)], now).find((m) => m.group === 'legs')!.recovered;
    expect(later).toBeGreaterThan(legs);
    expect(muscleRecovery([workout(now - 100 * HOUR, heavy)], now).every((m) => m.recovered === 1)).toBe(true);
  });

  it('counts runs toward legs', () => {
    const run = [{ id: 'r', exerciseId: 'run', sets: [{ id: 'a', distance: 10, minutes: 60, done: true }] }];
    expect(muscleRecovery([workout(now - HOUR, run)], now).find((m) => m.group === 'legs')!.recovered).toBeLessThan(1);
  });
});

describe('readiness', () => {
  it('is high when rested and fresh', () => {
    const r = readiness(checkIn({ sleepHours: 8, soreness: 1, energy: 5, stress: 1 }), [], now);
    expect(r.score).toBe(100);
    expect(r.label).toBe('Ready to push');
    expect(r.checkedIn).toBe(true);
  });

  it('recommends rest when wrecked', () => {
    const days = [1, 2, 3, 4, 5].map((n) => workout(now - n * 24 * HOUR, [{ id: 'x', exerciseId: 'squat', sets: sets(15) }]));
    const r = readiness(checkIn({ sleepHours: 4.5, soreness: 5, energy: 1, stress: 5 }), days, now);
    expect(r.score).toBeLessThan(40);
    expect(r.label).toBe('Rest day');
  });

  it('falls back to training load without a check-in', () => {
    const r = readiness(undefined, [], now);
    expect(r.checkedIn).toBe(false);
    expect(r.factors.map((f) => f.label)).toEqual(['Training load']);
    expect(r.score).toBe(100);
  });
});

describe('check-ins', () => {
  it('lists recent check-ins and feeds milestones', () => {
    const yesterday = dayKey(now - 24 * HOUR);
    const all = {
      [dayKey(now)]: checkIn({ rest: true }),
      [yesterday]: checkIn({ date: yesterday }),
      '2026-01-01': checkIn({ date: '2026-01-01', rest: true }),
    };
    expect(recentCheckIns(all, now).map((c) => c.date)).toEqual([dayKey(now), yesterday]);
    const stats = milestoneStats({ workouts: [], weeklyGoal: 3, buddies: 1, customExercises: 0, checkIns: Object.values(all) });
    expect(stats.checkIns).toBe(3);
    expect(stats.restDays).toBe(2);
  });
});
