import { formatSeconds, getChallenge, parseSeconds } from '../challenges';
import {
  medalFor,
  monthStart,
  pastChampions,
  rankEntries,
  reportCounts,
  seasonBoard,
  seasonDaysLeft,
  seasonName,
  shouldHide,
} from '../leaderboard';

const e = (id: string, userId: string, value: number, createdAt: number, bodyweightKg?: number) => ({
  id,
  userId,
  value,
  createdAt,
  bodyweightKg,
});

const bench = getChallenge('bench_1rm');
const row = getChallenge('row_500m');

describe('rankEntries', () => {
  it('keeps only each user’s best and sorts best first', () => {
    const ranked = rankEntries([e('a', 'u1', 100, 1), e('b', 'u1', 120, 2), e('c', 'u2', 110, 3)], bench, 'open');
    expect(ranked.map((r) => [r.rank, r.entry.id])).toEqual([
      [1, 'b'],
      [2, 'c'],
    ]);
  });

  it('breaks ties by who posted first', () => {
    const ranked = rankEntries([e('late', 'u1', 100, 5), e('early', 'u2', 100, 1)], bench, 'open');
    expect(ranked[0].entry.id).toBe('early');
  });

  it('ranks lower-is-better challenges ascending', () => {
    const ranked = rankEntries([e('slow', 'u1', 110, 1), e('fast', 'u2', 95.5, 2)], row, 'open');
    expect(ranked[0].entry.id).toBe('fast');
  });

  it('ranks pound-for-pound by value per bodyweight and skips missing bodyweight', () => {
    const ranked = rankEntries(
      [e('big', 'u1', 180, 1, 120), e('small', 'u2', 120, 2, 60), e('none', 'u3', 200, 3)],
      bench,
      'p4p',
    );
    expect(ranked.map((r) => r.entry.id)).toEqual(['small', 'big']);
    expect(ranked[0].score).toBe(2);
  });
});

describe('medals and reports', () => {
  it('awards medals to the podium only', () => {
    expect([1, 2, 3, 4].map(medalFor)).toEqual(['🥇', '🥈', '🥉', null]);
  });

  it('counts reports only from established accounts', () => {
    const day = 24 * 60 * 60 * 1000;
    expect(reportCounts(0, 6 * day)).toBe(false);
    expect(reportCounts(0, 7 * day)).toBe(true);
  });

  it('hides after 3 invalid-lift reports or 1 inappropriate report', () => {
    expect(shouldHide({ invalid: 2, inappropriate: 0 })).toBe(false);
    expect(shouldHide({ invalid: 3, inappropriate: 0 })).toBe(true);
    expect(shouldHide({ invalid: 0, inappropriate: 1 })).toBe(true);
  });
});

describe('time helpers', () => {
  it('parses and formats times', () => {
    expect(parseSeconds('1:42.5')).toBe(102.5);
    expect(parseSeconds('95')).toBe(95);
    expect(parseSeconds('1:x')).toBeNull();
    expect(parseSeconds('0')).toBeNull();
    expect(formatSeconds(102.5)).toBe('1:42.5');
    expect(formatSeconds(95)).toBe('1:35');
    expect(formatSeconds(45)).toBe('45s');
  });
});

describe('endurance and carry challenges', () => {
  it('rank the fastest 5K first and read as a race clock', () => {
    const run = getChallenge('run_5k');
    const ranked = rankEntries([e('a', 'u1', 1530, 1), e('b', 'u2', 1395, 2)], run, 'open');
    expect(ranked.map((r) => r.entry.id)).toEqual(['b', 'a']);
    expect(formatSeconds(1530)).toBe('25:30');
    expect(parseSeconds('25:30')).toBe(1530);
  });

  it('treat the farmers carry as a loaded lift with pound-for-pound', () => {
    const carry = getChallenge('farmers_carry');
    expect(carry.metric).toBe('weight');
    expect(rankEntries([e('a', 'u1', 70, 1, 70), e('b', 'u2', 60, 2, 50)], carry, 'p4p')[0].entry.id).toBe('b');
  });
});

describe('monthly seasons', () => {
  const at = (month: number, day: number) => new Date(2026, month, day, 12).getTime();
  const now = at(9, 2); // Oct 2

  const entries = [
    // August: u1 wins. September: u2 wins (u1 posted too).
    e('aug1', 'u1', 150, at(7, 3)),
    e('aug2', 'u2', 140, at(7, 9)),
    e('sep1', 'u1', 155, at(8, 4)),
    e('sep2', 'u2', 160, at(8, 20)),
    // October so far: only u3.
    e('oct3', 'u3', 120, at(9, 1)),
  ];

  it('ranks only this month’s entries in the current season', () => {
    const { ranked } = seasonBoard(entries, bench, 'open', 'month', now);
    expect(ranked.map((r) => r.entry.id)).toEqual(['oct3']);
    expect(seasonBoard(entries, bench, 'open', 'all', now).ranked[0].entry.id).toBe('sep2');
  });

  it('crowns each finished month’s winner', () => {
    const crowns = pastChampions(entries, bench, 'open', now);
    expect(Object.fromEntries(crowns)).toEqual({ u1: 1, u2: 1 });
    // A September best doesn't count again for October.
    expect(pastChampions(entries, bench, 'open', at(8, 25)).get('u2')).toBeUndefined();
  });

  it('counts down the season', () => {
    expect(monthStart(now)).toBe(new Date(2026, 9, 1).getTime());
    expect(seasonDaysLeft(new Date(2026, 9, 31, 20).getTime())).toBe(1);
    expect(seasonDaysLeft(new Date(2026, 9, 1, 0, 0, 1).getTime())).toBe(31);
    expect(seasonName(now)).toBe('October 2026');
  });
});
