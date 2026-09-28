import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CompanionHero } from '@/components/companion-hero';
import { Screen } from '@/components/screen';
import { WorkoutRow } from '@/components/workout-row';
import { Button, Card, GemCount, SectionHeader, Stat, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { TEMPLATES } from '@/lib/exercises';
import { formatDuration, greeting } from '@/lib/format';
import { useGymmy } from '@/store/gymmy';
import { useProgress } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Today() {
  const name = useGymmy((s) => s.profile?.name ?? '');
  const gems = useGymmy((s) => s.gems);
  const workouts = useGymmy((s) => s.workouts);
  const startWorkout = useGymmy((s) => s.startWorkout);
  const { streak, thisWeek, goal, activeDays } = useProgress();
  const now = useNow(60_000);
  const today = (new Date(now).getDay() + 6) % 7;

  const start = (opts?: Parameters<typeof startWorkout>[0]) => {
    startWorkout(opts);
    router.push('/workout');
  };

  return (
    <Screen
      header={
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <T variant="caption" color={colors.textDim}>
              {greeting(now)},
            </T>
            <T variant="hero" numberOfLines={1}>
              {name} 👋
            </T>
          </View>
          <GemCount gems={gems} />
        </View>
      }>
      <CompanionHero />

      <Card style={styles.weekCard}>
        <View style={styles.statsRow}>
          <Stat value={`🔥 ${streak}w`} label="Streak" color={colors.flame} />
          <Stat
            value={`${thisWeek}/${goal}`}
            label="This week"
            color={thisWeek >= goal ? colors.accent : colors.text}
          />
          <Stat value={`${workouts.length}`} label="Workouts" />
        </View>
        <View style={styles.days}>
          {DAYS.map((d, i) => {
            const done = activeDays.has(i);
            return (
              <View key={i} style={styles.dayCol}>
                <View
                  style={[
                    styles.day,
                    done && styles.dayDone,
                    i === today && !done && styles.dayToday,
                  ]}>
                  <T variant="caption" color={done ? colors.accentInk : colors.textDim}>
                    {done ? '✓' : d}
                  </T>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <ActiveOrStart onStart={() => start()} />

      <SectionHeader title="Quick start" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.templates}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}>
        {TEMPLATES.map((t) => (
          <Card
            key={t.id}
            style={styles.template}
            onPress={() => start({ name: t.name, exerciseIds: t.exerciseIds })}>
            <T variant="heading">{t.name}</T>
            <T variant="caption" color={colors.textDim}>
              {t.blurb}
            </T>
            <T variant="caption" color={colors.accent} style={{ marginTop: space.sm }}>
              {t.exerciseIds.length} exercises →
            </T>
          </Card>
        ))}
      </ScrollView>

      {workouts.length > 0 && (
        <>
          <SectionHeader title="Recent" />
          {workouts.slice(0, 3).map((w) => (
            <WorkoutRow key={w.id} workout={w} />
          ))}
        </>
      )}
    </Screen>
  );
}

function ActiveOrStart({ onStart }: { onStart: () => void }) {
  const active = useGymmy((s) => s.active);
  const now = useNow();
  if (active) {
    return (
      <Button
        size="lg"
        icon={{ ios: 'play.fill', web: 'play_arrow' }}
        title={`Resume · ${formatDuration(now - active.startedAt)}`}
        onPress={() => router.push('/workout')}
        style={styles.cta}
      />
    );
  }
  return (
    <Button
      size="lg"
      icon={{ ios: 'bolt.fill', web: 'bolt' }}
      title="Start empty workout"
      onPress={onStart}
      style={styles.cta}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg, gap: space.md },
  weekCard: { marginTop: space.md, gap: space.lg },
  statsRow: { flexDirection: 'row' },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center' },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  dayDone: { backgroundColor: colors.accent },
  dayToday: { borderWidth: 2, borderColor: colors.accent },
  cta: { marginTop: space.lg },
  templates: { marginHorizontal: -space.lg },
  template: { width: 170, gap: 2, borderRadius: radius.md },
});
