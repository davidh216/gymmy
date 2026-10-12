// Supabase Edge Function: keeps Sign in with Apple revocable, as Apple requires for apps that
// let people delete their account (App Store guideline 5.1.1(v)).
//
//   { action: 'link', code }  After an Apple sign-in, trades the one-time authorization code for
//                             a refresh token and stores it (service role only).
//   { action: 'revoke' }      Before the account is deleted, revokes that token with Apple so
//                             Gymmy no longer appears under the person's Apple ID.
//
// Needs the APPLE_TEAM_ID, APPLE_KEY_ID and APPLE_PRIVATE_KEY (.p8 contents) secrets.
// Self-contained (no imports) so it can be pasted as a single file.

type Env = {
  supabaseUrl: string;
  serviceKey: string;
  teamId: string;
  keyId: string;
  privateKey: string;
  clientId: string;
};
type Deps = { env: Env; fetch: typeof fetch; now: () => number };

const APPLE = 'https://appleid.apple.com';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const base64url = (bytes: Uint8Array | string) => {
  const raw = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
  let s = '';
  for (const b of raw) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** The PKCS#8 bytes inside a .p8 file. */
export function pemBody(pem: string): Uint8Array<ArrayBuffer> {
  const bin = atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Apple's client secret: an ES256 JWT signed with the Sign in with Apple key, valid 5 minutes. */
export async function clientSecret(env: Env, now: number): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: env.keyId, typ: 'JWT' }));
  const iat = Math.floor(now / 1000);
  const payload = base64url(JSON.stringify({ iss: env.teamId, iat, exp: iat + 300, aud: APPLE, sub: env.clientId }));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemBody(env.privateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  // WebCrypto returns the raw r||s signature JWS expects.
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  return `${header}.${payload}.${base64url(new Uint8Array(sig))}`;
}

/** The signed-in user behind the request's token, or null. */
async function userId(req: Request, { env, fetch: fetchFn }: Deps): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth) return null;
  const res = await fetchFn(`${env.supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: env.serviceKey },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ?? null;
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const { env, fetch: fetchFn, now } = deps;
  if (!env.teamId || !env.keyId || !env.privateKey) return json({ error: 'Apple key not configured' }, 500);

  let body: { action?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Send JSON' }, 400);
  }
  const uid = await userId(req, deps);
  if (!uid) return json({ error: 'Sign in first' }, 401);

  const rest = `${env.supabaseUrl}/rest/v1/apple_tokens`;
  const service = {
    apikey: env.serviceKey,
    Authorization: `Bearer ${env.serviceKey}`,
    'Content-Type': 'application/json',
  };
  const form = async (extra: Record<string, string>) =>
    new URLSearchParams({ client_id: env.clientId, client_secret: await clientSecret(env, now()), ...extra });

  if (body.action === 'link') {
    if (!body.code) return json({ error: 'Missing code' }, 400);
    const res = await fetchFn(`${APPLE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: await form({ code: body.code, grant_type: 'authorization_code' }),
    });
    const token = (await res.json().catch(() => ({}))) as { refresh_token?: string; error?: string };
    if (!res.ok || !token.refresh_token) return json({ error: token.error ?? `Apple said ${res.status}` }, 502);
    const saved = await fetchFn(rest, {
      method: 'POST',
      headers: { ...service, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: uid,
        refresh_token: token.refresh_token,
        updated_at: new Date(now()).toISOString(),
      }),
    });
    if (!saved.ok) return json({ error: 'Could not save the token' }, 500);
    return json({ linked: true });
  }

  if (body.action === 'revoke') {
    const found = await fetchFn(`${rest}?user_id=eq.${uid}&select=refresh_token`, { headers: service });
    const rows = found.ok ? ((await found.json()) as { refresh_token: string }[]) : [];
    // Accounts made with email, or before this existed, have nothing to revoke.
    if (!rows[0]) return json({ revoked: false });
    const res = await fetchFn(`${APPLE}/auth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: await form({ token: rows[0].refresh_token, token_type_hint: 'refresh_token' }),
    });
    if (!res.ok) return json({ error: `Apple said ${res.status}` }, 502);
    await fetchFn(`${rest}?user_id=eq.${uid}`, { method: 'DELETE', headers: service }).catch(() => {});
    return json({ revoked: true });
  }

  return json({ error: 'Unknown action' }, 400);
}

// Only runs inside Supabase's Deno runtime; imports in tests skip this.
const deno = (
  globalThis as {
    Deno?: { env: { get(k: string): string | undefined }; serve(h: (r: Request) => Promise<Response>): void };
  }
).Deno;
if (deno) {
  const secretKeys = deno.env.get('SUPABASE_SECRET_KEYS');
  const env: Env = {
    supabaseUrl: deno.env.get('SUPABASE_URL') ?? '',
    serviceKey:
      deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      (secretKeys ? (Object.values(JSON.parse(secretKeys))[0] as string) : ''),
    teamId: deno.env.get('APPLE_TEAM_ID') ?? '',
    keyId: deno.env.get('APPLE_KEY_ID') ?? '',
    privateKey: (deno.env.get('APPLE_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n'),
    clientId: deno.env.get('APPLE_CLIENT_ID') ?? 'com.davidh216.gymmy',
  };
  deno.serve((req) => handle(req, { env, fetch, now: Date.now }));
}
