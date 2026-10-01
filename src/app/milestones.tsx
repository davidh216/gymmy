import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Button, Card, ProgressBar, SectionHeader, T, haptic } from '@/components/ui';
import {
  MILESTONE_CATEGORIES,
  formatMilestoneValue,
  milestoneDetail,
  visibleMilestones,
  type MilestoneState,
} from '@/lib/milestones';
import { useGymmy } from '@/store/gymmy';
import { useMilestones } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

export default function MilestonesScreen() {
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const claimMilestones = useGymmy((s) => s.claimMilestones);
  const { all, ready, earned } = useMilestones();
  const [last, setLast] = useState<{ xp: number; gems: number } | null>(null);
  const visible = visibleMilestones(all);
  const trophies = all.filter((m) => m.claimedAt).sort((a, b) => b.claimedAt! - a.claimedAt!);

  const claim = (ids: string[]) => {
    const got = claimMilestones(ids);
    if (got.xp || got.gems) {
      haptic('success');
      setLast(got);
    }
  };

  return (
    <Screen
      header={
        <BackHeader
          title="Milestones"
          subtitle={`${earned} of ${all.length} earned`}
        />
      }>
      {last && (
        <Animated.View entering={ZoomIn.springify()} key={`${last.xp}-${last.gems}-${earned}`}>
          <Card style={styles.claimed}>
            <T style={{ fontSize: 32 }}>🎉</T>
            <View style={{ flex: 1 }}>
              <T variant="heading">Rewards claimed</T>
              <T variant="body" color={colors.textDim}>
                <T variant="body" color={colors.accent}>
                  +{last.xp} XP
                </T>
                {'  '}
                <T variant="body" color={colors.gem}>
                  +{last.gems} 💎
                </T>
              </T>
            </View>
          </Card>
        </Animated.View>
      )}

      {ready.length > 1 && (
        <Button
          size="lg"
          title={`Claim all ${ready.length} · +${ready.reduce((n, m) => n + m.gems, 0)} 💎`}
          onPress={() => claim(ready.map((m) => m.id))}
          style={{ marginBottom: space.md }}
        />
      )}

      {MILESTONE_CATEGORIES.map((category) => {
        const items = order(visible.filter((m) => m.category === category));
        if (items.length === 0) return null;
        return (
          <View key={category}>
            <SectionHeader title={category} />
            {items.map((m, i) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(Math.min(i, 6) * 40)}>
                <MilestoneRow m={m} units={units} onClaim={() => claim([m.id])} />
              </Animated.View>
            ))}
          </View>
        );
      })}

      {trophies.length > 0 && (
        <>
          <SectionHeader title={`Earned · ${trophies.length}`} />
          <View style={styles.shelf}>
            {trophies.map((m) => (
              <View key={m.id} style={styles.trophy}>
                <T style={{ fontSize: 18 }}>{m.icon}</T>
                <T variant="caption" numberOfLines={1}>
                  {m.title}
                </T>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

/** Claimable first, then in progress (closest first), then claimed. */
function order(items: MilestoneState[]): MilestoneState[] {
  const rank = (m: MilestoneState) => (m.achieved && !m.claimedAt ? 0 : !m.achieved ? 1 : 2);
  return [...items].sort(
    (a, b) => rank(a) - rank(b) || (rank(a) === 1 ? b.value / b.target - a.value / a.target : 0),
  );
}

function MilestoneRow({ m, units, onClaim }: { m: MilestoneState; units: 'kg' | 'lb'; onClaim: () => void }) {
  const ready = m.achieved && !m.claimedAt;
  const progress = Math.min(1, m.value / m.target);
  return (
    <Card style={[styles.row, ready && styles.rowReady, m.claimedAt ? styles.rowDone : null]}>
      <View style={[styles.icon, ready && { backgroundColor: 'rgba(198,255,61,0.14)' }]}>
        <T style={{ fontSize: 24, opacity: m.achieved ? 1 : 0.45 }}>{m.icon}</T>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <T variant="heading" numberOfLines={1}>
          {m.title}
        </T>
        <T variant="caption" color={colors.textDim} numberOfLines={2}>
          {milestoneDetail(m, units)}
        </T>
        {!m.achieved && (
          <View style={styles.progress}>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={progress} height={6} />
            </View>
            <T variant="caption" color={colors.textFaint}>
              {formatMilestoneValue(m.format, Math.floor(m.value), units)} / {formatMilestoneValue(m.format, m.target, units)}
            </T>
          </View>
        )}
        <T variant="caption" color={colors.textFaint}>
          <T variant="caption" color={m.claimedAt ? colors.textFaint : colors.accent}>
            +{m.xp} XP
          </T>
          {'  '}
          <T variant="caption" color={m.claimedAt ? colors.textFaint : colors.gem}>
            +{m.gems} 💎
          </T>
        </T>
      </View>
      {ready ? (
        <Button title="Claim" onPress={onClaim} />
      ) : m.claimedAt ? (
        <T variant="heading" color={colors.accent}>
          ✓
        </T>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  claimed: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  rowReady: { borderWidth: 1, borderColor: colors.accent },
  rowDone: { opacity: 0.7 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  shelf: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  trophy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    maxWidth: '100%',
  },
});
