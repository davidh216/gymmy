import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { BackHeader } from '@/components/back-header';
import { ReadinessCard } from '@/components/readiness-card';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, ProgressBar, SectionHeader, T, haptic } from '@/components/ui';
import { formatDate } from '@/lib/format';
import {
  RATING_LABELS,
  RECOVERY_ACTIVITIES,
  muscleRecovery,
  recentCheckIns,
  type CheckIn,
  type Rating,
} from '@/lib/recovery';
import { lastNightSleep } from '@/services/health';
import { CHECK_IN_GEMS, useGymmy } from '@/store/gymmy';
import { useReadiness } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

type RatingField = keyof typeof RATING_LABELS;

const RATING_TITLES: Record<RatingField, string> = {
  soreness: 'Soreness',
  energy: 'Energy',
  stress: 'Stress',
};

export default function RecoveryScreen() {
  const { today, now } = useReadiness();
  const workouts = useGymmy((s) => s.workouts);
  const checkIns = useGymmy((s) => s.checkIns);
  const saveCheckIn = useGymmy((s) => s.saveCheckIn);

  const healthOn = useGymmy((s) => s.health.enabled);
  const { data: healthSleep } = useQuery({
    queryKey: ['health', 'sleep', today?.date ?? 'today'],
    queryFn: lastNightSleep,
    enabled: healthOn,
    staleTime: 15 * 60 * 1000,
  });
  // What you set wins; otherwise Apple Health's number, then a typical night.
  const [sleepEdit, setSleep] = useState<number | undefined>(today?.sleepHours);
  const fromHealth = sleepEdit === undefined && typeof healthSleep === 'number';
  const sleep = sleepEdit ?? (fromHealth ? healthSleep : 7.5);
  const [ratings, setRatings] = useState<Partial<Record<RatingField, Rating>>>({
    soreness: today?.soreness,
    energy: today?.energy,
    stress: today?.stress,
  });
  const [rest, setRest] = useState(today?.rest ?? false);
  const [activities, setActivities] = useState<string[]>(today?.activities ?? []);
  const [saved, setSaved] = useState<{ xp: number; gems: number } | null>(null);

  const save = () => {
    const reward = saveCheckIn({ sleepHours: sleep, ...ratings, rest, activities });
    haptic('success');
    setSaved(reward);
  };

  const muscles = muscleRecovery(workouts, now);
  const history = recentCheckIns(checkIns, now, 7);

  return (
    <Screen header={<BackHeader title="Recovery" subtitle={formatDate(now)} />}>
      <ReadinessCard />

      <SectionHeader title={today ? 'Today’s check-in' : 'Check in'} />
      <Card style={{ gap: space.lg }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <T variant="heading">Sleep</T>
            <T variant="caption" color={fromHealth ? colors.accent : colors.textDim}>
              {fromHealth ? 'Last night · from Apple Health' : 'Last night'}
            </T>
          </View>
          <Stepper value={sleep} onChange={setSleep} />
        </View>

        {(Object.keys(RATING_LABELS) as RatingField[]).map((field) => (
          <View key={field} style={{ gap: space.sm }}>
            <View style={styles.row}>
              <T variant="heading" style={{ flex: 1 }}>
                {RATING_TITLES[field]}
              </T>
              <T variant="caption" color={colors.textDim}>
                {ratings[field] ? RATING_LABELS[field][ratings[field]! - 1] : 'Tap to rate'}
              </T>
            </View>
            <View style={styles.scale}>
              {([1, 2, 3, 4, 5] as Rating[]).map((r) => {
                const on = ratings[field] === r;
                return (
                  <Pressable
                    key={r}
                    accessibilityRole="button"
                    accessibilityLabel={`${RATING_TITLES[field]}: ${RATING_LABELS[field][r - 1]}`}
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      haptic();
                      setRatings((s) => ({ ...s, [field]: r }));
                    }}
                    style={[styles.dot, on && styles.dotOn]}>
                    <T variant="heading" color={on ? colors.accentInk : colors.textDim}>
                      {r}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <T variant="heading">Rest day</T>
            <T variant="caption" color={colors.textDim}>
              A planned day off. It never breaks your streak.
            </T>
          </View>
          <Switch value={rest} onValueChange={setRest} trackColor={{ true: colors.accent, false: colors.cardHigh }} />
        </View>

        <View style={{ gap: space.sm }}>
          <T variant="heading">Recovery work</T>
          <View style={styles.chips}>
            {RECOVERY_ACTIVITIES.map((a) => (
              <Chip
                key={a.id}
                label={`${a.emoji} ${a.label}`}
                active={activities.includes(a.id)}
                onPress={() =>
                  setActivities((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]))
                }
              />
            ))}
          </View>
        </View>

        {saved && (
          <Animated.View entering={ZoomIn.springify()}>
            <T variant="body" color={colors.accent} style={{ textAlign: 'center' }}>
              {saved.gems ? `Saved! +${saved.xp} XP · +${saved.gems} 💎` : 'Check-in updated ✓'}
            </T>
          </Animated.View>
        )}
        <Button
          size="lg"
          title={today ? 'Update check-in' : `Save check-in · +${CHECK_IN_GEMS} 💎`}
          onPress={save}
        />
      </Card>

      <SectionHeader title="Muscle recovery" />
      <Card style={{ gap: space.md }}>
        {muscles.map((m) => (
          <View key={m.group} style={{ gap: 4 }}>
            <View style={styles.row}>
              <T variant="body" style={{ flex: 1, textTransform: 'capitalize' }}>
                {m.group}
              </T>
              <T variant="caption" color={statusColor(m.recovered)}>
                {m.recovered >= 0.9 ? 'Fresh' : m.recovered >= 0.6 ? 'Recovering' : 'Fatigued'} · {Math.round(m.recovered * 100)}%
              </T>
            </View>
            <ProgressBar progress={m.recovered} height={6} color={statusColor(m.recovered)} />
          </View>
        ))}
        <T variant="caption" color={colors.textFaint}>
          Estimated from your sets over the last few days. Big muscles take longer to bounce back.
        </T>
      </Card>

      {history.length > 0 && (
        <>
          <SectionHeader title="Last 7 days" />
          {history.map((c) => (
            <HistoryRow key={c.date} checkIn={c} />
          ))}
        </>
      )}
    </Screen>
  );
}

function statusColor(recovered: number) {
  return recovered >= 0.9 ? colors.accent : recovered >= 0.6 ? colors.flame : colors.danger;
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const step = (d: number) => {
    haptic();
    onChange(Math.min(14, Math.max(0, value + d)));
  };
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => step(-0.5)} style={styles.stepBtn} accessibilityLabel="Less sleep" hitSlop={6}>
        <T variant="heading">−</T>
      </Pressable>
      <T variant="title" style={{ minWidth: 64, textAlign: 'center' }}>
        {value}h
      </T>
      <Pressable onPress={() => step(0.5)} style={styles.stepBtn} accessibilityLabel="More sleep" hitSlop={6}>
        <T variant="heading">+</T>
      </Pressable>
    </View>
  );
}

function HistoryRow({ checkIn }: { checkIn: CheckIn }) {
  const [y, m, d] = checkIn.date.split('-').map(Number);
  const emojis = checkIn.activities
    .map((id) => RECOVERY_ACTIVITIES.find((a) => a.id === id)?.emoji)
    .filter(Boolean)
    .join(' ');
  const parts = [
    checkIn.sleepHours !== undefined ? `😴 ${checkIn.sleepHours}h` : null,
    checkIn.energy ? `⚡ ${RATING_LABELS.energy[checkIn.energy - 1]}` : null,
    checkIn.soreness ? `🦵 ${RATING_LABELS.soreness[checkIn.soreness - 1]}` : null,
  ].filter(Boolean);
  return (
    <Card style={[styles.row, { marginBottom: space.sm }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="heading">{formatDate(new Date(y, m - 1, d).getTime())}</T>
        <T variant="caption" color={colors.textDim}>
          {parts.join(' · ')}
        </T>
        {emojis ? <T variant="caption">{emojis}</T> : null}
      </View>
      {checkIn.rest && (
        <View style={styles.badge}>
          <T variant="label" color={colors.textDim}>
            💤 Rest
          </T>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  scale: { flexDirection: 'row', gap: space.sm },
  dot: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: colors.accent },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.cardHigh },
});
