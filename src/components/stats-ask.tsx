import { StyleSheet, View } from 'react-native';

import { Button, Card, T } from '@/components/ui';
import { analyticsAvailable, setAnalyticsEnabled, useAnalytics } from '@/services/analytics';
import { useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

/** Asks once, after the first workout, whether to share anonymous usage stats. */
export function StatsAsk() {
  const asked = useAnalytics((s) => s.asked);
  const hasWorkout = useGymmy((s) => s.workouts.length > 0);
  if (!analyticsAvailable || asked || !hasWorkout) return null;
  return (
    <Card style={styles.card}>
      <T variant="heading">Help improve Gymmy?</T>
      <T variant="caption" color={colors.textDim}>
        Share anonymous usage stats, like which features get used. Never your workouts, health data, name or email.
        You can change this any time in Profile.
      </T>
      <View style={styles.actions}>
        <Button title="Share stats" onPress={() => setAnalyticsEnabled(true)} />
        <Button title="No thanks" variant="ghost" onPress={() => setAnalyticsEnabled(false)} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.xs, marginTop: space.lg },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
});
