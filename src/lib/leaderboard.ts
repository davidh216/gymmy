import type { Challenge } from './challenges';

/**
 * How a board ranks: `total` is weight × reps, `open` the raw result (max weight for lifts),
 * `p4p` the weight as a share of bodyweight.
 */
export type BoardMode = 'total' | 'open' | 'p4p';

export type RankableEntry = {
  id: string;
  userId: string;
  value: number;
  /** Reps in the set, for weight × reps lifts. */
  reps?: number;
  bodyweightKg?: number;
  createdAt: number;
};

export type Ranked<E extends RankableEntry> = { rank: number; score: number; entry: E };

export const BOARD_SIZE = 10;

export const MEDALS = ['🥇', '🥈', '🥉'] as const;

export function medalFor(rank: number): string | null {
  return MEDALS[rank - 1] ?? null;
}

/** The ways a challenge's board can be ranked, the default first. */
export function boardModes(challenge: Challenge): BoardMode[] {
  if (challenge.reps) return ['total', 'open', 'p4p'];
  if (challenge.metric === 'weight') return ['open', 'p4p'];
  return ['open'];
}

/** The ranking used for podiums, medals and "you're #N" after posting. */
export function primaryMode(challenge: Challenge): BoardMode {
  return boardModes(challenge)[0];
}

export const MODE_LABELS: Record<BoardMode, string> = {
  total: 'Total',
  open: 'Max weight',
  p4p: 'Bodyweight %',
};

/** The number a board sorts by: weight × reps, the raw value, or value per kg of bodyweight. */
export function scoreOf(entry: RankableEntry, mode: BoardMode): number | null {
  if (mode === 'total') return entry.value * (entry.reps ?? 1);
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

/** Boards run as monthly seasons; "all" is the all-time board. */
export type Season = 'month' | 'all';

/** Local midnight on the 1st of the month containing `ts`. */
export function monthStart(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

/** Days left in the current season, counting today. */
export function seasonDaysLeft(now: number): number {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
  return Math.max(1, Math.ceil((next - now) / 86_400_000));
}

/** "October 2026" */
export function seasonName(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Who finished #1 in each finished monthly season: userId -> number of crowns.
 * Only months before the current one count.
 */
export function pastChampions<E extends RankableEntry>(
  entries: E[],
  challenge: Challenge,
  mode: BoardMode,
  now: number,
): Map<string, number> {
  const current = monthStart(now);
  const byMonth = new Map<number, E[]>();
  for (const e of entries) {
    const m = monthStart(e.createdAt);
    if (m >= current) continue;
    byMonth.set(m, [...(byMonth.get(m) ?? []), e]);
  }
  const crowns = new Map<string, number>();
  for (const monthEntries of byMonth.values()) {
    const top = rankEntries(monthEntries, challenge, mode)[0];
    if (top) crowns.set(top.entry.userId, (crowns.get(top.entry.userId) ?? 0) + 1);
  }
  return crowns;
}

/** The ranking for a season plus everyone's past-season crowns. */
export function seasonBoard<E extends RankableEntry>(
  entries: E[],
  challenge: Challenge,
  mode: BoardMode,
  season: Season,
  now: number,
): { ranked: Ranked<E>[]; crowns: Map<string, number> } {
  const inSeason = season === 'all' ? entries : entries.filter((e) => e.createdAt >= monthStart(now));
  return { ranked: rankEntries(inSeason, challenge, mode), crowns: pastChampions(entries, challenge, mode, now) };
}
