import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

// Refetch stale data when the app comes back to the foreground (the web handles this itself),
// so boards catch up after being away or offline.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((onFocus) => {
    const sub = AppState.addEventListener('change', (state) => onFocus(state === 'active'));
    return () => sub.remove();
  });
}
