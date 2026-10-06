import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import {
  ACTIVITY,
  BASELINE_DAYS,
  againstBaseline,
  healthExport,
  sleepHours,
  sleepWindow,
  workoutFromHealth,
  type HealthWorkout,
  type Reading,
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
const HRV = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN' as const;
const RESTING_HR = 'HKQuantityTypeIdentifierRestingHeartRate' as const;
const BODY_MASS = 'HKQuantityTypeIdentifierBodyMass' as const;
const VITALS = [HRV, RESTING_HR, BODY_MASS] as const;

/** Shows Apple's permission sheet: read sleep and workouts, save workouts. */
export async function connectHealth(): Promise<{ imported: number }> {
  const hk = await healthKit();
  try {
    await hk.requestAuthorization({
      toRead: [SLEEP, WORKOUTS, ...VITALS],
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
  setHealth({ enabled: true, connectedAt: health.connectedAt ?? Date.now(), readsVitals: true });
  return syncHealth({ force: true });
}

/** For people who connected before Gymmy read heart data: asks for HRV, resting heart rate and weight. */
export async function enableVitals(): Promise<void> {
  const hk = await healthKit();
  try {
    await hk.requestAuthorization({ toRead: [...VITALS], toShare: [] });
  } catch (e) {
    throw new HealthError(`Couldn’t connect to Apple Health. (${e instanceof Error ? e.message : 'unknown error'})`, 'failed');
  }
  useGymmy.getState().setHealth({ readsVitals: true });
  await refreshVitals();
}

/**
 * Reads HRV and resting heart rate for the last two weeks (to compare today with your
 * normal) and your body weights for the last 8 weeks. Missing data or permission just leaves gaps.
 */
export async function refreshVitals(): Promise<void> {
  const { health, setHealth } = useGymmy.getState();
  if (!health.enabled || !health.readsVitals) return;
  try {
    const hk = await healthKit();
    const now = Date.now();
    const since = new Date(now - (BASELINE_DAYS + 1) * 86_400_000);
    const read = async (id: typeof HRV | typeof RESTING_HR, unit: string): Promise<Reading[]> =>
      (await hk.queryQuantitySamples(id, { limit: 0, unit, filter: { date: { startDate: since } } })).map((s) => ({
        value: s.quantity,
        at: s.endDate.getTime(),
      }));
    const [hrv, rhr, mass] = await Promise.all([
      read(HRV, 'ms').catch(() => []),
      read(RESTING_HR, 'count/min').catch(() => []),
      hk
        .queryQuantitySamples(BODY_MASS, {
          limit: 0,
          ascending: false,
          unit: 'kg',
          filter: { date: { startDate: new Date(now - WEIGHT_HISTORY_DAYS * 86_400_000) } },
        })
        .catch(() => []),
    ]);
    // Weights also fill the weigh-in log (on this phone only) for the weekly review.
    useGymmy.getState().importHealthWeights(mass.map((m) => ({ kg: m.quantity, at: m.endDate.getTime() })));
    const h = againstBaseline(hrv, now);
    const r = againstBaseline(rhr, now);
    const latestMass = mass.reduce<(typeof mass)[number] | undefined>(
      (best, m) => (!best || m.endDate > best.endDate ? m : best),
      undefined,
    );
    setHealth({
      vitals: {
        hrv: h.today,
        hrvBaseline: h.baseline,
        rhr: r.today,
        rhrBaseline: r.baseline,
        bodyMassKg: latestMass?.quantity,
        bodyMassAt: latestMass?.endDate.getTime(),
        at: now,
      },
    });
  } catch {
    // Heart data is a bonus; readiness works without it.
  }
}

export function disconnectHealth() {
  useGymmy.getState().setHealth({ enabled: false });
}

/** How far back body weights are read for the weigh-in log. */
const WEIGHT_HISTORY_DAYS = 56;
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
  await refreshVitals();
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
