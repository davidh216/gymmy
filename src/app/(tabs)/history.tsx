import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { WorkoutRow } from '@/components/workout-row';
import { Card, SectionHeader, Stat, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { formatVolume } from '@/lib/format';
import { volume } from '@/lib/records';
import { weeklyCounts } from '@/lib/streaks';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const WEEKS = 8;

export default function History() {
  const workouts = useGymmy((s) => s.workouts);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);
  const now = useNow(60_000);

  const totalVolume = workouts.reduce((n, w) => n + volume(w.exercises), 0);
  const totalPRs = workouts.reduce((n, w) => n + w.prs.length, 0);
  const counts = weeklyCounts(
    workouts.map((w) => w.endedAt),
    WEEKS,
    now,
  );
  const max = Math.max(goal, ...counts);

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
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(4, (c / max) * 100)}%`,
                      backgroundColor: c >= goal ? colors.accent : c > 0 ? '#5B6B2E' : colors.cardHigh,
                    },
                  ]}
                />
              </View>
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
        </View>
      </Card>

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
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xxl },
});
