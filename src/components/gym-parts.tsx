import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Card, Icon, T } from '@/components/ui';
import { formatResult, getChallenge } from '@/lib/challenges';
import { getCompanion } from '@/lib/companions';
import { medalFor, type BoardMode } from '@/lib/leaderboard';
import type { Units } from '@/lib/types';
import { ME } from '@/services/gyms/local';
import type { BoardRow, Gym } from '@/services/gyms';
import { colors, radius, space } from '@/theme';

export function GymCard({ gym, medals }: { gym: Gym; medals: number[] }) {
  return (
    <Card
      onPress={() => router.push({ pathname: '/gym/[id]', params: { id: gym.id } })}
      style={styles.gymCard}>
      <View style={styles.gymIcon}>
        <T style={{ fontSize: 22 }}>{gym.kind === 'private' ? '🏠' : '🏟️'}</T>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <T variant="heading" numberOfLines={1}>
          {gym.name}
        </T>
        <T variant="caption" color={colors.textFaint} numberOfLines={1}>
          {gym.kind === 'private' ? 'Private' : gym.area ?? 'Public'} · {gym.memberCount}{' '}
          {gym.memberCount === 1 ? 'member' : 'members'}
          {gym.sample ? ' · Sample' : ''}
        </T>
      </View>
      {medals.length > 0 && (
        <T variant="heading">{medals.sort((a, b) => a - b).map((r) => medalFor(r)).join('')}</T>
      )}
      <Icon name={{ ios: 'chevron.right', web: 'chevron_right' }} size={14} color={colors.textFaint} />
    </Card>
  );
}

export function scoreLabel(row: BoardRow, mode: BoardMode, units: Units) {
  const challenge = getChallenge(row.entry.challengeId);
  if (mode === 'p4p') return `${row.score.toFixed(2)}× BW`;
  return formatResult(challenge, row.entry.value, units);
}

export function BoardRowView({
  row,
  mode,
  units,
}: {
  row: BoardRow;
  mode: BoardMode;
  units: Units;
}) {
  const medal = medalFor(row.rank);
  const isMe = row.entry.athlete.id === ME;
  return (
    <Card
      onPress={() => router.push({ pathname: '/entry/[id]', params: { id: row.entry.id } })}
      style={[styles.row, isMe && styles.rowMe, medal ? styles.rowPodium : null]}>
      <View style={styles.rank}>
        {medal ? (
          <T style={{ fontSize: 26 }}>{medal}</T>
        ) : (
          <T variant="heading" color={colors.textFaint}>
            {row.rank}
          </T>
        )}
      </View>
      <CompanionAvatar companion={getCompanion(row.entry.athlete.companionId)} size={36} ring={false} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T variant="heading" numberOfLines={1} color={isMe ? colors.accent : colors.text}>
          @{row.entry.athlete.username}
          {isMe ? ' (you)' : ''}
        </T>
        <T variant="caption" color={colors.textFaint}>
          {row.entry.videoUri ? '▶ Video' : row.entry.athlete.sample ? 'Sample entry' : 'No video'}
          {row.entry.myReport ? ' · Reported' : ''}
        </T>
      </View>
      <T variant="heading" style={{ fontVariant: ['tabular-nums'] }}>
        {scoreLabel(row, mode, units)}
      </T>
    </Card>
  );
}

const styles = StyleSheet.create({
  gymCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  gymIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    marginBottom: space.sm,
  },
  rowPodium: { backgroundColor: colors.cardHigh },
  rowMe: { borderColor: colors.accent, borderWidth: 1.5 },
  rank: { width: 32, alignItems: 'center' },
});
