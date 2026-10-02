import type { Units } from './types';

/** Common gym plates, heaviest first, in display units. */
export const PLATES: Record<Units, number[]> = {
  lb: [45, 35, 25, 10, 5, 2.5],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};

/** Bar choices, default first: Olympic, women's/technique, then EZ curl. */
export const BARS: Record<Units, number[]> = {
  lb: [45, 35, 25],
  kg: [20, 15, 10],
};

export type PlateLoad = {
  /** Plates for one side of the bar, heaviest first. */
  perSide: number[];
  /** What the bar actually weighs once loaded (can fall short when plates can't make it exactly). */
  loaded: number;
  /** Weight left over that the plates can't make, e.g. 1 lb. */
  short: number;
};

/** Plates to load on each side for `total` (in display units), greedy from the heaviest plate. */
export function plateLoad(total: number, bar: number, units: Units): PlateLoad {
  // Work in hundredths so 2.5 and 1.25 add up exactly.
  const c = (n: number) => Math.round(n * 100);
  let side = Math.max(0, Math.floor((c(total) - c(bar)) / 2));
  const perSide: number[] = [];
  for (const plate of PLATES[units]) {
    while (side >= c(plate)) {
      perSide.push(plate);
      side -= c(plate);
    }
  }
  const loaded = bar + 2 * perSide.reduce((a, b) => a + b, 0);
  return { perSide, loaded, short: Math.max(0, Math.round((total - loaded) * 100) / 100) };
}

/** "45 · 25 · 2.5", grouping repeats as "45 ×2". */
export function formatPlates(perSide: number[]): string {
  const groups: { plate: number; count: number }[] = [];
  for (const p of perSide) {
    const last = groups[groups.length - 1];
    if (last?.plate === p) last.count += 1;
    else groups.push({ plate: p, count: 1 });
  }
  return groups.map((g) => (g.count > 1 ? `${g.plate} ×${g.count}` : String(g.plate))).join(' · ');
}

/** RPE choices offered after a set. */
export const RPE_CHOICES = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

/** "Easy" … "Max effort", for RPE labels. */
export function rpeLabel(rpe: number): string {
  if (rpe >= 10) return 'Max effort';
  if (rpe >= 9) return '1 rep left';
  if (rpe >= 8) return '2 reps left';
  if (rpe >= 7) return '3 reps left';
  return 'Easy';
}
