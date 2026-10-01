import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { formatAgo } from '@/lib/format';
import { useAuth } from '@/services/auth';
import { isRemote } from '@/services/supabase';
import { switchToThisAccount, syncNow } from '@/services/sync';
import { useSync } from '@/store/sync';
import { colors, space } from '@/theme';

/** Backup status: sign in to back up, last synced, or what's wrong. */
export function SyncCard() {
  const userId = useAuth((s) => s.userId);
  const { status, error, lastSyncAt } = useSync();
  const pending = useSync((s) => Object.keys(s.dirty).length);
  const now = useNow(60_000);

  if (!isRemote) return null;

  const body = !userId
    ? 'Your workouts are only on this phone. Sign in or create a free account on the Gyms tab to back them up.'
    : status === 'other-account'
      ? 'This phone has training data from a different account. Switch to bring in this account’s data instead.'
      : status === 'syncing'
        ? 'Backing up…'
        : status === 'error'
          ? `Backup didn’t finish: ${error}`
          : lastSyncAt
            ? `Backed up ${formatAgo(lastSyncAt, now)}${pending ? ` · ${pending} change${pending === 1 ? '' : 's'} waiting` : ''}`
            : 'Getting ready to back up…';

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.row}>
        <T style={{ fontSize: 26 }}>{!userId ? '📱' : status === 'error' || status === 'other-account' ? '⚠️' : '☁️'}</T>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="heading">Backup & sync</T>
          <T variant="caption" color={status === 'error' ? colors.danger : colors.textDim}>
            {body}
          </T>
        </View>
      </View>
      {!userId ? (
        <Button title="Sign in to back up" variant="secondary" onPress={() => router.push('/gyms')} />
      ) : status === 'other-account' ? (
        <Button title="Use this account’s data" variant="secondary" onPress={() => void switchToThisAccount()} />
      ) : (
        <Button
          title={status === 'syncing' ? 'Syncing…' : 'Sync now'}
          variant="secondary"
          disabled={status === 'syncing'}
          onPress={() => void syncNow()}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
