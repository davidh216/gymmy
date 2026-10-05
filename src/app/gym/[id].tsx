import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { ErrorState } from '@/components/error-state';
import { Screen } from '@/components/screen';
import { athleteName } from '@/components/gym-parts';
import { Button, Card, Icon, SectionHeader, T, haptic } from '@/components/ui';
import { CHALLENGES, formatResult, type Challenge } from '@/lib/challenges';
import { confirm } from '@/lib/confirm';
import { medalFor, primaryMode } from '@/lib/leaderboard';
import { useMeId } from '@/services/gyms';
import { useBoard, useGym, useJoinGym, useLeaveGym } from '@/services/gyms/queries';
import { useGymmy } from '@/store/gymmy';
import { friendlyError } from '@/lib/errors';
import { colors, radius, space } from '@/theme';

export default function GymScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isGlobal = id === 'global';
  const { data: gym, isLoading, isError, error, refetch, isRefetching } = useGym(id);
  const join = useJoinGym();
  const leave = useLeaveGym();
  const [copied, setCopied] = useState(false);

  if (!isGlobal && isError && !gym) {
    return (
      <Screen header={<BackHeader title="Gym" />}>
        <ErrorState error={error} action="load this gym" onRetry={() => refetch()} retrying={isRefetching} />
      </Screen>
    );
  }

  if (!isGlobal && !isLoading && !gym) {
    return (
      <Screen header={<BackHeader title="Gym not found" />}>
        <T color={colors.textDim}>This gym may have been removed.</T>
      </Screen>
    );
  }

  const title = isGlobal ? 'Global boards' : gym?.name ?? '';
  const subtitle = isGlobal
    ? 'Every gym'
    : gym
      ? `${gym.kind === 'private' ? 'Private gym' : gym.area ?? 'Public gym'} · ${gym.memberCount} ${gym.memberCount === 1 ? 'member' : 'members'}`
      : '';

  return (
    <Screen header={<BackHeader title={title} subtitle={subtitle} />}>
      {gym?.inviteCode && (
        <Card style={styles.invite}>
          <View style={{ flex: 1 }}>
            <T variant="label" color={colors.textFaint}>
              Invite code
            </T>
            <T style={styles.code} selectable>
              {gym.inviteCode}
            </T>
          </View>
          <Button
            title={copied ? 'Copied' : 'Copy'}
            variant="secondary"
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(gym.inviteCode ?? '');
                setCopied(true);
              } catch {
                // Clipboard refused (some embedded views); the code is selectable instead.
              }
            }}
          />
        </Card>
      )}

      {gym && !gym.isMember && (
        <Card style={styles.joinCard}>
          <T variant="body" color={colors.textDim} style={{ flex: 1 }}>
            Join to post attempts and get alerts when someone takes your spot.
          </T>
          <Button
            title={join.isPending ? 'Joining…' : 'Join gym'}
            disabled={join.isPending}
            onPress={() => join.mutate(gym.id, { onSuccess: () => haptic('success') })}
          />
        </Card>
      )}
      {(join.isError || leave.isError) && (
        <T variant="caption" color={colors.danger} style={{ marginBottom: space.md }}>
          {friendlyError(join.error ?? leave.error, join.isError ? `join ${gym?.name ?? 'this gym'}` : 'leave this gym')}
        </T>
      )}

      <SectionHeader title="Challenges" />
      {CHALLENGES.map((c) => (
        <ChallengeRow key={c.id} gymId={isGlobal ? null : id} challenge={c} />
      ))}

      {gym?.isMember && (
        <Button
          title="Leave gym"
          variant="danger"
          style={{ marginTop: space.xl }}
          onPress={() =>
            confirm(`Leave ${gym.name}?`, 'Your entries stay on its boards. You can rejoin any time.', 'Leave', () => {
              leave.mutate(gym.id, { onSuccess: () => router.back() });
            })
          }
        />
      )}
    </Screen>
  );
}

function ChallengeRow({ gymId, challenge }: { gymId: string | null; challenge: Challenge }) {
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const { data } = useBoard(gymId, challenge.id, primaryMode(challenge));
  const meId = useMeId();
  const leader = data?.rows[0];
  const mine = data?.rows.find((r) => r.entry.athlete.id === meId) ?? data?.me;

  return (
    <Card
      onPress={() =>
        router.push({
          pathname: '/board/[gymId]/[challengeId]',
          params: { gymId: gymId ?? 'global', challengeId: challenge.id },
        })
      }
      style={styles.challenge}>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <T variant="heading">{challenge.name}</T>
        <T variant="caption" color={colors.textFaint} numberOfLines={1}>
          {leader
            ? `🥇 ${athleteName(leader.entry)} · ${formatResult(challenge, leader.entry.value, units, leader.entry.reps)}`
            : `${challenge.measure} · unclaimed, be the first`}
        </T>
      </View>
      {mine && (
        <View style={[styles.myRank, mine.rank <= 3 && styles.myRankPodium]}>
          <T variant="caption" color={mine.rank <= 3 ? colors.accentInk : colors.text}>
            {medalFor(mine.rank) ?? `#${mine.rank}`}
          </T>
        </View>
      )}
      <Icon name={{ ios: 'chevron.right', web: 'chevron_right' }} size={14} color={colors.textFaint} />
    </Card>
  );
}

const styles = StyleSheet.create({
  invite: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  code: { fontSize: 24, fontWeight: '800', letterSpacing: 4, color: colors.accent },
  joinCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderColor: colors.accent },
  challenge: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  myRank: {
    minWidth: 36,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
  },
  myRankPodium: { backgroundColor: colors.accent },
});
