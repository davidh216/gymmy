import type { BoardMode, ReportKind } from '@/lib/leaderboard';

export type GymKind = 'public' | 'private';

export type Gym = {
  id: string;
  kind: GymKind;
  name: string;
  /** Neighbourhood or address line for public gyms. */
  area?: string;
  /** Private gyms only. */
  inviteCode?: string;
  memberCount: number;
  isMember: boolean;
  /** Seeded for the local preview, not a real place. */
  sample?: boolean;
};

export type Athlete = {
  id: string;
  username: string;
  companionId: string;
  sample?: boolean;
};

export type EntryStatus = 'processing' | 'live' | 'hidden' | 'removed';

export type Entry = {
  id: string;
  gymId: string;
  challengeId: string;
  athlete: Athlete;
  /** kg, reps or seconds depending on the challenge metric. */
  value: number;
  bodyweightKg?: number;
  videoUri?: string;
  status: EntryStatus;
  createdAt: number;
  /** Set when the current user has reported this entry. */
  myReport?: ReportKind;
};

export type BoardRow = { rank: number; score: number; entry: Entry };

export type Board = {
  rows: BoardRow[];
  /** The current user's row when they're ranked outside the visible top. */
  me: BoardRow | null;
  total: number;
};

export type BoardQuery = { gymId: string | null; challengeId: string; mode: BoardMode };

export type PostEntryInput = {
  gymId: string;
  challengeId: string;
  value: number;
  bodyweightKg?: number;
  videoUri: string;
  athlete: Omit<Athlete, 'id' | 'sample'>;
};

export type PostEntryResult = {
  entry: Entry;
  rank: number;
  /** Who got pushed off the podium by this entry, if anyone. */
  dethroned: Athlete[];
};

/** Everything the app needs from the gyms backend. Local now, Supabase later. */
export interface GymsApi {
  myGyms(): Promise<Gym[]>;
  searchGyms(query: string): Promise<Gym[]>;
  getGym(id: string): Promise<Gym | null>;
  joinGym(id: string): Promise<void>;
  joinByInvite(code: string): Promise<Gym | null>;
  leaveGym(id: string): Promise<void>;
  createGym(input: { kind: GymKind; name: string; area?: string }): Promise<Gym>;

  getBoard(query: BoardQuery): Promise<Board>;
  getEntry(id: string): Promise<Entry | null>;
  postEntry(input: PostEntryInput): Promise<PostEntryResult>;
  reportEntry(id: string, kind: ReportKind, reason: string): Promise<void>;

  /** Current user's podium finishes per gym, for badges. */
  myMedals(): Promise<{ gymId: string; challengeId: string; rank: number }[]>;
}
