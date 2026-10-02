import { change, hasActivity, recapHeadline, recapShareText, shiftWeek, weekLabel, weekRecap } from '../recap';
import type { CheckIn } from '../recovery';
import { weekStart } from '../streaks';
import type { Workout } from '../types';

// Monday 2026-09-21, local time.
const MON = new Date(2026, 8, 21).getTime();
const at = (day: number, hour = 18) => new Date(2026, 8, 21 + day, hour).getTime();

let n = 0;
function workout(endedAt: number, sets: Workout['exercises'], prs: Workout['prs'] = []): Workout {
  n += 1;
  return {
    id: `w${n}`,
    name: 'Workout',
    startedAt: endedAt - 3_600_000,
    endedAt,
    exercises: sets,
    companionId: 'kong',
    xp: 0,
    gems: 0,
    prs,
  };
}
const squat = (weight: number, reps: number, count = 1) => ({
  id: `e${n}`,
  exerciseId: 'squat',
  sets: Array.from({ length: count }, (_, i) => ({
    id: `s${i}`,
    weight,
    reps,
    done: true,
  })),
});
const run = (km: number) => ({
  id: `r${n}`,
  exerciseId: 'run',
  sets: [{ id: 's', distance: km, minutes: km * 6, done: true }],
});

const checkIn = (day: number, extra: Partial<CheckIn> = {}): CheckIn => {
  const d = new Date(at(day));
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date, at: at(day), rest: false, activities: [], ...extra };
};

describe('weekly recap', () => {
  const workouts = [
    // The week before: one workout.
    workout(at(-5), [squat(100, 5, 3)]),
    // The recap week: three days, two workouts on Wednesday.
    workout(at(0), [squat(100, 5, 3)], [{ exerciseId: 'squat', value: 116, previous: 110 }]),
    workout(at(2, 7), [run(5)]),
    workout(at(2, 19), [squat(110, 5, 2)], [{ exerciseId: 'squat', value: 128, previous: 116 }]),
    workout(at(6, 23), [squat(60, 10)]),
    // Next Monday doesn't count.
    workout(at(7, 1), [squat(200, 1)]),
  ];
  const checkIns = {
    a: checkIn(1, { rest: true, sleepHours: 8, energy: 4 }),
    b: checkIn(3, { sleepHours: 6, energy: 2 }),
    c: checkIn(9, { sleepHours: 3 }),
  };
  const r = weekRecap({
    start: MON,
    workouts,
    checkIns: Object.fromEntries(Object.values(checkIns).map((c) => [c.date, c])),
    claimedMilestones: { 'workouts-1': at(0), 'workouts-5': at(-10) },
    weeklyGoal: 3,
  });

  it('totals the week', () => {
    expect(r).toMatchObject({
      days: 3,
      workouts: 4,
      sets: 7,
      distanceKm: 5,
      minutes: 240,
      goalHit: true,
      milestones: 1,
    });
    expect(r.volumeKg).toBe(100 * 5 * 3 + 110 * 5 * 2 + 60 * 10);
    expect(r.previous).toMatchObject({ workouts: 1, sets: 3, volumeKg: 1500 });
  });

  it('merges records per exercise across the week', () => {
    expect(r.prs).toEqual([{ exerciseId: 'squat', value: 128, previous: 110 }]);
    expect(r.topExercise).toEqual({ exerciseId: 'squat', sets: 6 });
  });

  it('summarises recovery', () => {
    expect(r).toMatchObject({
      checkIns: 2,
      restDays: 1,
      sleepAvg: 7,
      energyAvg: 3,
    });
  });

  it('shares totals but never sleep', () => {
    const text = recapShareText(r, 'kg');
    expect(text).toContain('Sep 21 – 27');
    expect(text).toContain('3/3 training days ✅');
    expect(text).toContain('4 workouts · 7 sets');
    expect(text).toContain('🏆 1 new best: Back Squat');
    expect(text).toContain('5 km');
    expect(text).not.toMatch(/sleep|energy/i);
  });

  it('reads a headline', () => {
    expect(recapHeadline(r)).toBe('Goal smashed, records broken');
    const quiet = weekRecap({
      start: shiftWeek(MON, 4),
      workouts,
      checkIns: {},
      claimedMilestones: {},
      weeklyGoal: 3,
    });
    expect(hasActivity(quiet)).toBe(false);
    expect(recapHeadline(quiet)).toBe('A quiet week');
  });
});

describe('recap helpers', () => {
  it('steps whole weeks, across daylight saving changes too', () => {
    expect(shiftWeek(MON, 1)).toBe(new Date(2026, 8, 28).getTime());
    expect(shiftWeek(MON, -1)).toBe(new Date(2026, 8, 14).getTime());
    let w = MON;
    for (let i = 0; i < 60; i++) {
      w = shiftWeek(w, 1);
      expect(new Date(w).getDay()).toBe(1);
      expect(new Date(w).getHours()).toBe(0);
      expect(weekStart(w)).toBe(w);
    }
  });

  it('labels weeks', () => {
    expect(weekLabel(MON)).toBe('Sep 21 – 27');
    expect(weekLabel(shiftWeek(MON, 1))).toBe('Sep 28 – Oct 4');
  });

  it('compares with the week before', () => {
    expect(change(12, 10)).toBe('+20%');
    expect(change(5, 10)).toBe('−50%');
    expect(change(5, 0)).toBeUndefined();
    expect(change(10, 10)).toBeUndefined();
  });
});
