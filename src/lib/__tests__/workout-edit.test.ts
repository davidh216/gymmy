import { cleanExercises, durationMinutes, editProblem, shiftDays } from '../workout-edit';
import type { WorkoutExercise } from '../types';

const squat = (sets: WorkoutExercise['sets']): WorkoutExercise => ({ id: 'e', exerciseId: 'squat', sets });
const now = new Date(2026, 9, 10, 20).getTime();
const base = {
  name: 'Legs',
  startedAt: now - 60 * 60_000,
  endedAt: now - 5 * 60_000,
  exercises: [squat([{ id: 's', weight: 100, reps: 5, done: true }])],
};

describe('cleanExercises', () => {
  it('keeps sets with numbers, marks them done, and drops empty exercises', () => {
    const out = cleanExercises([
      squat([
        { id: 'a', weight: 100, reps: 5, done: true },
        { id: 'b', weight: 100, done: false },
        { id: 'c', weight: 105, reps: 3, done: false },
      ]),
      { id: 'p', exerciseId: 'plank', sets: [{ id: 'd', done: false }] },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].sets.map((s) => [s.id, s.done])).toEqual([
      ['a', true],
      ['c', true],
    ]);
  });
});

describe('editProblem', () => {
  it('accepts a sensible edit', () => {
    expect(editProblem(base, now)).toBeNull();
  });

  it('explains what blocks saving', () => {
    expect(editProblem({ ...base, name: '  ' }, now)).toMatch(/name/);
    expect(editProblem({ ...base, endedAt: base.startedAt }, now)).toMatch(/minute/);
    expect(editProblem({ ...base, endedAt: base.startedAt + 13 * 3_600_000 }, now)).toMatch(/12 hours/);
    expect(editProblem({ ...base, startedAt: now, endedAt: now + 3_600_000 }, now)).toMatch(/future/);
    expect(editProblem({ ...base, exercises: [squat([{ id: 'x', done: false }])] }, now)).toMatch(/set/);
  });
});

describe('time helpers', () => {
  it('moves a day keeping the time of day, and counts minutes', () => {
    const d = new Date(shiftDays(now, -1));
    expect([d.getDate(), d.getHours()]).toEqual([9, 20]);
    expect(durationMinutes(base)).toBe(55);
  });
});
