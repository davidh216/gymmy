import { checkInsCsv, csvField, exportFileName, fullExport, workoutsCsv } from '../export';
import type { Workout } from '../types';

const at = new Date(2026, 9, 1, 18, 5).getTime();
const workout = (patch: Partial<Workout> = {}): Workout => ({
  id: 'w1',
  name: 'Leg day, heavy',
  startedAt: at,
  endedAt: at + 3600_000,
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
  exercises: [
    {
      id: 'e1',
      exerciseId: 'squat',
      sets: [
        { id: 'a', weight: 100, reps: 5, done: true },
        { id: 'b', weight: 120, reps: 3, done: false },
      ],
    },
    { id: 'e2', exerciseId: 'run', sets: [{ id: 'r', distance: 5, minutes: 25.5, done: true }] },
  ],
  ...patch,
});

describe('csvField', () => {
  it('quotes commas, quotes and newlines', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField(undefined)).toBe('');
    expect(csvField(5)).toBe('5');
  });

  it('defuses spreadsheet formulas in text', () => {
    expect(csvField('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvField('+1 rep')).toBe("'+1 rep");
    expect(csvField(-3)).toBe('-3');
  });
});

describe('workoutsCsv', () => {
  it('lists completed sets in the person’s units', () => {
    const lines = workoutsCsv([workout(), workout({ id: 'h', name: 'Run', source: 'health', startedAt: at - 86400_000, endedAt: at - 86000_000 })], 'lb')
      .trim()
      .split('\n');
    expect(lines[0]).toBe('date,workout,exercise,set,weight_lb,reps,minutes,distance_mi,source');
    expect(lines[1]).toContain('Apple Health');
    expect(lines).toContain('2026-10-01 18:05,"Leg day, heavy",Back Squat,1,220.5,5,,,Gymmy');
    expect(lines).toContain('2026-10-01 18:05,"Leg day, heavy",Run,1,,,25.5,3.11,Gymmy');
    expect(lines.some((l) => l.includes('264.6'))).toBe(false);
  });
});

describe('checkInsCsv and full export', () => {
  it('writes check-ins oldest first', () => {
    const csv = checkInsCsv({
      '2026-10-02': { date: '2026-10-02', at: 1, sleepHours: 7.5, energy: 4, rest: true, activities: ['stretch', 'sauna'] },
      '2026-10-01': { date: '2026-10-01', at: 1, rest: false, activities: [] },
    });
    expect(csv.trim().split('\n')).toEqual([
      'date,sleep_hours,soreness_1_5,energy_1_5,stress_1_5,rest_day,recovery',
      '2026-10-01,,,,,no,',
      '2026-10-02,7.5,,4,,yes,stretch sauna',
    ]);
  });

  it('builds a complete JSON backup and dated file names', () => {
    const json = JSON.parse(fullExport({ workouts: [workout()], gems: 5, secret: 'no', profile: { name: 'A' } }, at));
    expect(json).toMatchObject({ app: 'Gymmy', format: 1, gems: 5, profile: { name: 'A' } });
    expect(json.secret).toBeUndefined();
    expect(exportFileName('workouts', at)).toBe('gymmy-workouts-2026-10-01.csv');
    expect(exportFileName('backup', at)).toBe('gymmy-backup-2026-10-01.json');
  });
});
