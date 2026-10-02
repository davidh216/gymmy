/* eslint-disable @typescript-eslint/no-require-imports -- isolated module copies per simulated phone */
/**
 * Two phones syncing through an in-memory server that applies the same rules as
 * supabase/migrations/20261006000000_sync.sql (newest edit wins, server-time cursor).
 */
import type { Workout } from '@/lib/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

type Row = {
  user_id: string;
  kind: string;
  id: string;
  data: unknown;
  deleted: boolean;
  updated_at: string;
  server_updated_at: string;
};

const server = { rows: [] as Row[], clock: Date.parse('2026-10-01T00:00:00Z'), offline: false };
const tick = () => new Date((server.clock += 1000)).toISOString();

/** Just enough of supabase-js for the sync service. */
function fakeClient(userId: string) {
  return {
    from: () => {
      const q = { since: '', limit: 1000 };
      const chain = {
        select: () => chain,
        gt: (_: string, v: string) => ((q.since = v), chain),
        order: () => chain,
        limit: (n: number) => {
          q.limit = n;
          const data = server.rows
            .filter((r) => r.user_id === userId && r.server_updated_at > q.since)
            .sort((a, b) => a.server_updated_at.localeCompare(b.server_updated_at))
            .slice(0, q.limit)
            .map((r) => JSON.parse(JSON.stringify(r)));
          return Promise.resolve({ data, error: null });
        },
      };
      return chain;
    },
    rpc: (_: string, { p_records }: { p_records: Omit<Row, 'user_id' | 'server_updated_at'>[] }) => {
      if (server.offline) return Promise.resolve({ error: { message: 'Network request failed' } });
      for (const r of p_records) {
        const existing = server.rows.find((x) => x.user_id === userId && x.kind === r.kind && x.id === r.id);
        const row = { ...JSON.parse(JSON.stringify(r)), user_id: userId, server_updated_at: tick() } as Row;
        if (row.deleted) row.data = null;
        if (!existing) server.rows.push(row);
        else if (existing.updated_at <= row.updated_at) Object.assign(existing, row);
      }
      return Promise.resolve({ error: null });
    },
  };
}

type Phone = {
  gymmy: typeof import('@/store/gymmy');
  sync: typeof import('@/services/sync');
  syncStore: typeof import('@/store/sync');
  auth: typeof import('@/services/auth');
};

/** A separate copy of the app's modules, signed in as `userId`. */
function phone(userId: string): Phone {
  let p!: Phone;
  jest.isolateModules(() => {
    jest.doMock('@/services/supabase', () => ({ supabase: fakeClient(userId), isRemote: true }));
    p = {
      gymmy: require('@/store/gymmy'),
      sync: require('@/services/sync'),
      syncStore: require('@/store/sync'),
      auth: require('@/services/auth'),
    };
  });
  p.auth.useAuth.setState({ ready: true, userId, email: 'a@b.c' });
  return p;
}

const workout = (id: string, endedAt: number): Workout => ({
  id,
  name: id,
  startedAt: endedAt - 1000,
  endedAt,
  exercises: [{ id: `${id}-e`, exerciseId: 'squat', sets: [{ id: 's', weight: 100, reps: 5, done: true }] }],
  companionId: 'kong',
  xp: 50,
  gems: 25,
  prs: [],
});

/** Loads a phone's starting data, then starts tracking and syncs, as the app does on launch. */
async function boot(p: Phone, setup?: () => void) {
  p.gymmy.useGymmy.setState({ profile: { name: 'Alex', username: 'alex', weeklyGoal: 3, units: 'lb' } });
  setup?.();
  p.sync.startSyncTracking();
  await p.sync.syncNow();
}

beforeEach(() => {
  server.rows = [];
  server.offline = false;
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
});
afterEach(() => jest.useRealTimers());

describe('cloud sync between two phones', () => {
  it('backs up a phone and restores it on a fresh install', async () => {
    const a = phone('u1');
    a.gymmy.useGymmy.setState({
      profile: { name: 'Alex', username: 'alex', weeklyGoal: 4, units: 'kg' },
      workouts: [workout('w1', 2000), workout('w2', 3000)],
      gems: 640,
      xp: 900,
      collection: { kong: { stars: 3, obtainedAt: 1 }, zen: { stars: 1, obtainedAt: 2 } },
      claimedMilestones: { 'workouts-1': 5 },
    });
    a.sync.startSyncTracking();
    await a.sync.syncNow();
    expect(a.syncStore.useSync.getState().dirty).toEqual({});
    expect(server.rows.filter((r) => r.kind === 'workout')).toHaveLength(2);

    // New phone: onboarding made a fresh profile with starter gems before signing in.
    const b = phone('u1');
    b.gymmy.useGymmy.setState({
      profile: { name: 'New', username: 'new', weeklyGoal: 3, units: 'lb' },
      gems: 100,
      collection: { blaze: { stars: 1, obtainedAt: 99 } },
    });
    b.sync.startSyncTracking();
    await b.sync.syncNow();
    const s = b.gymmy.useGymmy.getState();
    expect(s.workouts.map((w) => w.id)).toEqual(['w2', 'w1']);
    expect(s.profile).toMatchObject({ name: 'Alex', weeklyGoal: 4, units: 'kg' });
    expect(s.gems).toBe(640);
    expect(Object.keys(s.collection).sort()).toEqual(['blaze', 'kong', 'zen']);
    expect(s.claimedMilestones).toEqual({ 'workouts-1': 5 });
  });

  it('syncs edits and deletes both ways, and never uploads Apple Health imports', async () => {
    const a = phone('u2');
    const b = phone('u2');
    await boot(a, () => a.gymmy.useGymmy.setState({ workouts: [workout('w1', 1000)] }));
    await boot(b);
    expect(b.gymmy.useGymmy.getState().workouts.map((w) => w.id)).toEqual(['w1']);

    // Phone B logs a workout and imports one from Health; phone A deletes w1.
    b.gymmy.useGymmy.setState((s) => ({
      workouts: [{ ...workout('h1', 5000), source: 'health' as const }, workout('w2', 4000), ...s.workouts],
    }));
    a.gymmy.useGymmy.getState().deleteWorkout('w1');
    await b.sync.syncNow();
    await a.sync.syncNow();
    await b.sync.syncNow();

    expect(a.gymmy.useGymmy.getState().workouts.map((w) => w.id)).toEqual(['w2']);
    expect(b.gymmy.useGymmy.getState().workouts.map((w) => w.id)).toEqual(['h1', 'w2']);
    expect(server.rows.some((r) => r.id === 'h1')).toBe(false);
  });

  it('keeps the newest edit when both phones change the same thing', async () => {
    const a = phone('u3');
    const b = phone('u3');
    await boot(a);
    await boot(b);
    // Relative to now, so the test doesn't depend on today's date.
    const start = Date.now();
    jest.setSystemTime(start + 3600_000);
    a.gymmy.useGymmy.getState().updateProfile({ weeklyGoal: 5 });
    jest.setSystemTime(start + 2 * 3600_000);
    b.gymmy.useGymmy.getState().updateProfile({ weeklyGoal: 2 });
    await b.sync.syncNow();
    await a.sync.syncNow();
    await b.sync.syncNow();
    expect(a.gymmy.useGymmy.getState().profile?.weeklyGoal).toBe(2);
    expect(b.gymmy.useGymmy.getState().profile?.weeklyGoal).toBe(2);
  });

  it('wiping the phone does not delete the backup', async () => {
    const a = phone('u4');
    await boot(a, () => a.gymmy.useGymmy.setState({ workouts: [workout('w1', 1000)] }));
    a.gymmy.useGymmy.getState().reset();
    await a.sync.syncNow();
    expect(server.rows.find((r) => r.id === 'w1')?.deleted).toBe(false);
    expect(a.syncStore.useSync.getState().cursor).toBeNull();
  });

  it('keeps changes made offline and sends them later', async () => {
    const a = phone('u7');
    await boot(a);
    server.offline = true;
    a.gymmy.useGymmy.setState((s) => ({ workouts: [workout('gym', 9000), ...s.workouts] }));
    await a.sync.syncNow();
    expect(a.syncStore.useSync.getState()).toMatchObject({ status: 'error', error: 'Network request failed' });
    expect(Object.keys(a.syncStore.useSync.getState().dirty)).toContain('workout:gym');
    server.offline = false;
    await a.sync.syncNow();
    expect(a.syncStore.useSync.getState().dirty).toEqual({});
    expect(server.rows.some((r) => r.id === 'gym')).toBe(true);
  });

  it('refuses to mix two accounts on one phone until you choose', async () => {
    const a = phone('u5');
    await boot(a, () => a.gymmy.useGymmy.setState({ workouts: [workout('mine', 1000)] }));
    a.auth.useAuth.setState({ userId: 'u6' });
    await a.sync.syncNow();
    expect(a.syncStore.useSync.getState().status).toBe('other-account');
    expect(server.rows.some((r) => r.user_id === 'u6')).toBe(false);
  });
});
