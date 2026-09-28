import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { RARITY, type Companion } from '@/lib/companions';

export function CompanionAvatar({
  companion,
  size = 88,
  locked = false,
  ring = true,
}: {
  companion: Companion;
  size?: number;
  locked?: boolean;
  ring?: boolean;
}) {
  const ringColor = RARITY[companion.rarity].color;
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ring && !locked ? ringColor : 'transparent',
        },
      ]}>
      <LinearGradient
        colors={locked ? ['#1D1D23', '#27272F'] : companion.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
      <Text style={{ fontSize: size * 0.5, opacity: locked ? 0.15 : 1 }}>
        {locked ? '❔' : companion.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
});
