import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Card, Icon, T } from '@/components/ui';
import { formatResult, getChallenge } from '@/lib/challenges';
import { getCompanion } from '@/lib/companions';
import { medalFor, type BoardMode } from '@/lib/leaderboard';
import { formatVolume } from '@/lib/format';
import type { Units } from '@/lib/types';
import { useMeId, type BoardRow, type Entry, type Gym } from '@/services/gyms';
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

/** "@alex", or the baseline's label for pacer rows. */
export function athleteName(entry: Entry): string {
  return entry.pacer ? entry.athlete.username : `@${entry.athlete.username}`;
}

/** The headline number for a row in this ranking mode. */
export function scoreLabel(row: BoardRow, mode: BoardMode, units: Units) {
  const challenge = getChallenge(row.entry.challengeId);
  if (mode === 'p4p') return `${Math.round(row.score * 100)}% BW`;
  if (mode === 'total' && challenge.reps) return formatVolume(row.score, units);
  return formatResult(challenge, row.entry.value, units);
}

/** The line under a row's name: the set itself, plus video and report state. */
function rowDetail(row: BoardRow, mode: BoardMode, units: Units): string {
  const { entry } = row;
  const challenge = getChallenge(entry.challengeId);
  const parts: string[] = [];
  if (challenge.reps && entry.reps && mode !== 'open') parts.push(formatResult(challenge, entry.value, units, entry.reps));
  else if (challenge.reps && entry.reps) parts.push(`× ${entry.reps}`);
  if (entry.pacer) parts.push('Baseline');
  else parts.push(entry.hasVideo ? '▶ Video' : entry.athlete.sample ? 'Sample entry' : 'No video');
  if (entry.myReport) parts.push('Reported');
  return parts.join(' · ');
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
  const meId = useMeId();
  const isMe = row.entry.athlete.id === meId;
  return (
    <Card
      onPress={
        row.entry.pacer ? undefined : () => router.push({ pathname: '/entry/[id]', params: { id: row.entry.id } })
      }
      style={[styles.row, isMe && styles.rowMe, medal ? styles.rowPodium : null, row.entry.pacer && styles.rowPacer]}>
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
          {athleteName(row.entry)}
          {isMe ? ' (you)' : ''}
          {row.crowns ? ` ${'👑'.repeat(Math.min(row.crowns, 3))}${row.crowns > 3 ? `×${row.crowns}` : ''}` : ''}
        </T>
        <T variant="caption" color={colors.textFaint} numberOfLines={1}>
          {rowDetail(row, mode, units)}
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
  rowPacer: { opacity: 0.7 },
  rank: { width: 32, alignItems: 'center' },
});
