// Supabase Edge Function: gyms near a point from OpenStreetMap's Overpass API, cached in
// public.places_cache so everyone in the same ~1 km area shares one lookup for a week.
//
// The app sends { lat, lng }; this searches around the centre of that ~1 km grid cell and
// returns the raw Overpass elements, which the app turns into a list with distances.
// Deployed with verify_jwt off so signed-out users can find gyms too.
// Self-contained (no imports) so it can be pasted as a single file.

type Env = { supabaseUrl: string; serviceKey: string };
type Deps = { env: Env; fetch: typeof fetch; now: () => number };

export const CACHE_MS = 7 * 24 * 3600 * 1000;
export const SEARCH_RADIUS_M = 5000;

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** The ~1 km grid cell a point falls in, and its centre. */
export function cell(lat: number, lng: number): { key: string; lat: number; lng: number } {
  const rLat = Math.round(lat * 100) / 100;
  const rLng = Math.round(lng * 100) / 100;
  return { key: `${rLat.toFixed(2)},${rLng.toFixed(2)}`, lat: rLat, lng: rLng };
}

export function overpassQuery(lat: number, lng: number): string {
  const around = `around:${SEARCH_RADIUS_M},${lat.toFixed(5)},${lng.toFixed(5)}`;
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

/** Asks every mirror at once and takes the first good answer. */
async function overpass(query: string, fetchFn: typeof fetch): Promise<unknown[]> {
  const body = `data=${encodeURIComponent(query)}`;
  const controllers = ENDPOINTS.map(() => new AbortController());
  const timer = setTimeout(() => controllers.forEach((c) => c.abort()), 30_000);
  try {
    return await new Promise((resolve, reject) => {
      let pending = ENDPOINTS.length;
      ENDPOINTS.forEach((url, i) => {
        fetchFn(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Gymmy/1.0 (+https://github.com/davidh216/gymmy)',
          },
          body,
          signal: controllers[i].signal,
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as { elements?: unknown[] };
            if (!Array.isArray(data?.elements)) throw new Error('bad response');
            resolve(data.elements);
          })
          .catch(() => {
            if (--pending === 0) reject(new Error('All map servers failed'));
          });
      });
    });
  } finally {
    clearTimeout(timer);
    controllers.forEach((c) => c.abort());
  }
}

export async function handle(req: Request, { env, fetch: fetchFn, now }: Deps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let lat: number;
  let lng: number;
  try {
    ({ lat, lng } = (await req.json()) as { lat: number; lng: number });
  } catch {
    return json({ error: 'Send { lat, lng }' }, 400);
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return json({ error: 'Send { lat, lng }' }, 400);
  }

  const c = cell(lat, lng);
  const rest = `${env.supabaseUrl.replace(/\/$/, '')}/rest/v1/places_cache`;
  const headers = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, 'Content-Type': 'application/json' };

  try {
    const hit = await fetchFn(`${rest}?key=eq.${encodeURIComponent(c.key)}&select=elements,fetched_at`, { headers });
    if (hit.ok) {
      const rows = (await hit.json()) as { elements: unknown[]; fetched_at: string }[];
      if (rows[0] && now() - Date.parse(rows[0].fetched_at) < CACHE_MS) {
        return json({ elements: rows[0].elements, cached: true });
      }
    }
  } catch {
    // Cache unavailable: fall through to a live lookup.
  }

  let elements: unknown[];
  try {
    elements = await overpass(overpassQuery(c.lat, c.lng), fetchFn);
  } catch (e) {
    return json({ error: (e as Error).message }, 502);
  }

  // Best effort; a failed write just means the next person looks it up again.
  await fetchFn(rest, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key: c.key, elements, fetched_at: new Date(now()).toISOString() }),
  }).catch(() => {});

  return json({ elements, cached: false });
}

// Only runs inside Supabase's Deno runtime; imports in tests skip this.
const deno = (globalThis as { Deno?: { env: { get(k: string): string | undefined }; serve(h: (r: Request) => Promise<Response>): void } }).Deno;
if (deno) {
  const secretKeys = deno.env.get('SUPABASE_SECRET_KEYS');
  const env: Env = {
    supabaseUrl: deno.env.get('SUPABASE_URL') ?? '',
    serviceKey:
      deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      (secretKeys ? (Object.values(JSON.parse(secretKeys))[0] as string) : ''),
  };
  deno.serve((req) => handle(req, { env, fetch, now: Date.now }));
}
