import { useEffect } from 'react';
import { AppState } from 'react-native';

import { applyRecords, changedKeys, pushRecords, recordsOf, type SyncKind, type SyncRecord } from '@/lib/sync';
import { useGymmy } from '@/store/gymmy';
import { useSync } from '@/store/sync';

import { useAuth } from './auth';
import { supabase } from './supabase';

const PAGE = 1000;
const PUSH_BATCH = 500;
/** Wait for edits to settle before pushing. */
const DEBOUNCE_MS = 4000;
/** Re-read a little before the cursor in case concurrent writes committed out of order. */
const CURSOR_OVERLAP_MS = 5000;

let applyingRemote = false;
let tracking = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let running: Promise<void> | null = null;

/** Marks records dirty as the app changes them. Call once, after the store has loaded. */
export function startSyncTracking() {
  if (tracking) return;
  tracking = true;
  useGymmy.subscribe((next, prev) => {
    if (applyingRemote) return;
    // The phone's data was wiped (Profile → reset): forget sync instead of deleting the backup.
    if (prev.profile && !next.profile) {
      useSync.setState({ userId: null, cursor: null, dirty: {}, lastSyncAt: null });
      return;
    }
    const keys = changedKeys(prev, next);
    if (keys.length === 0) return;
    const now = Date.now();
    useSync.setState((s) => ({ dirty: { ...s.dirty, ...Object.fromEntries(keys.map((k) => [k, now])) } }));
    scheduleSync();
  });
}

function scheduleSync() {
  clearTimeout(timer);
  timer = setTimeout(() => void syncNow(), DEBOUNCE_MS);
}

type Row = { kind: SyncKind; id: string; data: unknown; deleted: boolean; updated_at: string; server_updated_at: string };

/** Pulls changes from the cloud, merges them, then pushes local changes. Safe to call any time. */
export function syncNow(): Promise<void> {
  running ??= run().finally(() => {
    running = null;
  });
  return running;
}

/** Resolves once the saved sync state has loaded from storage. */
function syncStoreReady(): Promise<void> {
  if (useSync.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = useSync.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

async function run() {
  await syncStoreReady();
  const userId = useAuth.getState().userId;
  if (!supabase || !userId || !useGymmy.getState().profile) return;
  const start = useSync.getState();
  if (start.userId && start.userId !== userId) {
    useSync.setState({ status: 'other-account', error: null });
    return;
  }
  useSync.setState({ status: 'syncing', error: null });
  try {
    const firstSync = !start.cursor || start.userId !== userId;

    // Pull everything changed since the last pull.
    const rows: Row[] = [];
    let since = start.cursor
      ? new Date(Date.parse(start.cursor) - CURSOR_OVERLAP_MS).toISOString()
      : '1970-01-01T00:00:00Z';
    for (;;) {
      const { data, error } = await supabase
        .from('sync_records')
        .select('kind, id, data, deleted, updated_at, server_updated_at')
        .gt('server_updated_at', since)
        .order('server_updated_at', { ascending: true })
        .limit(PAGE);
      if (error) throw new Error(error.message);
      rows.push(...(data as Row[]));
      if (data.length < PAGE) break;
      since = (data[data.length - 1] as Row).server_updated_at;
    }
    const pulled: SyncRecord[] = rows.map((r) => ({
      kind: r.kind,
      id: r.id,
      data: r.data,
      deleted: r.deleted,
      updatedAt: Date.parse(r.updated_at),
    }));
    const patch = applyRecords(useGymmy.getState(), pulled, { dirty: useSync.getState().dirty, firstSync });
    if (Object.keys(patch).length) {
      applyingRemote = true;
      try {
        useGymmy.setState(patch as Parameters<typeof useGymmy.setState>[0]);
      } finally {
        applyingRemote = false;
      }
    }

    // First sync from this phone: send what it has that the account doesn't (or merged
    // differently). Records just downloaded unchanged aren't sent back.
    if (firstSync) {
      const now = Date.now();
      const fromCloud = new Map(pulled.map((r) => [`${r.kind}:${r.id}`, r.data]));
      const local = recordsOf(useGymmy.getState());
      const send = [...local.keys()].filter((k) => !fromCloud.has(k) || fromCloud.get(k) !== local.get(k));
      useSync.setState((s) => ({ dirty: { ...Object.fromEntries(send.map((k) => [k, now])), ...s.dirty } }));
    }

    // Push local changes, oldest batches first.
    const dirty = useSync.getState().dirty;
    const records = pushRecords(useGymmy.getState(), dirty);
    for (let i = 0; i < records.length; i += PUSH_BATCH) {
      const batch = records.slice(i, i + PUSH_BATCH);
      const { error } = await supabase.rpc('sync_push', {
        p_records: batch.map((r) => ({
          kind: r.kind,
          id: r.id,
          data: r.data ?? null,
          deleted: r.deleted ?? false,
          updated_at: new Date(r.updatedAt).toISOString(),
        })),
      });
      if (error) throw new Error(error.message);
      // Only clear keys that weren't edited again while we were sending.
      useSync.setState((s) => {
        const rest = { ...s.dirty };
        for (const r of batch) {
          const key = `${r.kind}:${r.id}`;
          if (rest[key] === r.updatedAt) delete rest[key];
        }
        return { dirty: rest };
      });
    }

    const newest = rows.length ? rows[rows.length - 1].server_updated_at : start.cursor;
    useSync.setState({
      userId,
      cursor: newest ?? new Date(0).toISOString(),
      lastSyncAt: Date.now(),
      status: 'idle',
      error: null,
    });
  } catch (e) {
    useSync.setState({ status: 'error', error: e instanceof Error ? e.message : 'Sync failed' });
  }
}

/**
 * This phone has another account's data. Clears that data (keeping the profile and
 * settings until the account's own arrive) and syncs with the signed-in account.
 */
export async function switchToThisAccount() {
  applyingRemote = true;
  try {
    useGymmy.setState({ workouts: [], checkIns: {}, customExercises: [], customPrograms: [], claimedMilestones: {} });
  } finally {
    applyingRemote = false;
  }
  useSync.setState({ userId: null, cursor: null, dirty: {}, lastSyncAt: null, status: 'idle', error: null });
  await syncNow();
}

/** Starts change tracking and syncs on launch, sign-in and when the app returns to the foreground. */
export function useAutoSync(ready: boolean) {
  useEffect(() => {
    if (!ready || !supabase) return;
    startSyncTracking();
    void syncNow();
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncNow();
    });
    const auth = useAuth.subscribe((s, prev) => {
      if (s.userId && s.userId !== prev.userId) void syncNow();
    });
    return () => {
      appState.remove();
      auth();
    };
  }, [ready]);
}
