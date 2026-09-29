import type { Challenge } from './challenges';

export type BoardMode = 'open' | 'p4p';

export type RankableEntry = {
  id: string;
  userId: string;
  value: number;
  bodyweightKg?: number;
  createdAt: number;
};

export type Ranked<E extends RankableEntry> = { rank: number; score: number; entry: E };

export const BOARD_SIZE = 10;

export const MEDALS = ['🥇', '🥈', '🥉'] as const;

export function medalFor(rank: number): string | null {
  return MEDALS[rank - 1] ?? null;
}

/** The number a board sorts by: raw value, or value per kg of bodyweight. */
export function scoreOf(entry: RankableEntry, mode: BoardMode): number | null {
  if (mode === 'open') return entry.value;
  return entry.bodyweightKg && entry.bodyweightKg > 0 ? entry.value / entry.bodyweightKg : null;
}

/**
 * Ranks entries: each user's best entry only, best first, earlier posts win ties.
 * Entries that can't be scored in this mode (no bodyweight for p4p) are left out.
 */
export function rankEntries<E extends RankableEntry>(
  entries: E[],
  challenge: Challenge,
  mode: BoardMode,
): Ranked<E>[] {
  const better = (a: number, b: number) => (challenge.higherIsBetter ? a > b : a < b);
  const best = new Map<string, { score: number; entry: E }>();
  for (const entry of entries) {
    const score = scoreOf(entry, mode);
    if (score === null) continue;
    const current = best.get(entry.userId);
    if (
      !current ||
      better(score, current.score) ||
      (score === current.score && entry.createdAt < current.entry.createdAt)
    ) {
      best.set(entry.userId, { score, entry });
    }
  }
  return [...best.values()]
    .sort((a, b) =>
      a.score === b.score ? a.entry.createdAt - b.entry.createdAt : better(a.score, b.score) ? -1 : 1,
    )
    .map((row, i) => ({ rank: i + 1, ...row }));
}

export type ReportKind = 'invalid' | 'inappropriate';

/** Counted reports needed before an entry is hidden pending review. */
export const HIDE_THRESHOLD: Record<ReportKind, number> = { invalid: 3, inappropriate: 1 };

/** Reports only count from accounts at least this old, to blunt throwaway brigading. */
export const MIN_REPORTER_AGE_DAYS = 7;

export function reportCounts(reporterCreatedAt: number, now: number): boolean {
  return now - reporterCreatedAt >= MIN_REPORTER_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function shouldHide(counted: Record<ReportKind, number>): boolean {
  return (Object.keys(HIDE_THRESHOLD) as ReportKind[]).some((k) => counted[k] >= HIDE_THRESHOLD[k]);
}
