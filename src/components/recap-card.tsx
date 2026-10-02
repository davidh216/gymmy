import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Icon, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { formatVolume } from '@/lib/format';
import { hasActivity, recapHeadline, shiftWeek, weekLabel, weekRecap } from '@/lib/recap';
import { weekStart } from '@/lib/streaks';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Days into the week (Monday = 0) that last week's recap stays on Today. */
const SHOW_UNTIL_DAY = 3;

/** Last week's recap, shown on Today early in the week until opened or dismissed. */
export function RecapCard() {
  const now = useNow(60_000);
  const workouts = useGymmy((s) => s.workouts);
  const checkIns = useGymmy((s) => s.checkIns);
  const claimedMilestones = useGymmy((s) => s.claimedMilestones);
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const recapSeen = useGymmy((s) => s.recapSeen);
  const seeRecap = useGymmy((s) => s.seeRecap);

  const start = shiftWeek(weekStart(now), -1);
  const dayOfWeek = (new Date(now).getDay() + 6) % 7;
  if (dayOfWeek >= SHOW_UNTIL_DAY || recapSeen >= start) return null;
  const r = weekRecap({
    start,
    workouts,
    checkIns,
    claimedMilestones,
    weeklyGoal: goal,
  });
  if (!hasActivity(r)) return null;

  const bits = [
    `${r.days}/${r.goal} days`,
    r.volumeKg ? formatVolume(r.volumeKg, units) : `${r.sets} sets`,
    r.prs.length ? `${r.prs.length} 🏆` : undefined,
  ].filter(Boolean);

  return (
    <Card
      style={styles.card}
      onPress={() => {
        seeRecap(start);
        router.push({ pathname: '/recap', params: { week: String(start) } });
      }}>
      <T style={{ fontSize: 30 }}>{r.goalHit ? '🏅' : '📅'}</T>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <T variant="label" color={colors.accent}>
          Your week · {weekLabel(start)}
        </T>
        <T variant="heading" numberOfLines={2}>
          {recapHeadline(r)}
        </T>
        <T variant="caption" color={colors.textDim} numberOfLines={1}>
          {bits.join(' · ')}
        </T>
      </View>
      <Pressable
        onPress={() => seeRecap(start)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Dismiss weekly recap"
        style={styles.close}>
        <Icon name={{ ios: 'xmark', web: 'close' }} size={14} color={colors.textFaint} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.lg,
  },
  close: { alignSelf: 'flex-start', padding: 2 },
});
