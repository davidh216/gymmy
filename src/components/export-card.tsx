import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, T } from '@/components/ui';
import { shareExport, type ExportKind } from '@/services/export';
import { colors, space } from '@/theme';

/** Export your training data as spreadsheets or a full JSON backup. */
export function ExportCard() {
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: ExportKind) => {
    setBusy(kind);
    setError(null);
    try {
      await shareExport(kind);
    } catch (e) {
      setError(`Couldn’t export: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.row}>
        <T style={{ fontSize: 26 }}>📤</T>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="heading">Export your data</T>
          <T variant="caption" color={colors.textDim}>
            Spreadsheets for Excel, Numbers or Google Sheets, or a full backup file. It’s yours.
          </T>
        </View>
      </View>
      <View style={styles.row}>
        <Button
          title={busy === 'workouts' ? 'Preparing…' : 'Workouts (CSV)'}
          variant="secondary"
          disabled={busy !== null}
          style={{ flex: 1 }}
          onPress={() => void run('workouts')}
        />
        <Button
          title={busy === 'check-ins' ? 'Preparing…' : 'Recovery (CSV)'}
          variant="secondary"
          disabled={busy !== null}
          style={{ flex: 1 }}
          onPress={() => void run('check-ins')}
        />
      </View>
      <Button
        title={busy === 'backup' ? 'Preparing…' : 'Everything (JSON)'}
        variant="ghost"
        disabled={busy !== null}
        onPress={() => void run('backup')}
      />
      {error && (
        <T variant="caption" color={colors.danger}>
          {error}
        </T>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
