import { useMutation, useQuery } from '@tanstack/react-query';
import { Platform, StyleSheet, View } from 'react-native';

import { Button, Card, T, haptic } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { formatAgo } from '@/lib/format';
import { bucket } from '@/lib/analytics';
import { track } from '@/services/analytics';
import { connectHealth, disconnectHealth, healthSupported, syncHealth } from '@/services/health';
import { useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

/** Connect, sync or disconnect Apple Health. iPhone only. */
export function HealthCard() {
  const health = useGymmy((s) => s.health);
  const imported = useGymmy((s) => s.workouts.filter((w) => w.source === 'health').length);
  const now = useNow(60_000);
  const { data: supported } = useQuery({ queryKey: ['health', 'supported'], queryFn: healthSupported, enabled: Platform.OS === 'ios' });
  const connect = useMutation({
    mutationFn: connectHealth,
    onSuccess: (r) => {
      haptic('success');
      track({ event: 'health_connect', props: { imported: bucket(r.imported) } });
    },
  });
  const sync = useMutation({ mutationFn: () => syncHealth({ force: true }) });

  if (Platform.OS !== 'ios') return null;

  const result = connect.data ?? sync.data;
  const error = connect.error ?? sync.error;

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.row}>
        <T style={{ fontSize: 26 }}>❤️</T>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="heading">Apple Health</T>
          <T variant="caption" color={colors.textDim}>
            {supported === false
              ? 'Update Gymmy from TestFlight to connect Apple Health.'
              : health.enabled
                ? `Connected${health.lastSync ? ` · synced ${formatAgo(health.lastSync, now)}` : ''} · ${imported} imported`
                : 'Bring in your sleep and your Apple Watch runs, walks, rides, rows and swims. Gymmy workouts are saved to Health too.'}
          </T>
        </View>
      </View>
      {result && result.imported > 0 && (
        <T variant="caption" color={colors.accent}>
          Imported {result.imported} {result.imported === 1 ? 'workout' : 'workouts'}.
        </T>
      )}
      {error && (
        <T variant="caption" color={colors.danger}>
          {error.message}
        </T>
      )}
      {supported !== false &&
        (health.enabled ? (
          <View style={styles.row}>
            <Button
              title={sync.isPending ? 'Syncing…' : 'Sync now'}
              variant="secondary"
              disabled={sync.isPending}
              style={{ flex: 1 }}
              onPress={() => sync.mutate()}
            />
            <Button title="Disconnect" variant="ghost" onPress={disconnectHealth} />
          </View>
        ) : (
          <Button
            title={connect.isPending ? 'Connecting…' : 'Connect Apple Health'}
            disabled={connect.isPending || supported === undefined}
            onPress={() => connect.mutate()}
          />
        ))}
      {health.enabled && (
        <T variant="caption" color={colors.textFaint}>
          To change what Gymmy can see, open the Health app → your profile → Apps → Gymmy.
        </T>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
