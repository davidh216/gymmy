import { StyleSheet, View } from 'react-native';

import { T } from '@/components/ui';
import { toDisplayWeight } from '@/lib/format';
import type { Units } from '@/lib/types';
import type { GoalStatus, WeeklyReview, WeightGoal } from '@/lib/weight';
import { colors, radius, space } from '@/theme';

/** "−0.8 lb" / "+1.2 kg" / "±0 lb". */
export function formatWeightChange(kg: number, units: Units): string {
  const v = toDisplayWeight(Math.abs(kg), units);
  if (v === 0) return `±0 ${units}`;
  return `${kg < 0 ? '−' : '+'}${v} ${units}`;
}

export const STATUS_TEXT: Record<GoalStatus, { label: string; color: string }> = {
  on_track: { label: 'On track', color: colors.accent },
  ahead: { label: 'Faster than planned', color: colors.flame },
  behind: { label: 'Slower than planned', color: colors.flame },
  wrong_way: { label: 'Heading the other way', color: colors.danger },
};

export function goalLabel(goal: WeightGoal, units: Units): string {
  if (goal.direction === 'maintain') return 'Maintain';
  const rate = toDisplayWeight(goal.ratePerWeekKg, units);
  return `${goal.direction === 'lose' ? 'Lose' : 'Gain'} ${rate} ${units}/week`;
}

/** Weekly averages as bars, scaled to the range of the data so small changes show. */
export function WeightChart({ weeks, units }: { weeks: WeeklyReview['weeks']; units: Units }) {
  const values = weeks.flatMap((w) => (w.avgKg === undefined ? [] : [w.avgKg]));
  if (values.length === 0) {
    return (
      <T variant="caption" color={colors.textDim}>
        Log a few weigh-ins to see your weekly trend.
      </T>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.5);
  return (
    <View
      style={styles.chart}
      accessible
      accessibilityLabel={`Weekly average weight: ${values.map((v) => `${toDisplayWeight(v, units)} ${units}`).join(', ')}`}>
      {weeks.map((w, i) => {
        const last = i === weeks.length - 1;
        const h = w.avgKg === undefined ? 0 : 0.25 + (0.75 * (w.avgKg - min)) / span;
        return (
          <View key={w.start} style={styles.col}>
            <View style={styles.track}>
              {w.avgKg !== undefined && (
                <View
                  style={[
                    styles.bar,
                    { height: `${h * 100}%`, backgroundColor: last ? colors.accent : colors.cardHigh },
                  ]}
                />
              )}
            </View>
            <T variant="caption" color={last ? colors.text : colors.textFaint} style={styles.label}>
              {new Date(w.start).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
            </T>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', gap: 6, height: 110, alignItems: 'flex-end', marginTop: space.sm },
  col: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: radius.sm },
  label: { fontSize: 10 },
});
