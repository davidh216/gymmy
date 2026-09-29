import { localGymsApi } from './local';
import type { GymsApi } from './types';

/** Swap for the Supabase implementation in stage 2 (see docs/gyms-spec.md). */
export const gymsApi: GymsApi = localGymsApi;

export * from './types';
