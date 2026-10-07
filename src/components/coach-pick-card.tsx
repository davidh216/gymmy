import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, Card, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { coachPick, groupList } from '@/lib/coach-review';
import { getCompanion } from '@/lib/companions';
import { TEMPLATES } from '@/lib/exercises';
import { muscleRecovery } from '@/lib/recovery';
import { useCompanionName, useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

/** Off a plan, the buddy suggests today's session from what's recovered. */
export function CoachPickCard() {
  const onPlan = useGymmy((s) => s.plan !== null);
  const hasWorkouts = useGymmy((s) => s.workouts.length > 0);
  const active = useGymmy((s) => s.active !== null);
  if (onPlan || !hasWorkouts || active) return null;
  return <Pick />;
}

function Pick() {
  const now = useNow(15 * 60_000);
  const workouts = useGymmy((s) => s.workouts);
  const saved = useGymmy((s) => s.templates);
  const companionId = useGymmy((s) => s.companionId);
  const buddy = useCompanionName(companionId);
  const startWorkout = useGymmy((s) => s.startWorkout);
  const pick = coachPick([...TEMPLATES, ...saved], muscleRecovery(workouts, now));
  if (!pick) return null;

  const detail =
    pick.kind === 'rest'
      ? `${groupList(pick.sore)} still need time. Rest, walk or stretch today.`
      : [
          pick.fresh.length ? `${groupList(pick.fresh)} ${pick.fresh.length === 1 ? 'is' : 'are'} fresh.` : '',
          pick.sore.length ? `${groupList(pick.sore)} can rest.` : '',
        ]
          .filter(Boolean)
          .join(' ') || 'You’re recovered across the board.';

  return (
    <Card style={styles.card} testID="coach-pick">
      <View style={styles.top}>
        <CompanionAvatar companion={getCompanion(companionId)} size={40} ring={false} />
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="caption" color={colors.accent}>
            {buddy}’s pick for today
          </T>
          <T variant="heading">{pick.kind === 'rest' ? 'Recovery day' : pick.name}</T>
          <T variant="caption" color={colors.textDim}>
            {detail}
          </T>
        </View>
      </View>
      {pick.kind === 'session' && (
        <Button
          title={`Start ${pick.name}`}
          icon={{ ios: 'play.fill', web: 'play_arrow' }}
          variant="secondary"
          onPress={() => {
            startWorkout({ name: pick.name, exerciseIds: pick.exerciseIds });
            router.push('/workout');
          }}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, marginTop: space.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
});
