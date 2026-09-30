import { getChallenge } from '@/lib/challenges';
import { uid } from '@/lib/format';
import { BOARD_SIZE, rankEntries, type ReportKind } from '@/lib/leaderboard';

import { useAuth } from '../auth';
import { supabase } from '../supabase';
import type { Board, Entry, EntryStatus, Gym, GymsApi } from './types';

/** Gyms backed by Supabase. Access rules live in supabase/migrations. */

const BUCKET = 'attempts';
const SIGNED_URL_SECONDS = 60 * 60;

type GymRow = {
  id: string;
  kind: 'public' | 'private';
  name: string;
  area: string | null;
  invite_code: string | null;
  gym_members: { count: number }[];
};

type EntryRow = {
  id: string;
  gym_id: string;
  challenge_id: string;
  user_id: string;
  value: number;
  bodyweight_kg: number | null;
  video_path: string;
  status: EntryStatus;
  created_at: string;
  profile: { username: string; companion_id: string } | null;
};

const GYM_COLUMNS = 'id, kind, name, area, invite_code, gym_members(count)';
const ENTRY_COLUMNS =
  'id, gym_id, challenge_id, user_id, value, bodyweight_kg, video_path, status, created_at, profile:profiles(username, companion_id)';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function db() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

function me(): string {
  const id = useAuth.getState().userId;
  if (!id) throw new Error('Sign in to use gyms.');
  return id;
}

/** Throws a readable error for failed queries. */
function check<T>(result: { data: T; error: { message: string; code?: string } | null }): T {
  if (result.error) {
    const err = new Error(result.error.message) as Error & { code?: string };
    err.code = result.error.code;
    throw err;
  }
  return result.data;
}

function toGym(row: GymRow, isMember: boolean): Gym {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    area: row.area ?? undefined,
    inviteCode: row.invite_code ?? undefined,
    memberCount: row.gym_members[0]?.count ?? 0,
    isMember,
  };
}

export function toEntry(row: EntryRow, myReport?: ReportKind): Entry {
  return {
    id: row.id,
    gymId: row.gym_id,
    challengeId: row.challenge_id,
    athlete: {
      id: row.user_id,
      username: row.profile?.username ?? 'unknown',
      companionId: row.profile?.companion_id ?? 'kong',
    },
    value: Number(row.value),
    bodyweightKg: row.bodyweight_kg === null ? undefined : Number(row.bodyweight_kg),
    hasVideo: Boolean(row.video_path),
    status: row.status,
    createdAt: Date.parse(row.created_at),
    myReport,
  };
}

/** Strips characters that would break a PostgREST `or` filter. */
export function searchTerm(query: string): string {
  return query.replace(/[%,()*\\"'.:]/g, ' ').trim().slice(0, 40);
}

const VIDEO_TYPES: Record<string, string> = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };

/** File extension and MIME type for an upload, from the blob type or the URI. */
export function videoFormat(uri: string, blobType?: string): { ext: string; contentType: string } {
  const fromBlob = Object.entries(VIDEO_TYPES).find(([, type]) => type === blobType);
  if (fromBlob) return { ext: fromBlob[0], contentType: fromBlob[1] };
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (VIDEO_TYPES[ext]) return { ext, contentType: VIDEO_TYPES[ext] };
  return { ext: 'mp4', contentType: 'video/mp4' };
}

/**
 * Asks the moderate-entry Edge Function to scan a new video. If the call fails the
 * entry stays 'processing' and reaches the admin queue after 15 minutes.
 */
async function scanVideo(entryId: string): Promise<EntryStatus> {
  const { data, error } = await db().functions.invoke<{ status: EntryStatus }>('moderate-entry', {
    body: { entryId },
  });
  return error || !data?.status ? 'processing' : data.status;
}

async function myGymIds(): Promise<Set<string>> {
  const rows = check(await db().from('gym_members').select('gym_id').eq('user_id', me()));
  return new Set((rows as { gym_id: string }[]).map((r) => r.gym_id));
}

async function myReports(entryIds: string[]): Promise<Map<string, ReportKind>> {
  if (entryIds.length === 0) return new Map();
  const rows = check(
    await db().from('reports').select('entry_id, kind').eq('reporter_id', me()).in('entry_id', entryIds),
  ) as { entry_id: string; kind: ReportKind }[];
  return new Map(rows.map((r) => [r.entry_id, r.kind]));
}

async function boardRows(gymId: string | null, challengeId: string): Promise<EntryRow[]> {
  let query = db()
    .from('entries')
    .select(ENTRY_COLUMNS)
    .eq('challenge_id', challengeId)
    .eq('status', 'live')
    .order('created_at', { ascending: true })
    .limit(2000);
  if (gymId) query = query.eq('gym_id', gymId);
  return check(await query) as unknown as EntryRow[];
}

export const supabaseGymsApi: GymsApi = {
  currentUserId: () => useAuth.getState().userId,

  async updateMe(patch) {
    const update: Record<string, string> = {};
    if (patch.username) update.username = patch.username.toLowerCase();
    if (patch.companionId) update.companion_id = patch.companionId;
    if (Object.keys(update).length === 0) return;
    check(await db().from('profiles').update(update).eq('id', me()));
  },

  async myGyms() {
    const rows = check(
      await db().from('gym_members').select(`gym:gyms(${GYM_COLUMNS})`).eq('user_id', me()),
    ) as unknown as { gym: GymRow | null }[];
    return rows.flatMap((r) => (r.gym ? [toGym(r.gym, true)] : [])).sort((a, b) => a.name.localeCompare(b.name));
  },

  async searchGyms(query) {
    let q = db().from('gyms').select(GYM_COLUMNS).eq('kind', 'public').order('name').limit(30);
    const term = searchTerm(query);
    if (term) q = q.or(`name.ilike.%${term}%,area.ilike.%${term}%`);
    const [rows, mine] = await Promise.all([q.then((r) => check(r) as unknown as GymRow[]), myGymIds()]);
    return rows.map((g) => toGym(g, mine.has(g.id)));
  },

  async getGym(id) {
    if (!UUID.test(id)) return null;
    const [row, mine] = await Promise.all([
      db().from('gyms').select(GYM_COLUMNS).eq('id', id).maybeSingle().then((r) => check(r) as unknown as GymRow | null),
      myGymIds(),
    ]);
    return row ? toGym(row, mine.has(row.id)) : null;
  },

  async joinGym(id) {
    const { error } = await db().from('gym_members').insert({ gym_id: id });
    if (error && error.code !== '23505') throw new Error(error.message);
  },

  async joinByInvite(code) {
    const gymId = check(await db().rpc('join_gym_by_invite', { p_code: code })) as string | null;
    return gymId ? supabaseGymsApi.getGym(gymId) : null;
  },

  async leaveGym(id) {
    check(await db().from('gym_members').delete().eq('gym_id', id).eq('user_id', me()));
  },

  async createGym({ kind, name, area }) {
    const { data, error } = await db()
      .from('gyms')
      .insert({ kind, name, area: area || null })
      .select('id, kind, name, area, invite_code')
      .single();
    if (error?.code === '23505') throw new Error('That gym is already on Gymmy. Search for it instead.');
    if (error || !data) throw new Error(error?.message ?? 'Couldn’t create the gym.');
    return toGym({ ...(data as Omit<GymRow, 'gym_members'>), gym_members: [{ count: 1 }] }, true);
  },

  async getBoard({ gymId, challengeId, mode }) {
    const rows = await boardRows(gymId, challengeId);
    const ranked = rankEntries(
      rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        value: Number(r.value),
        bodyweightKg: r.bodyweight_kg === null ? undefined : Number(r.bodyweight_kg),
        createdAt: Date.parse(r.created_at),
        row: r,
      })),
      getChallenge(challengeId),
      mode,
    );
    const reports = await myReports(ranked.slice(0, BOARD_SIZE).map((r) => r.entry.id));
    const all = ranked.map((r) => ({ rank: r.rank, score: r.score, entry: toEntry(r.entry.row, reports.get(r.entry.id)) }));
    const meId = useAuth.getState().userId;
    const mine = all.find((r) => r.entry.athlete.id === meId) ?? null;
    const board: Board = {
      rows: all.slice(0, BOARD_SIZE),
      me: mine && mine.rank > BOARD_SIZE ? mine : null,
      total: all.length,
    };
    return board;
  },

  async getEntry(id) {
    if (!UUID.test(id)) return null;
    const row = check(await db().from('entries').select(ENTRY_COLUMNS).eq('id', id).maybeSingle()) as unknown as EntryRow | null;
    if (!row) return null;
    const [reports, signed] = await Promise.all([
      myReports([row.id]),
      db().storage.from(BUCKET).createSignedUrl(row.video_path, SIGNED_URL_SECONDS),
    ]);
    return { ...toEntry(row, reports.get(row.id)), videoUri: signed.data?.signedUrl };
  },

  async postEntry({ gymId, challengeId, value, bodyweightKg, videoUri, athlete }) {
    const userId = me();
    const challenge = getChallenge(challengeId);
    const topUsers = async () =>
      rankEntries(
        (await boardRows(gymId, challengeId)).map((r) => ({
          id: r.id,
          userId: r.user_id,
          value: Number(r.value),
          createdAt: Date.parse(r.created_at),
          row: r,
        })),
        challenge,
        'open',
      );

    const before = (await topUsers()).slice(0, 3);

    // Upload the clip into the user's own folder, then create the entry pointing at it.
    const file = await fetch(videoUri);
    const blob = await file.blob();
    const { ext, contentType } = videoFormat(videoUri, blob.type);
    const path = `${userId}/${uid()}.${ext}`;
    const upload = await db().storage.from(BUCKET).upload(path, await blob.arrayBuffer(), { contentType });
    if (upload.error) throw new Error(`Video upload failed: ${upload.error.message}`);

    await supabaseGymsApi.updateMe({ companionId: athlete.companionId }).catch(() => {});
    const inserted = await db()
      .from('entries')
      .insert({ gym_id: gymId, challenge_id: challengeId, value, bodyweight_kg: bodyweightKg ?? null, video_path: path })
      .select(ENTRY_COLUMNS)
      .single();
    if (inserted.error) {
      await db().storage.from(BUCKET).remove([path]);
      throw new Error(inserted.error.message);
    }

    const entry = toEntry(inserted.data as unknown as EntryRow);
    const status = entry.status === 'processing' ? await scanVideo(entry.id) : entry.status;
    if (status !== 'live') return { entry: { ...entry, status }, status, rank: 0, dethroned: [] };

    const after = await topUsers();
    const rank = after.find((r) => r.entry.userId === userId)?.rank ?? after.length;
    const podium = new Set(after.slice(0, 3).map((r) => r.entry.userId));
    const dethroned = before
      .filter((r) => r.entry.userId !== userId && !podium.has(r.entry.userId))
      .map((r) => toEntry(r.entry.row).athlete);
    return { entry: { ...entry, status }, status, rank, dethroned };
  },

  async reportEntry(id, kind, reason) {
    const { error } = await db().from('reports').insert({ entry_id: id, kind, reason });
    if (error && error.code !== '23505') throw new Error(error.message);
  },

  async blockUser(athleteId) {
    const { error } = await db().from('blocks').insert({ blocked_id: athleteId });
    if (error && error.code !== '23505') throw new Error(error.message);
  },

  async myMedals() {
    const rows = check(
      await db().from('entries').select('gym_id, challenge_id').eq('user_id', me()).eq('status', 'live'),
    ) as { gym_id: string; challenge_id: string }[];
    const pairs = [...new Set(rows.map((r) => `${r.gym_id}|${r.challenge_id}`))];
    const userId = me();
    const results = await Promise.all(
      pairs.map(async (pair) => {
        const [gymId, challengeId] = pair.split('|');
        const ranked = rankEntries(
          (await boardRows(gymId, challengeId)).map((r) => ({
            id: r.id,
            userId: r.user_id,
            value: Number(r.value),
            createdAt: Date.parse(r.created_at),
          })),
          getChallenge(challengeId),
          'open',
        );
        const rank = ranked.find((r) => r.entry.userId === userId)?.rank;
        return rank && rank <= 3 ? { gymId, challengeId, rank } : null;
      }),
    );
    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  },
};
