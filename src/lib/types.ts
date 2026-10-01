export type SetEntry = {
  id: string;
  /** Load in kg (canonical unit; converted for display). */
  weight?: number;
  reps?: number;
  minutes?: number;
  /** Distance in km (canonical unit; shown in mi for lb users). */
  distance?: number;
  done: boolean;
};

/** What a training plan asks for, e.g. 4 × "8–10" or 30 minutes. */
export type Target = {
  sets: number;
  reps?: string;
  minutes?: number;
  /** km */
  distance?: number;
  note?: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
  target?: Target;
};

/** A training plan session this workout came from (weeks and sessions are 1-based). */
export type PlanRef = { programId: string; week: number; session: number };

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
  plan?: PlanRef;
};

export type Workout = ActiveWorkout & {
  endedAt: number;
  companionId: string;
  xp: number;
  gems: number;
  prs: PersonalRecord[];
  /** Set for workouts imported from Apple Health. */
  source?: 'health';
};

export type Units = 'kg' | 'lb';
