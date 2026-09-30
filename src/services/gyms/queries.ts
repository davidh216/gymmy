import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BoardMode, ReportKind } from '@/lib/leaderboard';

import { fetchMyProfile, useAuth } from '../auth';
import { gymsApi, type GymKind, type PostEntryInput } from './index';

export const gymKeys = {
  all: ['gyms'] as const,
  mine: ['gyms', 'mine'] as const,
  medals: ['gyms', 'medals'] as const,
  search: (q: string) => ['gyms', 'search', q] as const,
  gym: (id: string) => ['gyms', 'gym', id] as const,
  board: (gymId: string | null, challengeId: string, mode: BoardMode) =>
    ['gyms', 'board', gymId ?? 'global', challengeId, mode] as const,
  entry: (id: string) => ['gyms', 'entry', id] as const,
};

/** Server profile (username status, admin flag); null when signed out or offline. */
export const useMyProfile = () => {
  const userId = useAuth((s) => s.userId);
  return useQuery({ queryKey: ['gyms', 'profile', userId], queryFn: fetchMyProfile, enabled: Boolean(userId) });
};

export const useMyGyms = () => useQuery({ queryKey: gymKeys.mine, queryFn: gymsApi.myGyms });
export const useMyMedals = () => useQuery({ queryKey: gymKeys.medals, queryFn: gymsApi.myMedals });
export const useGymSearch = (q: string) =>
  useQuery({ queryKey: gymKeys.search(q), queryFn: () => gymsApi.searchGyms(q) });
export const useGym = (id: string) =>
  useQuery({ queryKey: gymKeys.gym(id), queryFn: () => gymsApi.getGym(id) });
export const useBoard = (gymId: string | null, challengeId: string, mode: BoardMode) =>
  useQuery({
    queryKey: gymKeys.board(gymId, challengeId, mode),
    queryFn: () => gymsApi.getBoard({ gymId, challengeId, mode }),
  });
export const useEntry = (id: string) =>
  useQuery({ queryKey: gymKeys.entry(id), queryFn: () => gymsApi.getEntry(id) });

/** Mutations refresh everything gym-related; boards are cheap to refetch. */
function useGymMutation<A, R>(fn: (args: A) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => client.invalidateQueries({ queryKey: gymKeys.all }),
  });
}

export const useJoinGym = () => useGymMutation((id: string) => gymsApi.joinGym(id));
export const useLeaveGym = () => useGymMutation((id: string) => gymsApi.leaveGym(id));
export const useJoinByInvite = () => useGymMutation((code: string) => gymsApi.joinByInvite(code));
export const useCreateGym = () =>
  useGymMutation((input: { kind: GymKind; name: string; area?: string }) => gymsApi.createGym(input));
export const usePostEntry = () => useGymMutation((input: PostEntryInput) => gymsApi.postEntry(input));
export const useBlockUser = () => useGymMutation((athleteId: string) => gymsApi.blockUser(athleteId));

export const useReportEntry = () =>
  useGymMutation(({ id, kind, reason }: { id: string; kind: ReportKind; reason: string }) =>
    gymsApi.reportEntry(id, kind, reason),
  );
