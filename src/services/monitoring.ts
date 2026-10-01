import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';

/**
 * Crash reporting with Sentry. Off unless EXPO_PUBLIC_SENTRY_DSN is set, and never in
 * development or the web preview. Reports carry an anonymous account id at most: no email,
 * no workout or health data, and URLs lose their query strings (signed video links).
 */
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const monitoringEnabled = Boolean(dsn) && !__DEV__ && Platform.OS !== 'web';

/** Drops query strings and fragments, which can hold signed-URL tokens. */
export function stripQuery(url: string): string {
  return url.replace(/[?#].*$/, '');
}

let started = false;

export function initMonitoring() {
  if (!monitoringEnabled || started) return;
  started = true;
  Sentry.init({
    dsn,
    environment: Updates.channel ?? 'production',
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
    beforeBreadcrumb(breadcrumb) {
      // Console output can include workout and check-in values; keep it out.
      if (breadcrumb.category === 'console') return null;
      const url = breadcrumb.data?.url;
      if (typeof url === 'string') breadcrumb.data = { ...breadcrumb.data, url: stripQuery(url) };
      return breadcrumb;
    },
    beforeSend(event) {
      if (event.request?.url) event.request.url = stripQuery(event.request.url);
      delete event.request?.query_string;
      return event;
    },
  });
  Sentry.setTag('update_id', Updates.updateId ?? 'embedded');
}

/** Ties reports to an account by its anonymous id, or clears it on sign-out. */
export function setMonitoringUser(id: string | null) {
  if (monitoringEnabled) Sentry.setUser(id ? { id } : null);
}

/** Reports an error that was caught and handled (e.g. by the root error screen). */
export function reportError(error: unknown, context?: Record<string, string>) {
  if (!monitoringEnabled) return;
  Sentry.captureException(error, context ? { tags: context } : undefined);
}

/** Wraps the root component so Sentry can track sessions and touches. */
export function withMonitoring(Component: ComponentType): ComponentType {
  return monitoringEnabled ? (Sentry.wrap(Component as ComponentType<Record<string, unknown>>) as ComponentType) : Component;
}
