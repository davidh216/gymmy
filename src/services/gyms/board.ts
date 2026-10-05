import type { Challenge } from '@/lib/challenges';
import {
  BOARD_SIZE,
  primaryMode,
  rankEntries,
  seasonBoard,
  type BoardMode,
  type RankableEntry,
  type Season,
} from '@/lib/leaderboard';
import { isPacerId, pacerEntries } from '@/lib/pacers';

import type { Board, Entry } from './types';

type Item = RankableEntry & { entry: Entry };

const rankable = (entry: Entry): Item => ({
  id: entry.id,
  userId: entry.athlete.id,
  value: entry.value,
  reps: entry.reps,
  bodyweightKg: entry.bodyweightKg,
  createdAt: entry.createdAt,
  entry,
});

/** Baseline rows as entries, so they render like any other row. */
function pacerItems(challenge: Challenge, now: number): Item[] {
  return pacerEntries(challenge, now).map((p) => ({
    ...p,
    entry: {
      id: p.id,
      gymId: '',
      challengeId: challenge.id,
      athlete: { id: p.userId, username: p.pacer.label, companionId: 'kong' },
      value: p.value,
      reps: p.reps,
      bodyweightKg: p.bodyweightKg,
      hasVideo: false,
      status: 'live',
      createdAt: p.createdAt,
      pacer: true,
    },
  }));
}

/** Ranks real entries alongside the baseline pacers. */
export function buildBoard(
  entries: Entry[],
  challenge: Challenge,
  mode: BoardMode,
  season: Season,
  meId: string | null,
  now: number,
): Board {
  const { ranked, crowns } = seasonBoard(
    [...entries.map(rankable), ...pacerItems(challenge, now)],
    challenge,
    mode,
    season,
    now,
  );
  const rows = ranked.map((r) => ({
    rank: r.rank,
    score: r.score,
    entry: r.entry.entry,
    crowns: crowns.get(r.entry.userId),
  }));
  const mine = meId ? (rows.find((r) => r.entry.athlete.id === meId) ?? null) : null;
  return {
    rows: rows.slice(0, BOARD_SIZE),
    me: mine && mine.rank > BOARD_SIZE ? mine : null,
    total: rows.filter((r) => !r.entry.pacer).length,
  };
}

/** Ranking on a challenge's main board (pacers included), for podiums and medals. */
export function primaryRanking<E extends RankableEntry>(entries: E[], challenge: Challenge, now: number) {
  return rankEntries<RankableEntry>([...entries, ...pacerEntries(challenge, now)], challenge, primaryMode(challenge));
}

/** Real athletes on the podium, best first. */
export function podiumUsers(ranked: { entry: RankableEntry }[]): string[] {
  return ranked
    .slice(0, 3)
    .map((r) => r.entry.userId)
    .filter((id) => !isPacerId(id));
}
