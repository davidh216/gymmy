export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

/**
 * How a set is measured:
 * - `weight`: load × reps
 * - `reps`: bodyweight reps
 * - `duration`: minutes (holds, cardio)
 */
export type ExerciseKind = 'weight' | 'reps' | 'duration';

export type Exercise = {
  id: string;
  name: string;
  group: MuscleGroup;
  kind: ExerciseKind;
  /** `custom`: made on this device. `community`: a reviewed submission, available to everyone. */
  source?: 'custom' | 'community';
};

export const EXERCISE_KINDS: { id: ExerciseKind; label: string }[] = [
  { id: 'weight', label: 'Weight × reps' },
  { id: 'reps', label: 'Reps only' },
  { id: 'duration', label: 'Time' },
];

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'core', label: 'Core' },
  { id: 'cardio', label: 'Cardio' },
];

const ex = (id: string, name: string, group: MuscleGroup, kind: ExerciseKind = 'weight') => ({
  id,
  name,
  group,
  kind,
});

export const EXERCISES: Exercise[] = [
  ex('bench_press', 'Bench Press', 'chest'),
  ex('incline_db_press', 'Incline Dumbbell Press', 'chest'),
  ex('db_fly', 'Dumbbell Fly', 'chest'),
  ex('cable_crossover', 'Cable Crossover', 'chest'),
  ex('push_up', 'Push-up', 'chest', 'reps'),
  ex('dip', 'Dip', 'chest', 'reps'),

  ex('deadlift', 'Deadlift', 'back'),
  ex('barbell_row', 'Barbell Row', 'back'),
  ex('lat_pulldown', 'Lat Pulldown', 'back'),
  ex('seated_cable_row', 'Seated Cable Row', 'back'),
  ex('db_row', 'One-Arm Dumbbell Row', 'back'),
  ex('pull_up', 'Pull-up', 'back', 'reps'),

  ex('squat', 'Back Squat', 'legs'),
  ex('front_squat', 'Front Squat', 'legs'),
  ex('romanian_deadlift', 'Romanian Deadlift', 'legs'),
  ex('leg_press', 'Leg Press', 'legs'),
  ex('bulgarian_split_squat', 'Bulgarian Split Squat', 'legs'),
  ex('leg_curl', 'Leg Curl', 'legs'),
  ex('leg_extension', 'Leg Extension', 'legs'),
  ex('hip_thrust', 'Hip Thrust', 'legs'),
  ex('calf_raise', 'Calf Raise', 'legs'),

  ex('overhead_press', 'Overhead Press', 'shoulders'),
  ex('db_shoulder_press', 'Dumbbell Shoulder Press', 'shoulders'),
  ex('lateral_raise', 'Lateral Raise', 'shoulders'),
  ex('face_pull', 'Face Pull', 'shoulders'),
  ex('rear_delt_fly', 'Rear Delt Fly', 'shoulders'),

  ex('barbell_curl', 'Barbell Curl', 'arms'),
  ex('db_curl', 'Dumbbell Curl', 'arms'),
  ex('hammer_curl', 'Hammer Curl', 'arms'),
  ex('tricep_pushdown', 'Tricep Pushdown', 'arms'),
  ex('skull_crusher', 'Skull Crusher', 'arms'),
  ex('overhead_tricep_ext', 'Overhead Tricep Extension', 'arms'),

  ex('plank', 'Plank', 'core', 'duration'),
  ex('hanging_leg_raise', 'Hanging Leg Raise', 'core', 'reps'),
  ex('cable_crunch', 'Cable Crunch', 'core'),
  ex('ab_wheel', 'Ab Wheel Rollout', 'core', 'reps'),

  ex('run', 'Run', 'cardio', 'duration'),
  ex('bike', 'Bike', 'cardio', 'duration'),
  ex('rower', 'Rower', 'cardio', 'duration'),
  ex('stair_climber', 'Stair Climber', 'cardio', 'duration'),
  ex('jump_rope', 'Jump Rope', 'cardio', 'duration'),
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

// Custom and community exercises, kept in sync by the store.
let extra: Exercise[] = [];
let extraById = new Map<string, Exercise>();

export function setExtraExercises(list: Exercise[]) {
  extra = list;
  extraById = new Map(list.map((e) => [e.id, e]));
}

export function getExercise(id: string): Exercise {
  return BY_ID.get(id) ?? extraById.get(id) ?? { id, name: 'Unknown exercise', group: 'core', kind: 'weight' };
}

/** Collapses whitespace, e.g. "  landmine   press " -> "landmine press". */
export function tidyExerciseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/** An existing exercise with this name (any case), ignoring `exceptId`. */
export function exerciseNamed(name: string, exceptId?: string): Exercise | undefined {
  const key = tidyExerciseName(name).toLowerCase();
  return [...EXERCISES, ...extra].find((e) => e.id !== exceptId && e.name.toLowerCase() === key);
}

/**
 * Your own exercises first, then the built-in and community ones. `extras` is passed in
 * (rather than read from the registry) so memoized callers re-run when it changes.
 */
export function searchExercises(query: string, group?: MuscleGroup | null, extras: Exercise[] = []): Exercise[] {
  const q = query.trim().toLowerCase();
  const custom = extras.filter((e) => e.source === 'custom');
  const community = extras.filter((e) => e.source !== 'custom');
  const shadowed = new Set(custom.map((e) => e.name.toLowerCase()));
  return [
    ...custom,
    ...[...EXERCISES, ...community].filter((e) => !shadowed.has(e.name.toLowerCase())),
  ].filter((e) => (!group || e.group === group) && (!q || e.name.toLowerCase().includes(q)));
}

export type Template = {
  id: string;
  name: string;
  blurb: string;
  exerciseIds: string[];
};

export const TEMPLATES: Template[] = [
  {
    id: 'push',
    name: 'Push',
    blurb: 'Chest · Shoulders · Triceps',
    exerciseIds: ['bench_press', 'overhead_press', 'incline_db_press', 'lateral_raise', 'tricep_pushdown'],
  },
  {
    id: 'pull',
    name: 'Pull',
    blurb: 'Back · Biceps',
    exerciseIds: ['deadlift', 'pull_up', 'barbell_row', 'face_pull', 'db_curl'],
  },
  {
    id: 'legs',
    name: 'Legs',
    blurb: 'Quads · Hamstrings · Glutes',
    exerciseIds: ['squat', 'romanian_deadlift', 'leg_press', 'leg_curl', 'calf_raise'],
  },
  {
    id: 'full',
    name: 'Full Body',
    blurb: 'Hit everything, fast',
    exerciseIds: ['squat', 'bench_press', 'barbell_row', 'overhead_press', 'plank'],
  },
];
