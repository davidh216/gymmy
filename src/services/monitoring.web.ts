import type { ComponentType } from 'react';

// Crash reporting is native-only; the web preview gets no-ops (and doesn't bundle Sentry).
export const monitoringEnabled = false;

export function stripQuery(url: string): string {
  return url.replace(/[?#].*$/, '');
}

export function initMonitoring() {}

export function setMonitoringUser(_id: string | null) {}

export function reportError(_error: unknown, _context?: Record<string, string>) {}

export function withMonitoring(Component: ComponentType): ComponentType {
  return Component;
}
