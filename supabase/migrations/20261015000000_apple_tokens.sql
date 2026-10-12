-- Sign in with Apple refresh tokens, kept so the apple-token Edge Function can revoke them when
-- an account is deleted (App Store guideline 5.1.1(v)). Only the service role touches this table.
create table if not exists public.apple_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.apple_tokens enable row level security;
revoke all on public.apple_tokens from public, anon, authenticated;
