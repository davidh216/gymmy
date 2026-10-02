import { CACHE_MS, cell, handle } from './index';

const env = { supabaseUrl: 'https://proj.supabase.co', serviceKey: 'sb_secret_x' };
const NOW = Date.parse('2026-10-02T12:00:00Z');
const post = (body: unknown) => new Request('https://fn/gym-places', { method: 'POST', body: JSON.stringify(body) });
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('gym-places', () => {
  it('groups nearby points into one ~1 km cell', () => {
    expect(cell(40.71234, -74.00611)).toEqual({ key: '40.71,-74.01', lat: 40.71, lng: -74.01 });
    expect(cell(40.709, -74.0099).key).toBe('40.71,-74.01');
  });

  it('serves a fresh cache hit without asking OpenStreetMap', async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(String(url));
      return ok([{ elements: [{ id: 1 }], fetched_at: new Date(NOW - 3600_000).toISOString() }]);
    }) as unknown as typeof fetch;
    const res = await handle(post({ lat: 40.71234, lng: -74.00611 }), { env, fetch: fetchFn, now: () => NOW });
    expect(await res.json()).toEqual({ elements: [{ id: 1 }], cached: true });
    expect(calls).toEqual(['https://proj.supabase.co/rest/v1/places_cache?key=eq.40.71%2C-74.01&select=elements,fetched_at']);
  });

  it('looks up and stores a stale or missing cell', async () => {
    const calls: { url: string; body?: string }[] = [];
    const fetchFn = (async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body as string | undefined });
      if (String(url).includes('?key=')) return ok([{ elements: [], fetched_at: new Date(NOW - CACHE_MS - 1).toISOString() }]);
      if (String(url).includes('overpass')) return ok({ elements: [{ id: 7, tags: { name: 'Iron Temple' } }] });
      return new Response('', { status: 201 });
    }) as unknown as typeof fetch;
    const res = await handle(post({ lat: 40.71, lng: -74.01 }), { env, fetch: fetchFn, now: () => NOW });
    expect(await res.json()).toEqual({ elements: [{ id: 7, tags: { name: 'Iron Temple' } }], cached: false });
    const write = calls.find((c) => c.url === 'https://proj.supabase.co/rest/v1/places_cache');
    expect(JSON.parse(write!.body!)).toMatchObject({ key: '40.71,-74.01', elements: [{ id: 7 }] });
  });

  it('refuses bad input and reports when every map server fails', async () => {
    const down = (async (url: string) =>
      String(url).includes('?key=') ? ok([]) : new Response('', { status: 504 })) as unknown as typeof fetch;
    expect((await handle(post({ lat: 'x' }), { env, fetch: down, now: () => NOW })).status).toBe(400);
    expect((await handle(post({ lat: 95, lng: 0 }), { env, fetch: down, now: () => NOW })).status).toBe(400);
    expect((await handle(post({ lat: 1, lng: 2 }), { env, fetch: down, now: () => NOW })).status).toBe(502);
  });
});
