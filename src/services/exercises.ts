import { useQuery } from '@tanstack/react-query';

import { fixGroup, type Exercise, type ExerciseKind, type MuscleGroup } from '@/lib/exercises';
import { useGymmy, type CustomExercise, type SubmissionStatus } from '@/store/gymmy';

import { useAuth } from './auth';
import { isRemote, supabase } from './supabase';

export class SubmitError extends Error {}

type SubmissionRow = { id: string; name: string; muscle_group: MuscleGroup; kind: ExerciseKind; status: SubmissionStatus };

/** Sends a custom exercise for review. In the offline preview it's only marked pending. */
export async function submitExercise(exercise: CustomExercise): Promise<void> {
  const { updateCustomExercise } = useGymmy.getState();
  if (!supabase) {
    updateCustomExercise(exercise.id, { submission: { id: `local_${exercise.id}`, status: 'pending' } });
    return;
  }
  if (!useAuth.getState().userId) throw new SubmitError('Sign in on the Gyms tab to submit exercises.');
  const { data, error } = await supabase
    .from('exercise_submissions')
    .insert({ name: exercise.name, muscle_group: exercise.group, kind: exercise.kind })
    .select('id')
    .single();
  if (error) throw new SubmitError(error.message);
  updateCustomExercise(exercise.id, { submission: { id: data.id, status: 'pending' } });
}

/**
 * Fetches approved community exercises into the store, plus the review status of your own
 * submissions. Cached offline in the store, so failures are harmless.
 */
async function syncExercises(userId: string | null): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from('exercise_submissions')
    .select('id, name, muscle_group, kind, status')
    .or(userId ? `status.eq.approved,user_id.eq.${userId}` : 'status.eq.approved');
  if (error) throw new Error(error.message);
  const rows = data as SubmissionRow[];
  const { setCommunityExercises, setSubmissionStatuses } = useGymmy.getState();
  setCommunityExercises(
    rows
      .filter((r) => r.status === 'approved')
      .map(
        (r): Exercise => ({
          id: `community_${r.id}`,
          name: r.name,
          group: fixGroup(r.muscle_group, r.name),
          kind: r.kind,
          source: 'community',
        }),
      ),
  );
  setSubmissionStatuses(Object.fromEntries(rows.map((r) => [r.id, r.status])));
  return rows.length;
}

export function useExerciseSync() {
  const userId = useAuth((s) => s.userId);
  return useQuery({
    queryKey: ['exercises', 'sync', userId],
    queryFn: () => syncExercises(userId),
    enabled: isRemote,
    staleTime: 10 * 60 * 1000,
  });
}

export type PendingExercise = {
  id: string;
  name: string;
  group: MuscleGroup;
  kind: ExerciseKind;
  username: string;
  createdAt: number;
};

export async function pendingExercises(): Promise<PendingExercise[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('admin_exercise_submissions');
  if (error) throw new Error(error.message);
  return (data as { id: string; name: string; muscle_group: MuscleGroup; kind: ExerciseKind; username: string; created_at: string }[]).map(
    (r) => ({ id: r.id, name: r.name, group: r.muscle_group, kind: r.kind, username: r.username, createdAt: Date.parse(r.created_at) }),
  );
}

export async function resolveExercise(id: string, decision: 'approve' | 'reject', name?: string) {
  if (!supabase) return;
  const { error } = await supabase.rpc('admin_resolve_exercise', { p_id: id, p_decision: decision, p_name: name ?? null });
  if (error) throw new Error(error.message);
}
