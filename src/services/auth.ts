import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { setMonitoringUser } from './monitoring';
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
    if (userId !== useAuth.getState().userId) {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      setMonitoringUser(userId);
    }
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
  if (checkError) throw new AuthError(`Couldn’t reach Gymmy. Check your connection and try again. (${checkError.message})`);
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

/** Whether Sign in with Apple works here (iPhone builds that include it). */
export async function appleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !supabase) return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Signs in with Apple, creating the account on first use. New accounts get a placeholder
 * username and are asked to pick one. Resolves false when the person cancels.
 */
export async function signInWithApple(): Promise<boolean> {
  if (!supabase) throw new AuthError('Online features are not set up in this build.');
  // Apple signs a hash of this nonce into the token; Supabase checks it against the raw value.
  const nonce = Crypto.randomUUID();
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashed,
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return false;
    throw new AuthError('Couldn’t sign in with Apple. Try again.');
  }
  if (!credential.identityToken) throw new AuthError('Apple didn’t return a sign-in token. Try again.');
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce,
  });
  if (error) throw new AuthError(`Couldn’t sign in with Apple. (${error.message})`);
  // Lets the account's Apple sign-in be revoked if it's ever deleted. Best effort: signing in
  // already worked, and the next Apple sign-in tries again.
  if (credential.authorizationCode) {
    supabase.functions
      .invoke('apple-token', { body: { action: 'link', code: credential.authorizationCode } })
      .catch(() => {});
  }
  return true;
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

export type MyProfile = { username: string; usernameSet: boolean; isAdmin: boolean; banned: boolean };

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const userId = useAuth.getState().userId;
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('username, username_set, is_admin, banned_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    username: data.username,
    usernameSet: data.username_set,
    isAdmin: data.is_admin,
    banned: data.banned_at !== null,
  };
}

/** Picks a new public username; throws AuthError if it's invalid or taken. */
export async function chooseUsername(raw: string) {
  const userId = useAuth.getState().userId;
  if (!supabase || !userId) throw new AuthError('Sign in first.');
  const username = raw.toLowerCase();
  if (!USERNAME.test(username)) {
    throw new AuthError('Usernames are 3–20 characters: letters, numbers, dots and underscores.');
  }
  const { error } = await supabase.from('profiles').update({ username }).eq('id', userId);
  if (error?.code === '23505') throw new AuthError(`@${username} is taken. Try another username.`);
  if (error) throw new AuthError('Couldn’t save your username. Try again.');
  queryClient.invalidateQueries({ queryKey: ['gyms'] });
}

/** Deletes the account, its videos and everything it posted. */
export async function deleteAccount() {
  const userId = useAuth.getState().userId;
  if (!supabase || !userId) return;
  // Revokes Sign in with Apple first, while still signed in (Apple requires it for deleted
  // accounts). Email accounts have nothing to revoke; a failure doesn't block the deletion.
  await supabase.functions.invoke('apple-token', { body: { action: 'revoke' } }).catch(() => {});
  const bucket = supabase.storage.from('attempts');
  const { data: files } = await bucket.list(userId, { limit: 1000 });
  if (files?.length) await bucket.remove(files.map((f) => `${userId}/${f.name}`));
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(error.message);
  // The server-side user is gone, so only clear the session on this device.
  await supabase.auth.signOut({ scope: 'local' });
}
