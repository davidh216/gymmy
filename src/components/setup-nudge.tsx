import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, Card, T, haptic } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { getCompanion } from '@/lib/companions';
import { nextNudge, suggestTrainingDays, type NudgeId } from '@/lib/nudges';
import { connectHealth, healthSupported } from '@/services/health';
import { allowReminders } from '@/services/reminders';
import { useCompanionName, useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** An hour before you usually start, between 6 AM and 9 PM. */
function usualReminderHour(starts: number[]): number {
  if (!starts.length) return 18;
  const hours = starts.map((t) => new Date(t).getHours()).sort((a, b) => a - b);
  const median = hours[Math.floor(hours.length / 2)];
  return Math.max(6, Math.min(21, median - 1));
}

/**
 * After the first few workouts, one setup question at a time on Today: reminders, Apple Health,
 * then height and weight for calorie estimates. Each shows once and is easy to wave off.
 */
export function SetupNudge() {
  const now = useNow(60 * 60_000);
  const workouts = useGymmy((s) => s.workouts);
  const seen = useGymmy((s) => s.nudgesSeen);
  const reminders = useGymmy((s) => s.reminders);
  const healthOn = useGymmy((s) => s.health.enabled);
  const hasBody = useGymmy((s) => Boolean(s.profile?.body?.heightCm) && Object.keys(s.weighIns).length > 0);
  const ios = Platform.OS === 'ios';
  const { data: health } = useQuery({ queryKey: ['health', 'supported'], queryFn: healthSupported, enabled: ios });

  const id = nextNudge({
    workouts: workouts.filter((w) => w.source !== 'health').length,
    seen,
    now,
    available: { reminders: ios, health: ios && health === true, body: true },
    done: {
      reminders: Boolean(reminders.training || reminders.weighIn || reminders.recap),
      health: healthOn,
      body: hasBody,
    },
  });
  if (!id) return null;
  return <Nudge id={id} />;
}

function Nudge({ id }: { id: NudgeId }) {
  const companionId = useGymmy((s) => s.companionId);
  const buddy = useCompanionName(companionId);
  const workouts = useGymmy((s) => s.workouts);
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);
  const { seeNudge, setReminders } = useGymmy.getState();
  const connect = useMutation({
    mutationFn: connectHealth,
    onSuccess: () => {
      haptic('success');
      seeNudge('health');
    },
  });

  const mine = workouts.filter((w) => w.source !== 'health');
  const days = suggestTrainingDays(
    mine.map((w) => w.startedAt),
    goal,
  );
  const hour = usualReminderHour(mine.map((w) => w.startedAt));
  const later = () => seeNudge(id);

  let title: string;
  let body: string;
  let primary: { title: string; onPress: () => void; busy?: boolean };
  let secondary: { title: string; onPress: () => void } | undefined;

  if (id === 'reminders') {
    const when = new Date(2026, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric' });
    title = `Want ${buddy} to nudge you?`;
    body = `A reminder on ${days.map((d) => DAY_NAMES[d]).join(', ')} at ${when}, skipped when you’ve already trained.`;
    primary = {
      title: 'Remind me',
      onPress: async () => {
        if (await allowReminders()) {
          haptic('success');
          setReminders({ training: { days, hour, minute: 0 } });
        }
        seeNudge('reminders');
      },
    };
    secondary = {
      title: 'Choose days',
      onPress: () => {
        seeNudge('reminders');
        router.push('/reminders');
      },
    };
  } else if (id === 'health') {
    title = 'Connect Apple Health?';
    body =
      'Your sleep fills in check-ins, Watch runs and rides join your log, and Gymmy workouts count in Fitness, with calories.';
    primary = {
      title: connect.isPending ? 'Connecting…' : 'Connect',
      onPress: () => connect.mutate(),
      busy: connect.isPending,
    };
  } else {
    title = 'See calories burned?';
    body = 'Add your height and weight and every workout shows an estimate. Age and sex make it closer.';
    primary = {
      title: 'Add details',
      onPress: () => {
        seeNudge('body');
        router.push('/weight');
      },
    };
  }

  return (
    <Card style={styles.card} testID={`nudge-${id}`}>
      <View style={styles.top}>
        <CompanionAvatar companion={getCompanion(companionId)} size={36} ring={false} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.titleRow}>
            <T variant="heading" style={{ flex: 1 }}>
              {title}
            </T>
            <Pressable onPress={later} hitSlop={10} accessibilityRole="button" testID="nudge-later">
              <T variant="caption" color={colors.textFaint}>
                Not now
              </T>
            </Pressable>
          </View>
          <T variant="caption" color={colors.textDim}>
            {body}
          </T>
        </View>
      </View>
      {connect.error && (
        <T variant="caption" color={colors.danger}>
          {connect.error.message}
        </T>
      )}
      <View style={styles.actions}>
        <Button title={primary.title} onPress={primary.onPress} disabled={primary.busy} style={{ flex: 1 }} />
        {secondary && <Button title={secondary.title} variant="secondary" onPress={secondary.onPress} />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, marginTop: space.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
