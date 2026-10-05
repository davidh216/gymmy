import { getChallenge } from '@/lib/challenges';
import { BOARD_SIZE } from '@/lib/leaderboard';

import { buildBoard, podiumUsers, primaryRanking } from '../board';
import type { Entry } from '../types';

const bench = getChallenge('bench_1rm');
const now = new Date(2026, 9, 15).getTime();

const entry = (id: string, userId: string, value: number, reps?: number): Entry => ({
  id,
  gymId: 'g1',
  challengeId: 'bench_1rm',
  athlete: { id: userId, username: userId, companionId: 'kong' },
  value,
  reps,
  bodyweightKg: 80,
  hasVideo: true,
  status: 'live',
  createdAt: now - 60_000,
});

describe('buildBoard', () => {
  it('fills an empty board with labelled baselines', () => {
    const board = buildBoard([], bench, 'total', 'month', null, now);
    expect(board.rows.length).toBeGreaterThan(0);
    expect(board.rows.every((r) => r.entry.pacer && !r.entry.hasVideo)).toBe(true);
    expect(board.rows[board.rows.length - 1].entry.athlete.username).toBe('1 plate');
    expect(board.total).toBe(0);
  });

  it('ranks real athletes among the baselines and counts only them', () => {
    const board = buildBoard([entry('e1', 'u1', 100, 8)], bench, 'total', 'month', 'u1', now);
    expect(board.rows[0].entry.id).toBe('e1');
    expect(board.total).toBe(1);
  });

  it('shows the current user beyond the top rows', () => {
    const many = Array.from({ length: BOARD_SIZE + 2 }, (_, i) => entry(`e${i}`, `u${i}`, 200 + i, 5));
    const board = buildBoard([...many, entry('mine', 'me', 20, 1)], bench, 'total', 'all', 'me', now);
    expect(board.rows).toHaveLength(BOARD_SIZE);
    expect(board.me?.entry.id).toBe('mine');
  });
});

describe('podiums', () => {
  it('leave baselines out of who was dethroned', () => {
    const ranked = primaryRanking([{ id: 'e1', userId: 'u1', value: 30, reps: 1, createdAt: 1 }], bench, now);
    expect(ranked[0].entry.userId).toMatch(/^pacer:/);
    expect(podiumUsers(ranked)).toEqual([]);
  });
});
