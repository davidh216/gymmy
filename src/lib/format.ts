import type { ExerciseKind } from './exercises';
import type { SetEntry, Units } from './types';

const LB_PER_KG = 2.20462;

export function toDisplayWeight(kg: number, units: Units): number {
  const value = units === 'lb' ? kg * LB_PER_KG : kg;
  return Math.round(value * 10) / 10;
}

export function fromDisplayWeight(value: number, units: Units): number {
  return units === 'lb' ? value / LB_PER_KG : value;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function formatWeight(kg: number, units: Units): string {
  return `${toDisplayWeight(kg, units)} ${units}`;
}

/** Compact volume, e.g. 12.4k. */
export function formatVolume(kg: number, units: Units): string {
  const v = units === 'lb' ? kg * LB_PER_KG : kg;
  return v >= 10000 ? `${(v / 1000).toFixed(1)}k ${units}` : `${formatNumber(v)} ${units}`;
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatMinutes(ms: number): string {
  const min = Math.round(ms / 60000);
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;
}

/** A set as people say it: "185 lb × 5", "12 reps", "20 min". */
export function formatSet(set: SetEntry, kind: ExerciseKind, units: Units): string {
  if (kind === 'weight') return `${toDisplayWeight(set.weight ?? 0, units)} ${units} × ${set.reps ?? 0}`;
  if (kind === 'reps') return `${set.reps ?? 0} reps`;
  return `${set.minutes ?? 0} min`;
}

/** "today", "yesterday", "3d ago", "5w ago". */
export function formatAgo(ts: number, now: number): string {
  const days = Math.max(0, Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  return formatDate(ts);
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function greeting(now: number): string {
  const h = new Date(now).getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function defaultWorkoutName(now: number): string {
  const h = new Date(now).getHours();
  if (h < 5) return 'Night Session';
  if (h < 12) return 'Morning Session';
  if (h < 17) return 'Afternoon Session';
  return 'Evening Session';
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Human-readable value for a record score (see `setScore`). */
export function formatScore(kind: 'weight' | 'reps' | 'duration', value: number, units: Units) {
  if (kind === 'weight') return formatWeight(value, units);
  if (kind === 'reps') return `${value} reps`;
  return `${Math.round(value * 10) / 10} min`;
}
