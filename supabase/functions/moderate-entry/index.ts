// Supabase Edge Function: scans a newly posted attempt video with Hive's visual
// moderation API and publishes the entry or holds it for admin review.
//
// Deploy: Supabase Dashboard → Edge Functions → Deploy a new function → Via editor,
// name it `moderate-entry` and paste this file. Add the secret HIVE_API_KEY.
// Self-contained (no imports) so it can be pasted as a single file.

type Env = {
  supabaseUrl: string;
  serviceKey: string;
  hiveKey: string;
};

type Deps = { env: Env; fetch: typeof fetch };

/** Hive classes that block an entry, with the score that triggers the block. */
export const BLOCKING_CLASSES: Record<string, number> = {
  general_nsfw: 0.9,
  yes_sexual_activity: 0.9,
  yes_female_nudity: 0.9,
  yes_male_nudity: 0.9,
  yes_sex_toy: 0.9,
  very_bloody: 0.9,
  human_corpse: 0.9,
  yes_self_harm: 0.9,
  hanging: 0.9,
  yes_nazi: 0.9,
  yes_kkk: 0.9,
  yes_terrorist: 0.9,
};
// Deliberately not blocking general_suggestive: it fires on shirtless lifters and gym wear.

export type Verdict =
  | { flagged: false }
  | { flagged: true; flagClass: string; flagScore: number; time: number };

type HiveResponse = {
  status?: {
    status?: { code?: string; message?: string };
    response?: { output?: { time?: number; classes?: { class: string; score: number }[] }[] };
  }[];
};

/** Worst blocking class across every frame, or not flagged. */
export function evaluateHive(body: HiveResponse, rules = BLOCKING_CLASSES): Verdict {
  const task = body.status?.[0];
  const frames = task?.response?.output;
  if (!frames) throw new Error(`Unexpected Hive response: ${task?.status?.message ?? 'no output'}`);
  let worst: Verdict = { flagged: false };
  for (const frame of frames) {
    for (const c of frame.classes ?? []) {
      const threshold = rules[c.class];
      if (threshold === undefined || c.score < threshold) continue;
      if (!worst.flagged || c.score > worst.flagScore) {
        worst = { flagged: true, flagClass: c.class, flagScore: c.score, time: frame.time ?? 0 };
      }
    }
  }
  return worst;
}

// Lets the web build call the function from the browser.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/** Headers for calling Supabase with the service key (legacy JWT or new sb_secret_ key). */
function serviceHeaders(key: string): Record<string, string> {
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

export async function handle(req: Request, { env, fetch }: Deps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Sign in first' });
  const { entryId } = (await req.json().catch(() => ({}))) as { entryId?: string };
  if (!entryId || !/^[0-9a-f-]{36}$/i.test(entryId)) return json(400, { error: 'entryId required' });

  const base = env.supabaseUrl.replace(/\/$/, '');
  const svc = serviceHeaders(env.serviceKey);

  // Who is calling?
  const userRes = await fetch(`${base}/auth/v1/user`, {
    headers: { apikey: svc.apikey, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return json(401, { error: 'Sign in first' });
  const user = (await userRes.json()) as { id: string };

  // Only the poster can trigger a scan, and only while the entry is waiting for one.
  const entryRes = await fetch(
    `${base}/rest/v1/entries?id=eq.${entryId}&select=id,user_id,status,video_path`,
    { headers: svc },
  );
  const [entry] = (await entryRes.json()) as {
    id: string;
    user_id: string;
    status: string;
    video_path: string;
  }[];
  if (!entry || entry.user_id !== user.id) return json(404, { error: 'Entry not found' });
  if (entry.status !== 'processing') return json(200, { status: entry.status });

  const record = async (status: 'live' | 'hidden', result: Record<string, unknown>) => {
    await fetch(`${base}/rest/v1/moderation_results`, {
      method: 'POST',
      headers: { ...svc, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ entry_id: entry.id, provider: 'hive', ...result }),
    });
    await fetch(`${base}/rest/v1/entries?id=eq.${entry.id}&status=eq.processing`, {
      method: 'PATCH',
      headers: { ...svc, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    });
    return json(200, { status });
  };

  try {
    // Short-lived link Hive can download the clip from.
    const signRes = await fetch(`${base}/storage/v1/object/sign/attempts/${entry.video_path}`, {
      method: 'POST',
      headers: { ...svc, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 600 }),
    });
    if (!signRes.ok) throw new Error(`Could not sign video URL (${signRes.status})`);
    const { signedURL } = (await signRes.json()) as { signedURL: string };
    const videoUrl = `${base}/storage/v1${signedURL}`;

    const form = new FormData();
    form.append('url', videoUrl);
    const hiveRes = await fetch('https://api.thehive.ai/api/v2/task/sync', {
      method: 'POST',
      headers: { Authorization: `Token ${env.hiveKey}` },
      body: form,
    });
    if (!hiveRes.ok) throw new Error(`Hive returned ${hiveRes.status}`);
    const verdict = evaluateHive((await hiveRes.json()) as HiveResponse);

    if (verdict.flagged) {
      return await record('hidden', {
        flagged: true,
        flag_class: verdict.flagClass,
        flag_score: verdict.flagScore,
      });
    }
    return await record('live', { flagged: false });
  } catch (e) {
    // Fail closed: if the scan can't run, a person reviews the entry instead.
    return await record('hidden', { flagged: false, error: String((e as Error).message ?? e) });
  }
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
    hiveKey: deno.env.get('HIVE_API_KEY') ?? '',
  };
  deno.serve((req) => handle(req, { env, fetch }));
}
