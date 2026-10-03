import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionAvatar } from '@/components/companion-avatar';
import { MilestoneBanner } from '@/components/milestone-banner';
import { SaveTemplateButton } from '@/components/save-template-button';
import { Button, Card, ProgressBar, SectionHeader, Stat, T } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { getCompanion } from '@/lib/companions';
import { getExercise } from '@/lib/exercises';
import {
  formatDate,
  formatMinutes,
  formatScore,
  formatSet,
  formatVolume,
} from '@/lib/format';
import { levelFromXp } from '@/lib/progression';
import { completedSets, volume } from '@/lib/records';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const { id, celebrate } = useLocalSearchParams<{ id: string; celebrate?: string }>();
  const workout = useGymmy((s) => s.workouts.find((w) => w.id === id));
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const totalXp = useGymmy((s) => s.xp);
  const rewards = useGymmy((s) => s.lastRewards);
  const hasActive = useGymmy((s) => s.active !== null);
  const { deleteWorkout, startWorkout } = useGymmy.getState();

  if (!workout) {
    return (
      <View style={[styles.root, styles.center]}>
        <T variant="heading">Workout not found</T>
        <Button title="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const isCelebration = celebrate === '1';
  const companion = getCompanion(workout.companionId);
  const vol = volume(workout.exercises);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xxl },
        ]}>
        {isCelebration ? (
          <Celebration
            xpBefore={totalXp - workout.xp}
            xpAfter={totalXp}
            gained={workout.xp}
            gems={workout.gems}
            companion={companion}
          />
        ) : (
          <View style={{ gap: 4, marginBottom: space.lg }}>
            <T variant="caption" color={colors.textDim}>
              {formatDate(workout.endedAt)}
            </T>
            <T variant="hero">{workout.name}</T>
          </View>
        )}

        {isCelebration && (
          <View style={{ marginBottom: space.md }}>
            <MilestoneBanner />
          </View>
        )}

        <Card style={styles.stats}>
          <Stat value={formatMinutes(workout.endedAt - workout.startedAt)} label="Duration" />
          <Stat value={String(completedSets(workout.exercises))} label="Sets" />
          <Stat value={vol > 0 ? formatVolume(vol, units) : '—'} label="Volume" />
        </Card>

        {isCelebration && rewards && (
          <>
            <SectionHeader title="Rewards" />
            <Card style={{ gap: space.sm }}>
              {rewards.lines.map((l, i) => (
                <Animated.View key={l.label} entering={FadeInDown.delay(600 + i * 120)} style={styles.rewardRow}>
                  <T variant="body" style={{ flex: 1 }}>
                    {l.label}
                  </T>
                  {l.xp ? (
                    <T variant="caption" color={colors.accent}>
                      +{l.xp} XP
                    </T>
                  ) : null}
                  {l.gems ? (
                    <T variant="caption" color={colors.gem}>
                      +{l.gems} 💎
                    </T>
                  ) : null}
                </Animated.View>
              ))}
            </Card>
          </>
        )}

        {workout.prs.length > 0 && (
          <>
            <SectionHeader title="Personal records" />
            {workout.prs.map((pr) => {
              const ex = getExercise(pr.exerciseId);
              return (
                <Card key={pr.exerciseId} style={styles.prCard}>
                  <T style={{ fontSize: 28 }}>🏆</T>
                  <View style={{ flex: 1 }}>
                    <T variant="heading">{ex.name}</T>
                    <T variant="caption" color={colors.textDim}>
                      {ex.kind === 'weight' ? 'Est. 1RM ' : 'Best '}
                      {formatScore(ex.kind, pr.value, units)} · was {formatScore(ex.kind, pr.previous, units)}
                    </T>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        <SectionHeader title="Exercises" />
        {workout.exercises.map((we) => {
          const ex = getExercise(we.exerciseId);
          return (
            <Card key={we.id} style={{ gap: 6, marginBottom: space.sm }}>
              <T variant="heading">{ex.name}</T>
              {we.sets.map((s, i) => (
                <View key={s.id} style={styles.setLine}>
                  <T variant="caption" color={colors.textFaint} style={{ width: 24 }}>
                    {i + 1}
                  </T>
                  <T variant="body">{formatSet(s, ex.kind, units, { pace: true })}</T>
                </View>
              ))}
            </Card>
          );
        })}

        <View style={styles.actions}>
          {isCelebration ? (
            <>
              <Button size="lg" title="Done" onPress={() => router.back()} />
              <SaveTemplateButton name={workout.name} exerciseIds={workout.exercises.map((e) => e.exerciseId)} />
            </>
          ) : (
            <>
              <Button
                size="lg"
                title="Repeat this workout"
                icon={{ ios: 'arrow.clockwise', web: 'refresh' }}
                disabled={hasActive}
                onPress={() => {
                  startWorkout({ name: workout.name, exerciseIds: workout.exercises.map((e) => e.exerciseId) });
                  router.replace('/workout');
                }}
              />
              <SaveTemplateButton name={workout.name} exerciseIds={workout.exercises.map((e) => e.exerciseId)} />
              <Button
                title="Delete workout"
                variant="danger"
                onPress={() =>
                  confirm('Delete workout?', "XP and gems you've earned are kept.", 'Delete', () => {
                    router.back();
                    deleteWorkout(workout.id);
                  })
                }
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


function Celebration({
  xpBefore,
  xpAfter,
  gained,
  gems,
  companion,
}: {
  xpBefore: number;
  xpAfter: number;
  gained: number;
  gems: number;
  companion: ReturnType<typeof getCompanion>;
}) {
  const before = levelFromXp(xpBefore);
  const after = levelFromXp(xpAfter);
  const leveledUp = after.level > before.level;
  const [progress, setProgress] = useState(leveledUp ? 0 : before.into / before.needed);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(after.into / after.needed), 500);
    const started = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / 900);
      setCount(Math.round(gained * p));
      if (p >= 1) clearInterval(id);
    }, 30);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [after.into, after.needed, gained]);

  return (
    <View style={styles.celebration}>
      <Animated.View entering={ZoomIn.springify().damping(8)}>
        <CompanionAvatar companion={companion} size={120} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200)} style={{ alignItems: 'center', gap: 4 }}>
        <T variant="label" color={colors.accent}>
          Workout complete
        </T>
        <T style={styles.bigXp}>+{count} XP</T>
        <T variant="heading" color={colors.gem}>
          +{gems} 💎
        </T>
      </Animated.View>
      {leveledUp && (
        <Animated.View entering={ZoomIn.delay(700).springify()} style={styles.levelUp}>
          <T variant="heading" color={colors.accentInk}>
            ⚡ LEVEL UP → {after.level}
          </T>
        </Animated.View>
      )}
      <View style={{ width: '100%', gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="label" color={colors.textDim}>
            Level {after.level}
          </T>
          <T variant="caption" color={colors.textFaint}>
            {after.into} / {after.needed}
          </T>
        </View>
        <ProgressBar progress={progress} height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.md },
  content: { paddingHorizontal: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' },
  stats: { flexDirection: 'row' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  prCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  setLine: { flexDirection: 'row', alignItems: 'center' },
  actions: { marginTop: space.xl, gap: space.md },
  celebration: { alignItems: 'center', gap: space.lg, marginBottom: space.xl },
  bigXp: { fontSize: 52, fontWeight: '900', color: colors.text, letterSpacing: -1.5 },
  levelUp: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
