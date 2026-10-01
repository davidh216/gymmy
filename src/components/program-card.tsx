import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, T } from '@/components/ui';
import type { Program } from '@/lib/programs';
import { colors, radius, space } from '@/theme';

/** A training plan in a list; opens its detail screen. */
export function ProgramCard({ program, active }: { program: Program; active?: boolean }) {
  return (
    <Card
      style={[styles.card, active && styles.active]}
      onPress={() => router.push({ pathname: '/program/[id]', params: { id: program.id } })}>
      <View style={styles.emoji}>
        <T style={{ fontSize: 30 }}>{program.emoji}</T>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={styles.titleRow}>
          <T variant="heading" numberOfLines={1} style={{ flexShrink: 1 }}>
            {program.name}
          </T>
          {active && (
            <View style={styles.badge}>
              <T variant="label" color={colors.accentInk}>
                Active
              </T>
            </View>
          )}
        </View>
        <T variant="caption" color={colors.textDim} numberOfLines={1}>
          {program.tagline}
        </T>
        <T variant="caption" color={colors.textFaint}>
          {program.weeks} weeks · {program.daysPerWeek} days/week · {program.level}
        </T>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  active: { borderWidth: 1, borderColor: colors.accent },
  emoji: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
