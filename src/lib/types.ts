import type { CoachTarget } from './coach';

export type SetEntry = {
  id: string;
  /** Load in kg (canonical unit; converted for display). */
  weight?: number;
  reps?: number;
  minutes?: number;
  /** Distance in km (canonical unit; shown in mi for lb users). */
  distance?: number;
  done: boolean;
  /** Warm-up sets are logged but don't count toward records, volume or set totals. */
  warmup?: boolean;
  /** Rate of perceived exertion, 6–10. */
  rpe?: number;
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
  /** Your own note, e.g. "seat 4". Carries over to the next session. */
  note?: string;
  /** Rest after each set, in seconds. 0 turns the timer off. Carries over to the next session. */
  rest?: number;
  /** The coach's target when the sets were prefilled. */
  coach?: CoachTarget;
};

/** A training plan session this workout came from (weeks and sessions are 1-based). */
export type PlanRef = {
  programId: string;
  week: number;
  session: number;
  /** Done as the lighter version; still counts as that session. */
  light?: boolean;
};

export type PersonalRecord = {
  exerciseId: string;
  /** e1RM in kg for weighted lifts, reps for bodyweight, minutes for duration. */
  value: number;
  previous: number;
};

/** Where a workout happened: a Gymmy gym, a map place, or just a name. */
export type WorkoutLocation = {
  name: string;
  /** Neighbourhood or address line, when known. */
  area?: string;
  /** Gymmy gym, when picked from your gyms. */
  gymId?: string;
  /** Map place (osm:node/123), when picked from nearby gyms. */
  placeId?: string;
};

export type ActiveWorkout = {
  id: string;
  name: string;
  startedAt: number;
  exercises: WorkoutExercise[];
  plan?: PlanRef;
  location?: WorkoutLocation;
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
