import type { Exercise } from './exercises';
import type { CheckIn } from './recovery';
import type { Workout } from './types';

/**
 * Cloud sync works on records: one per workout, check-in, custom exercise, companion and
 * claimed milestone, plus one "meta" record for profile, XP, gems and settings. Each local
 * change marks its record dirty; dirty records are pushed, and records changed elsewhere are
 * pulled and merged. The newest edit of a record wins.
 */
export type SyncKind = 'meta' | 'workout' | 'check_in' | 'custom_exercise' | 'companion' | 'milestone';

export type SyncRecord = {
  kind: SyncKind;
  id: string;
  data?: unknown;
  deleted?: boolean;
  /** When the change was made, ms. */
  updatedAt: number;
};

type Owned = { stars: number; obtainedAt: number };

/** The parts of app state that sync. Typed loosely so this file doesn't depend on the store. */
export type Syncable = {
  profile: unknown;
  xp: number;
  gems: number;
  companionId: string;
  pity: unknown;
  plan: unknown;
  workouts: Workout[];
  checkIns: Record<string, CheckIn>;
  customExercises: (Exercise & { createdAt: number })[];
  collection: Record<string, Owned>;
  claimedMilestones: Record<string, number>;
};

export const recordKey = (kind: SyncKind, id: string) => `${kind}:${id}`;

export function parseKey(key: string): { kind: SyncKind; id: string } {
  const i = key.indexOf(':');
  return { kind: key.slice(0, i) as SyncKind, id: key.slice(i + 1) };
}

const META_FIELDS = ['profile', 'xp', 'gems', 'companionId', 'pity', 'plan'] as const;

/** Every syncable record in the state, by key. Workouts imported from Apple Health stay on the phone. */
export function recordsOf(s: Syncable): Map<string, unknown> {
  const out = new Map<string, unknown>();
  out.set(recordKey('meta', 'main'), Object.fromEntries(META_FIELDS.map((f) => [f, s[f]])));
  for (const w of s.workouts) if (w.source !== 'health') out.set(recordKey('workout', w.id), w);
  for (const c of Object.values(s.checkIns)) out.set(recordKey('check_in', c.date), c);
  for (const e of s.customExercises) out.set(recordKey('custom_exercise', e.id), e);
  for (const [id, owned] of Object.entries(s.collection)) out.set(recordKey('companion', id), owned);
  for (const [id, claimedAt] of Object.entries(s.claimedMilestones)) out.set(recordKey('milestone', id), { claimedAt });
  return out;
}

/**
 * Keys of records that changed between two states (added, edited or removed). Cheap when a
 * collection is untouched, because the store replaces collections instead of mutating them.
 */
export function changedKeys(prev: Syncable, next: Syncable): string[] {
  const keys: string[] = [];
  if (META_FIELDS.some((f) => prev[f] !== next[f])) keys.push(recordKey('meta', 'main'));

  const diff = <T>(kind: SyncKind, a: T[], b: T[], id: (x: T) => string, include: (x: T) => boolean = () => true) => {
    if (a === b) return;
    const before = new Map(a.filter(include).map((x) => [id(x), x]));
    const after = new Map(b.filter(include).map((x) => [id(x), x]));
    for (const [k, v] of after) if (before.get(k) !== v) keys.push(recordKey(kind, k));
    for (const k of before.keys()) if (!after.has(k)) keys.push(recordKey(kind, k));
  };
  diff('workout', prev.workouts, next.workouts, (w) => w.id, (w) => w.source !== 'health');
  diff('custom_exercise', prev.customExercises, next.customExercises, (e) => e.id);
  const byId = <V>(kind: SyncKind, a: Record<string, V>, b: Record<string, V>) => {
    if (a === b) return;
    for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[id] !== b[id]) keys.push(recordKey(kind, id));
  };
  byId('check_in', prev.checkIns, next.checkIns);
  byId('companion', prev.collection, next.collection);
  byId('milestone', prev.claimedMilestones, next.claimedMilestones);
  return keys;
}

/**
 * What to send for dirty keys: the current record, or a delete when it's gone.
 * `dirty` maps keys to when they changed.
 */
export function pushRecords(s: Syncable, dirty: Record<string, number>): SyncRecord[] {
  const current = recordsOf(s);
  return Object.entries(dirty).map(([key, updatedAt]) => {
    const { kind, id } = parseKey(key);
    return current.has(key) ? { kind, id, data: current.get(key), updatedAt } : { kind, id, deleted: true, updatedAt };
  });
}

/**
 * Merges pulled records into local state. A record with a newer unsent local edit is kept.
 * On a device's first sync, the account's data wins for profile/XP/gems, companions merge
 * (more stars wins) and everything else is combined, so a fresh install restores cleanly.
 */
export function applyRecords(
  local: Syncable,
  records: SyncRecord[],
  opts: { dirty: Record<string, number>; firstSync: boolean },
): Partial<Syncable> {
  if (records.length === 0) return {};
  const workouts = new Map(local.workouts.map((w) => [w.id, w]));
  const checkIns = { ...local.checkIns };
  const custom = new Map(local.customExercises.map((e) => [e.id, e]));
  const collection = { ...local.collection };
  const claimed = { ...local.claimedMilestones };
  let meta: Partial<Syncable> = {};

  for (const r of records) {
    const pending = opts.dirty[recordKey(r.kind, r.id)];
    const merge = opts.firstSync && (r.kind === 'meta' || r.kind === 'companion' || r.kind === 'milestone');
    // Ties go to the unsent local edit.
    if (pending !== undefined && pending >= r.updatedAt && !merge) continue;
    switch (r.kind) {
      case 'meta':
        if (!r.deleted && r.data) meta = r.data as Partial<Syncable>;
        break;
      case 'workout':
        if (r.deleted) workouts.delete(r.id);
        else workouts.set(r.id, r.data as Workout);
        break;
      case 'check_in':
        if (r.deleted) delete checkIns[r.id];
        else checkIns[r.id] = r.data as CheckIn;
        break;
      case 'custom_exercise':
        if (r.deleted) custom.delete(r.id);
        else custom.set(r.id, r.data as Syncable['customExercises'][number]);
        break;
      case 'companion': {
        const remote = r.data as Owned | undefined;
        if (r.deleted || !remote) {
          if (!opts.firstSync) delete collection[r.id];
        } else {
          const mine = collection[r.id];
          collection[r.id] =
            merge && mine
              ? { stars: Math.max(mine.stars, remote.stars), obtainedAt: Math.min(mine.obtainedAt, remote.obtainedAt) }
              : remote;
        }
        break;
      }
      case 'milestone': {
        const at = (r.data as { claimedAt?: number } | undefined)?.claimedAt;
        if (r.deleted || !at) {
          if (!opts.firstSync) delete claimed[r.id];
        } else {
          claimed[r.id] = merge && claimed[r.id] ? Math.min(claimed[r.id], at) : at;
        }
        break;
      }
    }
  }

  return {
    ...meta,
    workouts: [...workouts.values()].sort((a, b) => b.endedAt - a.endedAt),
    checkIns,
    customExercises: [...custom.values()].sort((a, b) => b.createdAt - a.createdAt),
    collection,
    claimedMilestones: claimed,
  };
}
