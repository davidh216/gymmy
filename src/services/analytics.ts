import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { eventsFromStateChange, screenName, type AnalyticsEvent } from '@/lib/analytics';
import { useGymmy } from '@/store/gymmy';

import { isRemote, supabase } from './supabase';

/**
 * First-party, anonymous product analytics stored in our own Supabase (see
 * supabase/migrations/20261007000000_analytics.sql). Each install gets a random id that is
 * never linked to the account. Off in development and the web preview, and when the person
 * turns it off in Profile.
 */
export const analyticsAvailable = isRemote && !__DEV__ && Platform.OS !== 'web';

type Queued = { event: string; props: object; client_at: string; app_version?: string; platform: string };

type AnalyticsState = { installId: string; enabled: boolean; queue: Queued[] };

/** A random v4 UUID (not for security: just an anonymous install id). */
function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const useAnalytics = create<AnalyticsState>()(
  persist((): AnalyticsState => ({ installId: randomId(), enabled: true, queue: [] }), {
    name: 'gymmy-analytics',
    version: 1,
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

const MAX_QUEUE = 200;
const BATCH = 50;
const FLUSH_MS = 30_000;
let timer: ReturnType<typeof setTimeout> | undefined;
let flushing: Promise<void> | null = null;

export function track(e: AnalyticsEvent) {
  if (!analyticsAvailable || !useAnalytics.getState().enabled) return;
  const item: Queued = {
    event: e.event,
    props: 'props' in e ? e.props : {},
    client_at: new Date().toISOString(),
    app_version: Constants.expoConfig?.version,
    platform: Platform.OS,
  };
  useAnalytics.setState((s) => ({ queue: [...s.queue, item].slice(-MAX_QUEUE) }));
  if (useAnalytics.getState().queue.length >= 20) void flushAnalytics();
  else {
    clearTimeout(timer);
    timer = setTimeout(() => void flushAnalytics(), FLUSH_MS);
  }
}

/** Sends queued events. Failures keep them for next time. */
export function flushAnalytics(): Promise<void> {
  flushing ??= (async () => {
    try {
      while (supabase) {
        const { queue, installId, enabled } = useAnalytics.getState();
        if (!enabled || queue.length === 0) break;
        const batch = queue.slice(0, BATCH);
        const { error } = await supabase.rpc('track_events', { p_install: installId, p_events: batch });
        if (error) break;
        useAnalytics.setState((s) => ({ queue: s.queue.slice(batch.length) }));
      }
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}

/** Turning analytics off also drops anything not yet sent. */
export function setAnalyticsEnabled(enabled: boolean) {
  useAnalytics.setState({ enabled, ...(enabled ? {} : { queue: [] }) });
}

/** Tracks app opens, screens and workout lifecycle events; flushes when the app backgrounds. */
export function useAnalyticsTracking(ready: boolean) {
  const segments = useSegments();
  const screen = screenName(segments);

  useEffect(() => {
    if (!ready || !analyticsAvailable) return;
    track({ event: 'app_open' });
    const unsubscribe = useGymmy.subscribe((next, prev) => {
      for (const e of eventsFromStateChange(prev, next)) track(e);
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'background') void flushAnalytics();
      if (state === 'active') track({ event: 'app_open' });
    });
    return () => {
      unsubscribe();
      appState.remove();
    };
  }, [ready]);

  useEffect(() => {
    if (ready) track({ event: 'screen', props: { name: screen } });
  }, [ready, screen]);
}
