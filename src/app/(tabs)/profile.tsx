import { StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Chip, SectionHeader, Stat, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { COMPANIONS } from '@/lib/companions';
import { formatNumber } from '@/lib/format';
import { useGymmy } from '@/store/gymmy';
import { useProgress } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

export default function Profile() {
  const profile = useGymmy((s) => s.profile);
  const xp = useGymmy((s) => s.xp);
  const owned = useGymmy((s) => Object.keys(s.collection).length);
  const { updateProfile, reset } = useGymmy.getState();
  const { level, streak } = useProgress();

  if (!profile) return null;

  return (
    <Screen header={<T variant="hero" style={{ marginBottom: space.lg }}>Profile</T>}>
      <Card style={{ gap: space.lg }}>
        <TextInput
          value={profile.name}
          onChangeText={(name) => updateProfile({ name })}
          style={styles.name}
          maxLength={24}
          placeholder="Your name"
          placeholderTextColor={colors.textFaint}
        />
        <View style={{ flexDirection: 'row' }}>
          <Stat value={String(level)} label="Level" color={colors.accent} />
          <Stat value={formatNumber(xp)} label="Total XP" />
          <Stat value={`${owned}/${COMPANIONS.length}`} label="Buddies" />
        </View>
      </Card>

      <SectionHeader title="Weekly goal" />
      <Card style={{ gap: space.md }}>
        <View style={styles.goalRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Chip
              key={n}
              label={String(n)}
              active={profile.weeklyGoal === n}
              onPress={() => updateProfile({ weeklyGoal: n })}
            />
          ))}
        </View>
        <T variant="caption" color={colors.textDim}>
          Training days per week. Current streak: 🔥 {streak} {streak === 1 ? 'week' : 'weeks'}.
        </T>
      </Card>

      <SectionHeader title="Units" />
      <Card style={styles.goalRow}>
        <Chip label="Pounds (lb)" active={profile.units === 'lb'} onPress={() => updateProfile({ units: 'lb' })} />
        <Chip label="Kilograms (kg)" active={profile.units === 'kg'} onPress={() => updateProfile({ units: 'kg' })} />
      </Card>

      <SectionHeader title="Data" />
      <Button
        title="Reset all data"
        variant="danger"
        onPress={() =>
          confirm(
            'Reset everything?',
            'This deletes your workouts, XP, gems and squad. It cannot be undone.',
            'Reset',
            () => {
              haptic('heavy');
              reset();
            },
          )
        }
      />
      <T variant="caption" color={colors.textFaint} style={styles.footer}>
        Gymmy 1.0 · Your data stays on this device.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
  },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { textAlign: 'center', marginTop: space.xl },
});
