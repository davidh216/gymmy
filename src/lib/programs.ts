import type { PlanRef, Target, Workout } from './types';

export type PlanExercise = Target & { exerciseId: string };

export type PlanSession = {
  name: string;
  /** One line on what the session is for. */
  focus: string;
  exercises: PlanExercise[];
};

export type Program = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  weeks: number;
  daysPerWeek: number;
  tags: string[];
  /** Sessions for a 1-based week; always `daysPerWeek` long. */
  week: (week: number) => PlanSession[];
};

/** Sets × reps (reps can be a range like "8–10" or "10 each leg"). */
const lift = (exerciseId: string, sets: number, reps: string, note?: string): PlanExercise => ({
  exerciseId,
  sets,
  reps,
  note,
});

/** A set distance in km, e.g. a race. */
const distance = (exerciseId: string, km: number, note?: string): PlanExercise => ({ exerciseId, sets: 1, distance: km, note });

/** Timed work: `sets` rounds of `minutes` each. */
const timed = (exerciseId: string, minutes: number, note?: string, sets = 1): PlanExercise => ({
  exerciseId,
  sets,
  minutes,
  note,
});

const hyrox: Program = {
  id: 'hyrox',
  name: 'HYROX Prep',
  emoji: '🛷',
  tagline: 'Run, push, pull, repeat',
  description:
    'Eight weeks to race-ready: strength for the sleds and lunges, an engine for eight 1 km runs, station practice, and race simulations under fatigue. Tapers in the last two weeks.',
  level: 'Intermediate',
  weeks: 8,
  daysPerWeek: 4,
  tags: ['Hybrid', 'Endurance', 'Strength'],
  week: (w) => {
    const taper = w >= 7;
    const build = Math.min(w, 6);
    const sets = taper ? 3 : w <= 3 ? 3 : 4;
    const intervals = taper ? 4 : 4 + build;
    const race = w === 8;
    return [
      {
        name: 'Strength',
        focus: 'Legs, pulling and pressing for the stations',
        exercises: [
          lift('squat', sets, w <= 3 ? '8' : w <= 6 ? '6' : '5'),
          lift('romanian_deadlift', sets, '8'),
          lift('sandbag_lunge', 3, '10 each leg'),
          lift('pull_up', 3, w <= 3 ? '5–8' : '6–10'),
          lift('overhead_press', 3, '8'),
          timed('plank', 1, 'Hold each set for a minute', 3),
        ],
      },
      {
        name: 'Engine',
        focus: 'Run intervals and erg work to build your engine',
        exercises: [
          timed('run', 10 + intervals * 4, `${intervals} × 3 min hard, 1 min easy, plus warm-up and cool-down`),
          timed('ski_erg', taper ? 8 : 8 + build, 'Steady, conversational effort'),
          timed('rower', taper ? 8 : 8 + build, 'Steady, conversational effort'),
        ],
      },
      {
        name: 'Stations',
        focus: 'Practice the HYROX stations until they feel routine',
        exercises: [
          lift('sled_push', sets, '2 lengths', w >= 5 ? 'Race weight from here on' : 'Build toward race weight'),
          lift('sled_pull', sets, '2 lengths'),
          lift('burpee_broad_jump', sets, String(Math.min(10 + build * 2, 20))),
          lift('farmers_carry', sets, '2 lengths'),
          lift('wall_ball', sets, String(Math.min(15 + build * 2, 25))),
        ],
      },
      race
        ? {
            name: 'Race day',
            focus: '8 × 1 km run, each followed by a station. Go get it.',
            exercises: [distance('run', 8, '8 × 1 km. Pace the first runs; the wall balls come last')],
          }
        : {
            name: 'Race simulation',
            focus: 'Running on tired legs, like on race day',
            exercises: [
              timed('run', taper ? 30 : 25 + build * 5, `${taper ? 3 : 2 + Math.ceil(build / 2)} rounds: 1 km run, then 1 station`),
              lift('wall_ball', 3, '20'),
              timed('rower', 8, 'Hard but even'),
            ],
          },
    ];
  },
};

/** Long-run minutes for a marathon week, with a cutback every fourth week. */
function longRun(w: number): number {
  if (w === 14) return 120;
  if (w === 15) return 90;
  const base = 60 + (w - 1) * 10;
  return w % 4 === 0 ? Math.round((base * 0.75) / 5) * 5 : base;
}

const marathon: Program = {
  id: 'marathon',
  name: 'Marathon',
  emoji: '🏃',
  tagline: '16 weeks to 26.2',
  description:
    'Four days a week: an easy run, a quality session (tempo or intervals), strength to stay injury-free, and a long run that builds to three hours with cutback weeks. Three-week taper into race day.',
  level: 'Intermediate',
  weeks: 16,
  daysPerWeek: 4,
  tags: ['Running', 'Endurance'],
  week: (w) => {
    const taper = w >= 14;
    const race = w === 16;
    const tempo = w % 2 === 1;
    return [
      {
        name: 'Easy run',
        focus: 'Zone 2: you should be able to talk in full sentences',
        exercises: [timed('run', race ? 20 : taper ? (w === 14 ? 40 : 30) : 30 + Math.min(w, 12) * 2, race ? 'Shakeout' : 'Easy pace')],
      },
      {
        name: race ? 'Strides' : tempo ? 'Tempo run' : 'Intervals',
        focus: race ? 'Stay sharp, stay fresh' : tempo ? 'Comfortably hard, steady pace' : 'Fast repeats to raise your ceiling',
        exercises: [
          race
            ? timed('run', 25, '4 × 20 s strides at the end')
            : tempo
              ? timed('run', taper ? 35 : 35 + w * 2, `${taper ? 10 : 10 + w} min at half-marathon pace in the middle`)
              : timed('run', taper ? 35 : 40 + w, `${taper ? 3 : 3 + Math.ceil(w / 3)} × 1 km at 10K pace, 2 min jog between`),
        ],
      },
      {
        name: 'Strength',
        focus: 'Strong legs and core keep you running',
        exercises: [
          lift('squat', taper ? 2 : 3, '8'),
          lift('romanian_deadlift', taper ? 2 : 3, '8'),
          lift('bulgarian_split_squat', taper ? 2 : 3, '8 each leg'),
          lift('calf_raise', 3, '15'),
          timed('plank', 1, 'Hold each set for a minute', 3),
        ],
      },
      race
        ? { name: 'Race day', focus: '26.2 miles. Start slow, finish strong.', exercises: [distance('run', 42.2, 'Marathon')] }
        : {
            name: 'Long run',
            focus: w % 4 === 0 ? 'Cutback week: shorter, let your body absorb the work' : 'Slow and steady time on your feet',
            exercises: [timed('run', longRun(w), 'Easy pace; practice your race fueling')],
          },
    ];
  },
};

/** Run/walk minutes per week of the 5K plan: [run, walk, rounds]. */
const RUN_WALK: [number, number, number][] = [
  [1, 1.5, 8],
  [2, 1, 7],
  [3, 1, 6],
  [5, 1.5, 4],
  [8, 2, 3],
  [10, 2, 2],
  [15, 1, 2],
  [25, 0, 1],
];

const first5k: Program = {
  id: 'first-5k',
  name: 'First 5K',
  emoji: '👟',
  tagline: 'From the couch to a 5K',
  description:
    'Three short sessions a week of run/walk intervals that grow until you run 30 minutes without stopping. One session adds a little bodyweight strength. Ends with your first 5K.',
  level: 'Beginner',
  weeks: 8,
  daysPerWeek: 3,
  tags: ['Running', 'Beginner'],
  week: (w) => {
    const [run, walk, rounds] = RUN_WALK[w - 1];
    const minutes = Math.round(5 + run * rounds + walk * (rounds - 1));
    const intervals =
      rounds === 1 ? `Run ${run} min without stopping` : `${rounds} × ${run} min run / ${walk} min walk`;
    const session = (name: string): PlanSession => ({
      name,
      focus: 'Start with a 5 min brisk walk',
      exercises: [timed('run', minutes, intervals)],
    });
    return [
      session('Run/walk'),
      {
        ...session('Run/walk + strength'),
        exercises: [
          timed('run', minutes, intervals),
          lift('push_up', 2, w <= 4 ? '5–8' : '8–12', 'From your knees is fine'),
          timed('plank', 0.5, 'Hold each set for 30 seconds', 2),
        ],
      },
      w === 8
        ? { name: 'Run your 5K', focus: 'Easy start, then hold a pace you could talk at', exercises: [distance('run', 5, '5K')] }
        : session('Run/walk'),
    ];
  },
};

const strength: Program = {
  id: 'strength-5x5',
  name: 'Strength 5×5',
  emoji: '🏋️',
  tagline: 'Get strong on the big lifts',
  description:
    'Three full-body sessions a week alternating two workouts. Add a little weight every session you hit all your reps. Weeks 9–11 drop to triples, and week 12 tests your new maxes.',
  level: 'Beginner',
  weeks: 12,
  daysPerWeek: 3,
  tags: ['Strength', 'Barbell'],
  week: (w) => {
    if (w === 12) {
      const test = (name: string, exerciseId: string): PlanSession => ({
        name,
        focus: 'Work up to a heavy single with good form',
        exercises: [lift(exerciseId, 5, '1–3', 'Rest 3–5 min between heavy sets')],
      });
      return [test('Squat test', 'squat'), test('Bench test', 'bench_press'), test('Deadlift test', 'deadlift')];
    }
    const reps = w <= 8 ? '5' : '3';
    const note = 'Add 2.5 kg / 5 lb when you hit every rep';
    const a: PlanSession = {
      name: 'Workout A',
      focus: 'Squat, bench, row',
      exercises: [lift('squat', 5, reps, note), lift('bench_press', 5, reps, note), lift('barbell_row', 5, reps)],
    };
    const b: PlanSession = {
      name: 'Workout B',
      focus: 'Squat, press, deadlift',
      exercises: [lift('squat', 5, reps, note), lift('overhead_press', 5, reps, note), lift('deadlift', 1, reps, 'One heavy work set')],
    };
    return w % 2 === 1 ? [a, b, a] : [b, a, b];
  },
};

const muscle: Program = {
  id: 'build-muscle',
  name: 'Build Muscle',
  emoji: '💪',
  tagline: 'Upper/lower hypertrophy split',
  description:
    'Four sessions a week: two upper, two lower. Moderate weights, lots of quality sets, last set of each exercise close to failure. Week 8 is a deload.',
  level: 'Intermediate',
  weeks: 8,
  daysPerWeek: 4,
  tags: ['Hypertrophy', 'Strength'],
  week: (w) => {
    const deload = w === 8;
    const n = deload ? 2 : w <= 2 ? 3 : 4;
    const note = deload ? 'Deload: leave 3+ reps in the tank' : undefined;
    return [
      {
        name: 'Upper A',
        focus: 'Chest, back, shoulders, arms',
        exercises: [
          lift('bench_press', n, '6–8', note),
          lift('barbell_row', n, '6–8', note),
          lift('db_shoulder_press', n - 1, '10'),
          lift('lat_pulldown', n - 1, '10–12'),
          lift('db_curl', 3, '12'),
          lift('tricep_pushdown', 3, '12'),
        ],
      },
      {
        name: 'Lower A',
        focus: 'Quads and hamstrings',
        exercises: [
          lift('squat', n, '6–8', note),
          lift('romanian_deadlift', n - 1, '8–10'),
          lift('leg_press', 3, '12'),
          lift('leg_curl', 3, '12'),
          lift('calf_raise', 4, '15'),
        ],
      },
      {
        name: 'Upper B',
        focus: 'Upper chest, lats, delts',
        exercises: [
          lift('incline_db_press', n, '8–10', note),
          lift('pull_up', n, '6–10', note),
          lift('lateral_raise', 4, '15'),
          lift('seated_cable_row', 3, '10–12'),
          lift('hammer_curl', 3, '12'),
          lift('skull_crusher', 3, '12'),
        ],
      },
      {
        name: 'Lower B',
        focus: 'Posterior chain and glutes',
        exercises: [
          lift('deadlift', deload ? 2 : 3, '5', note),
          lift('front_squat', 3, '8'),
          lift('bulgarian_split_squat', 3, '10 each leg'),
          lift('hip_thrust', 3, '10'),
          lift('leg_extension', 3, '15'),
        ],
      },
    ];
  },
};

export const PROGRAMS: Program[] = [hyrox, marathon, first5k, strength, muscle];

const BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));

export function getProgram(id: string): Program | undefined {
  return BY_ID.get(id);
}

export function planSession(ref: PlanRef): PlanSession | undefined {
  const program = getProgram(ref.programId);
  if (!program || ref.week < 1 || ref.week > program.weeks) return undefined;
  return program.week(ref.week)[ref.session - 1];
}

const key = (week: number, session: number) => `${week}-${session}`;

export type PlanProgress = {
  /** "week-session" keys of finished sessions. */
  done: Set<string>;
  completed: number;
  total: number;
  /** First unfinished session in order, or null when the plan is complete. */
  next: { week: number; session: number } | null;
  /** Week to show: the next session's week, or the last week when finished. */
  currentWeek: number;
};

/** Progress through a plan from finished workouts (only those since `since`, the start date). */
export function planProgress(program: Program, workouts: Workout[], since = 0): PlanProgress {
  const done = new Set(
    workouts
      .filter((w) => w.plan?.programId === program.id && w.endedAt >= since)
      .map((w) => key(w.plan!.week, w.plan!.session)),
  );
  let next: PlanProgress['next'] = null;
  for (let week = 1; week <= program.weeks && !next; week++) {
    for (let session = 1; session <= program.daysPerWeek; session++) {
      if (!done.has(key(week, session))) {
        next = { week, session };
        break;
      }
    }
  }
  const total = program.weeks * program.daysPerWeek;
  let completed = 0;
  for (const k of done) {
    const [week, session] = k.split('-').map(Number);
    if (week <= program.weeks && session <= program.daysPerWeek) completed++;
  }
  return { done, completed, total, next, currentWeek: next?.week ?? program.weeks };
}

export function isSessionDone(progress: PlanProgress, week: number, session: number): boolean {
  return progress.done.has(key(week, session));
}

/** Plans with every session finished at some point. */
export function completedPrograms(workouts: Workout[]): string[] {
  return PROGRAMS.filter((p) => planProgress(p, workouts).next === null).map((p) => p.id);
}

/** First whole number in a reps target ("8–10" -> 8), or undefined for open targets. */
export function targetReps(reps?: string): number | undefined {
  const m = reps?.match(/^\d+/);
  return m ? Number(m[0]) : undefined;
}
