import { activeDaysThisWeek, countInWeek, daysSince, weekStart, weekStreak, weeklyCounts } from '../streaks';

// Wednesday, 2026-09-16 at noon local time.
const NOW = new Date(2026, 8, 16, 12).getTime();
const day = (offset: number, hour = 9) => new Date(2026, 8, 16 + offset, hour).getTime();

describe('weekStart', () => {
  it('returns Monday at midnight', () => {
    const d = new Date(weekStart(NOW));
    expect(d.getDay()).toBe(1);
    expect(d.getDate()).toBe(14);
    expect(d.getHours()).toBe(0);
  });

  it('treats Sunday as the end of the week', () => {
    expect(weekStart(day(4))).toBe(weekStart(NOW));
    expect(weekStart(day(5))).not.toBe(weekStart(NOW));
  });
});

describe('weekStreak', () => {
  it('is zero with no workouts', () => {
    expect(weekStreak([], 3, NOW)).toBe(0);
  });

  it('counts previous full weeks without breaking on the current week', () => {
    const lastWeek = [day(-7), day(-8), day(-9)];
    const twoWeeksAgo = [day(-14), day(-15), day(-16)];
    expect(weekStreak([...lastWeek, ...twoWeeksAgo], 3, NOW)).toBe(2);
  });

  it('includes the current week once the goal is met', () => {
    const times = [day(0), day(-1), day(-2, 8), day(-7), day(-8), day(-9)];
    expect(weekStreak(times, 3, NOW)).toBe(2);
  });

  it('does not let double sessions inflate a week', () => {
    expect(weekStreak([day(-7), day(-7, 18), day(-8)], 3, NOW)).toBe(0);
  });

  it('breaks on a missed week', () => {
    expect(weekStreak([day(-14), day(-15), day(-16)], 3, NOW)).toBe(0);
  });
});

describe('weekly helpers', () => {
  it('counts distinct training days in the current week', () => {
    const times = [day(0), day(-2), day(-2, 18), day(-7)];
    expect(countInWeek(times, NOW)).toBe(2);
    expect([...activeDaysThisWeek(times, NOW)].sort()).toEqual([0, 2]);
  });

  it('buckets weekly counts oldest first', () => {
    expect(weeklyCounts([day(0), day(-7), day(-8)], 3, NOW)).toEqual([0, 2, 1]);
    expect(weeklyCounts([day(0), day(0, 18)], 1, NOW)).toEqual([1]);
  });

  it('measures calendar days since the last workout', () => {
    expect(daysSince([], NOW)).toBeNull();
    expect(daysSince([day(0, 7)], NOW)).toBe(0);
    expect(daysSince([day(-3), day(-10)], NOW)).toBe(3);
  });
});
