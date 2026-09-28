import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, T } from '@/components/ui';
import { RARITY, RARITY_ORDER, getCompanion } from '@/lib/companions';
import { colors, radius, space } from '@/theme';

export default function SummonReveal() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ids?: string; fresh?: string }>();
  const ids = params.ids?.split(',').filter(Boolean) ?? [];
  const fresh = params.fresh?.split(',') ?? [];
  const results = ids.map((id, i) => ({ companion: getCompanion(id), isNew: fresh[i] === '1' }));
  const best = results.reduce<(typeof results)[number] | null>(
    (b, r) =>
      !b || RARITY_ORDER.indexOf(r.companion.rarity) < RARITY_ORDER.indexOf(b.companion.rarity) ? r : b,
    null,
  );
  const glow = best ? RARITY[best.companion.rarity].color : colors.accent;
  const single = results.length === 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg }]}>
      <LinearGradient
        colors={[`${glow}66`, colors.bg, colors.bg]}
        style={StyleSheet.absoluteFill}
        end={{ x: 0.5, y: 0.8 }}
      />
      <Animated.View entering={FadeIn.duration(400)} style={styles.titleWrap}>
        <T variant="label" color={glow}>
          {best ? RARITY[best.companion.rarity].label : ''} pull!
        </T>
        <T variant="hero">{single ? 'New recruit' : 'Squad incoming'}</T>
      </Animated.View>

      {single && best ? (
        <View style={styles.singleWrap}>
          <Animated.View entering={ZoomIn.delay(250).springify().damping(9)}>
            <CompanionAvatar companion={best.companion} size={200} />
          </Animated.View>
          <Animated.View entering={FadeIn.delay(700)} style={{ alignItems: 'center', gap: 4 }}>
            <T variant="hero">{best.companion.name}</T>
            <T variant="heading" color={colors.textDim}>
              {best.companion.title}
            </T>
            <Tag isNew={best.isNew} />
            <T variant="body" color={colors.textDim} style={styles.quote}>
              “{best.companion.lines[0]}”
            </T>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.grid}>
          {results.map((r, i) => (
            <Animated.View
              key={i}
              entering={ZoomIn.delay(150 + i * 120).springify().damping(12)}
              style={[styles.tile, { borderColor: RARITY[r.companion.rarity].color }]}>
              <CompanionAvatar companion={r.companion} size={56} ring={false} />
              <T variant="caption" numberOfLines={1}>
                {r.companion.name}
              </T>
              <Tag isNew={r.isNew} small />
            </Animated.View>
          ))}
        </View>
      )}

      <Animated.View entering={FadeIn.delay(single ? 900 : 150 + results.length * 120)} style={styles.footer}>
        <Button size="lg" title="Let's train" onPress={() => router.back()} />
      </Animated.View>
    </View>
  );
}

function Tag({ isNew, small }: { isNew: boolean; small?: boolean }) {
  return (
    <View style={[styles.tag, { backgroundColor: isNew ? colors.accent : colors.cardHigh }]}>
      <T variant="label" color={isNew ? colors.accentInk : colors.textDim} style={small && { fontSize: 9 }}>
        {isNew ? 'New!' : '+1 ★'}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.lg },
  titleWrap: { alignItems: 'center', gap: 4 },
  singleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl },
  quote: { fontStyle: 'italic', marginTop: space.md, textAlign: 'center' },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: space.sm,
    maxWidth: 520,
    alignSelf: 'center',
  },
  tile: {
    width: '18%',
    minWidth: 92,
    alignItems: 'center',
    gap: 4,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.card,
  },
  tag: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill, marginTop: 2 },
  footer: { width: '100%', maxWidth: 520, alignSelf: 'center' },
});
