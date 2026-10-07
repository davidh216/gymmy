import { getExercise } from '../exercises';
import { exercisesFor, generatePlan, generatedName, type GeneratorInput } from '../plan-generator';
import { validCustomProgram } from '../programs';

const base: GeneratorInput = {
  goal: 'strength',
  days: 3,
  experience: 'some',
  equipment: 'gym',
  minutes: 60,
};

describe('generatePlan', () => {
  it('makes one session per training day, every one valid', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      for (const equipment of ['gym', 'dumbbells'] as const) {
        const plan = generatePlan({ ...base, days, equipment });
        expect(plan).toHaveLength(days);
        expect(validCustomProgram({ name: 'x', weeks: 8, days: plan })).toBe(true);
        for (const d of plan) {
          expect(new Set(d.exercises.map((e) => e.exerciseId)).size).toBe(d.exercises.length);
          for (const e of d.exercises) expect(getExercise(e.exerciseId).name).not.toBe('Unknown exercise');
        }
      }
    }
  });

  it('picks the split from days and experience', () => {
    expect(generatePlan({ ...base, experience: 'new' }).map((d) => d.name)).toEqual([
      'Full body A',
      'Full body B',
      'Full body C',
    ]);
    expect(generatePlan({ ...base, experience: 'experienced' }).map((d) => d.name)).toEqual(['Push', 'Pull', 'Legs']);
    const lower = generatePlan({ ...base, days: 4 })[1];
    expect(lower.name).toBe('Lower A');
    // Leg curls never get the heavy main-lift sets.
    expect(lower.exercises[1]).toMatchObject({ exerciseId: 'leg_curl', reps: '8–10' });
  });

  it('fits the session length', () => {
    expect(exercisesFor(30)).toBe(3);
    expect(exercisesFor(45)).toBe(4);
    expect(exercisesFor(75)).toBe(6);
    expect(generatePlan({ ...base, minutes: 30 })[0].exercises).toHaveLength(3);
  });

  it('sets reps by goal, heavier on the main lifts', () => {
    const [a] = generatePlan(base);
    expect(a.exercises[0]).toEqual({ exerciseId: 'squat', sets: 5, reps: '5' });
    expect(a.exercises[2].reps).toBe('8–10');
    const [m] = generatePlan({ ...base, goal: 'muscle', experience: 'new' });
    expect(m.exercises[0]).toEqual({
      exerciseId: 'squat',
      sets: 3,
      reps: '6–8',
    });
  });

  it('swaps in dumbbell lifts and deadlifts only for strength in a gym', () => {
    const [, b] = generatePlan({ ...base, equipment: 'dumbbells' });
    expect(b.exercises.map((e) => e.exerciseId)).toContain('romanian_deadlift');
    expect(generatePlan(base)[1].exercises[0].exerciseId).toBe('deadlift');
    expect(generatePlan({ ...base, goal: 'general' })[1].exercises[0].exerciseId).toBe('romanian_deadlift');
  });

  it('names the plan after the goal', () => {
    expect(generatedName(base)).toEqual({
      name: 'Strength · 3 days',
      emoji: '🏋️',
    });
  });
});
