import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Button, Card, Icon, SectionHeader, T, haptic } from '@/components/ui';
import { DEFAULT_TRAINING, type ReminderSettings } from '@/lib/reminders';
import { allowReminders, remindersAllowed } from '@/services/reminders';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime = (hour: number, minute: number) =>
  new Date(2026, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** Training-day, weigh-in and weekly recap reminders. */
export default function RemindersScreen() {
  const reminders = useGymmy((s) => s.reminders);
  const setReminders = useGymmy((s) => s.setReminders);
  const weighInOn = useGymmy((s) => Boolean(s.profile?.weightReview?.enabled));
  const queryClient = useQueryClient();
  const { data: allowed } = useQuery({ queryKey: ['reminders', 'allowed'], queryFn: remindersAllowed });
  const [blocked, setBlocked] = useState(false);

  /** Turning one on asks for permission first; nothing changes if it's refused. */
  const turnOn = async (patch: Partial<ReminderSettings>) => {
    const ok = await allowReminders();
    queryClient.invalidateQueries({ queryKey: ['reminders', 'allowed'] });
    if (!ok) {
      setBlocked(true);
      return;
    }
    haptic('success');
    setReminders(patch);
  };

  const training = reminders.training;
  const shiftTime = (by: number) => {
    if (!training) return;
    const minutes = (training.hour * 60 + training.minute + by + 24 * 60) % (24 * 60);
    setReminders({ training: { ...training, hour: Math.floor(minutes / 60), minute: minutes % 60 } });
  };
  const toggleDay = (d: number) => {
    if (!training) return;
    const days = training.days.includes(d) ? training.days.filter((x) => x !== d) : [...training.days, d].sort();
    setReminders({ training: { ...training, days } });
  };

  if (Platform.OS !== 'ios') {
    return (
      <Screen header={<BackHeader title="Reminders" />}>
        <T variant="body" color={colors.textDim}>
          Reminders work in the iPhone app.
        </T>
      </Screen>
    );
  }

  const anyOn = Boolean(training || reminders.weighIn || reminders.recap);

  return (
    <Screen header={<BackHeader title="Reminders" subtitle="Nudges on the days that matter" />}>
      {(blocked || (anyOn && allowed === false)) && (
        <Card style={styles.warning}>
          <T variant="body">Notifications are off for Gymmy.</T>
          <T variant="caption" color={colors.textDim}>
            Turn them on in Settings → Notifications → Gymmy, then come back.
          </T>
          <Button title="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
        </Card>
      )}

      <Card style={styles.card}>
        <Row
          title="Training days"
          detail={
            training
              ? `${formatTime(training.hour, training.minute)} on ${training.days.length ? training.days.map((d) => DAY_NAMES[d].slice(0, 3)).join(', ') : 'no days yet'}`
              : 'A nudge with today’s session, skipped if you’ve already trained'
          }
          value={Boolean(training)}
          onChange={(on) => (on ? turnOn({ training: DEFAULT_TRAINING }) : setReminders({ training: undefined }))}
          testID="reminder-training"
        />
        {training && (
          <>
            <View style={styles.days}>
              {DAYS.map((d, i) => {
                const on = training.days.includes(i);
                return (
                  <Pressable
                    key={i}
                    onPress={() => toggleDay(i)}
                    accessibilityRole="button"
                    accessibilityLabel={`${DAY_NAMES[i]}${on ? ', on' : ''}`}
                    style={[styles.day, on && styles.dayOn]}>
                    <T variant="heading" color={on ? colors.accentInk : colors.textDim}>
                      {d}
                    </T>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.time}>
              <Step label="30 minutes earlier" icon="minus" onPress={() => shiftTime(-30)} />
              <T variant="heading" style={{ flex: 1, textAlign: 'center' }}>
                {formatTime(training.hour, training.minute)}
              </T>
              <Step label="30 minutes later" icon="plus" onPress={() => shiftTime(30)} />
            </View>
          </>
        )}
      </Card>

      <SectionHeader title="Weekly" />
      <Card style={styles.card}>
        <Row
          title="Sunday weigh-in"
          detail={weighInOn ? 'Sunday at 8:00 AM' : 'Turn on the weekly weigh-in under Weight & body first'}
          value={Boolean(reminders.weighIn) && weighInOn}
          disabled={!weighInOn}
          onChange={(on) => (on ? turnOn({ weighIn: true }) : setReminders({ weighIn: false }))}
        />
        {!weighInOn && (
          <Pressable onPress={() => router.push('/weight')} accessibilityRole="button">
            <T variant="caption" color={colors.accent}>
              Weight & body →
            </T>
          </Pressable>
        )}
      </Card>
      <Card style={styles.card}>
        <Row
          title="Monday recap"
          detail="Monday at 9:00 AM: last week’s totals and your buddy’s notes"
          value={Boolean(reminders.recap)}
          onChange={(on) => (on ? turnOn({ recap: true }) : setReminders({ recap: false }))}
        />
      </Card>
    </Screen>
  );
}

function Row({
  title,
  detail,
  value,
  disabled,
  onChange,
  testID,
}: {
  title: string;
  detail: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  testID?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="heading">{title}</T>
        <T variant="caption" color={colors.textDim}>
          {detail}
        </T>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.cardHigh }}
        accessibilityLabel={title}
        testID={testID}
      />
    </View>
  );
}

function Step({ label, icon, onPress }: { label: string; icon: 'plus' | 'minus'; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress();
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.step}>
      <Icon name={{ ios: icon, web: icon === 'plus' ? 'add' : 'remove' }} size={16} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, marginBottom: space.sm },
  warning: { gap: space.sm, marginBottom: space.md, borderColor: colors.flame, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  dayOn: { backgroundColor: colors.accent },
  time: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  step: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
