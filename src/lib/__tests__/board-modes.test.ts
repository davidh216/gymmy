import { formatResult, getChallenge } from '../challenges';
import { boardModes, primaryMode, rankEntries, scoreOf, seasonBoard } from '../leaderboard';
import { isPacerId, PACER_BODYWEIGHT_KG, pacerEntries, pacersFor } from '../pacers';

const bench = getChallenge('bench_1rm');
const set = (id: string, userId: string, value: number, reps?: number, bodyweightKg?: number) => ({
  id,
  userId,
  value,
  reps,
  bodyweightKg,
  createdAt: 1,
});

describe('board modes', () => {
  it('ranks barbell lifts by total, max weight or bodyweight %', () => {
    expect(boardModes(bench)).toEqual(['total', 'open', 'p4p']);
    expect(primaryMode(bench)).toBe('total');
    expect(boardModes(getChallenge('farmers_carry'))).toEqual(['open', 'p4p']);
    expect(boardModes(getChallenge('pullups_max'))).toEqual(['open']);
  });

  it('scores total as weight × reps, with no reps counting as a single', () => {
    expect(scoreOf(set('a', 'u', 100, 5), 'total')).toBe(500);
    expect(scoreOf(set('a', 'u', 100), 'total')).toBe(100);
    expect(scoreOf(set('a', 'u', 100, 5), 'open')).toBe(100);
    expect(scoreOf(set('a', 'u', 100, 5, 80), 'p4p')).toBe(1.25);
  });

  it('puts a lighter set with more reps ahead on total, behind on max', () => {
    const entries = [set('heavy', 'u1', 100, 1, 80), set('volume', 'u2', 60, 10, 100)];
    expect(rankEntries(entries, bench, 'total')[0].entry.id).toBe('volume');
    expect(rankEntries(entries, bench, 'open')[0].entry.id).toBe('heavy');
    expect(rankEntries(entries, bench, 'p4p')[0].entry.id).toBe('heavy');
  });

  it('shows the set as weight × reps', () => {
    expect(formatResult(bench, 61.235, 'lb', 5)).toBe('135 lb × 5');
    expect(formatResult(bench, 61.235, 'lb')).toBe('135 lb');
  });
});

describe('pacers', () => {
  it('gives every challenge a baseline, starting at one plate for lifts', () => {
    for (const id of ['bench_1rm', 'squat_1rm', 'deadlift_1rm', 'pullups_max', 'run_5k', 'farmers_carry'])
      expect(pacersFor(id).length).toBeGreaterThan(0);
    expect(pacersFor('bench_1rm')[0]).toMatchObject({ label: '1 plate', reps: 5 });
    expect(formatResult(bench, pacersFor('bench_1rm')[0].value, 'lb')).toBe('135 lb');
  });

  it('are marked, weigh a typical lifter and land in the current season', () => {
    const now = new Date(2026, 9, 15).getTime();
    const pacers = pacerEntries(bench, now);
    expect(pacers.every((p) => isPacerId(p.id) && isPacerId(p.userId))).toBe(true);
    expect(pacers.every((p) => p.bodyweightKg === PACER_BODYWEIGHT_KG)).toBe(true);
    expect(seasonBoard(pacers, bench, 'total', 'month', now).ranked).toHaveLength(pacers.length);
  });

  it('lose ties to real entries and never win crowns', () => {
    const now = new Date(2026, 9, 15).getTime();
    const [first] = pacerEntries(bench, now);
    const real = { ...set('real', 'u1', first.value, first.reps), createdAt: now - 1000 };
    expect(rankEntries([first, real], bench, 'total')[0].entry.id).toBe('real');
    expect(seasonBoard(pacerEntries(bench, now), bench, 'total', 'all', now).crowns.size).toBe(0);
  });
});
