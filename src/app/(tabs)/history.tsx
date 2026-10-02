import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { WorkoutRow } from '@/components/workout-row';
import { Card, SectionHeader, Stat, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { getExercise } from '@/lib/exercises';
import { formatAgo, formatSet, formatVolume } from '@/lib/format';
import { trainedExercises } from '@/lib/progress';
import { lastSession, volume } from '@/lib/records';
import { shiftWeek } from '@/lib/recap';
import { weekStart, weeklyCounts } from '@/lib/streaks';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const WEEKS = 8;

export default function History() {
  const workouts = useGymmy((s) => s.workouts);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);
  const now = useNow(60_000);
  const [showAll, setShowAll] = useState(false);

  const totalVolume = workouts.reduce((n, w) => n + volume(w.exercises), 0);
  const totalPRs = workouts.reduce((n, w) => n + w.prs.length, 0);
  const counts = weeklyCounts(
    workouts.map((w) => w.endedAt),
    WEEKS,
    now,
  );
  const max = Math.max(goal, ...counts);
  const trained = trainedExercises(workouts);

  return (
    <Screen header={<T variant="hero" style={{ marginBottom: space.lg }}>History</T>}>
      <Card style={{ gap: space.lg }}>
        <View style={{ flexDirection: 'row' }}>
          <Stat value={String(workouts.length)} label="Workouts" />
          <Stat value={formatVolume(totalVolume, units)} label="Lifted" />
          <Stat value={`🏆 ${totalPRs}`} label="PRs" color={colors.flame} />
        </View>
        <View>
          <View style={styles.chart}>
            <View style={[styles.goalLine, { bottom: `${(goal / max) * 100}%` }]} />
            {counts.map((c, i) => (
              <Pressable
                key={i}
                style={styles.barCol}
                accessibilityRole="button"
                accessibilityLabel={i === WEEKS - 1 ? 'Recap for this week' : `Recap for ${WEEKS - 1 - i} weeks ago`}
                onPress={() =>
                  router.push({ pathname: '/recap', params: { week: String(shiftWeek(weekStart(now), i - (WEEKS - 1))) } })
                }>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(4, (c / max) * 100)}%`,
                      backgroundColor: c >= goal ? colors.accent : c > 0 ? '#5B6B2E' : colors.cardHigh,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.chartLabels}>
            <T variant="caption" color={colors.textFaint}>
              {WEEKS} weeks ago
            </T>
            <T variant="caption" color={colors.textFaint}>
              This week
            </T>
          </View>
          <T variant="caption" color={colors.accent} style={{ marginTop: space.sm }} onPress={() => router.push('/recap')}>
            Weekly recap →
          </T>
        </View>
      </Card>

      {trained.length > 0 && (
        <>
          <SectionHeader title="Progress" />
          {trained.slice(0, showAll ? undefined : 5).map((t) => {
            const ex = getExercise(t.exerciseId);
            const last = lastSession(t.exerciseId, workouts);
            return (
              <Card
                key={t.exerciseId}
                style={styles.progressRow}
                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: t.exerciseId } })}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T variant="heading" numberOfLines={1}>
                    {ex.name}
                  </T>
                  <T variant="caption" color={colors.textDim} numberOfLines={1}>
                    {last ? `Last: ${formatSet(last.top, ex.kind, units)} · ` : ''}
                    {formatAgo(t.lastAt, now)} · {t.sessions} {t.sessions === 1 ? 'session' : 'sessions'}
                  </T>
                </View>
                <T variant="heading" color={colors.textFaint}>
                  📈
                </T>
              </Card>
            );
          })}
          {trained.length > 5 && (
            <T variant="caption" color={colors.accent} onPress={() => setShowAll(!showAll)} style={styles.more}>
              {showAll ? 'Show fewer' : `Show all ${trained.length} exercises`}
            </T>
          )}
        </>
      )}

      <SectionHeader title="All workouts" />
      {workouts.length === 0 ? (
        <Card style={styles.empty}>
          <T style={{ fontSize: 40 }}>📓</T>
          <T variant="heading">No workouts yet</T>
          <T variant="caption" color={colors.textDim} style={{ textAlign: 'center' }}>
            Finish your first session and it’ll show up here.
          </T>
        </Card>
      ) : (
        workouts.map((w) => <WorkoutRow key={w.id} workout={w} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chart: { height: 110, flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textFaint,
  },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderRadius: radius.sm, width: '100%' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  more: { textAlign: 'center', paddingVertical: space.sm },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xxl },
});
