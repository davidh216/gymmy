import { ACTIVITY, APP_BUNDLE_ID, healthExport, sleepHours, sleepWindow, workoutFromHealth, type HealthWorkout } from '../health';
import type { Workout } from '../types';

const H = 3_600_000;
const base: HealthWorkout = {
  uuid: 'abc',
  activityType: ACTIVITY.running,
  start: 1_000_000,
  end: 1_000_000 + 30 * 60_000,
  durationSeconds: 1800,
  distanceMeters: 5012,
  sourceBundleId: 'com.apple.health',
};

describe('workoutFromHealth', () => {
  it('maps a Watch run to a Gymmy run with distance and time', () => {
    const w = workoutFromHealth(base, 'kong')!;
    expect(w.id).toBe('health_abc');
    expect(w.source).toBe('health');
    expect(w.exercises[0].exerciseId).toBe('run');
    expect(w.exercises[0].sets[0]).toMatchObject({ minutes: 30, distance: 5.012, done: true });
  });

  it('maps hikes to walks and skips unsupported types, our own exports and tiny ones', () => {
    expect(workoutFromHealth({ ...base, activityType: ACTIVITY.hiking }, 'kong')!.exercises[0].exerciseId).toBe('walk');
    expect(workoutFromHealth({ ...base, activityType: ACTIVITY.traditionalStrengthTraining }, 'kong')).toBeNull();
    expect(workoutFromHealth({ ...base, sourceBundleId: APP_BUNDLE_ID }, 'kong')).toBeNull();
    expect(workoutFromHealth({ ...base, durationSeconds: 20 }, 'kong')).toBeNull();
    expect(workoutFromHealth({ ...base, distanceMeters: undefined }, 'kong')!.exercises[0].sets[0].distance).toBeUndefined();
  });
});

describe('healthExport', () => {
  const workout = (exerciseIds: string[], distance?: number): Workout => ({
    id: 'w',
    name: 'w',
    startedAt: 0,
    endedAt: 1,
    companionId: 'kong',
    xp: 0,
    gems: 0,
    prs: [],
    exercises: exerciseIds.map((exerciseId, i) => ({
      id: String(i),
      exerciseId,
      sets: [{ id: 's', distance, minutes: 20, weight: 50, reps: 5, done: true }],
    })),
  });

  it('saves a run as a run with its distance', () => {
    expect(healthExport(workout(['run'], 5))).toEqual({ activityType: ACTIVITY.running, distanceMeters: 5000 });
    expect(healthExport(workout(['bike']))).toEqual({ activityType: ACTIVITY.cycling, distanceMeters: undefined });
  });

  it('saves lifting and mixed sessions as strength training', () => {
    expect(healthExport(workout(['squat', 'bench_press']))).toEqual({ activityType: ACTIVITY.traditionalStrengthTraining });
    expect(healthExport(workout(['run', 'squat'], 3)).activityType).toBe(ACTIVITY.traditionalStrengthTraining);
  });
});

describe('sleepHours', () => {
  const now = new Date(2026, 9, 2, 9).getTime();
  const at = (h: number) => new Date(2026, 9, 1, h).getTime();
  const window = sleepWindow(now);

  it('uses 6 pm yesterday until now', () => {
    expect(window.start).toBe(new Date(2026, 9, 1, 18).getTime());
    expect(window.end).toBe(now);
  });

  it('adds up asleep stages and ignores in-bed and awake', () => {
    const samples = [
      { start: at(22), end: at(23), value: 0 }, // in bed
      { start: at(23), end: at(25), value: 3 }, // core, 2 h
      { start: at(25), end: at(26), value: 2 }, // awake
      { start: at(26), end: at(30), value: 4 }, // deep, 4 h
    ];
    expect(sleepHours(samples, window)).toBe(6);
  });

  it('merges overlapping phone and watch samples', () => {
    const samples = [
      { start: at(23), end: at(30), value: 1 },
      { start: at(23) + H / 2, end: at(30) + H / 2, value: 5 },
    ];
    expect(sleepHours(samples, window)).toBe(7.5);
  });

  it('clips to the window and returns null without data', () => {
    expect(sleepHours([{ start: at(14), end: at(20), value: 1 }], window)).toBe(2);
    expect(sleepHours([], window)).toBeNull();
  });
});
