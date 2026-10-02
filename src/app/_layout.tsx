import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, ErrorBoundary as RouterErrorBoundary, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ConfirmHost } from '@/components/confirm-host';
import { initAuth } from '@/services/auth';
import { useAnalyticsTracking } from '@/services/analytics';
import { useHealthAutoSync } from '@/services/health';
import { initMonitoring, reportError, withMonitoring } from '@/services/monitoring';
import { useAutoSync } from '@/services/sync';
import { queryClient } from '@/services/query-client';
import { useGymmy, useHydrated } from '@/store/gymmy';
import { colors } from '@/theme';

initMonitoring();
SplashScreen.preventAutoHideAsync();
initAuth();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    primary: colors.accent,
    text: colors.text,
    border: colors.border,
  },
};

export default withMonitoring(RootLayout);

/** Shown when a screen crashes: reports it, then offers a retry. */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  useEffect(() => {
    reportError(props.error, { boundary: 'root' });
  }, [props.error]);
  return <RouterErrorBoundary {...props} />;
}

function RootLayout() {
  const hydrated = useHydrated();
  const onboarded = useGymmy((s) => s.profile !== null);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);
  useHealthAutoSync(hydrated);
  useAutoSync(hydrated);
  useAnalyticsTracking(hydrated);

  if (!hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Protected guard={!onboarded}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={onboarded}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="workout"
              options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
            />
            <Stack.Screen name="exercise-picker" options={{ presentation: 'modal' }} />
            <Stack.Screen name="exercise-edit" options={{ presentation: 'modal' }} />
            <Stack.Screen name="plan-edit" options={{ presentation: 'modal' }} />
            <Stack.Screen name="session/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="gym/[id]" />
            <Stack.Screen name="board/[gymId]/[challengeId]" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="milestones" />
            <Stack.Screen name="recovery" />
            <Stack.Screen name="recap" />
            <Stack.Screen name="exercise/[id]" />
            <Stack.Screen name="programs" />
            <Stack.Screen name="program/[id]" />
            <Stack.Screen name="gym-find" options={{ presentation: 'modal' }} />
            <Stack.Screen name="post-entry" options={{ presentation: 'modal' }} />
            <Stack.Screen name="entry/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen
              name="summon-reveal"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
          </Stack.Protected>
        </Stack>
        <ConfirmHost />
      </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
