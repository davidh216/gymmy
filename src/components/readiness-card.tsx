import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, ProgressBar, T } from '@/components/ui';
import { useReadiness } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

export function scoreColor(score: number) {
  return score >= 80 ? colors.accent : score >= 60 ? colors.gold : score >= 40 ? colors.flame : colors.danger;
}

/**
 * Today's readiness. `compact` is the Today-screen version, which links to the full
 * Recovery screen and prompts a check-in.
 */
export function ReadinessCard({ compact }: { compact?: boolean }) {
  const r = useReadiness();
  const color = scoreColor(r.score);
  const rest = r.today?.rest;

  return (
    <Card style={{ gap: space.md }} onPress={compact ? () => router.push('/recovery') : undefined}>
      <View style={styles.head}>
        <View style={[styles.ring, { borderColor: color }]}>
          <T variant="title" color={color}>
            {r.score}
          </T>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <T variant="label" color={colors.textFaint}>
            Readiness
          </T>
          <T variant="heading">{rest ? '💤 Rest day' : `${r.emoji} ${r.label}`}</T>
          <T variant="caption" color={colors.textDim}>
            {rest ? 'Enjoy it. Sleep, food and easy movement make your next session count.' : r.advice}
          </T>
        </View>
      </View>

      {!compact && (
        <View style={{ gap: space.sm }}>
          {r.factors.map((f) => (
            <View key={f.label} style={styles.factor}>
              <T variant="caption" color={colors.textDim} style={{ width: 96 }}>
                {f.label}
              </T>
              <View style={{ flex: 1 }}>
                <ProgressBar progress={f.score / 100} height={6} color={scoreColor(f.score)} />
              </View>
            </View>
          ))}
          {!r.checkedIn && (
            <T variant="caption" color={colors.textFaint}>
              Based on your training only. Check in below for a better read.
            </T>
          )}
        </View>
      )}

      {compact && !r.checkedIn && (
        <Button title="Daily check-in" variant="secondary" onPress={() => router.push('/recovery')} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  ring: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factor: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
