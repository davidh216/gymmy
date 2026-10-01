import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Clip } from '@/components/clip';
import { Screen } from '@/components/screen';
import { Button, Card, T, haptic } from '@/components/ui';
import { formatResult, getChallenge } from '@/lib/challenges';
import { EXERCISE_KINDS } from '@/lib/exercises';
import { formatDate, formatWeight } from '@/lib/format';
import { resolveEntry, reviewQueue, videoUrl, type ReviewItem } from '@/services/admin';
import { pendingExercises, resolveExercise, type PendingExercise } from '@/services/exercises';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Admin-only queue of entries hidden by reports. The server rejects non-admins. */
export default function AdminScreen() {
  const { data: queue = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['gyms', 'admin-queue'],
    queryFn: reviewQueue,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['gyms', 'admin-exercises'],
    queryFn: pendingExercises,
  });

  return (
    <Screen header={<BackHeader title="Review" subtitle="Admin" />}>
      {exercises.length > 0 && (
        <T variant="label" color={colors.textFaint} style={styles.section}>
          Exercise submissions
        </T>
      )}
      {exercises.map((item) => (
        <ExerciseCard key={item.id} item={item} />
      ))}
      <T variant="label" color={colors.textFaint} style={styles.section}>
        Reported entries
      </T>
      {isError && (
        <Card style={styles.row}>
          <T variant="body" color={colors.textDim} style={{ flex: 1 }}>
            Couldn’t load the queue. Your account needs admin access.
          </T>
          <Button title="Retry" variant="secondary" onPress={() => refetch()} />
        </Card>
      )}
      {!isLoading && !isError && queue.length === 0 && (
        <Card style={styles.empty}>
          <T style={{ fontSize: 40 }}>✅</T>
          <T variant="heading">No reported entries</T>
          <T variant="caption" color={colors.textDim}>
            Entries hidden by reports show up here.
          </T>
        </Card>
      )}
      {queue.map((item) => (
        <ReviewCard key={item.entryId} item={item} />
      ))}
    </Screen>
  );
}

function ExerciseCard({ item }: { item: PendingExercise }) {
  const client = useQueryClient();
  const [name, setName] = useState(item.name);
  const resolve = useMutation({
    mutationFn: (decision: 'approve' | 'reject') =>
      resolveExercise(item.id, decision, name.trim() === item.name ? undefined : name),
    onSuccess: () => client.invalidateQueries({ queryKey: ['gyms', 'admin-exercises'] }),
  });
  const kind = EXERCISE_KINDS.find((k) => k.id === item.kind)?.label;

  return (
    <Card style={styles.card}>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={40}
        style={styles.nameInput}
        accessibilityLabel="Exercise name"
      />
      <T variant="caption" color={colors.textFaint} style={{ textTransform: 'capitalize' }}>
        {item.group} · {kind} · @{item.username} · {formatDate(item.createdAt)}
      </T>
      {resolve.isError && (
        <T variant="caption" color={colors.danger}>
          {resolve.error.message}
        </T>
      )}
      <View style={styles.row}>
        <Button
          title="Reject"
          variant="secondary"
          disabled={resolve.isPending}
          style={{ flex: 1 }}
          onPress={() => resolve.mutate('reject')}
        />
        <Button
          title="Approve"
          disabled={resolve.isPending || name.trim().length < 2}
          style={{ flex: 1 }}
          onPress={() => resolve.mutate('approve')}
        />
      </View>
    </Card>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const client = useQueryClient();
  const [uri, setUri] = useState<string | undefined>();
  const resolve = useMutation({
    mutationFn: (decision: 'restore' | 'remove') => resolveEntry(item.entryId, decision),
    onSuccess: () => client.invalidateQueries({ queryKey: ['gyms'] }),
  });

  useEffect(() => {
    videoUrl(item.videoPath).then(setUri);
  }, [item.videoPath]);

  const challenge = getChallenge(item.challengeId);
  const inappropriate = item.inappropriateReports > 0 || Boolean(item.scanFlag);
  const label = item.scanFlag
    ? 'Scan flagged'
    : item.status === 'processing' || item.scanError
      ? 'Scan didn’t finish'
      : inappropriate
        ? 'Inappropriate'
        : 'Invalid lift';

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T variant="heading">@{item.username}</T>
          <T variant="caption" color={colors.textFaint}>
            {item.gymName} · {formatDate(item.createdAt)}
          </T>
        </View>
        <View style={[styles.badge, inappropriate && styles.badgeDanger]}>
          <T variant="label" color={inappropriate ? colors.danger : colors.textDim}>
            {label}
          </T>
        </View>
      </View>
      <Clip uri={uri} emptyLabel="Loading video…" />
      <T variant="body">
        {challenge.name}: {formatResult(challenge, item.value, units)}
        {item.bodyweightKg ? ` at ${formatWeight(item.bodyweightKg, units)} bodyweight` : ''}
      </T>
      {item.scanFlag && (
        <T variant="caption" color={colors.danger}>
          Automatic scan: {item.scanFlag.replace(/_/g, ' ')}
          {item.scanScore !== undefined ? ` (${Math.round(item.scanScore * 100)}% confidence)` : ''}
        </T>
      )}
      {item.scanError && (
        <T variant="caption" color={colors.textDim}>
          Scan error: {item.scanError}
        </T>
      )}
      <T variant="caption" color={colors.textDim}>
        {item.invalidReports} invalid-lift · {item.inappropriateReports} inappropriate reports
      </T>
      {item.reasons.map((r) => (
        <T key={r} variant="caption" color={colors.textDim}>
          • {r}
        </T>
      ))}
      {resolve.isError && (
        <T variant="caption" color={colors.danger}>
          That didn’t save. Try again.
        </T>
      )}
      <View style={styles.row}>
        <Button
          title="Restore"
          variant="secondary"
          disabled={resolve.isPending}
          style={{ flex: 1 }}
          onPress={() => resolve.mutate('restore')}
        />
        <Button
          title="Remove + strike"
          variant="danger"
          disabled={resolve.isPending}
          style={{ flex: 1 }}
          onPress={() => {
            haptic('heavy');
            resolve.mutate('remove');
          }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, marginBottom: space.md },
  section: { marginBottom: space.sm, marginTop: space.sm },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.cardHigh,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    height: 44,
    minWidth: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.cardHigh,
  },
  badgeDanger: { backgroundColor: 'rgba(244,63,94,0.14)' },
});
