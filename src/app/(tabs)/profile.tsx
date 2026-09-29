import { useQueryClient } from '@tanstack/react-query';
import { StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Chip, SectionHeader, Stat, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { COMPANIONS } from '@/lib/companions';
import { formatNumber } from '@/lib/format';
import { resetLocalGyms } from '@/services/gyms/local';
import { toUsername, useGymmy } from '@/store/gymmy';
import { useProgress } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

export default function Profile() {
  const profile = useGymmy((s) => s.profile);
  const xp = useGymmy((s) => s.xp);
  const owned = useGymmy((s) => Object.keys(s.collection).length);
  const { updateProfile, reset } = useGymmy.getState();
  const { level, streak } = useProgress();
  const queryClient = useQueryClient();

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
        <View style={styles.usernameRow}>
          <T variant="caption" color={colors.textFaint}>
            @
          </T>
          <TextInput
            value={profile.username}
            onChangeText={(username) => updateProfile({ username: toUsername(username) })}
            style={styles.username}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="username"
            placeholderTextColor={colors.textFaint}
            accessibilityLabel="Leaderboard username"
          />
          <T variant="caption" color={colors.textFaint}>
            on leaderboards
          </T>
        </View>
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
              resetLocalGyms();
              queryClient.clear();
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
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: -space.sm },
  username: { flex: 1, minWidth: 0, color: colors.text, fontSize: 15, fontWeight: '600', paddingVertical: 4 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { textAlign: 'center', marginTop: space.xl },
});
