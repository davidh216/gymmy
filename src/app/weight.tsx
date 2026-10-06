import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, SectionHeader, T, haptic } from '@/components/ui';
import { STATUS_TEXT, WeightChart, formatWeightChange, goalLabel } from '@/components/weight-parts';
import { useNow } from '@/hooks/use-now';
import { confirm } from '@/lib/confirm';
import { formatWeight, fromDisplayWeight } from '@/lib/format';
import { dayKey, dayKeyTime } from '@/lib/recovery';
import type { Units } from '@/lib/types';
import { weeklyReview, type WeightDirection, type WeightGoal } from '@/lib/weight';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Rates offered for lose/gain goals, per week, in display units. */
const RATES: Record<Units, number[]> = { lb: [0.5, 1, 1.5, 2], kg: [0.25, 0.5, 0.75, 1] };

export default function WeightScreen() {
  const now = useNow(60 * 60_000);
  const profile = useGymmy((s) => s.profile);
  const weighIns = useGymmy((s) => s.weighIns);
  const updateProfile = useGymmy((s) => s.updateProfile);
  const logWeight = useGymmy((s) => s.logWeight);
  const deleteWeighIn = useGymmy((s) => s.deleteWeighIn);
  const [text, setText] = useState('');
  if (!profile) return null;

  const units = profile.units;
  const settings = profile.weightReview ?? { enabled: false };
  const goal = settings.goal;
  const review = weeklyReview(weighIns, goal, now);
  const history = Object.values(weighIns)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);
  const value = parseFloat(text.replace(',', '.'));
  const valid = Number.isFinite(value) && value > 20 && value < 1000;
  const today = dayKey(now);

  const setGoal = (next: WeightGoal | undefined) => updateProfile({ weightReview: { ...settings, goal: next } });
  const setDirection = (direction: WeightDirection) =>
    setGoal({
      direction,
      ratePerWeekKg: direction === 'maintain' ? 0 : goal?.ratePerWeekKg || fromDisplayWeight(RATES[units][1], units),
    });

  return (
    <Screen header={<BackHeader title="Weight" subtitle="Weigh-ins and weekly trend" />}>
      <Card style={styles.row}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="heading">Weekly weigh-in</T>
          <T variant="caption" color={colors.textDim}>
            Each week starting Sunday, Today asks for your weight and shows how it’s trending.
          </T>
        </View>
        <Switch
          value={settings.enabled}
          onValueChange={(enabled) => updateProfile({ weightReview: { ...settings, enabled } })}
          trackColor={{ true: colors.accent, false: colors.cardHigh }}
          testID="weight-review-switch"
        />
      </Card>

      <SectionHeader title="Goal" />
      <View style={styles.chips}>
        <Chip label="No goal" active={!goal} onPress={() => setGoal(undefined)} />
        <Chip label="Lose" active={goal?.direction === 'lose'} onPress={() => setDirection('lose')} />
        <Chip label="Maintain" active={goal?.direction === 'maintain'} onPress={() => setDirection('maintain')} />
        <Chip label="Gain" active={goal?.direction === 'gain'} onPress={() => setDirection('gain')} />
      </View>
      {goal && goal.direction !== 'maintain' && (
        <View style={styles.chips}>
          {RATES[units].map((r) => {
            const kg = fromDisplayWeight(r, units);
            return (
              <Chip
                key={r}
                label={`${r} ${units}/wk`}
                active={Math.abs(goal.ratePerWeekKg - kg) < 0.01}
                onPress={() => setGoal({ ...goal, ratePerWeekKg: kg })}
              />
            );
          })}
        </View>
      )}

      <SectionHeader title="Trend" />
      <Card style={{ gap: space.sm }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <T variant="heading">
              {review.perWeekKg !== undefined
                ? `${formatWeightChange(review.perWeekKg, units)} / week`
                : 'Not enough weigh-ins yet'}
            </T>
            <T variant="caption" color={colors.textDim}>
              {goal ? goalLabel(goal, units) : 'Set a goal to see if you’re on track'}
              {review.status ? ' · ' : ''}
              {review.status ? (
                <T variant="caption" color={STATUS_TEXT[review.status].color}>
                  {STATUS_TEXT[review.status].label}
                </T>
              ) : null}
            </T>
          </View>
        </View>
        <WeightChart weeks={review.weeks} units={units} />
      </Card>

      <SectionHeader title="Log a weigh-in" />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          keyboardType="decimal-pad"
          placeholder={weighIns[today] ? String(formatWeight(weighIns[today].kg, units)) : `Today, in ${units}`}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          accessibilityLabel={`Today's weight in ${units}`}
        />
        <Button
          title="Save"
          disabled={!valid}
          onPress={() => {
            haptic('success');
            logWeight(fromDisplayWeight(value, units));
            setText('');
          }}
        />
      </View>

      {history.length > 0 && <SectionHeader title="History" />}
      {history.map((w) => (
        <Card
          key={w.date}
          style={styles.row}
          onLongPress={
            w.source === 'health'
              ? undefined
              : () =>
                  confirm('Delete weigh-in?', 'This removes it from this phone and your backup.', 'Delete', () =>
                    deleteWeighIn(w.date),
                  )
          }
          accessibilityLabel={`${w.date}: ${formatWeight(w.kg, units)}${w.source === 'health' ? ', from Apple Health' : ''}`}>
          <T variant="body" style={{ flex: 1 }}>
            {new Date(dayKeyTime(w.date)).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </T>
          {w.source === 'health' && (
            <T variant="caption" color={colors.textFaint}>
              Apple Health
            </T>
          )}
          <T variant="heading">{formatWeight(w.kg, units)}</T>
        </Card>
      ))}
      {history.length > 0 && (
        <T variant="caption" color={colors.textFaint} style={{ textAlign: 'center', marginTop: space.sm }}>
          Hold a weigh-in to delete it. Weights from Apple Health stay on this phone.
        </T>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
});
