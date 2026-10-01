import { MILESTONES, milestoneDetail, milestoneStates, milestoneStats, visibleMilestones } from '../milestones';
import { getExercise } from '../exercises';
import { PROGRAMS, completedPrograms, planProgress, planSession, targetReps } from '../programs';
import { workoutRewards } from '../progression';
import { bestWeekStreak } from '../streaks';
import type { PlanRef, Workout } from '../types';

const DAY = 86400000;
const base = new Date(2026, 0, 5, 12).getTime(); // a Monday

const workout = (id: string, endedAt: number, extra: Partial<Workout> = {}): Workout => ({
  id,
  name: id,
  startedAt: endedAt - 3600_000,
  endedAt,
  exercises: [{ id: 'x', exerciseId: 'squat', sets: [{ id: 's', weight: 100, reps: 5, done: true }] }],
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
  ...extra,
});

describe('programs', () => {
  it('every week of every plan has the right number of sessions with real exercises', () => {
    for (const p of PROGRAMS) {
      for (let w = 1; w <= p.weeks; w++) {
        const sessions = p.week(w);
        expect(sessions).toHaveLength(p.daysPerWeek);
        for (const s of sessions) {
          expect(s.exercises.length).toBeGreaterThan(0);
          for (const e of s.exercises) {
            expect(getExercise(e.exerciseId).name).not.toBe('Unknown exercise');
            expect(e.sets).toBeGreaterThan(0);
            expect(e.reps !== undefined || e.minutes !== undefined).toBe(true);
            if (e.minutes !== undefined) expect(e.minutes).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('builds the marathon long run with cutbacks and a race at the end', () => {
    const long = (w: number) => planSession({ programId: 'marathon', week: w, session: 4 })!.exercises[0].minutes;
    expect(long(1)).toBe(60);
    expect(long(4)! < long(3)!).toBe(true);
    expect(long(13)).toBe(180);
    expect(planSession({ programId: 'marathon', week: 16, session: 4 })!.name).toBe('Race day');
  });

  it('tracks progress and the next session', () => {
    const program = PROGRAMS.find((p) => p.id === 'first-5k')!;
    const done = (ref: Omit<PlanRef, 'programId'>, t: number) => workout(`${ref.week}-${ref.session}`, t, { plan: { programId: 'first-5k', ...ref } });
    const history = [done({ week: 1, session: 1 }, base), done({ week: 1, session: 2 }, base + DAY)];
    const progress = planProgress(program, history, base - DAY);
    expect(progress.completed).toBe(2);
    expect(progress.next).toEqual({ week: 1, session: 3 });
    expect(planProgress(program, history, base + 2 * DAY).completed).toBe(0);

    const all = Array.from({ length: 24 }, (_, i) => done({ week: Math.floor(i / 3) + 1, session: (i % 3) + 1 }, base + i * DAY));
    expect(planProgress(program, all).next).toBeNull();
    expect(completedPrograms(all)).toEqual(['first-5k']);
  });

  it('reads whole-number reps targets', () => {
    expect(targetReps('8')).toBe(8);
    expect(targetReps('8–10')).toBe(8);
    expect(targetReps('2 lengths')).toBe(2);
    expect(targetReps(undefined)).toBeUndefined();
  });

  it('pays a bonus for plan sessions', () => {
    const input = { completedSets: 0, prCount: 0, streakWeeks: 0, companionBonus: 0, hitsWeeklyGoal: false };
    const plain = workoutRewards(input);
    const plan = workoutRewards({ ...input, plan: 'HYROX Prep' });
    expect(plan.gems - plain.gems).toBe(10);
    expect(plan.lines.some((l) => l.label === 'HYROX Prep session')).toBe(true);
  });
});

describe('milestones', () => {
  it('have unique ids and sensible wording', () => {
    expect(new Set(MILESTONES.map((m) => m.id)).size).toBe(MILESTONES.length);
    const first = MILESTONES.find((m) => m.id === 'workouts-1')!;
    expect(milestoneDetail(first, 'lb')).toBe('Finish your first workout');
    expect(milestoneDetail(MILESTONES.find((m) => m.id === 'streak-4')!, 'lb')).toBe('Hit your weekly goal 4 weeks in a row');
  });

  it('computes stats from history', () => {
    const run = (id: string, t: number, minutes: number) =>
      workout(id, t, { exercises: [{ id: 'r', exerciseId: 'run', sets: [{ id: 's', minutes, done: true }] }] });
    const early = new Date(2026, 0, 6, 6).getTime();
    const history = [
      workout('a', base, { prs: [{ exerciseId: 'squat', value: 1, previous: 0 }] }),
      run('b', base + DAY, 45),
      run('c', base + 2 * DAY, 70),
      { ...workout('d', early + 3600_000), startedAt: early },
    ];
    const stats = milestoneStats({ workouts: history, weeklyGoal: 2, buddies: 4, customExercises: 1 });
    expect(stats).toMatchObject({
      workouts: 4,
      prs: 1,
      cardioMinutes: 115,
      longestCardio: 70,
      exercisesTried: 2,
      sets: 4,
      buddies: 4,
      customExercises: 1,
      earlyBirds: 1,
      bestStreak: 1,
    });
    expect(stats.volumeKg).toBe(1000);
    const states = milestoneStates(stats, { 'workouts-1': 1 });
    expect(states.find((m) => m.id === 'workouts-1')).toMatchObject({ achieved: true, claimedAt: 1 });
    expect(states.find((m) => m.id === 'long-60')?.achieved).toBe(true);
    expect(states.find((m) => m.id === 'long-120')?.achieved).toBe(false);
  });

  it('finds the best week streak ever, not just the current one', () => {
    const week = 7 * DAY;
    // Weeks 0-2 hit a 1-day goal, week 3 missed, week 4 hit.
    const times = [base, base + week, base + 2 * week, base + 4 * week];
    expect(bestWeekStreak(times, 1)).toBe(3);
    expect(bestWeekStreak(times, 2)).toBe(0);
  });
});

describe('visibleMilestones', () => {
  it('shows claimable tiers and only the next goal per track', () => {
    const stats = milestoneStats({ workouts: [], weeklyGoal: 3, buddies: 4, customExercises: 0 });
    const shown = visibleMilestones(milestoneStates({ ...stats, workouts: 12 }, { 'workouts-1': 1 }));
    const workouts = shown.filter((m) => m.trackId === 'workouts').map((m) => m.id);
    expect(workouts).toEqual(['workouts-5', 'workouts-10', 'workouts-25']);
    expect(shown.filter((m) => m.trackId === 'buddies').map((m) => m.id)).toEqual(['buddies-3', 'buddies-6']);
  });
});
