import { formatPlates, plateLoad, rpeLabel } from '../plates';
import { completedSets, detectPRs, lastSession, topSet, volume } from '../records';
import type { Workout, WorkoutExercise } from '../types';

describe('plate calculator', () => {
  it('loads the heaviest plates first', () => {
    expect(plateLoad(225, 45, 'lb')).toEqual({ perSide: [45, 45], loaded: 225, short: 0 });
    expect(plateLoad(185, 45, 'lb').perSide).toEqual([45, 25]);
    expect(plateLoad(100, 20, 'kg').perSide).toEqual([25, 15]);
    expect(plateLoad(62.5, 20, 'kg').perSide).toEqual([20, 1.25]);
  });

  it('says how far off it is when plates can’t make the weight', () => {
    expect(plateLoad(226, 45, 'lb')).toEqual({ perSide: [45, 45], loaded: 225, short: 1 });
    expect(plateLoad(40, 45, 'lb')).toEqual({ perSide: [], loaded: 45, short: 0 });
  });

  it('groups repeated plates', () => {
    expect(formatPlates([45, 45, 45, 10, 2.5])).toBe('45 ×3 · 10 · 2.5');
    expect(formatPlates([])).toBe('');
  });

  it('labels RPE', () => {
    expect(rpeLabel(10)).toBe('Max effort');
    expect(rpeLabel(8.5)).toBe('2 reps left');
    expect(rpeLabel(6)).toBe('Easy');
  });
});

describe('warm-up sets', () => {
  const squat: WorkoutExercise = {
    id: 'e',
    exerciseId: 'squat',
    note: 'Belt on',
    rest: 180,
    sets: [
      { id: 'w1', weight: 140, reps: 3, done: true, warmup: true },
      { id: 's1', weight: 100, reps: 5, done: true },
      { id: 's2', weight: 100, reps: 5, done: true, rpe: 9 },
    ],
  };

  it('don’t count toward sets, volume or the top set', () => {
    expect(completedSets([squat])).toBe(2);
    expect(volume([squat])).toBe(1000);
    expect(topSet('weight', squat.sets)?.id).toBe('s1');
  });

  it('can’t set a record', () => {
    const history: Workout[] = [
      {
        id: 'old',
        name: 'Old',
        startedAt: 0,
        endedAt: 1,
        companionId: 'kong',
        xp: 0,
        gems: 0,
        prs: [],
        exercises: [{ id: 'o', exerciseId: 'squat', sets: [{ id: 'x', weight: 110, reps: 5, done: true }] }],
      },
    ];
    expect(detectPRs([squat], history)).toEqual([]);
  });

  it('carry the note and rest time to next time', () => {
    const w: Workout = { id: 'w', name: 'Legs', startedAt: 0, endedAt: 5, companionId: 'kong', xp: 0, gems: 0, prs: [], exercises: [squat] };
    expect(lastSession('squat', [w])).toMatchObject({ note: 'Belt on', rest: 180, top: { id: 's1' } });
  });
});
