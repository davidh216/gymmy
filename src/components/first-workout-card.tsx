import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, Card, T } from '@/components/ui';
import { getCompanion } from '@/lib/companions';
import { TEMPLATES, templateBlurb } from '@/lib/exercises';
import { planProgress } from '@/lib/programs';
import { useCompanionName, useGymmy } from '@/store/gymmy';
import { useProgram } from '@/store/selectors';
import { colors, space } from '@/theme';

/**
 * Until the first workout is logged, Today leads with one clear next step chosen from
 * onboarding: day 1 of the plan you picked, a full-body session, or an empty workout.
 */
export function FirstWorkoutCard() {
  const hasWorkouts = useGymmy((s) => s.workouts.length > 0);
  const active = useGymmy((s) => s.active !== null);
  if (hasWorkouts || active) return null;
  return <FirstWorkout />;
}

function FirstWorkout() {
  const companionId = useGymmy((s) => s.companionId);
  const buddy = useCompanionName(companionId);
  const focus = useGymmy((s) => s.profile?.focus);
  const plan = useGymmy((s) => s.plan);
  const startWorkout = useGymmy((s) => s.startWorkout);
  const startPlanSession = useGymmy((s) => s.startPlanSession);
  const program = useProgram(plan?.programId);

  const next = program && plan ? planProgress(program, [], plan.startedAt).next : null;
  const session = program && next ? program.week(next.week)[next.session - 1] : undefined;
  const fullBody = TEMPLATES.find((t) => t.id === 'full');

  let title: string;
  let detail: string;
  let cta: string;
  let start: () => void;
  if (program && next && session) {
    title = `${program.name}: day 1`;
    detail = session.name;
    cta = 'Start day 1';
    start = () => startPlanSession({ programId: program.id, ...next });
  } else if (focus === 'consistency' && fullBody) {
    title = 'A full-body session';
    detail = templateBlurb(fullBody.exerciseIds);
    cta = 'Start full body';
    start = () => startWorkout({ name: fullBody.name, exerciseIds: fullBody.exerciseIds });
  } else {
    title = 'Log your first workout';
    detail = 'Add exercises as you go. Tick each set when it’s done.';
    cta = 'Start your first workout';
    start = () => startWorkout();
  }

  return (
    <Animated.View entering={FadeInDown}>
      <Card style={styles.card} testID="first-workout">
        <View style={styles.top}>
          <CompanionAvatar companion={getCompanion(companionId)} size={44} ring={false} />
          <View style={{ flex: 1 }}>
            <T variant="caption" color={colors.accent}>
              {buddy}: let’s get the first one in
            </T>
            <T variant="heading">{title}</T>
            <T variant="caption" color={colors.textDim} numberOfLines={2}>
              {detail}
            </T>
          </View>
        </View>
        <Button
          size="lg"
          icon={{ ios: 'play.fill', web: 'play_arrow' }}
          title={cta}
          onPress={() => {
            start();
            router.push('/workout');
          }}
        />
        <T variant="caption" color={colors.textFaint} style={{ textAlign: 'center' }}>
          Finish it to earn XP, level up {buddy} and start your streak.
        </T>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, marginTop: space.md, borderColor: colors.accent, borderWidth: 1.5 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
