import { againstBaseline, freshVitals, heartScore, type Reading } from '../health';
import { readiness } from '../recovery';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 2, 8);
const daily = (values: number[]): Reading[] => values.map((value, i) => ({ value, at: NOW - (values.length - i) * DAY }));

describe('heart signals against your normal', () => {
  it('compares today with the two weeks before', () => {
    const readings = [...daily([50, 52, 48, 50, 50]), { value: 40, at: NOW - 3600_000 }, { value: 44, at: NOW - 7200_000 }];
    expect(againstBaseline(readings, NOW)).toEqual({ today: 42, baseline: 50 });
  });

  it('needs a few days of history before setting a baseline', () => {
    expect(againstBaseline([...daily([50, 52]), { value: 40, at: NOW - 60_000 }], NOW)).toEqual({ today: 40, baseline: undefined });
    expect(againstBaseline([], NOW)).toEqual({ today: undefined, baseline: undefined });
  });

  it('scores HRV dips and resting heart rate rises', () => {
    expect(heartScore({ hrv: 50, hrvBaseline: 50 })).toBe(75);
    expect(heartScore({ hrv: 45, hrvBaseline: 50 })).toBe(50);
    expect(heartScore({ hrv: 60, hrvBaseline: 50 })).toBe(100);
    expect(heartScore({ rhr: 58, rhrBaseline: 54 })).toBe(51);
    expect(heartScore({ hrv: 45, hrvBaseline: 50, rhr: 54, rhrBaseline: 54 })).toBe(63);
    expect(heartScore({ hrv: 45 })).toBeUndefined();
  });

  it('ignores stale readings', () => {
    expect(freshVitals({ hrv: 1, at: NOW - 2 * DAY }, NOW)).toBeUndefined();
    expect(freshVitals({ hrv: 1, at: NOW - 3600_000 }, NOW)?.hrv).toBe(1);
  });

  it('feed readiness as a heart factor', () => {
    const without = readiness(undefined, [], NOW);
    const low = readiness(undefined, [], NOW, 20);
    expect(low.factors.map((f) => f.label)).toContain('Heart (HRV)');
    expect(low.score).toBeLessThan(without.score);
  });
});
