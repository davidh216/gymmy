import type { PlanExercise, PlanSession } from './programs';

export type PlanGoal = 'strength' | 'muscle' | 'general';
export type Experience = 'new' | 'some' | 'experienced';
export type Equipment = 'gym' | 'dumbbells';

export type GeneratorInput = {
  goal: PlanGoal;
  /** 2–6 */
  days: number;
  experience: Experience;
  equipment: Equipment;
  /** Session length: 30, 45, 60 or 75. */
  minutes: number;
};

export const GOALS: { id: PlanGoal; emoji: string; label: string; short: string; blurb: string }[] = [
  {
    id: 'strength',
    emoji: '🏋️',
    label: 'Get stronger',
    short: 'Strength',
    blurb: 'Heavier lifts, fewer reps',
  },
  {
    id: 'muscle',
    emoji: '💪',
    label: 'Build muscle',
    short: 'Muscle',
    blurb: 'More sets in the 6–12 rep range',
  },
  {
    id: 'general',
    emoji: '⚡',
    label: 'Get fit',
    short: 'Fitness',
    blurb: 'A bit of everything',
  },
];
export const EXPERIENCE: { id: Experience; label: string }[] = [
  { id: 'new', label: 'New to lifting' },
  { id: 'some', label: 'Under 2 years' },
  { id: 'experienced', label: '2+ years' },
];
export const EQUIPMENT: { id: Equipment; label: string }[] = [
  { id: 'gym', label: 'Full gym' },
  { id: 'dumbbells', label: 'Dumbbells only' },
];
export const DAY_CHOICES = [2, 3, 4, 5, 6];
export const MINUTE_CHOICES = [30, 45, 60, 75];
export const GENERATED_WEEKS = 8;

/** A movement slot in a session, filled by a lift that suits your equipment. */
type Slot =
  | 'squat'
  | 'hinge'
  | 'hpush'
  | 'vpush'
  | 'hpull'
  | 'vpull'
  | 'legs'
  | 'hamstrings'
  | 'chest'
  | 'delts'
  | 'rear'
  | 'biceps'
  | 'triceps'
  | 'calves'
  | 'core';

const LIFTS: Record<Slot, Record<Equipment, string>> = {
  squat: { gym: 'squat', dumbbells: 'bulgarian_split_squat' },
  hinge: { gym: 'romanian_deadlift', dumbbells: 'romanian_deadlift' },
  hpush: { gym: 'bench_press', dumbbells: 'incline_db_press' },
  vpush: { gym: 'overhead_press', dumbbells: 'db_shoulder_press' },
  hpull: { gym: 'barbell_row', dumbbells: 'db_row' },
  vpull: { gym: 'lat_pulldown', dumbbells: 'pull_up' },
  legs: { gym: 'leg_press', dumbbells: 'hip_thrust' },
  hamstrings: { gym: 'leg_curl', dumbbells: 'romanian_deadlift' },
  chest: { gym: 'cable_crossover', dumbbells: 'db_fly' },
  delts: { gym: 'lateral_raise', dumbbells: 'lateral_raise' },
  rear: { gym: 'face_pull', dumbbells: 'rear_delt_fly' },
  biceps: { gym: 'barbell_curl', dumbbells: 'db_curl' },
  triceps: { gym: 'tricep_pushdown', dumbbells: 'overhead_tricep_ext' },
  calves: { gym: 'calf_raise', dumbbells: 'calf_raise' },
  core: { gym: 'cable_crunch', dumbbells: 'plank' },
};

type Day = { name: string; focus: string; slots: Slot[] };

const FULL_A: Day = {
  name: 'Full body A',
  focus: 'Squat, bench and row',
  slots: ['squat', 'hpush', 'hpull', 'delts', 'biceps', 'core'],
};
const FULL_B: Day = {
  name: 'Full body B',
  focus: 'Hinge, press and pull-down',
  slots: ['hinge', 'vpush', 'vpull', 'legs', 'triceps', 'core'],
};
const FULL_C: Day = {
  name: 'Full body C',
  focus: 'Squat, bench and pull-down',
  slots: ['squat', 'hpush', 'vpull', 'hamstrings', 'rear', 'calves'],
};
const UPPER_A: Day = {
  name: 'Upper A',
  focus: 'Bench and row',
  slots: ['hpush', 'hpull', 'vpush', 'vpull', 'biceps', 'triceps'],
};
const LOWER_A: Day = {
  name: 'Lower A',
  focus: 'Squat-led legs',
  slots: ['squat', 'hamstrings', 'legs', 'calves', 'core'],
};
const UPPER_B: Day = {
  name: 'Upper B',
  focus: 'Press and pull-down',
  slots: ['vpush', 'vpull', 'hpush', 'hpull', 'delts', 'rear'],
};
const LOWER_B: Day = {
  name: 'Lower B',
  focus: 'Hinge-led legs',
  slots: ['hinge', 'legs', 'hamstrings', 'calves', 'core'],
};
const PUSH: Day = {
  name: 'Push',
  focus: 'Chest, shoulders, triceps',
  slots: ['hpush', 'vpush', 'chest', 'delts', 'triceps'],
};
const PULL: Day = {
  name: 'Pull',
  focus: 'Back and biceps',
  slots: ['vpull', 'hpull', 'rear', 'biceps', 'core'],
};
const LEGS: Day = {
  name: 'Legs',
  focus: 'Quads, hamstrings, calves',
  slots: ['squat', 'hinge', 'legs', 'hamstrings', 'calves'],
};

/** The split for a number of days a week. New lifters get full-body sessions at 3 days. */
function split(days: number, experience: Experience): Day[] {
  switch (days) {
    case 2:
      return [FULL_A, FULL_B];
    case 3:
      return experience === 'experienced' ? [PUSH, PULL, LEGS] : [FULL_A, FULL_B, FULL_C];
    case 4:
      return [UPPER_A, LOWER_A, UPPER_B, LOWER_B];
    case 5:
      return [UPPER_A, LOWER_A, PUSH, PULL, LEGS];
    default:
      return [PUSH, PULL, LEGS, { ...PUSH, name: 'Push 2' }, { ...PULL, name: 'Pull 2' }, { ...LEGS, name: 'Legs 2' }];
  }
}

/** Exercises that fit a session of this length (about 10 minutes each, plus warming up). */
export function exercisesFor(minutes: number): number {
  return Math.max(3, Math.min(6, Math.floor((minutes - 5) / 10)));
}

/** Big multi-joint lifts; only these get the heavy main-lift prescription. */
const COMPOUND = new Set<Slot>(['squat', 'hinge', 'hpush', 'vpush', 'hpull', 'vpull', 'legs']);

/** Sets and reps for a lift, by goal; the first two compound lifts of a day are the main ones. */
function prescription(slot: Slot, main: boolean, input: GeneratorInput, exerciseId: string): PlanExercise {
  if (exerciseId === 'plank') return { exerciseId, sets: 3, minutes: 0.5 };
  if (exerciseId === 'pull_up')
    return {
      exerciseId,
      sets: 3,
      reps: input.experience === 'new' ? '5–8' : '6–10',
    };
  const fewer = input.experience === 'new' ? 1 : 0;
  if (slot === 'calves' || slot === 'core') return { exerciseId, sets: 3, reps: '12–15' };
  if (input.goal === 'strength') {
    return main ? { exerciseId, sets: 5 - fewer, reps: '5' } : { exerciseId, sets: 3, reps: '8–10' };
  }
  if (input.goal === 'muscle') {
    return main ? { exerciseId, sets: 4 - fewer, reps: '6–8' } : { exerciseId, sets: 3, reps: '10–12' };
  }
  return main ? { exerciseId, sets: 3, reps: '8–10' } : { exerciseId, sets: 3 - fewer, reps: '10–12' };
}

/** A week of sessions from your answers. The same week repeats; the coach moves the weights. */
export function generatePlan(input: GeneratorInput): PlanSession[] {
  const count = exercisesFor(input.minutes);
  return split(input.days, input.experience).map((day) => {
    const used = new Set<string>();
    const exercises: PlanExercise[] = [];
    for (const slot of day.slots) {
      if (exercises.length >= count) break;
      // Strength plans pull heavy from the floor on a gym hinge day.
      const id =
        slot === 'hinge' && input.goal === 'strength' && input.equipment === 'gym'
          ? 'deadlift'
          : LIFTS[slot][input.equipment];
      if (used.has(id)) continue;
      used.add(id);
      exercises.push(prescription(slot, exercises.length < 2 && COMPOUND.has(slot), input, id));
    }
    return { name: day.name, focus: day.focus, exercises };
  });
}

export function generatedName(input: GeneratorInput): {
  name: string;
  emoji: string;
} {
  const goal = GOALS.find((g) => g.id === input.goal)!;
  return { name: `${goal.short} · ${input.days} days`, emoji: goal.emoji };
}
