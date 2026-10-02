import { getProgram, lightenSession, lighterReason, planAdvice, planProgress, planSession } from '../programs';
import type { Workout } from '../types';

const DAY = 86_400_000;
const START = Date.UTC(2026, 8, 1);
const hyrox = getProgram('hyrox')!;
const strength = getProgram('strength-5x5')!;
const plan = { programId: 'hyrox', startedAt: START };

const done = (week: number, session: number, endedAt: number, light?: boolean): Workout => ({
  id: `${week}-${session}`,
  name: 'x',
  startedAt: endedAt - 3600_000,
  endedAt,
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
  exercises: [],
  plan: { programId: 'hyrox', week, session, ...(light ? { light } : {}) },
});

describe('lighter sessions', () => {
  it('drops a set from bigger lifts and trims distance and time', () => {
    const full = strength.week(1)[0];
    const light = lightenSession(full);
    expect(light.name).toBe(`${full.name} (lighter)`);
    light.exercises.forEach((e, i) => {
      const f = full.exercises[i];
      expect(e.sets).toBe(f.sets > 2 ? f.sets - 1 : f.sets);
      expect(e.reps).toBe(f.reps);
    });
    const run = lightenSession({ name: 'Run', focus: '', exercises: [{ exerciseId: 'run', sets: 1, distance: 10 }] });
    expect(run.exercises[0].distance).toBe(7);
    const tempo = lightenSession({ name: 'Bike', focus: '', exercises: [{ exerciseId: 'bike', sets: 1, minutes: 30 }] });
    expect(tempo.exercises[0].minutes).toBe(21);
  });

  it('come from the plan ref and still count as that session', () => {
    expect(planSession({ programId: 'hyrox', week: 1, session: 1, light: true })?.name).toMatch(/\(lighter\)$/);
    const p = planProgress(hyrox, [done(1, 1, START + DAY, true)], START);
    expect(p.completed).toBe(1);
    expect(p.next).toEqual({ week: 1, session: 2 });
  });
});

describe('plan advice', () => {
  const advise = (workouts: Workout[], now: number, readiness = 80) =>
    planAdvice({ program: hyrox, plan, progress: planProgress(hyrox, workouts, START), workouts, readiness, now });

  it('suggests a lighter day when readiness is low', () => {
    const a = advise([], START + DAY, 30);
    expect(a.lighter).toBe('readiness');
    expect(lighterReason(a)).toMatch(/Readiness is low/);
    expect(advise([], START + DAY, 70).lighter).toBeUndefined();
  });

  it('suggests easing back in after a long break', () => {
    const a = advise([done(1, 1, START + DAY)], START + 13 * DAY);
    expect(a).toMatchObject({ lighter: 'comeback', daysAway: 12 });
    expect(lighterReason(a)).toBe('Welcome back after 12 days. Ease in with a lighter session.');
    expect(advise([done(1, 1, START + DAY)], START + 5 * DAY).lighter).toBeUndefined();
  });

  it('counts weeks behind the calendar', () => {
    expect(advise([], START + 2 * DAY)).toMatchObject({ scheduledWeek: 1, weeksBehind: 0 });
    expect(advise([done(1, 1, START + DAY)], START + 15 * DAY)).toMatchObject({ scheduledWeek: 3, weeksBehind: 2 });
    expect(advise([], START + 400 * DAY).scheduledWeek).toBe(hyrox.weeks);
  });
});
