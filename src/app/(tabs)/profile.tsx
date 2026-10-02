import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { ExportCard } from '@/components/export-card';
import { HealthCard } from '@/components/health-card';
import { Screen } from '@/components/screen';
import { SyncCard } from '@/components/sync-card';
import { Button, Card, Chip, SectionHeader, Stat, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { COMPANIONS } from '@/lib/companions';
import { formatNumber } from '@/lib/format';
import { getProgram } from '@/lib/programs';
import { analyticsAvailable, setAnalyticsEnabled, useAnalytics } from '@/services/analytics';
import { deleteAccount, signOut, useAuth } from '@/services/auth';
import { useMyProfile } from '@/services/gyms/queries';
import { gymsApi } from '@/services/gyms';
import { resetLocalGyms } from '@/services/gyms/local';
import { isRemote } from '@/services/supabase';
import { toUsername, useGymmy } from '@/store/gymmy';
import { useMilestones, useProgress } from '@/store/selectors';
import { resetSync } from '@/store/sync';
import { colors, radius, space } from '@/theme';

export default function Profile() {
  const profile = useGymmy((s) => s.profile);
  const xp = useGymmy((s) => s.xp);
  const owned = useGymmy((s) => Object.keys(s.collection).length);
  const { updateProfile, reset } = useGymmy.getState();
  const { level, streak } = useProgress();
  const queryClient = useQueryClient();
  const email = useAuth((s) => s.email);
  const { data: serverProfile } = useMyProfile();
  const analyticsOn = useAnalytics((s) => s.enabled);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

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
            onChangeText={(username) => {
              updateProfile({ username: toUsername(username) });
              setUsernameError(null);
            }}
            onEndEditing={() => {
              if (email) {
                gymsApi.updateMe({ username: profile.username }).catch(() =>
                  setUsernameError('That username is taken or invalid. Your leaderboard name didn’t change.'),
                );
              }
            }}
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
        {usernameError && (
          <T variant="caption" color={colors.danger}>
            {usernameError}
          </T>
        )}
        <View style={{ flexDirection: 'row' }}>
          <Stat value={String(level)} label="Level" color={colors.accent} />
          <Stat value={formatNumber(xp)} label="Total XP" />
          <Stat value={`${owned}/${COMPANIONS.length}`} label="Buddies" />
        </View>
      </Card>

      <ProfileLinks />

      <View style={{ marginTop: space.sm, gap: space.sm }}>
        <SyncCard />
        <HealthCard />
        <ExportCard />
      </View>

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

      {analyticsAvailable && (
        <>
          <SectionHeader title="Privacy" />
          <Card style={styles.link}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="heading">Share anonymous usage stats</T>
              <T variant="caption" color={colors.textDim}>
                Which screens and features get used, with a random id that isn’t tied to your account. Never your
                workouts, health data, name or email.
              </T>
            </View>
            <Switch
              value={analyticsOn}
              onValueChange={setAnalyticsEnabled}
              trackColor={{ true: colors.accent, false: colors.cardHigh }}
            />
          </Card>
        </>
      )}

      {isRemote && (
        <>
          <SectionHeader title="Account" />
          <Card style={styles.account}>
            <T variant="body" color={colors.textDim} style={{ flex: 1 }} numberOfLines={1}>
              {email ? `Signed in as ${email}` : 'Not signed in. Sign in from the Gyms tab.'}
            </T>
            {email && <Button title="Sign out" variant="secondary" onPress={() => signOut()} />}
          </Card>
          {serverProfile?.isAdmin && (
            <Button
              title="Review reports"
              icon={{ ios: 'shield.lefthalf.filled', web: 'shield' }}
              variant="secondary"
              style={{ marginTop: space.sm }}
              onPress={() => router.push('/admin')}
            />
          )}
          {email && (
            <Button
              title="Delete account"
              variant="ghost"
              style={{ marginTop: space.sm }}
              onPress={() =>
                confirm(
                  'Delete your account?',
                  'This permanently deletes your Gymmy account, your cloud backup, leaderboard entries and videos. Workouts on this phone stay.',
                  'Delete',
                  () => {
                    setAccountError(null);
                    deleteAccount().then(resetSync, () =>
                      setAccountError('Couldn’t delete your account. Check your connection and try again.'),
                    );
                  },
                )
              }
            />
          )}
          {accountError && (
            <T variant="caption" color={colors.danger}>
              {accountError}
            </T>
          )}
        </>
      )}

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
  link: { flexDirection: 'row', alignItems: 'center', gap: space.md },
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
  account: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { textAlign: 'center', marginTop: space.xl },
});

function ProfileLinks() {
  const { ready, earned, all } = useMilestones();
  const plan = useGymmy((s) => s.plan);
  const program = plan ? getProgram(plan.programId) : undefined;
  return (
    <View style={{ gap: space.sm, marginTop: space.md }}>
      <Card style={styles.link} onPress={() => router.push('/milestones')}>
        <T style={{ fontSize: 24 }}>🏆</T>
        <View style={{ flex: 1 }}>
          <T variant="heading">Milestones</T>
          <T variant="caption" color={ready.length ? colors.accent : colors.textDim}>
            {ready.length ? `${ready.length} ready to claim` : `${earned} of ${all.length} earned`}
          </T>
        </View>
        <T variant="heading" color={colors.textFaint}>
          →
        </T>
      </Card>
      <Card style={styles.link} onPress={() => router.push('/recovery')}>
        <T style={{ fontSize: 24 }}>🫶</T>
        <View style={{ flex: 1 }}>
          <T variant="heading">Recovery</T>
          <T variant="caption" color={colors.textDim}>
            Daily check-in, readiness and muscle recovery
          </T>
        </View>
        <T variant="heading" color={colors.textFaint}>
          →
        </T>
      </Card>
      <Card style={styles.link} onPress={() => router.push('/programs')}>
        <T style={{ fontSize: 24 }}>{program?.emoji ?? '📋'}</T>
        <View style={{ flex: 1 }}>
          <T variant="heading">Training plans</T>
          <T variant="caption" color={colors.textDim}>
            {program ? `Following ${program.name}` : 'HYROX, marathon, 5K, strength and more'}
          </T>
        </View>
        <T variant="heading" color={colors.textFaint}>
          →
        </T>
      </Card>
    </View>
  );
}
