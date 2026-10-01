import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import {
  ACTIVITY,
  healthExport,
  sleepHours,
  sleepWindow,
  workoutFromHealth,
  type HealthWorkout,
} from '@/lib/health';
import type { Workout } from '@/lib/types';
import { useGymmy } from '@/store/gymmy';

type HealthKit = typeof import('@kingstinct/react-native-healthkit');

export class HealthError extends Error {
  constructor(
    message: string,
    readonly reason: 'unsupported' | 'denied' | 'failed',
  ) {
    super(message);
  }
}

/**
 * Loads HealthKit on demand. It only exists on iPhone builds that include it, so older
 * builds (reached by an over-the-air update), Android and web get a clear error instead of a crash.
 */
async function healthKit(): Promise<HealthKit> {
  if (Platform.OS !== 'ios') throw new HealthError('Apple Health is only on iPhone.', 'unsupported');
  try {
    const hk = await import('@kingstinct/react-native-healthkit');
    if (!(await hk.isHealthDataAvailableAsync())) throw new Error('unavailable');
    return hk;
  } catch {
    throw new HealthError('Update Gymmy from TestFlight to connect Apple Health.', 'unsupported');
  }
}

/** True when this build and device can use Apple Health. */
export async function healthSupported(): Promise<boolean> {
  try {
    await healthKit();
    return true;
  } catch {
    return false;
  }
}

const SLEEP = 'HKCategoryTypeIdentifierSleepAnalysis' as const;
const WORKOUTS = 'HKWorkoutTypeIdentifier' as const;

/** Shows Apple's permission sheet: read sleep and workouts, save workouts. */
export async function connectHealth(): Promise<{ imported: number }> {
  const hk = await healthKit();
  try {
    await hk.requestAuthorization({
      toRead: [SLEEP, WORKOUTS],
      toShare: [
        WORKOUTS,
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'HKQuantityTypeIdentifierDistanceCycling',
        'HKQuantityTypeIdentifierDistanceSwimming',
      ],
    });
  } catch (e) {
    throw new HealthError(`Couldn’t connect to Apple Health. (${e instanceof Error ? e.message : 'unknown error'})`, 'failed');
  }
  const { health, setHealth } = useGymmy.getState();
  setHealth({ enabled: true, connectedAt: health.connectedAt ?? Date.now() });
  return syncHealth({ force: true });
}

export function disconnectHealth() {
  useGymmy.getState().setHealth({ enabled: false });
}

const SYNC_EVERY_MS = 10 * 60 * 1000;
const BACKFILL_DAYS = 30;

/**
 * Imports new Apple Health runs, walks, rides, rows and swims. The first sync looks back
 * 30 days; later ones look back a day before the last sync to catch late Watch uploads.
 */
export async function syncHealth(opts: { force?: boolean } = {}): Promise<{ imported: number }> {
  const { health, companionId, importWorkouts, setHealth } = useGymmy.getState();
  if (!health.enabled) return { imported: 0 };
  const now = Date.now();
  if (!opts.force && health.lastSync && now - health.lastSync < SYNC_EVERY_MS) return { imported: 0 };
  const hk = await healthKit();
  const since = health.lastSync ? health.lastSync - 24 * 3600 * 1000 : now - BACKFILL_DAYS * 24 * 3600 * 1000;
  const samples = await hk.queryWorkoutSamples({ limit: 0, ascending: false, filter: { date: { startDate: new Date(since) } } });
  const workouts = samples
    .map(
      (w): HealthWorkout => ({
        uuid: w.uuid,
        activityType: w.workoutActivityType,
        start: w.startDate.getTime(),
        end: w.endDate.getTime(),
        durationSeconds: w.duration.quantity,
        distanceMeters: w.totalDistance?.quantity,
        sourceBundleId: w.sourceRevision.source.bundleIdentifier,
      }),
    )
    .map((w) => workoutFromHealth(w, companionId))
    .filter((w): w is Workout => w !== null);
  const imported = importWorkouts(workouts);
  setHealth({ lastSync: now });
  return { imported };
}

/** Hours asleep last night from Apple Health, or null when there's no data. */
export async function lastNightSleep(): Promise<number | null> {
  if (!useGymmy.getState().health.enabled) return null;
  const hk = await healthKit();
  const window = sleepWindow(Date.now());
  const samples = await hk.queryCategorySamples(SLEEP, {
    limit: 0,
    filter: { date: { startDate: new Date(window.start), endDate: new Date(window.end) } },
  });
  return sleepHours(
    samples.map((s) => ({ start: s.startDate.getTime(), end: s.endDate.getTime(), value: Number(s.value) })),
    window,
  );
}

/** Saves a finished Gymmy workout to Apple Health. Errors are swallowed: it's a bonus. */
export async function saveWorkoutToHealth(workout: Workout): Promise<void> {
  if (!useGymmy.getState().health.enabled || workout.source === 'health') return;
  try {
    const hk = await healthKit();
    const { activityType, distanceMeters } = healthExport(workout);
    await hk.saveWorkoutSample(
      activityType as typeof ACTIVITY.running,
      [],
      new Date(workout.startedAt),
      new Date(workout.endedAt),
      distanceMeters ? { distance: distanceMeters } : undefined,
      { HKExternalUUID: workout.id },
    );
  } catch {
    // Not connected on this build, or permission withdrawn in the Health app.
  }
}

/** Syncs with Apple Health when the app starts and whenever it comes back to the foreground. */
export function useHealthAutoSync(ready: boolean) {
  useEffect(() => {
    if (!ready || Platform.OS !== 'ios') return;
    const run = () => {
      syncHealth().catch(() => {});
    };
    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, [ready]);
}
