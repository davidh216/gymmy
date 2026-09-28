import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Screen } from '@/components/screen';
import { Button, GemCount, ProgressBar, SectionHeader, T, haptic } from '@/components/ui';
import { COMPANIONS, RARITY, RARITY_ORDER, companionXpBonus } from '@/lib/companions';
import { EPIC_PITY, LEGENDARY_PITY } from '@/lib/gacha';
import { SUMMON_10_COST, SUMMON_COST } from '@/lib/progression';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const SORTED = [...COMPANIONS].sort(
  (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
);

export default function Squad() {
  const gems = useGymmy((s) => s.gems);
  const pity = useGymmy((s) => s.pity);
  const collection = useGymmy((s) => s.collection);
  const companionId = useGymmy((s) => s.companionId);
  const { setCompanion, summon } = useGymmy.getState();
  const owned = Object.keys(collection).length;

  const pull = (count: 1 | 10) => {
    const results = summon(count);
    if (!results) return;
    haptic('heavy');
    router.push({
      pathname: '/summon-reveal',
      params: {
        ids: results.map((r) => r.id).join(','),
        fresh: results.map((r) => (r.isNew ? 1 : 0)).join(','),
      },
    });
  };

  return (
    <Screen
      header={
        <View style={styles.header}>
          <T variant="hero" style={{ flex: 1 }}>
            Squad
          </T>
          <GemCount gems={gems} />
        </View>
      }>
      <View style={styles.banner}>
        <LinearGradient
          colors={['#4C1D95', '#7C3AED', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerTop}>
          <View style={{ flex: 1, gap: 4 }}>
            <T variant="label" color="rgba(255,255,255,0.7)">
              Summon
            </T>
            <T variant="title">Recruit a gym buddy</T>
            <T variant="caption" color="rgba(255,255,255,0.8)">
              Earn 💎 by working out, hitting PRs and smashing your weekly goal.
            </T>
          </View>
          <T style={{ fontSize: 56 }}>🥚</T>
        </View>
        <View style={{ gap: 6 }}>
          <View style={styles.pityRow}>
            <T variant="caption" color="rgba(255,255,255,0.85)">
              Epic+ guaranteed in {EPIC_PITY - pity.sinceEpic}
            </T>
            <T variant="caption" color="rgba(255,255,255,0.6)">
              Legendary in {LEGENDARY_PITY - pity.sinceLegendary}
            </T>
          </View>
          <ProgressBar progress={pity.sinceEpic / EPIC_PITY} color={RARITY.epic.color} height={6} />
        </View>
        <View style={styles.buttons}>
          <Button
            title={`×1  ·  💎 ${SUMMON_COST}`}
            variant="secondary"
            disabled={gems < SUMMON_COST}
            onPress={() => pull(1)}
            style={{ flex: 1 }}
          />
          <Button
            title={`×10  ·  💎 ${SUMMON_10_COST}`}
            variant="primary"
            disabled={gems < SUMMON_10_COST}
            onPress={() => pull(10)}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <SectionHeader
        title={`Collection · ${owned}/${COMPANIONS.length}`}
        action={
          <T variant="caption" color={colors.textFaint}>
            Tap to set active
          </T>
        }
      />
      <View style={styles.grid}>
        {SORTED.map((c) => {
          const own = collection[c.id];
          const active = c.id === companionId;
          return (
            <Pressable
              key={c.id}
              disabled={!own}
              onPress={() => {
                haptic('medium');
                setCompanion(c.id);
              }}
              style={[styles.tile, active && styles.tileActive]}>
              <CompanionAvatar companion={c} size={64} locked={!own} />
              <T variant="caption" numberOfLines={1}>
                {own ? c.name : '???'}
              </T>
              <T variant="label" color={RARITY[c.rarity].color} style={{ fontSize: 9 }}>
                {own ? '★'.repeat(own.stars) : RARITY[c.rarity].label}
              </T>
              {own && (
                <T variant="caption" color={colors.textFaint} style={{ fontSize: 10 }}>
                  +{Math.round(companionXpBonus(c, own.stars) * 100)}% XP
                </T>
              )}
            </Pressable>
          );
        })}
      </View>
      <T variant="caption" color={colors.textFaint} style={styles.footnote}>
        Rates: Legendary 1.5% · Epic 8.5% · Rare 30% · Common 60%. Duplicates add a ★ (max 5), each
        worth +2% XP.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg },
  banner: { borderRadius: radius.lg, overflow: 'hidden', padding: space.lg, gap: space.lg },
  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  buttons: { flexDirection: 'row', gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    width: '31%',
    flexGrow: 1,
    maxWidth: '33%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileActive: { borderColor: colors.accent },
  footnote: { marginTop: space.lg, textAlign: 'center', lineHeight: 18 },
});
