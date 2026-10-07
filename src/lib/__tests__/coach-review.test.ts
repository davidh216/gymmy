import { coachPick, coachReview, groupList, metTarget } from '../coach-review';
import { shiftWeek } from '../recap';
import { dayKey } from '../recovery';
import { weekStart } from '../streaks';
import type { SetEntry, Workout, WorkoutExercise } from '../types';

const start = weekStart(new Date(2026, 9, 5, 12).getTime());
const at = (weekOffset: number, day = 1) => shiftWeek(start, weekOffset) + day * 86_400_000 + 18 * 3_600_000;
let n = 0;
const sets = (count: number, weight = 100, reps = 5): SetEntry[] =>
  Array.from({ length: count }, () => ({ id: `s${n++}`, weight, reps, done: true }));
const ex = (exerciseId: string, s: SetEntry[], extra: Partial<WorkoutExercise> = {}): WorkoutExercise => ({
  id: `e${n++}`,
  exerciseId,
  sets: s,
  ...extra,
});
const workout = (ts: number, exercises: WorkoutExercise[], extra: Partial<Workout> = {}): Workout =>
  ({ id: `w${n++}`, name: 'W', startedAt: ts - 3_600_000, endedAt: ts, exercises, prs: [], ...extra }) as Workout;

describe('metTarget', () => {
  const coach = { call: 'up' as const, weight: 102.5, reps: 5, from: 100 };
  it('needs every working set at the target', () => {
    expect(metTarget(ex('squat', sets(3, 102.5, 5), { coach }))).toBe(true);
    expect(metTarget(ex('squat', [...sets(2, 102.5, 5), ...sets(1, 102.5, 4)], { coach }))).toBe(false);
    expect(metTarget(ex('squat', sets(3, 102.5, 5)))).toBe(false);
  });
});

describe('coachReview', () => {
  it('counts plan sessions and coach targets', () => {
    const coach = { call: 'up' as const, weight: 100, reps: 5, from: 97.5 };
    const plan = { programId: 'p', week: 1, session: 1 };
    const workouts = [
      workout(at(0, 0), [ex('squat', sets(3), { coach })], { plan }),
      workout(at(0, 2), [ex('bench_press', sets(3, 100, 4), { coach })], { plan }),
    ];
    const r = coachReview({
      start,
      workouts,
      checkIns: {},
      plan: { programId: 'p', daysPerWeek: 3, name: 'Strength' },
    });
    expect(r.targets).toEqual({ met: 1, total: 2 });
    expect(r.notes.map((x) => x.text)).toEqual(['2 of 3 Strength sessions.', 'Hit 1 of 2 coach targets.']);
    expect(r.setsByGroup).toEqual({ legs: 3, chest: 3 });
  });

  it('flags big muscle groups left out for two weeks', () => {
    const legDay = (ts: number) =>
      workout(ts, [ex('squat', sets(6)), ex('bench_press', sets(6)), ex('barbell_row', sets(4))]);
    const r = coachReview({ start, workouts: [legDay(at(0)), legDay(at(-1))], checkIns: {} });
    expect(r.notes).toEqual([
      expect.objectContaining({ id: 'neglected', text: expect.stringMatching(/^No shoulders work/) }),
    ]);
  });

  it('suggests an easier week after six steady weeks', () => {
    const workouts = [0, -1, -2, -3, -4, -5].flatMap((w) => [workout(at(w, 0), []), workout(at(w, 3), [])]);
    expect(coachReview({ start, workouts, checkIns: {} }).notes.map((x) => x.id)).toEqual(['deload']);
    expect(coachReview({ start, workouts: workouts.slice(2), checkIns: {} }).notes).toEqual([]);
  });

  it('suggests an easier week when check-ins say you are worn down', () => {
    const checkIns = Object.fromEntries(
      [0, 1, 2].map((d) => {
        const date = dayKey(at(0, d));
        return [date, { date, at: at(0, d), rest: false, activities: [], energy: 2 as const }];
      }),
    );
    expect(coachReview({ start, workouts: [], checkIns }).notes.map((x) => x.id)).toEqual(['tired']);
  });
});

describe('coachPick', () => {
  const templates = [
    { id: 'push', name: 'Push', exerciseIds: ['bench_press', 'overhead_press', 'tricep_pushdown'] },
    { id: 'legs', name: 'Legs', exerciseIds: ['squat', 'leg_curl'] },
  ];
  const fresh = (overrides: Record<string, number>) =>
    (['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'] as const).map((group) => ({
      group,
      recovered: overrides[group] ?? 1,
    }));

  it('picks the most recovered session and says what is still sore', () => {
    const pick = coachPick(templates, fresh({ chest: 0.3, shoulders: 0.5, triceps: 0.4 }));
    expect(pick).toMatchObject({
      kind: 'session',
      id: 'legs',
      fresh: ['legs'],
      sore: ['chest', 'shoulders', 'triceps'],
    });
  });

  it('suggests rest when everything is worn out', () => {
    const tired = fresh({ chest: 0.2, shoulders: 0.2, triceps: 0.2, legs: 0.3 });
    expect(coachPick(templates, tired)).toMatchObject({ kind: 'rest' });
  });

  it('lists groups for a sentence', () => {
    expect(groupList(['chest', 'back', 'legs'])).toBe('Chest, back and legs');
  });
});
