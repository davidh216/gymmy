import { StyleSheet } from 'react-native';

import { Button, Card, T } from '@/components/ui';
import { friendlyError, isNetworkError } from '@/lib/errors';
import { colors, space } from '@/theme';

/** A failed load, with a retry button. */
export function ErrorState({
  error,
  action,
  onRetry,
  retrying,
}: {
  error: unknown;
  /** What failed, e.g. "load this gym". */
  action?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <Card style={styles.card}>
      <T style={{ fontSize: 36 }}>{isNetworkError(error) ? '📡' : '😵'}</T>
      <T variant="caption" color={colors.textDim} style={{ textAlign: 'center' }}>
        {friendlyError(error, action)}
      </T>
      {onRetry && (
        <Button
          title={retrying ? 'Trying…' : 'Try again'}
          variant="secondary"
          disabled={retrying}
          onPress={onRetry}
          testID="error-retry"
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
});
