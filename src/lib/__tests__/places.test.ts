import {
  areaFromTags,
  distanceKm,
  fetchOverpass,
  formatDistance,
  overpassQuery,
  parseOverpass,
  type OverpassElement,
} from '../places';

const origin = { lat: 40.758, lng: -73.9855 }; // Times Square

describe('overpassQuery', () => {
  it('searches gyms and fitness centres around the point', () => {
    const q = overpassQuery(origin, 5000);
    expect(q).toContain('nwr["leisure"="fitness_centre"](around:5000,40.75800,-73.98550);');
    expect(q).toContain('nwr["amenity"="gym"]');
    expect(q).toContain('out center tags');
  });
});

describe('parseOverpass', () => {
  const json: { elements: OverpassElement[] } = {
    elements: [
      { type: 'way', id: 2, center: { lat: 40.77, lon: -73.98 }, tags: { name: 'Far Gym', 'addr:city': 'New York' } },
      { type: 'node', id: 1, lat: 40.759, lon: -73.985, tags: { name: 'Near Gym', 'addr:street': '7th Ave', 'addr:city': 'New York' } },
      { type: 'node', id: 3, lat: 40.76, lon: -73.98, tags: { leisure: 'fitness_centre' } },
      { type: 'node', id: 4, lat: 40.761, lon: -73.98, tags: { brand: 'Planet Fitness' } },
      { type: 'node', id: 1, lat: 40.759, lon: -73.985, tags: { name: 'Near Gym' } },
    ],
  };

  it('keeps named places, nearest first, without duplicates', () => {
    const places = parseOverpass(json, origin);
    expect(places.map((p) => p.placeId)).toEqual(['osm:node/1', 'osm:node/4', 'osm:way/2']);
    expect(places[0]).toMatchObject({ name: 'Near Gym', area: '7th Ave, New York' });
    expect(places[1].name).toBe('Planet Fitness');
    expect(places[2]).toMatchObject({ lat: 40.77, lng: -73.98 });
  });

  it('respects the result limit', () => {
    expect(parseOverpass(json, origin, 1)).toHaveLength(1);
  });

  it('handles empty responses', () => {
    expect(parseOverpass({}, origin)).toEqual([]);
  });
});

describe('helpers', () => {
  it('measures distance', () => {
    expect(distanceKm(origin, origin)).toBe(0);
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.2, 0);
  });

  it('formats distance in miles or km', () => {
    expect(formatDistance(0.5, false)).toBe('500 m');
    expect(formatDistance(2.345, false)).toBe('2.3 km');
    expect(formatDistance(1.609, true)).toBe('1.0 mi');
    expect(formatDistance(0.01, true)).toBe('33 ft');
  });

  it('builds a short area line and clips long text', () => {
    expect(areaFromTags({ 'addr:suburb': 'Brooklyn' })).toBe('Brooklyn');
    expect(areaFromTags({})).toBeUndefined();
    expect(areaFromTags({ 'addr:street': 'A Very Long Street Name That Keeps Going', 'addr:city': 'Somewhere' })!.length).toBeLessThanOrEqual(40);
  });
});

describe('fetchOverpass', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });
  const reply = (status: number, body: unknown, delay = 0) =>
    new Promise<Response>((resolve) =>
      setTimeout(() => resolve({ ok: status === 200, status, json: async () => body } as Response), delay),
    );

  it('takes the first good answer from any mirror', async () => {
    const urls: string[] = [];
    global.fetch = jest.fn((url: string) => {
      urls.push(url);
      if (url.includes('overpass-api.de')) return reply(504, null, 5);
      if (url.includes('kumi')) return reply(200, { elements: [{ type: 'node', id: 1 }] }, 20);
      return reply(200, { elements: [] }, 50);
    }) as unknown as typeof fetch;
    const json = await fetchOverpass('q');
    expect(json.elements).toHaveLength(1);
    expect(urls).toHaveLength(3);
  });

  it('explains every failure when all mirrors fail', async () => {
    global.fetch = jest.fn(() => reply(429, null)) as unknown as typeof fetch;
    await expect(fetchOverpass('q')).rejects.toThrow(/overpass-api\.de: HTTP 429.*HTTP 429.*HTTP 429/);
  });
});
