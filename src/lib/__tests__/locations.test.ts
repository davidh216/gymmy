import { customLocation, locationKey, recentLocations } from '../locations';
import type { Workout } from '../types';

const w = (id: string, endedAt: number, location?: Workout['location']): Workout => ({
  id,
  name: 'Session',
  startedAt: endedAt - 3_600_000,
  endedAt,
  exercises: [],
  companionId: 'kong',
  xp: 0,
  gems: 0,
  prs: [],
  location,
});

describe('recentLocations', () => {
  it('lists each gym once, most recent first', () => {
    const list = recentLocations([
      w('a', 1, { name: 'Iron Temple', gymId: 'g1' }),
      w('b', 3, { name: 'Home' }),
      w('c', 2, { name: 'Iron Temple (renamed)', gymId: 'g1' }),
      w('d', 4),
      w('e', 5, { name: 'home ' }),
    ]);
    expect(list.map((l) => l.name)).toEqual(['home ', 'Iron Temple (renamed)']);
  });

  it('stops at the limit', () => {
    const many = Array.from({ length: 8 }, (_, i) => w(`w${i}`, i, { name: `Gym ${i}` }));
    expect(recentLocations(many, 3)).toHaveLength(3);
  });
});

describe('location helpers', () => {
  it('tells gyms apart by id, place, then name', () => {
    expect(locationKey({ name: 'A', gymId: 'g1' })).toBe('gym:g1');
    expect(locationKey({ name: 'A', placeId: 'osm:node/1' })).toBe('place:osm:node/1');
    expect(locationKey({ name: ' Home ' })).toBe('name:home');
  });

  it('tidies typed names', () => {
    expect(customLocation('  Garage   gym ')).toEqual({ name: 'Garage gym' });
    expect(customLocation('   ')).toBeNull();
  });
});
