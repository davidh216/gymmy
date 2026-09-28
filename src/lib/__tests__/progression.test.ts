import { levelFromXp, workoutRewards, xpToNext } from '../progression';

describe('levelFromXp', () => {
  it('starts at level 1', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, into: 0, needed: 100 });
  });

  it('carries remainder into the next level', () => {
    expect(levelFromXp(130)).toEqual({ level: 2, into: 30, needed: xpToNext(2) });
  });

  it('handles exact boundaries', () => {
    expect(levelFromXp(100 + 150).level).toBe(3);
  });
});

describe('workoutRewards', () => {
  const base = { completedSets: 0, prCount: 0, streakWeeks: 0, companionBonus: 0, hitsWeeklyGoal: false };

  it('pays the base reward', () => {
    expect(workoutRewards(base)).toMatchObject({ xp: 50, gems: 25 });
  });

  it('adds sets, PRs and weekly goal', () => {
    const r = workoutRewards({ ...base, completedSets: 10, prCount: 2, hitsWeeklyGoal: true });
    expect(r.xp).toBe(50 + 80 + 80);
    expect(r.gems).toBe(25 + 30 + 100);
  });

  it('caps the streak multiplier at 50%', () => {
    const r = workoutRewards({ ...base, streakWeeks: 20 });
    expect(r.xp).toBe(75);
  });

  it('applies the companion bonus on base XP', () => {
    const r = workoutRewards({ ...base, companionBonus: 0.2 });
    expect(r.xp).toBe(60);
    expect(r.lines.at(-1)?.label).toBe('Companion bonus');
  });
});
