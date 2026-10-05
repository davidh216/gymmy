import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { BoardRowView } from '@/components/gym-parts';
import { ErrorState } from '@/components/error-state';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, SectionHeader, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { getChallenge } from '@/lib/challenges';
import { friendlyError } from '@/lib/errors';
import {
  boardModes,
  MODE_LABELS,
  primaryMode,
  seasonDaysLeft,
  seasonName,
  type BoardMode,
  type Season,
} from '@/lib/leaderboard';
import { useBoard, useGym, useJoinGym } from '@/services/gyms/queries';
import { useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

export default function BoardScreen() {
  const params = useLocalSearchParams<{ gymId: string; challengeId: string }>();
  const gymId = params.gymId === 'global' ? null : params.gymId;
  const challenge = getChallenge(params.challengeId);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const modes = boardModes(challenge);
  const [mode, setMode] = useState<BoardMode>(primaryMode(challenge));
  const [season, setSeason] = useState<Season>('month');
  const now = useNow(60 * 60_000);
  const [showRules, setShowRules] = useState(false);
  const { data: board, isLoading, isError, error, refetch, isRefetching } = useBoard(gymId, challenge.id, mode, season);
  const { data: gym } = useGym(gymId ?? 'global');
  const join = useJoinGym();

  return (
    <Screen
      header={
        <BackHeader
          title={challenge.name}
          subtitle={`${gymId ? gym?.name ?? '' : 'Global'} · ${challenge.measure}`}
        />
      }>
      <View style={styles.modes}>
        <Chip label="This month" active={season === 'month'} onPress={() => setSeason('month')} />
        <Chip label="All time" active={season === 'all'} onPress={() => setSeason('all')} />
      </View>
      <T variant="caption" color={colors.textDim} style={{ marginBottom: space.md }}>
        {season === 'month'
          ? `${seasonName(now)} season · ${seasonDaysLeft(now)} ${seasonDaysLeft(now) === 1 ? 'day' : 'days'} left. #1 when it ends earns a 👑.`
          : 'Best ever. 👑 marks past monthly champions.'}
      </T>

      {modes.length > 1 && (
        <>
          <View style={styles.modes}>
            {modes.map((m) => (
              <Chip key={m} label={MODE_LABELS[m]} active={mode === m} onPress={() => setMode(m)} />
            ))}
          </View>
          <T variant="caption" color={colors.textDim} style={{ marginBottom: space.md }}>
            {MODE_HINTS[mode]}
          </T>
        </>
      )}

      <Pressable onPress={() => setShowRules(!showRules)} style={styles.rulesToggle}>
        <T variant="caption" color={colors.textDim}>
          {showRules ? '▾' : '▸'} What counts ({challenge.standards.length} standards)
        </T>
      </Pressable>
      {showRules && (
        <Card style={{ gap: 6, marginBottom: space.md }}>
          {challenge.standards.map((s) => (
            <T key={s} variant="body" color={colors.textDim}>
              • {s}
            </T>
          ))}
        </Card>
      )}

      {isError && !board && (
        <ErrorState error={error} action="load the leaderboard" onRetry={() => refetch()} retrying={isRefetching} />
      )}

      {!isLoading && board && board.rows.length === 0 && (
        <Card style={styles.empty}>
          <T style={{ fontSize: 40 }}>👑</T>
          <T variant="heading">Unclaimed</T>
          <T variant="caption" color={colors.textDim} style={{ textAlign: 'center' }}>
            {mode === 'p4p'
              ? 'No entries with a bodyweight yet.'
              : season === 'month'
                ? 'Nobody has posted this month yet. Take the top spot before the month ends.'
                : 'Nobody has posted here yet. The top spot is yours for the taking.'}
          </T>
        </Card>
      )}

      {board?.rows.map((row) => (
        <BoardRowView key={row.entry.id} row={row} mode={mode} units={units} />
      ))}

      {board?.me && (
        <>
          <SectionHeader title="Your rank" />
          <BoardRowView row={board.me} mode={mode} units={units} />
        </>
      )}

      <View style={{ marginTop: space.lg }}>
        {!gymId ? (
          <T variant="caption" color={colors.textFaint} style={{ textAlign: 'center' }}>
            Post attempts from one of your gyms. Your best counts here too.
          </T>
        ) : gym && !gym.isMember ? (
          <View style={{ gap: space.sm }}>
            <Button
              size="lg"
              title={join.isPending ? 'Joining…' : `Join ${gym.name} to compete`}
              disabled={join.isPending}
              onPress={() => join.mutate(gym.id)}
            />
            {join.isError && (
              <T variant="caption" color={colors.danger} style={{ textAlign: 'center' }}>
                {friendlyError(join.error, `join ${gym.name}`)}
              </T>
            )}
          </View>
        ) : (
          <Button
            size="lg"
            icon={{ ios: 'video.fill', web: 'videocam' }}
            title="Post an attempt"
            onPress={() =>
              router.push({ pathname: '/post-entry', params: { gymId: gymId, challengeId: challenge.id } })
            }
          />
        )}
      </View>
    </Screen>
  );
}

const MODE_HINTS: Record<BoardMode, string> = {
  total: 'Ranked by weight × reps.',
  open: 'Ranked by the heaviest weight lifted.',
  p4p: 'Ranked by weight as a share of bodyweight.',
};

const styles = StyleSheet.create({
  modes: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  rulesToggle: { paddingVertical: space.sm, marginBottom: space.sm },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl },
});
