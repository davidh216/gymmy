import { create } from 'zustand';

import { queryClient } from './query-client';
import { isRemote, supabase } from './supabase';

type AuthState = {
  /** False until the stored session has been read. */
  ready: boolean;
  userId: string | null;
  email: string | null;
};

export const useAuth = create<AuthState>(() => ({ ready: !isRemote, userId: null, email: null }));

let started = false;

/** Tracks the Supabase session; call once at startup. */
export function initAuth() {
  if (!supabase || started) return;
  started = true;
  const apply = (session: { user: { id: string; email?: string } } | null) => {
    const userId = session?.user.id ?? null;
    if (userId !== useAuth.getState().userId) queryClient.invalidateQueries({ queryKey: ['gyms'] });
    useAuth.setState({ ready: true, userId, email: session?.user.email ?? null });
  };
  supabase.auth.getSession().then(({ data }) => apply(data.session));
  supabase.auth.onAuthStateChange((_event, session) => apply(session));
}

export class AuthError extends Error {}

const USERNAME = /^[a-z0-9_.]{3,20}$/;

export async function signUp(input: {
  email: string;
  password: string;
  username: string;
  companionId: string;
}): Promise<{ needsConfirmation: boolean }> {
  if (!supabase) throw new AuthError('Online features are not set up in this build.');
  const username = input.username.toLowerCase();
  if (!USERNAME.test(username)) {
    throw new AuthError('Usernames are 3–20 characters: letters, numbers, dots and underscores.');
  }
  const { data: available, error: checkError } = await supabase.rpc('username_available', {
    p_username: username,
  });
  if (checkError) throw new AuthError('Couldn’t reach Gymmy. Check your connection and try again.');
  if (!available) throw new AuthError(`@${username} is taken. Try another username.`);

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { username, companion_id: input.companionId } },
  });
  if (error) throw new AuthError(error.message);
  return { needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new AuthError('Online features are not set up in this build.');
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new AuthError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
}

export async function signOut() {
  await supabase?.auth.signOut();
}

/** The signed-in user's public handle from the server. */
export async function fetchMyUsername(): Promise<string | null> {
  const userId = useAuth.getState().userId;
  if (!supabase || !userId) return null;
  const { data } = await supabase.from('profiles').select('username').eq('id', userId).maybeSingle();
  return data?.username ?? null;
}
