import { applyRecords, changedKeys, pushRecords, recordsOf, type Syncable } from '../sync';
import type { Workout } from '../types';

const workout = (id: string, endedAt = 1, extra: Partial<Workout> = {}): Workout => ({
  id,
  name: id,
  startedAt: endedAt - 1,
  endedAt,
  exercises: [],
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
  ...extra,
});

const state = (patch: Partial<Syncable> = {}): Syncable => ({
  profile: { name: 'Alex' },
  xp: 10,
  gems: 100,
  companionId: 'kong',
  pity: {},
  plan: null,
  workouts: [],
  checkIns: {},
  customExercises: [],
  customPrograms: [],
  templates: [],
  weighIns: {},
  collection: { kong: { stars: 1, obtainedAt: 5 } },
  claimedMilestones: {},
  ...patch,
});

describe('recordsOf', () => {
  it('lists every record and keeps Apple Health imports on the phone', () => {
    const s = state({ workouts: [workout('a'), workout('h', 2, { source: 'health' })], claimedMilestones: { 'workouts-1': 9 } });
    expect([...recordsOf(s).keys()].sort()).toEqual(['companion:kong', 'meta:main', 'milestone:workouts-1', 'workout:a']);
  });
});

describe('changedKeys', () => {
  it('finds additions, edits and removals without touching unchanged collections', () => {
    const a = workout('a');
    const prev = state({ workouts: [a, workout('b')] });
    const next = { ...prev, workouts: [{ ...a, name: 'renamed' }, workout('c')], gems: 50 };
    expect(changedKeys(prev, next).sort()).toEqual(['meta:main', 'workout:a', 'workout:b', 'workout:c']);
    expect(changedKeys(prev, { ...prev })).toEqual([]);
  });

  it('notices companion stars, check-ins and claims', () => {
    const prev = state();
    const next = {
      ...prev,
      collection: { ...prev.collection, kong: { stars: 2, obtainedAt: 5 } },
      checkIns: { '2026-10-01': { date: '2026-10-01', at: 1, rest: false, activities: [] } },
      claimedMilestones: { 'prs-1': 3 },
    };
    expect(changedKeys(prev, next).sort()).toEqual(['check_in:2026-10-01', 'companion:kong', 'milestone:prs-1']);
  });
});

describe('pushRecords', () => {
  it('sends current data or a delete', () => {
    const s = state({ workouts: [workout('a')] });
    expect(pushRecords(s, { 'workout:a': 7, 'workout:gone': 8 })).toEqual([
      { kind: 'workout', id: 'a', data: s.workouts[0], updatedAt: 7 },
      { kind: 'workout', id: 'gone', deleted: true, updatedAt: 8 },
    ]);
  });
});

describe('applyRecords', () => {
  it('adds, replaces and deletes pulled records', () => {
    const local = state({ workouts: [workout('a', 1), workout('b', 2)] });
    const out = applyRecords(
      local,
      [
        { kind: 'workout', id: 'a', data: workout('a', 1, { name: 'from cloud' }), updatedAt: 10 },
        { kind: 'workout', id: 'b', deleted: true, updatedAt: 10 },
        { kind: 'workout', id: 'c', data: workout('c', 3), updatedAt: 10 },
      ],
      { dirty: {}, firstSync: false },
    );
    expect(out.workouts!.map((w) => [w.id, w.name])).toEqual([
      ['c', 'c'],
      ['a', 'from cloud'],
    ]);
  });

  it('keeps a newer local edit that has not been sent yet', () => {
    const local = state({ workouts: [workout('a', 1, { name: 'mine' })] });
    const out = applyRecords(local, [{ kind: 'workout', id: 'a', data: workout('a', 1, { name: 'old' }), updatedAt: 5 }], {
      dirty: { 'workout:a': 9 },
      firstSync: false,
    });
    expect(out.workouts![0].name).toBe('mine');
  });

  it('restores an account on a fresh install: account wins, companions and claims merge', () => {
    const fresh = state({ gems: 100, xp: 0, collection: { kong: { stars: 1, obtainedAt: 50 }, zen: { stars: 1, obtainedAt: 50 } } });
    const out = applyRecords(
      fresh,
      [
        { kind: 'meta', id: 'main', data: { profile: { name: 'Real' }, xp: 900, gems: 640, companionId: 'blaze' }, updatedAt: 1 },
        { kind: 'companion', id: 'kong', data: { stars: 3, obtainedAt: 10 }, updatedAt: 1 },
        { kind: 'companion', id: 'blaze', data: { stars: 2, obtainedAt: 12 }, updatedAt: 1 },
        { kind: 'milestone', id: 'workouts-1', data: { claimedAt: 4 }, updatedAt: 1 },
        { kind: 'workout', id: 'old', data: workout('old', 4), updatedAt: 1 },
      ],
      { dirty: { 'meta:main': 99, 'companion:kong': 99 }, firstSync: true },
    );
    expect(out).toMatchObject({ profile: { name: 'Real' }, xp: 900, gems: 640, companionId: 'blaze' });
    expect(out.collection).toEqual({
      kong: { stars: 3, obtainedAt: 10 },
      zen: { stars: 1, obtainedAt: 50 },
      blaze: { stars: 2, obtainedAt: 12 },
    });
    expect(out.claimedMilestones).toEqual({ 'workouts-1': 4 });
    expect(out.workouts!.map((w) => w.id)).toEqual(['old']);
  });

  it('does nothing for an empty pull', () => {
    expect(applyRecords(state(), [], { dirty: {}, firstSync: false })).toEqual({});
  });
});

describe('custom plans', () => {
  const plan = {
    id: 'custom-1',
    name: 'Push Pull Legs',
    emoji: '💪',
    weeks: 8,
    days: [{ name: 'Push', focus: '', exercises: [{ exerciseId: 'bench_press', sets: 4, reps: '8' }] }],
    createdAt: 1,
    updatedAt: 1,
  };

  it('syncs as their own records, including deletes', () => {
    const before = state();
    const after = { ...before, customPrograms: [plan] };
    expect(changedKeys(before, after)).toEqual(['custom_program:custom-1']);
    expect(pushRecords(after, { 'custom_program:custom-1': 9 })[0]).toMatchObject({ kind: 'custom_program', data: plan });
    expect(changedKeys(after, before)).toEqual(['custom_program:custom-1']);

    const merged = applyRecords(before, [{ kind: 'custom_program', id: 'custom-1', data: plan, updatedAt: 9 }], {
      dirty: {},
      firstSync: false,
    });
    expect(merged.customPrograms).toEqual([plan]);
    const gone = applyRecords(after, [{ kind: 'custom_program', id: 'custom-1', deleted: true, updatedAt: 10 }], {
      dirty: {},
      firstSync: false,
    });
    expect(gone.customPrograms).toEqual([]);
  });
});

describe('Apple Health sleep', () => {
  const healthNight = { date: '2026-10-02', at: 5, sleepHours: 7.2, sleepSource: 'health' as const, energy: 4 as const, rest: false, activities: [] };
  const typedNight = { date: '2026-10-01', at: 4, sleepHours: 6, rest: false, activities: [] };

  it('stays on the phone; typed-in sleep still syncs', () => {
    const s = state({ checkIns: { [healthNight.date]: healthNight, [typedNight.date]: typedNight } });
    const pushed = pushRecords(s, { 'check_in:2026-10-02': 9, 'check_in:2026-10-01': 9 });
    const health = pushed.find((r) => r.id === '2026-10-02')!.data as Record<string, unknown>;
    expect(health).toMatchObject({ energy: 4 });
    expect(health).not.toHaveProperty('sleepHours');
    expect(health).not.toHaveProperty('sleepSource');
    expect(pushed.find((r) => r.id === '2026-10-01')!.data).toMatchObject({ sleepHours: 6 });
  });

  it('isn’t wiped when the synced copy comes back', () => {
    const s = state({ checkIns: { [healthNight.date]: healthNight } });
    const remote = { date: '2026-10-02', at: 6, energy: 5, rest: false, activities: [] };
    const merged = applyRecords(s, [{ kind: 'check_in', id: '2026-10-02', data: remote, updatedAt: 99 }], {
      dirty: {},
      firstSync: false,
    });
    expect(merged.checkIns!['2026-10-02']).toMatchObject({ energy: 5, sleepHours: 7.2, sleepSource: 'health' });
  });
});

describe('saved templates', () => {
  it('sync both ways', () => {
    const t = { id: 'tpl-1', name: 'Arm day', exerciseIds: ['barbell_curl'], createdAt: 1 };
    const before = state();
    const after = { ...before, templates: [t] };
    expect(changedKeys(before, after)).toEqual(['template:tpl-1']);
    expect(applyRecords(before, [{ kind: 'template', id: 'tpl-1', data: t, updatedAt: 5 }], { dirty: {}, firstSync: false }).templates).toEqual([t]);
  });
});

describe('weigh-ins', () => {
  const typed = { date: '2026-10-06', kg: 80, at: 1 };
  const fromHealth = { date: '2026-10-05', kg: 81, source: 'health' as const, at: 1 };

  it('sync typed-in weigh-ins and keep Health readings on the phone', () => {
    const base = state();
    const s = { ...base, weighIns: { [typed.date]: typed, [fromHealth.date]: fromHealth } };
    expect([...recordsOf(s).keys()].filter((k) => k.startsWith('weigh_in'))).toEqual(['weigh_in:2026-10-06']);
    expect(changedKeys(base, s)).toEqual(['weigh_in:2026-10-06']);
  });

  it('delete the cloud copy when Health replaces a typed weigh-in', () => {
    const before = state({ weighIns: { [typed.date]: typed } });
    const after = { ...before, weighIns: { [typed.date]: { ...fromHealth, date: typed.date } } };
    expect(changedKeys(before, after)).toEqual(['weigh_in:2026-10-06']);
    expect(pushRecords(after, { 'weigh_in:2026-10-06': 5 })[0]).toMatchObject({ deleted: true });
  });

  it('pull typed weigh-ins without dropping this phone\'s Health readings', () => {
    const local = state({ weighIns: { [fromHealth.date]: fromHealth } });
    const patch = applyRecords(
      local,
      [
        { kind: 'weigh_in', id: typed.date, data: typed, updatedAt: 2 },
        { kind: 'weigh_in', id: fromHealth.date, deleted: true, updatedAt: 2 },
      ],
      { dirty: {}, firstSync: false },
    );
    expect(patch.weighIns).toEqual({ [typed.date]: typed, [fromHealth.date]: fromHealth });
  });
});

it('keeps a buddy nickname when companions merge on first sync', () => {
  const local = state({ collection: { kong: { stars: 1, obtainedAt: 5, nickname: 'Bruno' } } });
  const patch = applyRecords(local, [{ kind: 'companion', id: 'kong', data: { stars: 2, obtainedAt: 9 }, updatedAt: 3 }], {
    dirty: {},
    firstSync: true,
  });
  expect(patch.collection?.kong).toEqual({ stars: 2, obtainedAt: 5, nickname: 'Bruno' });
});
