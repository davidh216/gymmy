import { dayKey } from '../recovery';
import {
  goalStatus,
  mergeHealthWeights,
  shouldPromptReview,
  suggestedWeight,
  sundayStart,
  trendPerWeek,
  weeklyAverages,
  weeklyReview,
  type WeighIn,
} from '../weight';

const DAY = 86_400_000;
// Wednesday 7 October 2026, 9am.
const NOW = new Date(2026, 9, 7, 9).getTime();
const daysAgo = (n: number) => dayKey(NOW - n * DAY);
const log = (entries: [number, number][]): Record<string, WeighIn> =>
  Object.fromEntries(entries.map(([ago, kg]) => [daysAgo(ago), { date: daysAgo(ago), kg, at: NOW - ago * DAY }]));

describe('weeks', () => {
  it('start on Sunday', () => {
    expect(new Date(sundayStart(NOW))).toEqual(new Date(2026, 9, 4));
    expect(sundayStart(new Date(2026, 9, 4, 0, 30).getTime())).toBe(new Date(2026, 9, 4).getTime());
  });

  it('average each week, oldest first', () => {
    const weeks = weeklyAverages(
      log([
        [0, 80],
        [1, 82],
        [4, 83],
        [10, 84],
      ]),
      3,
      NOW,
    );
    expect(weeks.map((w) => w.avgKg)).toEqual([undefined, 83.5, 81]);
    expect(weeks.map((w) => w.count)).toEqual([0, 2, 2]);
  });
});

describe('trend', () => {
  it('fits the change per week across a few weeks', () => {
    const steady = log(Array.from({ length: 22 }, (_, i): [number, number] => [i, 80 + i * 0.1]));
    expect(trendPerWeek(steady, NOW)).toBeCloseTo(-0.7, 5);
  });

  it('needs readings at least a week apart', () => {
    expect(
      trendPerWeek(
        log([
          [0, 80],
          [3, 81],
        ]),
        NOW,
      ),
    ).toBeUndefined();
  });
});

describe('goals', () => {
  const lose = { direction: 'lose' as const, ratePerWeekKg: 0.5 };
  it('rates the pace against the target', () => {
    expect(goalStatus(lose, -0.5)).toBe('on_track');
    expect(goalStatus(lose, -0.1)).toBe('behind');
    expect(goalStatus(lose, -1)).toBe('ahead');
    expect(goalStatus(lose, 0.2)).toBe('wrong_way');
    expect(goalStatus({ direction: 'gain', ratePerWeekKg: 0.25 }, 0.25)).toBe('on_track');
    expect(goalStatus({ direction: 'maintain', ratePerWeekKg: 0 }, 0.1)).toBe('on_track');
    expect(goalStatus({ direction: 'maintain', ratePerWeekKg: 0 }, -0.6)).toBe('wrong_way');
  });

  it('builds the weekly review', () => {
    const r = weeklyReview(
      log([
        [0, 79.5],
        [8, 80.5],
        [15, 81],
      ]),
      lose,
      NOW,
    );
    expect(r.thisWeekKg).toBe(79.5);
    expect(r.lastWeekKg).toBe(80.5);
    expect(r.changeKg).toBeCloseTo(-1);
    expect(r.status).toBeDefined();
    expect(r.weeks).toHaveLength(8);
  });
});

describe('prompting', () => {
  it('asks once a week, and only when turned on', () => {
    expect(shouldPromptReview(undefined, 0, NOW)).toBe(false);
    expect(shouldPromptReview({ enabled: false }, 0, NOW)).toBe(false);
    expect(shouldPromptReview({ enabled: true }, 0, NOW)).toBe(true);
    expect(shouldPromptReview({ enabled: true }, sundayStart(NOW), NOW)).toBe(false);
  });

  it('suggests a fresh Health reading, else the latest weigh-in', () => {
    expect(suggestedWeight(log([[2, 81]]), { kg: 80, at: NOW - DAY }, NOW)).toBe(80);
    expect(suggestedWeight(log([[2, 81]]), { kg: 80, at: NOW - 9 * DAY }, NOW)).toBe(81);
    expect(suggestedWeight({}, undefined, NOW)).toBeUndefined();
  });
});

describe('Health readings', () => {
  it('fill days you did not log yourself, latest reading per day', () => {
    const mine = log([[0, 80]]);
    const merged = mergeHealthWeights(mine, [
      { kg: 79, at: NOW - 1000 },
      { kg: 81.234, at: NOW - DAY - 5000 },
      { kg: 81.5, at: NOW - DAY - 1000 },
    ]);
    expect(merged[daysAgo(0)]).toEqual(mine[daysAgo(0)]);
    expect(merged[daysAgo(1)]).toMatchObject({ kg: 81.5, source: 'health' });
  });

  it('returns the same object when nothing changes', () => {
    const mine = log([[0, 80]]);
    expect(mergeHealthWeights(mine, [{ kg: 79, at: NOW }])).toBe(mine);
  });
});
