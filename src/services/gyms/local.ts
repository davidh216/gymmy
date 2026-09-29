import AsyncStorage from '@react-native-async-storage/async-storage';

import { getChallenge } from '@/lib/challenges';
import { uid } from '@/lib/format';
import { BOARD_SIZE, rankEntries, type ReportKind } from '@/lib/leaderboard';

import { seedWorld, type StoredEntry, type StoredGym } from './seed';
import type { Athlete, Board, Entry, Gym, GymsApi } from './types';

/**
 * A single-device stand-in for the real backend. Data lives in AsyncStorage and
 * the world is pre-seeded with sample gyms and rivals so boards aren't empty.
 */

const KEY = 'gymmy-gyms-v2';
export const ME = 'me';

type World = {
  athletes: Record<string, Athlete>;
  gyms: StoredGym[];
  entries: StoredEntry[];
  /** Reports filed by the current user, keyed by entry id. */
  myReports: Record<string, { kind: ReportKind; reason: string }>;
};

let world: World | null = null;

async function load(): Promise<World> {
  if (world) return world;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) world = JSON.parse(raw) as World;
  } catch {
    // Corrupt or unavailable storage: fall through to a fresh seed.
  }
  if (!world) {
    const seed = seedWorld(Date.now());
    world = {
      athletes: Object.fromEntries(seed.athletes.map((a) => [a.id, a])),
      gyms: seed.gyms,
      entries: seed.entries,
      myReports: {},
    };
    await save();
  }
  return world;
}

async function save() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(world));
  } catch {
    // Best effort; the in-memory world still works for this session.
  }
}

/** Clears local gyms data (used by "Reset all data"). */
export async function resetLocalGyms() {
  world = null;
  await AsyncStorage.removeItem(KEY).catch(() => {});
}

function toGym(g: StoredGym): Gym {
  return {
    id: g.id,
    kind: g.kind,
    name: g.name,
    area: g.area,
    inviteCode: g.inviteCode,
    sample: g.sample,
    memberCount: g.members.length,
    isMember: g.members.includes(ME),
  };
}

function toEntry(w: World, e: StoredEntry): Entry {
  return {
    id: e.id,
    gymId: e.gymId,
    challengeId: e.challengeId,
    athlete: w.athletes[e.userId],
    value: e.value,
    bodyweightKg: e.bodyweightKg,
    videoUri: e.videoUri,
    status: e.status,
    createdAt: e.createdAt,
    myReport: w.myReports[e.id]?.kind,
  };
}

/** Entries the current user can see on a board. */
function visible(w: World, gymId: string | null, challengeId: string) {
  return w.entries.filter(
    (e) =>
      e.challengeId === challengeId &&
      (gymId === null || e.gymId === gymId) &&
      e.status === 'live' &&
      w.myReports[e.id]?.kind !== 'inappropriate',
  );
}

function inviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const localGymsApi: GymsApi = {
  async myGyms() {
    const w = await load();
    return w.gyms.filter((g) => g.members.includes(ME)).map(toGym);
  },

  async searchGyms(query) {
    const w = await load();
    const q = query.trim().toLowerCase();
    return w.gyms
      .filter((g) => g.kind === 'public')
      .filter((g) => !q || `${g.name} ${g.area ?? ''}`.toLowerCase().includes(q))
      .map(toGym);
  },

  async getGym(id) {
    const w = await load();
    const gym = w.gyms.find((g) => g.id === id);
    return gym ? toGym(gym) : null;
  },

  async joinGym(id) {
    const w = await load();
    const gym = w.gyms.find((g) => g.id === id);
    if (gym && !gym.members.includes(ME)) gym.members.push(ME);
    await save();
  },

  async joinByInvite(code) {
    const w = await load();
    const gym = w.gyms.find((g) => g.inviteCode === code.trim().toUpperCase());
    if (!gym) return null;
    if (!gym.members.includes(ME)) gym.members.push(ME);
    await save();
    return toGym(gym);
  },

  async leaveGym(id) {
    const w = await load();
    const gym = w.gyms.find((g) => g.id === id);
    if (gym) gym.members = gym.members.filter((m) => m !== ME);
    await save();
  },

  async createGym({ kind, name, area }) {
    const w = await load();
    const gym: StoredGym = {
      id: uid(),
      kind,
      name: name.trim(),
      area: area?.trim() || undefined,
      inviteCode: kind === 'private' ? inviteCode() : undefined,
      members: [ME],
    };
    w.gyms.push(gym);
    await save();
    return toGym(gym);
  },

  async getBoard({ gymId, challengeId, mode }) {
    const w = await load();
    const ranked = rankEntries(visible(w, gymId, challengeId), getChallenge(challengeId), mode);
    const rows = ranked.map((r) => ({ rank: r.rank, score: r.score, entry: toEntry(w, r.entry) }));
    const mine = rows.find((r) => r.entry.athlete.id === ME) ?? null;
    const board: Board = {
      rows: rows.slice(0, BOARD_SIZE),
      me: mine && mine.rank > BOARD_SIZE ? mine : null,
      total: rows.length,
    };
    return board;
  },

  async getEntry(id) {
    const w = await load();
    const e = w.entries.find((x) => x.id === id);
    return e ? toEntry(w, e) : null;
  },

  async postEntry({ gymId, challengeId, value, bodyweightKg, videoUri, athlete }) {
    const w = await load();
    const challenge = getChallenge(challengeId);
    const podiumBefore = rankEntries(visible(w, gymId, challengeId), challenge, 'open')
      .slice(0, 3)
      .map((r) => r.entry.userId);

    w.athletes[ME] = { id: ME, ...athlete };
    const stored: StoredEntry = {
      id: uid(),
      gymId,
      challengeId,
      userId: ME,
      value,
      bodyweightKg,
      videoUri,
      // The real backend holds entries in `processing` until the content scan passes.
      status: 'live',
      createdAt: Date.now(),
    };
    w.entries.push(stored);
    await save();

    const after = rankEntries(visible(w, gymId, challengeId), challenge, 'open');
    const podiumAfter = after.slice(0, 3).map((r) => r.entry.userId);
    const rank = after.find((r) => r.entry.userId === ME)?.rank ?? after.length;
    const dethroned = podiumBefore
      .filter((id) => id !== ME && !podiumAfter.includes(id))
      .map((id) => w.athletes[id]);
    return { entry: toEntry(w, stored), rank, dethroned };
  },

  async reportEntry(id, kind, reason) {
    const w = await load();
    // Locally there's one reporter, so the hide thresholds can't be reached; the
    // report is recorded and inappropriate content is hidden for this user.
    w.myReports[id] = { kind, reason };
    await save();
  },

  async myMedals() {
    const w = await load();
    const medals: { gymId: string; challengeId: string; rank: number }[] = [];
    const mine = w.entries.filter((e) => e.userId === ME && e.status === 'live');
    const pairs = new Set(mine.map((e) => `${e.gymId}|${e.challengeId}`));
    for (const pair of pairs) {
      const [gymId, challengeId] = pair.split('|');
      const ranked = rankEntries(visible(w, gymId, challengeId), getChallenge(challengeId), 'open');
      const rank = ranked.find((r) => r.entry.userId === ME)?.rank;
      if (rank && rank <= 3) medals.push({ gymId, challengeId, rank });
    }
    return medals;
  },
};
