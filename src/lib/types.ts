export type SetEntry = {
  id: string;
  /** Load in kg (canonical unit; converted for display). */
  weight?: number;
  reps?: number;
  minutes?: number;
  done: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
};

export type PersonalRecord = {
  exerciseId: string;
  /** e1RM in kg for weighted lifts, reps for bodyweight, minutes for duration. */
  value: number;
  previous: number;
};

export type ActiveWorkout = {
  id: string;
  name: string;
  startedAt: number;
  exercises: WorkoutExercise[];
};

export type Workout = ActiveWorkout & {
  endedAt: number;
  companionId: string;
  xp: number;
  gems: number;
  prs: PersonalRecord[];
};

export type Units = 'kg' | 'lb';
