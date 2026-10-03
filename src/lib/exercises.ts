export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio';

/**
 * How a set is measured:
 * - `weight`: load × reps
 * - `reps`: bodyweight reps
 * - `duration`: minutes (holds, cardio)
 * - `distance`: distance and time (runs, rides, rows); time alone also counts
 */
export type ExerciseKind = 'weight' | 'reps' | 'duration' | 'distance';

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
  { id: 'distance', label: 'Distance + time' },
];

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
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
  ex('sled_push', 'Sled Push', 'legs'),
  ex('sled_pull', 'Sled Pull', 'back'),
  ex('sandbag_lunge', 'Sandbag Lunge', 'legs'),
  ex('wall_ball', 'Wall Ball', 'legs', 'reps'),

  ex('overhead_press', 'Overhead Press', 'shoulders'),
  ex('db_shoulder_press', 'Dumbbell Shoulder Press', 'shoulders'),
  ex('lateral_raise', 'Lateral Raise', 'shoulders'),
  ex('face_pull', 'Face Pull', 'shoulders'),
  ex('rear_delt_fly', 'Rear Delt Fly', 'shoulders'),

  ex('barbell_curl', 'Barbell Curl', 'biceps'),
  ex('db_curl', 'Dumbbell Curl', 'biceps'),
  ex('hammer_curl', 'Hammer Curl', 'biceps'),
  ex('preacher_curl', 'Preacher Curl', 'biceps'),
  ex('cable_curl', 'Cable Curl', 'biceps'),
  ex('tricep_pushdown', 'Tricep Pushdown', 'triceps'),
  ex('skull_crusher', 'Skull Crusher', 'triceps'),
  ex('overhead_tricep_ext', 'Overhead Tricep Extension', 'triceps'),
  ex('close_grip_bench', 'Close-Grip Bench Press', 'triceps'),
  ex('tricep_kickback', 'Tricep Kickback', 'triceps'),

  ex('plank', 'Plank', 'core', 'duration'),
  ex('hanging_leg_raise', 'Hanging Leg Raise', 'core', 'reps'),
  ex('cable_crunch', 'Cable Crunch', 'core'),
  ex('ab_wheel', 'Ab Wheel Rollout', 'core', 'reps'),

  ex('farmers_carry', 'Farmers Carry', 'core'),

  ex('run', 'Run', 'cardio', 'distance'),
  ex('walk', 'Walk', 'cardio', 'distance'),
  ex('bike', 'Bike', 'cardio', 'distance'),
  ex('rower', 'Rower', 'cardio', 'distance'),
  ex('swim', 'Swim', 'cardio', 'distance'),
  ex('stair_climber', 'Stair Climber', 'cardio', 'duration'),
  ex('jump_rope', 'Jump Rope', 'cardio', 'duration'),
  ex('ski_erg', 'SkiErg', 'cardio', 'distance'),
  ex('burpee_broad_jump', 'Burpee Broad Jump', 'cardio', 'reps'),
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

// Custom and community exercises, kept in sync by the store.
let extra: Exercise[] = [];
let extraById = new Map<string, Exercise>();

/**
 * Older exercises were filed under "arms", before biceps and triceps were split. Sort them by
 * name: pressing and extension moves work the triceps, everything else the biceps.
 */
export function fixGroup(group: string, name: string): MuscleGroup {
  if (group !== 'arms') return group as MuscleGroup;
  return /tri|push ?down|skull|extension|kickback|dip|close.?grip/i.test(name) ? 'triceps' : 'biceps';
}

export function setExtraExercises(list: Exercise[]) {
  list = list.map((e) => ((e.group as string) === 'arms' ? { ...e, group: fixGroup(e.group, e.name) } : e));
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

/** A workout template you saved. */
export type SavedTemplate = { id: string; name: string; exerciseIds: string[]; createdAt: number };

/** "Chest · Biceps · Core" from the exercises' muscle groups, in order. */
export function templateBlurb(exerciseIds: string[]): string {
  const labels = [...new Set(exerciseIds.map((id) => getExercise(id).group))].map(
    (g) => MUSCLE_GROUPS.find((m) => m.id === g)?.label ?? g,
  );
  return labels.slice(0, 3).join(' · ') + (labels.length > 3 ? ' · …' : '');
}

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
