import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'other-account';

type SyncState = {
  /** The account this phone's data is synced with. */
  userId: string | null;
  /** Server time of the newest record pulled (ISO). Null until the first sync. */
  cursor: string | null;
  /** Record keys changed locally and not yet pushed -> when they changed (ms). */
  dirty: Record<string, number>;
  lastSyncAt: number | null;
  status: SyncStatus;
  error: string | null;
};

const initial: SyncState = { userId: null, cursor: null, dirty: {}, lastSyncAt: null, status: 'idle', error: null };

export const useSync = create<SyncState>()(
  persist(() => initial, {
    name: 'gymmy-sync',
    version: 1,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ userId, cursor, dirty, lastSyncAt }) => ({ userId, cursor, dirty, lastSyncAt }),
  }),
);

/** Forget sync state, e.g. after deleting the account or wiping the phone's data. */
export function resetSync() {
  useSync.setState(initial);
}
