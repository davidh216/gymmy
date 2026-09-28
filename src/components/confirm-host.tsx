import { Pressable, StyleSheet, View } from 'react-native';

import { Button, T } from '@/components/ui';
import { useConfirmStore } from '@/lib/confirm';
import { colors, radius, space } from '@/theme';

/** Renders web confirmation dialogs requested via `confirm()`. */
export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  if (!request) return null;
  const close = () => useConfirmStore.setState({ request: null });

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Cancel" />
      <View style={styles.dialog} accessibilityRole="alert">
        <T variant="title">{request.title}</T>
        <T variant="body" color={colors.textDim}>
          {request.message}
        </T>
        <View style={styles.actions}>
          <Button title="Cancel" variant="secondary" onPress={close} style={{ flex: 1 }} />
          <Button
            title={request.action}
            variant="danger"
            onPress={() => {
              close();
              request.onConfirm();
            }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    gap: space.md,
    padding: space.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.cardHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
});
