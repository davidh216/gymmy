import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, T, haptic } from '@/components/ui';
import { STATUS_TEXT, formatWeightChange } from '@/components/weight-parts';
import { useNow } from '@/hooks/use-now';
import { formatWeight, fromDisplayWeight, toDisplayWeight } from '@/lib/format';
import { shouldPromptReview, suggestedWeight, sundayStart, weeklyReview } from '@/lib/weight';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Once a week (weeks start Sunday), for people who turned it on: log a weight and see the trend. */
export function WeightReviewCard() {
  const now = useNow(60 * 60_000);
  const settings = useGymmy((s) => s.profile?.weightReview);
  const seen = useGymmy((s) => s.weightReviewSeen);
  if (!shouldPromptReview(settings, seen, now)) return null;
  return <Review now={now} />;
}

function Review({ now }: { now: number }) {
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const goal = useGymmy((s) => s.profile?.weightReview?.goal);
  const weighIns = useGymmy((s) => s.weighIns);
  const vitals = useGymmy((s) => s.health.vitals);
  const logWeight = useGymmy((s) => s.logWeight);
  const seeWeightReview = useGymmy((s) => s.seeWeightReview);
  // Follows the suggestion until the user types.
  const [typed, setText] = useState<string | null>(null);
  const suggested = suggestedWeight(weighIns, { kg: vitals?.bodyMassKg, at: vitals?.bodyMassAt }, now);
  const text = typed ?? (suggested === undefined ? '' : String(toDisplayWeight(suggested, units)));

  const review = weeklyReview(weighIns, goal, now);
  // On the review day the new week has barely begun, so compare the last two full weeks.
  const [before, last] = review.weeks.slice(-3, -1);
  const value = parseFloat(text.replace(',', '.'));
  const valid = Number.isFinite(value) && value > 20 && value < 1000;
  const weekStart = sundayStart(now);

  const save = () => {
    if (!valid) return;
    haptic('success');
    logWeight(fromDisplayWeight(value, units));
    seeWeightReview(weekStart);
  };

  return (
    <Card style={styles.card} testID="weight-review">
      <View style={styles.titleRow}>
        <T variant="heading" style={{ flex: 1 }}>
          ⚖️ Weekly weigh-in
        </T>
        <Pressable onPress={() => router.push('/weight')} hitSlop={8} accessibilityRole="button">
          <T variant="caption" color={colors.accent}>
            Trend →
          </T>
        </Pressable>
      </View>

      {last?.avgKg !== undefined ? (
        <T variant="body" color={colors.textDim}>
          Last week averaged {formatWeight(last.avgKg, units)}
          {before?.avgKg !== undefined ? ` (${formatWeightChange(last.avgKg - before.avgKg, units)})` : ''}.
          {review.status ? (
            <T variant="body" color={STATUS_TEXT[review.status].color}>
              {' '}
              {STATUS_TEXT[review.status].label}.
            </T>
          ) : null}
        </T>
      ) : (
        <T variant="body" color={colors.textDim}>
          Log your weight once a week to see how it’s trending.
        </T>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          accessibilityLabel={`Today's weight in ${units}`}
          testID="weight-review-input"
        />
        <T variant="heading" color={colors.textDim}>
          {units}
        </T>
      </View>
      <View style={styles.actions}>
        <Button title="Save" onPress={save} disabled={!valid} style={{ flex: 1 }} />
        <Button title="Skip this week" variant="ghost" onPress={() => seeWeightReview(weekStart)} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, marginTop: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
  },
  actions: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
});
