import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applyTarget, lighterLoad, nextTarget, repRange, type CoachTarget } from '@/lib/coach';
import { MAX_STARS, companionXpBonus, getCompanion } from '@/lib/companions';
import {
  fixGroup,
  getExercise,
  setExtraExercises,
  tidyExerciseName,
  type Exercise,
  type SavedTemplate,
} from '@/lib/exercises';
import { defaultWorkoutName, uid } from '@/lib/format';
import { EMPTY_PITY, summon, type Pity } from '@/lib/gacha';
import { getMilestone, milestoneStats } from '@/lib/milestones';
import {
  getProgram,
  planSession,
  setCustomPrograms,
  targetReps,
  type CustomProgram,
} from '@/lib/programs';
import type { Vitals } from '@/lib/health';
import { dayKey, type CheckIn } from '@/lib/recovery';
import { mergeHealthWeights, type WeighIn, type WeightReviewSettings } from '@/lib/weight';
import {
  STARTING_GEMS,
  SUMMON_10_COST,
  SUMMON_COST,
  workoutRewards,
  type Rewards,
} from '@/lib/progression';
import { completedSets, detectPRs, exerciseSettings, lastPerformance } from '@/lib/records';
import { countInWeek, weekStreak } from '@/lib/streaks';
import type { ActiveWorkout, PlanRef, SetEntry, Target, Units, Workout, WorkoutExercise, WorkoutLocation } from '@/lib/types';

export type Profile = {
  name: string;
  /** Public handle shown on gym leaderboards. */
  username: string;
  weeklyGoal: number;
  units: Units;
  /** Ask how hard each set felt (RPE) after checking it off. */
  rpe?: boolean;
  /** Weekly weigh-in review and weight goal; off unless turned on. */
  weightReview?: WeightReviewSettings;
  focus?: Focus;
};

export type Owned = {
  stars: number;
  obtainedAt: number;
  /** What you call this buddy, when you've named it. */
  nickname?: string;
};

/** Why someone opened Gymmy, from onboarding. Shapes the first workout suggested. */
export type Focus = 'strength' | 'event' | 'consistency' | 'log';

export type SummonResult = { id: string; isNew: boolean };

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

/** An exercise made on this device, optionally submitted for everyone. */
export type CustomExercise = Exercise & {
  source: 'custom';
  createdAt: number;
  submission?: { id: string; status: SubmissionStatus };
};

export type CustomProgramInput = Pick<CustomProgram, 'name' | 'emoji' | 'weeks' | 'days'>;

export type CustomExerciseInput = Pick<Exercise, 'name' | 'group' | 'kind'>;

type State = {
  profile: Profile | null;
  workouts: Workout[];
  active: ActiveWorkout | null;
  xp: number;
  gems: number;
  collection: Record<string, Owned>;
  companionId: string;
  pity: Pity;
  /** Rewards from the most recently finished workout, for the summary screen. */
  lastRewards: Rewards | null;
  customExercises: CustomExercise[];
  /** Training plans you built. */
  customPrograms: CustomProgram[];
  /** Workout templates you saved, newest first. */
  templates: SavedTemplate[];
  /** Approved community exercises, cached so history works offline. */
  communityExercises: Exercise[];
  /** The training plan you're following. Progress counts workouts since `startedAt`. */
  plan: { programId: string; startedAt: number } | null;
  /** Milestone id -> when its reward was claimed. */
  claimedMilestones: Record<string, number>;
  /** Daily recovery check-ins by local date (YYYY-MM-DD). */
  checkIns: Record<string, CheckIn>;
  /** Apple Health sync. Workouts finished after `connectedAt` earn rewards when imported. */
  health: {
    enabled: boolean;
    connectedAt?: number;
    lastSync?: number;
    /** Asked to read HRV, resting heart rate and body weight. */
    readsVitals?: boolean;
    vitals?: Vitals;
  };
  /** Start of the most recent week whose recap card was opened or dismissed. */
  recapSeen: number;
  /** Body weight by day. Typed-in weigh-ins sync; ones from Apple Health stay on the phone. */
  weighIns: Record<string, WeighIn>;
  /** Sunday of the most recent week whose weigh-in review was saved or skipped. */
  weightReviewSeen: number;
};

type Actions = {
  /** Saves the profile and first buddy; optionally names the buddy and starts a plan. */
  completeOnboarding: (profile: Profile, starterId: string, opts?: { nickname?: string; planId?: string }) => void;
  /** Names a buddy you own; an empty name goes back to its species name. */
  renameCompanion: (id: string, nickname: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setCompanion: (id: string) => void;

  startWorkout: (opts?: { name?: string; exerciseIds?: string[] }) => void;
  renameWorkout: (name: string) => void;
  /** Sets or clears where a workout happened: the active one, or a finished one by id. */
  setWorkoutLocation: (location: WorkoutLocation | null, workoutId?: string) => void;
  addExercises: (exerciseIds: string[]) => void;
  removeExercise: (workoutExerciseId: string) => void;
  updateExercise: (workoutExerciseId: string, patch: Partial<Pick<WorkoutExercise, 'note' | 'rest'>>) => void;
  /** Moves an exercise up (-1) or down (+1) in the workout. */
  moveExercise: (workoutExerciseId: string, by: -1 | 1) => void;
  addSet: (workoutExerciseId: string) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  discardWorkout: () => void;
  finishWorkout: () => Workout | null;
  deleteWorkout: (id: string) => void;

  addCustomExercise: (input: CustomExerciseInput) => CustomExercise;
  updateCustomExercise: (id: string, patch: Partial<CustomExerciseInput> & Pick<CustomExercise, 'submission'>) => void;
  deleteCustomExercise: (id: string) => void;
  setCommunityExercises: (list: Exercise[]) => void;
  /** Applies server-side review results to your submitted exercises. */
  setSubmissionStatuses: (statuses: Record<string, SubmissionStatus>) => void;

  startPlan: (programId: string) => void;
  leavePlan: () => void;
  /** Creates a custom plan, or updates it when `id` is given. Returns its id. */
  saveCustomProgram: (input: CustomProgramInput, id?: string) => string;
  /** Deletes a custom plan, leaving it first if you're following it. */
  deleteCustomProgram: (id: string) => void;
  /** Saves a workout's exercises as a template; returns its id. */
  saveTemplate: (input: { name: string; exerciseIds: string[] }) => string;
  deleteTemplate: (id: string) => void;
  /** Starts a workout prefilled from a plan session. */
  startPlanSession: (ref: PlanRef) => void;
  /** Grants XP and gems for achieved, unclaimed milestones. Returns what was granted. */
  claimMilestones: (ids: string[]) => { xp: number; gems: number };

  setHealth: (patch: Partial<State['health']>) => void;
  /** Adds workouts imported from Apple Health that aren't in history yet. Returns how many were added. */
  importWorkouts: (workouts: Workout[]) => number;
  /** Saves today's check-in. The first one each day earns a small reward, returned here. */
  saveCheckIn: (input: Omit<CheckIn, 'date' | 'at'>) => { xp: number; gems: number };

  summon: (count: 1 | 10) => SummonResult[] | null;
  /** Hides the Today recap card for the week starting `weekStart`. */
  seeRecap: (weekStart: number) => void;
  /** Logs a typed-in weight (kg) for a day, today by default. */
  logWeight: (kg: number, date?: string) => void;
  deleteWeighIn: (date: string) => void;
  /** Adds Apple Health weight readings for days without a typed-in weigh-in. */
  importHealthWeights: (samples: { kg: number; at: number }[]) => void;
  seeWeightReview: (weekStart: number) => void;
  reset: () => void;
};

const initialState: State = {
  profile: null,
  workouts: [],
  active: null,
  xp: 0,
  gems: STARTING_GEMS,
  collection: {},
  companionId: 'kong',
  pity: EMPTY_PITY,
  lastRewards: null,
  customExercises: [],
  customPrograms: [],
  templates: [],
  communityExercises: [],
  plan: null,
  claimedMilestones: {},
  checkIns: {},
  health: { enabled: false },
  recapSeen: 0,
  weighIns: {},
  weightReviewSeen: 0,
};

/** Seed sets for a newly added exercise from its last performance, moved on by the coach's target. */
function seedSets(exerciseId: string, history: Workout[], coach: CoachTarget | null): SetEntry[] {
  const previous = lastPerformance(exerciseId, history);
  if (previous?.length) {
    const sets = previous.map(({ rpe: _rpe, ...s }) => ({ ...s, id: uid(), done: false }));
    return coach ? applyTarget(sets, coach) : sets;
  }
  const kind = getExercise(exerciseId).kind;
  const count = kind === 'duration' || kind === 'distance' ? 1 : 3;
  return Array.from({ length: count }, () => ({ id: uid(), done: false }));
}

export const CHECK_IN_XP = 10;
export const CHECK_IN_GEMS = 5;

/** Kept here for existing callers; the coach owns load math now. */
export { lighterLoad };

/** Sets for a plan exercise: planned count, reps/minutes from the plan, weight from the coach or last time. */
function planSets(
  exerciseId: string,
  target: { sets: number; reps?: string; minutes?: number; distance?: number },
  history: Workout[],
  coach: CoachTarget | null,
  light?: { units: Units },
): SetEntry[] {
  const previous = (lastPerformance(exerciseId, history) ?? []).filter((s) => !s.warmup);
  const reps = targetReps(target.reps);
  return Array.from({ length: Math.max(1, target.sets) }, (_, i) => {
    const last = previous[Math.min(i, previous.length - 1)];
    return {
      id: uid(),
      weight: coach ? coach.weight : last?.weight && light ? lighterLoad(last.weight, light.units) : last?.weight,
      reps: coach ? coach.reps : (reps ?? last?.reps),
      minutes: target.minutes ?? (target.distance ? undefined : last?.minutes),
      distance: target.distance,
      done: false,
    };
  });
}

/** A new exercise in a workout, keeping your note and rest time from last time. */
function workoutExercise(
  exerciseId: string,
  history: Workout[],
  units: Units,
  plan?: { target: Target; light: boolean },
): WorkoutExercise {
  const last = exerciseSettings(exerciseId, history);
  // Lighter plan days keep last time's load, eased off, with no coach call.
  const coach = plan?.light ? null : nextTarget(exerciseId, history, units, repRange(plan?.target.reps));
  return {
    id: uid(),
    exerciseId,
    sets: plan
      ? planSets(exerciseId, plan.target, history, coach, plan.light ? { units } : undefined)
      : seedSets(exerciseId, history, coach),
    ...(plan ? { target: plan.target } : {}),
    ...(coach ? { coach } : {}),
    ...(last.note ? { note: last.note } : {}),
    ...(last.rest !== undefined ? { rest: last.rest } : {}),
  };
}

/** Lowercase handle from a display name, e.g. "Alex R" -> "alexr". */
export function toUsername(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20) || 'lifter';
}

export const useGymmy = create<State & Actions>()(
  persist(
    (set, get) => {
      const mutateActive = (fn: (active: ActiveWorkout) => ActiveWorkout) => {
        const active = get().active;
        if (active) set({ active: fn(active) });
      };

      return {
        ...initialState,

        completeOnboarding: (profile, starterId, opts = {}) => {
          const nickname = cleanNickname(opts.nickname, starterId);
          set({
            profile,
            companionId: starterId,
            collection: { [starterId]: { stars: 1, obtainedAt: Date.now(), ...(nickname ? { nickname } : {}) } },
            plan: opts.planId && getProgram(opts.planId) ? { programId: opts.planId, startedAt: Date.now() } : null,
          });
        },

        renameCompanion: (id, name) => {
          const owned = get().collection[id];
          if (!owned) return;
          const { nickname: _old, ...rest } = owned;
          const nickname = cleanNickname(name, id);
          set({ collection: { ...get().collection, [id]: nickname ? { ...rest, nickname } : rest } });
        },

        updateProfile: (patch) => {
          const profile = get().profile;
          if (profile) set({ profile: { ...profile, ...patch } });
        },

        setCompanion: (id) => {
          if (get().collection[id]) set({ companionId: id });
        },

        startWorkout: (opts) => {
          if (get().active) return;
          const history = get().workouts;
          set({
            active: {
              id: uid(),
              name: opts?.name ?? defaultWorkoutName(Date.now()),
              startedAt: Date.now(),
              exercises: (opts?.exerciseIds ?? []).map((exerciseId) => workoutExercise(exerciseId, history, get().profile?.units ?? 'lb')),
            },
          });
        },

        startPlan: (programId) => {
          if (getProgram(programId)) set({ plan: { programId, startedAt: Date.now() } });
        },

        leavePlan: () => set({ plan: null }),

        saveCustomProgram: (input, id) => {
          const now = Date.now();
          const existing = id ? get().customPrograms.find((p) => p.id === id) : undefined;
          const program: CustomProgram = {
            ...input,
            name: input.name.trim(),
            id: existing?.id ?? `custom-${uid()}`,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          };
          set((s) => ({
            customPrograms: existing
              ? s.customPrograms.map((p) => (p.id === program.id ? program : p))
              : [program, ...s.customPrograms],
          }));
          return program.id;
        },

        saveTemplate: ({ name, exerciseIds }) => {
          const template: SavedTemplate = {
            id: `tpl-${uid()}`,
            name: name.trim() || 'My workout',
            exerciseIds: [...new Set(exerciseIds)],
            createdAt: Date.now(),
          };
          set((s) => ({ templates: [template, ...s.templates] }));
          return template.id;
        },

        deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

        deleteCustomProgram: (id) =>
          set((s) => ({
            customPrograms: s.customPrograms.filter((p) => p.id !== id),
            plan: s.plan?.programId === id ? null : s.plan,
          })),

        startPlanSession: (ref) => {
          const program = getProgram(ref.programId);
          const session = planSession(ref);
          if (get().active || !program || !session) return;
          const history = get().workouts;
          set({
            active: {
              id: uid(),
              name: `${program.name} · ${session.name}`,
              startedAt: Date.now(),
              plan: ref,
              exercises: session.exercises.map(({ exerciseId, ...target }) =>
                workoutExercise(exerciseId, history, get().profile?.units ?? 'lb', {
                  target,
                  light: Boolean(ref.light),
                }),
              ),
            },
          });
        },

        claimMilestones: (ids) => {
          const s = get();
          const stats = milestoneStats({
            workouts: s.workouts,
            weeklyGoal: s.profile?.weeklyGoal ?? 3,
            buddies: Object.keys(s.collection).length,
            customExercises: s.customExercises.length,
            checkIns: Object.values(s.checkIns),
          });
          const now = Date.now();
          const claimed = { ...s.claimedMilestones };
          let xp = 0;
          let gems = 0;
          for (const id of ids) {
            const m = getMilestone(id);
            if (!m || claimed[id] || stats[m.metric] < m.target) continue;
            claimed[id] = now;
            xp += m.xp;
            gems += m.gems;
          }
          if (xp || gems) set({ claimedMilestones: claimed, xp: s.xp + xp, gems: s.gems + gems });
          return { xp, gems };
        },

        setHealth: (patch) => set((s) => ({ health: { ...s.health, ...patch } })),

        importWorkouts: (incoming) => {
          const s = get();
          const known = new Set(s.workouts.map((w) => w.id));
          const fresh = incoming.filter((w) => !known.has(w.id)).sort((a, b) => a.endedAt - b.endedAt);
          if (fresh.length === 0) return 0;
          let history = s.workouts;
          let xp = 0;
          let gems = 0;
          const since = s.health.connectedAt ?? Infinity;
          const added = fresh.map((w) => {
            const prs = detectPRs(w.exercises, history);
            // Only workouts done after connecting earn rewards; the backfill doesn't.
            const rewards =
              w.endedAt >= since
                ? workoutRewards({
                    completedSets: completedSets(w.exercises),
                    prCount: prs.length,
                    streakWeeks: 0,
                    companionBonus: 0,
                    hitsWeeklyGoal: false,
                  })
                : { xp: 0, gems: 0 };
            xp += rewards.xp;
            gems += rewards.gems;
            const workout = { ...w, prs, xp: rewards.xp, gems: rewards.gems };
            history = [workout, ...history];
            return workout;
          });
          set({
            workouts: [...added, ...s.workouts].sort((a, b) => b.endedAt - a.endedAt),
            xp: s.xp + xp,
            gems: s.gems + gems,
          });
          return added.length;
        },

        saveCheckIn: (input) => {
          const now = Date.now();
          const date = dayKey(now);
          const s = get();
          const first = !s.checkIns[date];
          const reward = first ? { xp: CHECK_IN_XP, gems: CHECK_IN_GEMS } : { xp: 0, gems: 0 };
          set({
            checkIns: { ...s.checkIns, [date]: { ...input, date, at: now } },
            xp: s.xp + reward.xp,
            gems: s.gems + reward.gems,
          });
          return reward;
        },

        renameWorkout: (name) => mutateActive((a) => ({ ...a, name })),

        setWorkoutLocation: (location, workoutId) => {
          const apply = <W extends ActiveWorkout>(w: W): W => {
            const { location: _old, ...rest } = w;
            return (location ? { ...rest, location } : rest) as W;
          };
          if (!workoutId) return mutateActive(apply);
          set((s) => ({ workouts: s.workouts.map((w) => (w.id === workoutId ? apply(w) : w)) }));
        },

        addExercises: (exerciseIds) => {
          const history = get().workouts;
          mutateActive((a) => ({
            ...a,
            exercises: [
              ...a.exercises,
              ...exerciseIds.map((exerciseId) => workoutExercise(exerciseId, history, get().profile?.units ?? 'lb')),
            ],
          }));
        },

        removeExercise: (weId) =>
          mutateActive((a) => ({ ...a, exercises: a.exercises.filter((e) => e.id !== weId) })),

        updateExercise: (weId, patch) =>
          mutateActive((a) => ({ ...a, exercises: a.exercises.map((e) => (e.id === weId ? { ...e, ...patch } : e)) })),

        moveExercise: (weId, by) =>
          mutateActive((a) => {
            const from = a.exercises.findIndex((e) => e.id === weId);
            const to = from + by;
            if (from < 0 || to < 0 || to >= a.exercises.length) return a;
            const exercises = [...a.exercises];
            const [moved] = exercises.splice(from, 1);
            exercises.splice(to, 0, moved);
            return { ...a, exercises };
          }),

        addSet: (weId) =>
          mutateActive((a) => ({
            ...a,
            exercises: a.exercises.map((e) => {
              if (e.id !== weId) return e;
              const last = e.sets[e.sets.length - 1];
              const next: SetEntry = {
                id: uid(),
                weight: last?.weight,
                reps: last?.reps,
                minutes: last?.minutes,
                done: false,
              };
              return { ...e, sets: [...e.sets, next] };
            }),
          })),

        removeSet: (weId, setId) =>
          mutateActive((a) => ({
            ...a,
            exercises: a.exercises.map((e) =>
              e.id === weId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e,
            ),
          })),

        updateSet: (weId, setId, patch) =>
          mutateActive((a) => ({
            ...a,
            exercises: a.exercises.map((e) =>
              e.id === weId
                ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
                : e,
            ),
          })),

        discardWorkout: () => set({ active: null }),

        finishWorkout: () => {
          const { active, workouts, profile, companionId, collection } = get();
          if (!active || !profile) return null;

          const now = Date.now();
          // Drop exercises with nothing completed; keep only finished sets.
          const exercises = active.exercises
            .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
            .filter((e) => e.sets.length > 0);

          const prs = detectPRs(exercises, workouts);
          const times = workouts.map((w) => w.endedAt);
          const goal = profile.weeklyGoal;
          const daysBefore = countInWeek(times, now);
          const daysAfter = countInWeek([...times, now], now);
          const companion = getCompanion(companionId);
          const rewards = workoutRewards({
            completedSets: completedSets(exercises),
            prCount: prs.length,
            streakWeeks: weekStreak(times, goal, now),
            companionBonus: companionXpBonus(companion, collection[companionId]?.stars ?? 1),
            hitsWeeklyGoal: daysBefore < goal && daysAfter >= goal,
            plan: active.plan ? getProgram(active.plan.programId)?.name : undefined,
          });

          const workout: Workout = {
            ...active,
            exercises,
            endedAt: now,
            companionId,
            xp: rewards.xp,
            gems: rewards.gems,
            prs,
          };
          set((s) => ({
            active: null,
            workouts: [workout, ...s.workouts],
            xp: s.xp + rewards.xp,
            gems: s.gems + rewards.gems,
            lastRewards: rewards,
          }));
          return workout;
        },

        deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

        addCustomExercise: (input) => {
          const exercise: CustomExercise = {
            ...input,
            name: tidyExerciseName(input.name),
            id: `custom_${uid()}`,
            source: 'custom',
            createdAt: Date.now(),
          };
          set((s) => ({ customExercises: [exercise, ...s.customExercises] }));
          return exercise;
        },

        updateCustomExercise: (id, patch) =>
          set((s) => ({
            customExercises: s.customExercises.map((e) =>
              e.id === id ? { ...e, ...patch, name: tidyExerciseName(patch.name ?? e.name) } : e,
            ),
          })),

        deleteCustomExercise: (id) =>
          set((s) => ({ customExercises: s.customExercises.filter((e) => e.id !== id) })),

        setCommunityExercises: (list) => set({ communityExercises: list }),

        setSubmissionStatuses: (statuses) =>
          set((s) => ({
            customExercises: s.customExercises.map((e) => {
              const status = e.submission && statuses[e.submission.id];
              return status && status !== e.submission!.status
                ? { ...e, submission: { ...e.submission!, status } }
                : e;
            }),
          })),

        summon: (count) => {
          const cost = count === 10 ? SUMMON_10_COST : SUMMON_COST;
          const { gems, pity, collection } = get();
          if (gems < cost) return null;
          const result = summon(count, pity);
          const next = { ...collection };
          const now = Date.now();
          const results = result.ids.map((id) => {
            const owned = next[id];
            next[id] = owned
              ? { ...owned, stars: Math.min(MAX_STARS, owned.stars + 1) }
              : { stars: 1, obtainedAt: now };
            return { id, isNew: !owned };
          });
          set({ gems: gems - cost, pity: result.pity, collection: next });
          return results;
        },

        seeRecap: (weekStart) => {
          if (get().recapSeen < weekStart) set({ recapSeen: weekStart });
        },

        logWeight: (kg, date = dayKey(Date.now())) =>
          set((s) => ({ weighIns: { ...s.weighIns, [date]: { date, kg: Math.round(kg * 100) / 100, at: Date.now() } } })),

        deleteWeighIn: (date) =>
          set((s) => {
            const { [date]: _gone, ...rest } = s.weighIns;
            return { weighIns: rest };
          }),

        importHealthWeights: (samples) => {
          const next = mergeHealthWeights(get().weighIns, samples);
          if (next !== get().weighIns) set({ weighIns: next });
        },

        seeWeightReview: (weekStart) => {
          if (get().weightReviewSeen < weekStart) set({ weightReviewSeen: weekStart });
        },

        reset: () => set(initialState),
      };
    },
    {
      name: 'gymmy',
      version: 8,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const state = persisted as State;
        if (version < 2 && state.profile && !state.profile.username) {
          state.profile = { ...state.profile, username: toUsername(state.profile.name) };
        }
        state.customExercises ??= [];
        // v7: "arms" split into biceps and triceps.
        state.customExercises = state.customExercises.map((e) => ({ ...e, group: fixGroup(e.group, e.name) }));
        state.communityExercises = (state.communityExercises ?? []).map((e) => ({ ...e, group: fixGroup(e.group, e.name) }));
        state.communityExercises ??= [];
        state.plan ??= null;
        state.claimedMilestones ??= {};
        state.checkIns ??= {};
        state.health ??= { enabled: false };
        state.recapSeen ??= 0;
        state.weighIns ??= {};
        state.weightReviewSeen ??= 0;
        state.customPrograms ??= [];
        state.templates ??= [];
        return state;
      },
    },
  ),
);

// Keep exercise lookups (names, kinds) in step with your custom and community exercises.
// Keep plan lookups in step with your custom plans.
setCustomPrograms(useGymmy.getState().customPrograms);
useGymmy.subscribe((s, prev) => {
  if (s.customPrograms !== prev.customPrograms) setCustomPrograms(s.customPrograms);
});

const syncExtraExercises = (s: State) => setExtraExercises([...s.customExercises, ...s.communityExercises]);
syncExtraExercises(useGymmy.getState());
useGymmy.subscribe((s, prev) => {
  if (s.customExercises !== prev.customExercises || s.communityExercises !== prev.communityExercises) {
    syncExtraExercises(s);
  }
});

const subscribeHydration = (cb: () => void) => useGymmy.persist.onFinishHydration(cb);

/** True once persisted state has been loaded from storage. */
export function useHydrated() {
  return useSyncExternalStore(subscribeHydration, useGymmy.persist.hasHydrated);
}

/** A buddy's nickname, tidied; undefined when empty or the same as its species name. */
export function cleanNickname(name: string | undefined, companionId: string): string | undefined {
  const clean = (name ?? '').trim().replace(/\s+/g, ' ').slice(0, 16);
  return clean && clean !== getCompanion(companionId).name ? clean : undefined;
}

/** What to call a buddy: its nickname, or its species name. */
export function useCompanionName(companionId: string): string {
  const nickname = useGymmy((s) => s.collection[companionId]?.nickname);
  return nickname ?? getCompanion(companionId).name;
}
