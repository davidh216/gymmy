import { clientSecret, handle } from './index';

const NOW = Date.parse('2026-10-12T12:00:00Z');

async function testKey() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  const b64 = btoa(String.fromCharCode(...der));
  const pem = `-----BEGIN PRIVATE KEY-----\n${b64.match(/.{1,64}/g)!.join('\n')}\n-----END PRIVATE KEY-----`;
  return { pem, publicKey: pair.publicKey };
}

const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const decode = (s: string) => JSON.parse(new TextDecoder().decode(fromB64url(s)));

describe('apple-token', () => {
  let env: Parameters<typeof clientSecret>[0];
  let publicKey: CryptoKey;
  beforeAll(async () => {
    const k = await testKey();
    publicKey = k.publicKey;
    env = {
      supabaseUrl: 'https://proj.supabase.co',
      serviceKey: 'sb_secret_x',
      teamId: 'TEAM123',
      keyId: 'KEY456',
      privateKey: k.pem,
      clientId: 'com.davidh216.gymmy',
    };
  });

  it('signs an ES256 client secret Apple accepts', async () => {
    const jwt = await clientSecret(env, NOW);
    const [h, p, s] = jwt.split('.');
    expect(decode(h)).toEqual({ alg: 'ES256', kid: 'KEY456', typ: 'JWT' });
    expect(decode(p)).toEqual({
      iss: 'TEAM123',
      iat: NOW / 1000,
      exp: NOW / 1000 + 300,
      aud: 'https://appleid.apple.com',
      sub: 'com.davidh216.gymmy',
    });
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      fromB64url(s),
      new TextEncoder().encode(`${h}.${p}`),
    );
    expect(ok).toBe(true);
  });

  const call = async (
    body: unknown,
    routes: Record<string, (init?: RequestInit) => Response>,
    auth = 'Bearer user-jwt',
  ) => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchFn = (async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      const route = Object.keys(routes).find((r) => String(url).startsWith(r));
      return route ? routes[route](init) : new Response('not found', { status: 404 });
    }) as unknown as typeof fetch;
    const req = new Request('https://fn/apple-token', {
      method: 'POST',
      headers: auth ? { Authorization: auth } : {},
      body: JSON.stringify(body),
    });
    const res = await handle(req, { env, fetch: fetchFn, now: () => NOW });
    return { res, json: await res.json(), calls };
  };
  const user = () => new Response(JSON.stringify({ id: 'u1' }), { status: 200 });

  it('trades the code for a refresh token and stores it for the signed-in user', async () => {
    const { json, calls } = await call(
      { action: 'link', code: 'abc' },
      {
        'https://proj.supabase.co/auth/v1/user': user,
        'https://appleid.apple.com/auth/token': () =>
          new Response(JSON.stringify({ refresh_token: 'r1' }), { status: 200 }),
        'https://proj.supabase.co/rest/v1/apple_tokens': () => new Response('', { status: 201 }),
      },
    );
    expect(json).toEqual({ linked: true });
    const apple = new URLSearchParams(String(calls[1].init?.body));
    expect([apple.get('code'), apple.get('grant_type'), apple.get('client_id')]).toEqual([
      'abc',
      'authorization_code',
      'com.davidh216.gymmy',
    ]);
    expect(JSON.parse(String(calls[2].init?.body))).toMatchObject({ user_id: 'u1', refresh_token: 'r1' });
  });

  it('revokes the stored token, and has nothing to do for email accounts', async () => {
    const stored = await call(
      { action: 'revoke' },
      {
        'https://proj.supabase.co/auth/v1/user': user,
        'https://proj.supabase.co/rest/v1/apple_tokens': (init) =>
          init?.method === 'DELETE'
            ? new Response('', { status: 204 })
            : new Response(JSON.stringify([{ refresh_token: 'r1' }]), { status: 200 }),
        'https://appleid.apple.com/auth/revoke': () => new Response('', { status: 200 }),
      },
    );
    expect(stored.json).toEqual({ revoked: true });
    const revoke = stored.calls.find((c) => c.url.endsWith('/auth/revoke'))!;
    expect(new URLSearchParams(String(revoke.init?.body)).get('token')).toBe('r1');
    expect(stored.calls.some((c) => c.init?.method === 'DELETE')).toBe(true);

    const none = await call(
      { action: 'revoke' },
      {
        'https://proj.supabase.co/auth/v1/user': user,
        'https://proj.supabase.co/rest/v1/apple_tokens': () => new Response('[]', { status: 200 }),
      },
    );
    expect(none.json).toEqual({ revoked: false });
  });

  it('refuses requests without a signed-in user', async () => {
    const { res } = await call({ action: 'revoke' }, {}, '');
    expect(res.status).toBe(401);
  });
});
