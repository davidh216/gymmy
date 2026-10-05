import type { Workout, WorkoutLocation } from './types';

/** Places you've trained before, most recent first, one per gym. */
export function recentLocations(workouts: Workout[], limit = 5): WorkoutLocation[] {
  const seen = new Set<string>();
  const out: WorkoutLocation[] = [];
  for (const w of [...workouts].sort((a, b) => b.endedAt - a.endedAt)) {
    if (!w.location) continue;
    const key = locationKey(w.location);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w.location);
    if (out.length >= limit) break;
  }
  return out;
}

/** Same gym: same Gymmy gym, same map place, or the same name when neither is known. */
export function locationKey(l: WorkoutLocation): string {
  return l.gymId ? `gym:${l.gymId}` : l.placeId ? `place:${l.placeId}` : `name:${l.name.trim().toLowerCase()}`;
}

/** A typed-in gym name, tidied; null when empty. */
export function customLocation(name: string): WorkoutLocation | null {
  const clean = name.trim().replace(/\s+/g, ' ').slice(0, 60);
  return clean ? { name: clean } : null;
}
