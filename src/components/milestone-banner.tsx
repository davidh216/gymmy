import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, T } from '@/components/ui';
import { useMilestones } from '@/store/selectors';
import { colors, space } from '@/theme';

/** Shows when milestone rewards are waiting to be claimed. */
export function MilestoneBanner() {
  const { ready } = useMilestones();
  if (ready.length === 0) return null;
  const gems = ready.reduce((n, m) => n + m.gems, 0);
  return (
    <Card style={styles.banner} onPress={() => router.push('/milestones')}>
      <T style={{ fontSize: 28 }}>🏆</T>
      <View style={{ flex: 1 }}>
        <T variant="heading">
          {ready.length === 1 ? `${ready[0].title} unlocked` : `${ready.length} milestones unlocked`}
        </T>
        <T variant="caption" color={colors.textDim}>
          Tap to claim <T variant="caption" color={colors.gem}>+{gems} 💎</T>
        </T>
      </View>
      <T variant="heading" color={colors.accent}>
        →
      </T>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
});
