import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CompanionAvatar } from '@/components/companion-avatar';
import { ProgressBar, T } from '@/components/ui';
import { RARITY, companionMood, getCompanion } from '@/lib/companions';
import { useGymmy } from '@/store/gymmy';
import { useProgress } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

export function CompanionHero() {
  const companionId = useGymmy((s) => s.companionId);
  const stars = useGymmy((s) => s.collection[s.companionId]?.stars ?? 1);
  const { level, into, needed, daysSince } = useProgress();
  const companion = getCompanion(companionId);
  const mood = companionMood(daysSince);
  // Stable line per day so it doesn't flicker on re-render.
  const line = companion.lines[new Date().getDate() % companion.lines.length];

  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [float]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[`${companion.colors[1]}55`, `${companion.colors[0]}22`, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.top}>
        <Animated.View style={floatStyle}>
          <CompanionAvatar companion={companion} size={96} />
        </Animated.View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <T variant="title">{companion.name}</T>
            <T variant="caption" color={RARITY[companion.rarity].color}>
              {'★'.repeat(stars)}
            </T>
          </View>
          <T variant="caption" color={colors.textDim}>
            {companion.title}
          </T>
          <View style={styles.mood}>
            <T variant="caption">
              {mood.emoji} {mood.label}
            </T>
          </View>
        </View>
      </View>
      <View style={styles.bubble}>
        <T variant="body" color={colors.text} style={{ fontStyle: 'italic' }}>
          “{line}”
        </T>
      </View>
      <View style={styles.levelRow}>
        <T variant="label" color={colors.accent}>
          Level {level}
        </T>
        <T variant="caption" color={colors.textFaint}>
          {into} / {needed} XP
        </T>
      </View>
      <ProgressBar progress={into / needed} height={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: space.lg,
    gap: space.md,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  mood: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bubble: {
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
