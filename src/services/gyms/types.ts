import type { BoardMode, ReportKind, Season } from '@/lib/leaderboard';
import type { NearbyPlace } from '@/lib/places';

export type GymKind = 'public' | 'private';

export type Gym = {
  id: string;
  kind: GymKind;
  name: string;
  /** Neighbourhood or address line for public gyms. */
  area?: string;
  /** Private gyms only. */
  inviteCode?: string;
  /** Map place this gym is linked to (osm:node/123), if any. */
  placeId?: string;
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
  /** Reps in the set, for weight × reps lifts. */
  reps?: number;
  bodyweightKg?: number;
  hasVideo: boolean;
  /** Playable URL; only filled in when loading a single entry. */
  videoUri?: string;
  status: EntryStatus;
  createdAt: number;
  /** Set when the current user has reported this entry. */
  myReport?: ReportKind;
  /** A baseline row from Gymmy, not a real athlete. */
  pacer?: boolean;
};

export type BoardRow = {
  rank: number;
  score: number;
  entry: Entry;
  /** Monthly seasons this athlete finished #1 on this board. */
  crowns?: number;
};

export type Board = {
  rows: BoardRow[];
  /** The current user's row when they're ranked outside the visible top. */
  me: BoardRow | null;
  total: number;
};

export type BoardQuery = {
  gymId: string | null;
  challengeId: string;
  mode: BoardMode;
  /** The current monthly season, or all time (the default). */
  season?: Season;
};

export type PostEntryInput = {
  gymId: string;
  challengeId: string;
  value: number;
  reps?: number;
  bodyweightKg?: number;
  videoUri: string;
  athlete: Omit<Athlete, 'id' | 'sample'>;
};

export type PostEntryResult = {
  entry: Entry;
  /** 'live' once on the board; 'processing' or 'hidden' while the video is checked or reviewed. */
  status: EntryStatus;
  rank: number;
  /** Who got pushed off the podium by this entry, if anyone. */
  dethroned: Athlete[];
};

/** Everything the app needs from the gyms backend. Local now, Supabase later. */
export interface GymsApi {
  /** Id of the signed-in athlete, or null when signed out. */
  currentUserId(): string | null;
  /** Keep the public profile in sync with local settings. */
  updateMe(patch: { username?: string; companionId?: string }): Promise<void>;

  myGyms(): Promise<Gym[]>;
  searchGyms(query: string): Promise<Gym[]>;
  getGym(id: string): Promise<Gym | null>;
  joinGym(id: string): Promise<void>;
  joinByInvite(code: string): Promise<Gym | null>;
  leaveGym(id: string): Promise<void>;
  createGym(input: { kind: GymKind; name: string; area?: string }): Promise<Gym>;
  /** Gymmy gyms already linked to these map places, keyed by place id. */
  gymsForPlaces(placeIds: string[]): Promise<Record<string, Gym>>;
  /** Joins the Gymmy gym for a map place, creating it on first use. */
  joinPlace(place: NearbyPlace): Promise<Gym>;

  getBoard(query: BoardQuery): Promise<Board>;
  getEntry(id: string): Promise<Entry | null>;
  postEntry(input: PostEntryInput): Promise<PostEntryResult>;
  reportEntry(id: string, kind: ReportKind, reason: string): Promise<void>;
  /** Hides everything this athlete posts, for the current user. */
  blockUser(athleteId: string): Promise<void>;

  /** Current user's podium finishes per gym, for badges. */
  myMedals(): Promise<{ gymId: string; challengeId: string; rank: number }[]>;
}
