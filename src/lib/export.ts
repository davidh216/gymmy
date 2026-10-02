import { getExercise } from './exercises';
import { distanceUnit, toDisplayDistance, toDisplayWeight } from './format';
import type { CheckIn } from './recovery';
import type { Units, Workout } from './types';

/** Local date and time as "2026-10-01 18:05" (sorts and opens cleanly in spreadsheets). */
function stamp(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** One CSV field, quoted when it needs to be. Leading = + - @ are defused so spreadsheets don't run them. */
export function csvField(value: string | number | undefined): string {
  if (value === undefined) return '';
  let s = String(value);
  if (/^[=+\-@]/.test(s) && typeof value === 'string') s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const row = (cells: (string | number | undefined)[]) => cells.map(csvField).join(',');

/** Every completed set as a CSV row, oldest workout first, in the person's units. */
export function workoutsCsv(workouts: Workout[], units: Units): string {
  const dist = distanceUnit(units);
  const lines = [
    row([
      'date',
      'workout',
      'exercise',
      'set',
      `weight_${units}`,
      'reps',
      'minutes',
      `distance_${dist}`,
      'rpe',
      'warmup',
      'source',
    ]),
  ];
  for (const w of [...workouts].sort((a, b) => a.endedAt - b.endedAt)) {
    for (const e of w.exercises) {
      const name = getExercise(e.exerciseId).name;
      e.sets
        .filter((s) => s.done)
        .forEach((s, i) => {
          lines.push(
            row([
              stamp(w.startedAt),
              w.name,
              name,
              i + 1,
              s.weight !== undefined ? toDisplayWeight(s.weight, units) : undefined,
              s.reps,
              s.minutes !== undefined ? Math.round(s.minutes * 100) / 100 : undefined,
              s.distance !== undefined ? toDisplayDistance(s.distance, units) : undefined,
              s.rpe,
              s.warmup ? 'yes' : 'no',
              w.source === 'health' ? 'Apple Health' : 'Gymmy',
            ]),
          );
        });
    }
  }
  return lines.join('\n') + '\n';
}

/** Daily recovery check-ins as CSV, oldest first. */
export function checkInsCsv(checkIns: Record<string, CheckIn>): string {
  const lines = [row(['date', 'sleep_hours', 'soreness_1_5', 'energy_1_5', 'stress_1_5', 'rest_day', 'recovery'])];
  for (const c of Object.values(checkIns).sort((a, b) => a.date.localeCompare(b.date))) {
    lines.push(row([c.date, c.sleepHours, c.soreness, c.energy, c.stress, c.rest ? 'yes' : 'no', c.activities.join(' ')]));
  }
  return lines.join('\n') + '\n';
}

/** Everything Gymmy keeps about you on this phone, as one JSON document. */
export function fullExport(state: Record<string, unknown>, now: number): string {
  const keys = [
    'profile',
    'workouts',
    'checkIns',
    'customExercises',
    'customPrograms',
    'plan',
    'claimedMilestones',
    'collection',
    'companionId',
    'xp',
    'gems',
  ] as const;
  return JSON.stringify(
    { app: 'Gymmy', format: 1, exportedAt: new Date(now).toISOString(), ...Object.fromEntries(keys.map((k) => [k, state[k]])) },
    null,
    2,
  );
}

/** "gymmy-workouts-2026-10-02.csv" */
export function exportFileName(kind: 'workouts' | 'check-ins' | 'backup', now: number): string {
  const ext = kind === 'backup' ? 'json' : 'csv';
  return `gymmy-${kind}-${stamp(now).slice(0, 10)}.${ext}`;
}
