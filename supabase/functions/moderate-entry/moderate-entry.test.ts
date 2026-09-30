import { evaluateHive, handle } from './index';

const hive = (frames: { time: number; classes: [string, number][] }[]) => ({
  status: [
    {
      status: { code: '0', message: 'SUCCESS' },
      response: {
        output: frames.map((f) => ({ time: f.time, classes: f.classes.map(([c, score]) => ({ class: c, score })) })),
      },
    },
  ],
});

describe('evaluateHive', () => {
  it('passes normal gym footage, including shirtless lifters', () => {
    expect(
      evaluateHive(hive([{ time: 0, classes: [['general_suggestive', 0.97], ['general_nsfw', 0.02]] }])),
    ).toEqual({ flagged: false });
  });

  it('flags the worst blocking class across frames', () => {
    const verdict = evaluateHive(
      hive([
        { time: 0, classes: [['general_nsfw', 0.1]] },
        { time: 3, classes: [['very_bloody', 0.92]] },
        { time: 4, classes: [['general_nsfw', 0.99]] },
      ]),
    );
    expect(verdict).toEqual({ flagged: true, flagClass: 'general_nsfw', flagScore: 0.99, time: 4 });
  });

  it('rejects responses without output', () => {
    expect(() => evaluateHive({ status: [{ status: { message: 'ERROR' } }] })).toThrow('ERROR');
  });
});

describe('handle', () => {
  const ENTRY = '11111111-2222-3333-4444-555555555555';
  const env = { supabaseUrl: 'https://proj.supabase.co', serviceKey: 'sb_secret_x', hiveKey: 'hive_key' };

  function setup(opts: { owner?: string; status?: string; hiveBody?: unknown; hiveOk?: boolean } = {}) {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
      if (url.endsWith('/auth/v1/user')) return ok({ id: 'user-1' });
      if (url.includes('/rest/v1/entries?id=eq.') && !init?.method) {
        return ok([{ id: ENTRY, user_id: opts.owner ?? 'user-1', status: opts.status ?? 'processing', video_path: 'user-1/a.mp4' }]);
      }
      if (url.includes('/storage/v1/object/sign/')) return ok({ signedURL: '/object/sign/attempts/user-1/a.mp4?token=t' });
      if (url.startsWith('https://api.thehive.ai')) {
        return new Response(JSON.stringify(opts.hiveBody ?? {}), { status: opts.hiveOk === false ? 500 : 200 });
      }
      return new Response(null, { status: 204 });
    });
    const request = () =>
      new Request('https://fn/moderate-entry', {
        method: 'POST',
        headers: { Authorization: 'Bearer user-jwt' },
        body: JSON.stringify({ entryId: ENTRY }),
      });
    return { calls, run: () => handle(request(), { env, fetch: fetchMock as unknown as typeof fetch }) };
  }

  const patchedStatus = (calls: { url: string; init?: RequestInit }[]) =>
    JSON.parse(String(calls.find((c) => c.init?.method === 'PATCH')?.init?.body)).status;

  it('publishes clean videos', async () => {
    const { calls, run } = setup({ hiveBody: hive([{ time: 0, classes: [['general_nsfw', 0.01]] }]) });
    const res = await run();
    expect(await res.json()).toEqual({ status: 'live' });
    expect(patchedStatus(calls)).toBe('live');
    const hiveCall = calls.find((c) => c.url.startsWith('https://api.thehive.ai'));
    expect((hiveCall?.init?.headers as Record<string, string>).Authorization).toBe('Token hive_key');
    expect((hiveCall?.init?.body as FormData).get('url')).toBe(
      'https://proj.supabase.co/storage/v1/object/sign/attempts/user-1/a.mp4?token=t',
    );
  });

  it('holds flagged videos for review and records why', async () => {
    const { calls, run } = setup({ hiveBody: hive([{ time: 2, classes: [['yes_male_nudity', 0.95]] }]) });
    expect(await (await run()).json()).toEqual({ status: 'hidden' });
    const result = JSON.parse(String(calls.find((c) => c.url.endsWith('/moderation_results'))?.init?.body));
    expect(result).toMatchObject({ entry_id: ENTRY, flagged: true, flag_class: 'yes_male_nudity' });
  });

  it('fails closed when Hive errors', async () => {
    const { calls, run } = setup({ hiveOk: false });
    expect(await (await run()).json()).toEqual({ status: 'hidden' });
    const result = JSON.parse(String(calls.find((c) => c.url.endsWith('/moderation_results'))?.init?.body));
    expect(result.error).toContain('Hive returned 500');
  });

  it('only lets the poster trigger a scan, once', async () => {
    expect((await setup({ owner: 'someone-else' }).run()).status).toBe(404);
    const already = setup({ status: 'live' });
    expect(await (await already.run()).json()).toEqual({ status: 'live' });
    expect(already.calls.some((c) => c.url.startsWith('https://api.thehive.ai'))).toBe(false);
  });

  it('uses only the apikey header for new secret keys', async () => {
    const { calls, run } = setup({ hiveBody: hive([]) });
    await run();
    const entryCall = calls.find((c) => c.url.includes('/rest/v1/entries?id=eq.'));
    expect(entryCall?.init?.headers).toEqual({ apikey: 'sb_secret_x' });
  });
});
