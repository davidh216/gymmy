/** Finding real gyms near the user via OpenStreetMap's Overpass API. */

export type Coords = { lat: number; lng: number };

export type NearbyPlace = Coords & {
  /** Stable id, e.g. osm:node/123 or osm:way/456. */
  placeId: string;
  name: string;
  area?: string;
  distanceKm: number;
};

export const SEARCH_RADIUS_M = 5000;
export const MAX_RESULTS = 30;

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

/** Overpass rejects anonymous clients (HTTP 406), so identify the app. */
export const OVERPASS_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Gymmy/1.0 (+https://github.com/davidh216/gymmy)',
};

/**
 * Posts a query to every Overpass mirror at once and returns the first good JSON answer.
 * Public mirrors are often slow or overloaded, so racing beats trying them in turn.
 */
export async function fetchOverpass(query: string, timeoutMs = 35_000): Promise<{ elements?: OverpassElement[] }> {
  const body = `data=${encodeURIComponent(query)}`;
  const controllers = OVERPASS_ENDPOINTS.map(() => new AbortController());
  const timer = setTimeout(() => controllers.forEach((c) => c.abort()), timeoutMs);
  const errors: string[] = [];
  try {
    return await new Promise((resolve, reject) => {
      let pending = OVERPASS_ENDPOINTS.length;
      OVERPASS_ENDPOINTS.forEach((url, i) => {
        fetch(url, { method: 'POST', headers: OVERPASS_HEADERS, body, signal: controllers[i].signal })
          .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (!Array.isArray(json?.elements)) throw new Error('bad response');
            resolve(json);
          })
          .catch((e: unknown) => {
            errors.push(`${new URL(url).host}: ${e instanceof Error ? e.message : 'failed'}`);
            if (--pending === 0) reject(new Error(errors.join('; ')));
          });
      });
    });
  } finally {
    clearTimeout(timer);
    controllers.forEach((c) => c.abort());
  }
}

/** Cache key for a spot, ~1 km grid. */
export function placesCacheKey({ lat, lng }: Coords): string {
  return `places:v1:${lat.toFixed(2)},${lng.toFixed(2)}`;
}

/** Overpass QL for gyms and fitness centres around a point. */
export function overpassQuery({ lat, lng }: Coords, radiusM = SEARCH_RADIUS_M): string {
  const around = `around:${Math.round(radiusM)},${lat.toFixed(5)},${lng.toFixed(5)}`;
  return [
    '[out:json][timeout:25];',
    '(',
    `  nwr["leisure"="fitness_centre"](${around});`,
    `  nwr["amenity"="gym"](${around});`,
    `  nwr["leisure"="sports_centre"]["sport"~"fitness|weightlifting|crossfit|bodybuilding|climbing"](${around});`,
    ');',
    'out center tags 100;',
  ].join('\n');
}

export type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** Great-circle distance in km. */
export function distanceKm(a: Coords, b: Coords): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function clip(text: string, max = 40): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** Short, human address line: "Main St, Springfield" or just the town. */
export function areaFromTags(tags: Record<string, string>): string | undefined {
  const street = tags['addr:street'];
  const town = tags['addr:city'] ?? tags['addr:suburb'] ?? tags['addr:town'] ?? tags['addr:village'];
  const parts = [street, town].filter(Boolean) as string[];
  return parts.length ? clip(parts.join(', ')) : undefined;
}

/** Named gyms from an Overpass response, nearest first, without duplicates. */
export function parseOverpass(json: { elements?: OverpassElement[] }, origin: Coords, limit = MAX_RESULTS): NearbyPlace[] {
  const seen = new Set<string>();
  const places: NearbyPlace[] = [];
  for (const el of json.elements ?? []) {
    const name = el.tags?.name ?? el.tags?.brand;
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!name || lat === undefined || lng === undefined) continue;
    const placeId = `osm:${el.type}/${el.id}`;
    if (seen.has(placeId)) continue;
    seen.add(placeId);
    places.push({
      placeId,
      name: clip(name),
      area: areaFromTags(el.tags ?? {}),
      lat,
      lng,
      distanceKm: distanceKm(origin, { lat, lng }),
    });
  }
  return places.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

/** "0.4 mi" / "650 m" style distance. */
export function formatDistance(km: number, imperial: boolean): string {
  if (imperial) {
    const mi = km * 0.621371;
    return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
