import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Clip } from '@/components/clip';
import { CompanionAvatar } from '@/components/companion-avatar';
import { ErrorState } from '@/components/error-state';
import { Button, Card, SectionHeader, T, haptic } from '@/components/ui';
import { formatResult, getChallenge } from '@/lib/challenges';
import { confirm } from '@/lib/confirm';
import { getCompanion } from '@/lib/companions';
import { formatDate, formatWeight } from '@/lib/format';
import type { ReportKind } from '@/lib/leaderboard';
import { useMeId } from '@/services/gyms';
import { useBlockUser, useEntry, useGym, useReportEntry } from '@/services/gyms/queries';
import { useGymmy } from '@/store/gymmy';
import { friendlyError } from '@/lib/errors';
import { colors, radius, space } from '@/theme';

const REASONS: Record<ReportKind, { title: string; blurb: string; reasons: string[] }> = {
  invalid: {
    title: 'The lift doesn’t count',
    blurb: 'Three reports hide the entry until it’s reviewed.',
    reasons: ['Missed a standard (depth, lockout, range)', 'Weight or result looks wrong', 'Not the same person', 'Video looks edited or cut'],
  },
  inappropriate: {
    title: 'Inappropriate content',
    blurb: 'Hidden for you right away and reviewed first.',
    reasons: ['Nudity or sexual content', 'Violence or dangerous acts', 'Harassment or hate', 'Spam or unrelated video'],
  },
};

export default function EntryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError, error, refetch, isRefetching } = useEntry(id);
  const { data: gym } = useGym(entry?.gymId ?? '');
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const report = useReportEntry();
  const block = useBlockUser();
  const [picking, setPicking] = useState<ReportKind | null>(null);
  const meId = useMeId();

  if (isLoading) return <View style={styles.root} />;
  if (isError && !entry) {
    return (
      <View style={[styles.root, styles.center]}>
        <ErrorState error={error} action="load this entry" onRetry={() => refetch()} retrying={isRefetching} />
        <Button title="Close" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }
  if (!entry) {
    return (
      <View style={[styles.root, styles.center]}>
        <T variant="heading">This entry is no longer available</T>
        <Button title="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const challenge = getChallenge(entry.challengeId);
  const isMine = entry.athlete.id === meId;

  const submitReport = (kind: ReportKind, reason: string) => {
    haptic('medium');
    setPicking(null);
    report.mutate(
      { id: entry.id, kind, reason },
      { onSuccess: () => kind === 'inappropriate' && router.back() },
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: space.lg, paddingBottom: insets.bottom + space.xxl }]}>
        <View style={styles.header}>
          <CompanionAvatar companion={getCompanion(entry.athlete.companionId)} size={48} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <T variant="heading" numberOfLines={1}>
              @{entry.athlete.username}
            </T>
            <T variant="caption" color={colors.textFaint} numberOfLines={1}>
              {gym?.name ?? ''} · {formatDate(entry.createdAt)}
            </T>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <T variant="heading" color={colors.textDim}>
              Close
            </T>
          </Pressable>
        </View>

        <Clip
          uri={entry.videoUri}
          emptyLabel={entry.athlete.sample ? 'Sample entry, no video' : entry.hasVideo ? 'Video unavailable' : 'No video'}
        />

        <Card style={styles.result}>
          <View style={{ flex: 1 }}>
            <T variant="label" color={colors.textFaint}>
              {challenge.name} · {challenge.measure}
            </T>
            <T variant="hero">{formatResult(challenge, entry.value, units)}</T>
          </View>
          {entry.bodyweightKg ? (
            <View style={{ alignItems: 'flex-end' }}>
              <T variant="label" color={colors.textFaint}>
                Bodyweight
              </T>
              <T variant="heading">{formatWeight(entry.bodyweightKg, units)}</T>
            </View>
          ) : null}
        </Card>

        <SectionHeader title="Standards" />
        <Card style={{ gap: 6 }}>
          {challenge.standards.map((s) => (
            <T key={s} variant="body" color={colors.textDim}>
              • {s}
            </T>
          ))}
        </Card>

        {!isMine && (
          <>
            <SectionHeader title="Report" />
            {entry.myReport ? (
              <Card>
                <T variant="body" color={colors.textDim}>
                  You reported this entry. Thanks, it’s been counted.
                </T>
              </Card>
            ) : picking ? (
              <Card style={{ gap: space.sm }}>
                <T variant="heading">{REASONS[picking].title}</T>
                <T variant="caption" color={colors.textDim}>
                  {REASONS[picking].blurb}
                </T>
                {REASONS[picking].reasons.map((r) => (
                  <Pressable key={r} onPress={() => submitReport(picking, r)} style={styles.reason}>
                    <T variant="body">{r}</T>
                  </Pressable>
                ))}
                <Button title="Cancel" variant="ghost" onPress={() => setPicking(null)} />
              </Card>
            ) : (
              <View style={{ gap: space.sm }}>
                <Button title="The lift doesn’t count" variant="secondary" onPress={() => setPicking('invalid')} />
                <Button title="Inappropriate content" variant="danger" onPress={() => setPicking('inappropriate')} />
              </View>
            )}
            <Button
              title={`Block @${entry.athlete.username}`}
              variant="ghost"
              onPress={() =>
                confirm(
                  `Block @${entry.athlete.username}?`,
                  'You won’t see their entries or videos anywhere in Gymmy.',
                  'Block',
                  () => {
                    block.mutate(entry.athlete.id, { onSuccess: () => router.back() });
                  },
                )
              }
            />
          </>
        )}
        {(report.isError || block.isError) && (
          <T variant="caption" color={colors.danger} style={{ textAlign: 'center', marginTop: space.md }}>
            {friendlyError(report.error ?? block.error, report.isError ? 'send your report' : 'block this person')}
          </T>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.md },
  content: { paddingHorizontal: space.lg, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  result: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  reason: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.cardHigh },
});
