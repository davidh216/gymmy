import { useAuth } from '../auth';
import { isRemote } from '../supabase';
import { localGymsApi } from './local';
import { supabaseGymsApi } from './supabase';
import type { GymsApi } from './types';

/** Supabase when configured; the local stand-in for the offline preview. */
export const gymsApi: GymsApi = isRemote ? supabaseGymsApi : localGymsApi;

/** The current athlete's id, reactive to sign-in and sign-out. */
export function useMeId(): string | null {
  const userId = useAuth((s) => s.userId);
  return isRemote ? userId : gymsApi.currentUserId();
}

export * from './types';
