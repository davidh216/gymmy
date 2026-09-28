import { Alert, Platform } from 'react-native';
import { create } from 'zustand';

export type ConfirmRequest = {
  title: string;
  message: string;
  action: string;
  onConfirm: () => void;
};

/** Pending web confirmation, rendered by `ConfirmHost`. */
export const useConfirmStore = create<{ request: ConfirmRequest | null }>(() => ({ request: null }));

/**
 * Destructive confirmation. Uses the native alert on iOS/Android and an in-app
 * dialog on web, where `window.confirm` is unreliable (blocked in embedded frames).
 */
export function confirm(title: string, message: string, action: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    useConfirmStore.setState({ request: { title, message, action, onConfirm } });
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);
}
