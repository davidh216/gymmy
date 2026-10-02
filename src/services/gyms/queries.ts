import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BoardMode, Season, ReportKind } from '@/lib/leaderboard';
import type { NearbyPlace } from '@/lib/places';

import { fetchMyProfile, useAuth } from '../auth';
import { gymsApi, type GymKind, type PostEntryInput } from './index';
import { track } from '@/services/analytics';

export const gymKeys = {
  all: ['gyms'] as const,
  mine: ['gyms', 'mine'] as const,
  medals: ['gyms', 'medals'] as const,
  search: (q: string) => ['gyms', 'search', q] as const,
  gym: (id: string) => ['gyms', 'gym', id] as const,
  board: (gymId: string | null, challengeId: string, mode: BoardMode, season: Season) =>
    ['gyms', 'board', gymId ?? 'global', challengeId, mode, season] as const,
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
export const useBoard = (gymId: string | null, challengeId: string, mode: BoardMode, season: Season = 'all') =>
  useQuery({
    queryKey: gymKeys.board(gymId, challengeId, mode, season),
    queryFn: () => gymsApi.getBoard({ gymId, challengeId, mode, season }),
  });
export const useEntry = (id: string) =>
  useQuery({ queryKey: gymKeys.entry(id), queryFn: () => gymsApi.getEntry(id) });

/** Mutations refresh everything gym-related; boards are cheap to refetch. */
function useGymMutation<A, R>(fn: (args: A) => Promise<R>, onDone?: (args: A, result: R) => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result, args) => {
      onDone?.(args, result);
      return client.invalidateQueries({ queryKey: gymKeys.all });
    },
  });
}

export const useJoinPlace = () =>
  useGymMutation(
    (place: NearbyPlace) => gymsApi.joinPlace(place),
    () => track({ event: 'gym_join', props: { via: 'nearby' } }),
  );
export const useJoinGym = () =>
  useGymMutation(
    (id: string) => gymsApi.joinGym(id),
    () => track({ event: 'gym_join', props: { via: 'gym' } }),
  );
export const useLeaveGym = () => useGymMutation((id: string) => gymsApi.leaveGym(id));
export const useJoinByInvite = () =>
  useGymMutation(
    (code: string) => gymsApi.joinByInvite(code),
    () => track({ event: 'gym_join', props: { via: 'invite' } }),
  );
export const useCreateGym = () =>
  useGymMutation(
    (input: { kind: GymKind; name: string; area?: string }) => gymsApi.createGym(input),
    () => track({ event: 'gym_join', props: { via: 'create' } }),
  );
export const usePostEntry = () =>
  useGymMutation(
    (input: PostEntryInput) => gymsApi.postEntry(input),
    (input, result) => track({ event: 'entry_post', props: { challenge: input.challengeId, status: String(result.status) } }),
  );
export const useBlockUser = () => useGymMutation((athleteId: string) => gymsApi.blockUser(athleteId));

export const useReportEntry = () =>
  useGymMutation(({ id, kind, reason }: { id: string; kind: ReportKind; reason: string }) =>
    gymsApi.reportEntry(id, kind, reason),
  );
