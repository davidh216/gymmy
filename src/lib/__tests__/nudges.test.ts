import { NUDGE_GAP_MS, nextNudge, suggestTrainingDays } from '../nudges';

const now = new Date(2026, 9, 12, 12).getTime();
const all = { reminders: true, health: true, body: true };
const none = { reminders: false, health: false, body: false };
const base = { now, seen: {}, available: all, done: none };

describe('nextNudge', () => {
  it('waits for the first workout, then asks one thing at a time in order', () => {
    expect(nextNudge({ ...base, workouts: 0 })).toBeNull();
    expect(nextNudge({ ...base, workouts: 1 })).toBe('reminders');
    expect(nextNudge({ ...base, workouts: 3 })).toBe('reminders');
  });

  it('moves on once answered, but not on the same day', () => {
    const seen = { reminders: now - 3_600_000 };
    expect(nextNudge({ ...base, workouts: 3, seen })).toBeNull();
    expect(nextNudge({ ...base, workouts: 3, seen: { reminders: now - NUDGE_GAP_MS } })).toBe('health');
  });

  it('skips prompts already set up or not available here', () => {
    expect(nextNudge({ ...base, workouts: 3, done: { ...none, reminders: true } })).toBe('health');
    expect(nextNudge({ ...base, workouts: 3, available: { ...none, body: true } })).toBe('body');
    expect(nextNudge({ ...base, workouts: 2, available: { ...none, body: true } })).toBeNull();
  });
});

describe('suggestTrainingDays', () => {
  const at = (d: number) => new Date(2026, 9, d, 18).getTime();
  it('picks the days you train most, as many as your goal', () => {
    // Oct 2026: 5 = Mon, 7 = Wed, 12 = Mon, 13 = Tue.
    expect(suggestTrainingDays([at(5), at(12), at(7), at(13)], 2)).toEqual([1, 2]);
  });

  it('tops up with spaced weekdays', () => {
    expect(suggestTrainingDays([], 3)).toEqual([1, 3, 5]);
    expect(suggestTrainingDays([at(13)], 3)).toEqual([1, 2, 3]);
  });
});
