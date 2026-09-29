import { formatSeconds, getChallenge, parseSeconds } from '../challenges';
import { medalFor, rankEntries, reportCounts, shouldHide } from '../leaderboard';

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
