import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, T, haptic } from '@/components/ui';
import { AuthError, fetchMyUsername, signIn, signInWithApple, signUp } from '@/services/auth';
import { toUsername, useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Sign-up and sign-in for online features (gym leaderboards). */
export function AccountCard() {
  const profile = useGymmy((s) => s.profile);
  const companionId = useGymmy((s) => s.companionId);
  const updateProfile = useGymmy((s) => s.updateProfile);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable, () => setAppleAvailable(false));
  }, []);

  const apple = async () => {
    setError(null);
    try {
      await signInWithApple();
      haptic('success');
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Couldn’t reach Gymmy. Check your connection and try again.');
    }
  };

  const valid =
    /\S+@\S+\.\S+/.test(email) && password.length >= 8 && (mode === 'signin' || username.length >= 3);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUp({ email, password, username, companionId });
        updateProfile({ username: toUsername(username) });
        if (needsConfirmation) setNotice(`Check ${email} for a confirmation link, then sign in.`);
      } else {
        await signIn(email, password);
        const serverName = await fetchMyUsername();
        if (serverName) updateProfile({ username: serverName });
      }
      haptic('success');
    } catch (e) {
      setError(
        e instanceof AuthError
          ? e.message
          : `Couldn’t reach Gymmy. Check your connection and try again. (${e instanceof Error ? e.message : String(e)})`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={styles.card}>
      <T variant="title">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</T>
      <T variant="body" color={colors.textDim} style={{ lineHeight: 21 }}>
        Gyms are shared with other lifters, so posting and reporting need an account. Your workouts stay on
        this phone.
      </T>
      {appleAvailable && (
        <>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={radius.pill}
            style={styles.apple}
            onPress={apple}
          />
          <T variant="caption" color={colors.textFaint} style={{ textAlign: 'center' }}>
            or use email
          </T>
        </>
      )}
      {mode === 'signup' && (
        <View style={styles.field}>
          <T variant="label" color={colors.textFaint}>
            Username
          </T>
          <View style={styles.usernameRow}>
            <T variant="heading" color={colors.textFaint}>
              @
            </T>
            <TextInput
              value={username}
              onChangeText={(t) => setUsername(toUsername(t))}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              placeholder="username"
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { flex: 1 }]}
              accessibilityLabel="Username"
            />
          </View>
        </View>
      )}
      <View style={styles.field}>
        <T variant="label" color={colors.textFaint}>
          Email
        </T>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="you@example.com"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          accessibilityLabel="Email"
        />
      </View>
      <View style={styles.field}>
        <T variant="label" color={colors.textFaint}>
          Password
        </T>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType={mode === 'signup' ? 'newPassword' : 'password'}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          placeholder="At least 8 characters"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          accessibilityLabel="Password"
        />
      </View>
      {error && (
        <T variant="body" color={colors.danger}>
          {error}
        </T>
      )}
      {notice && (
        <T variant="body" color={colors.success}>
          {notice}
        </T>
      )}
      <Button
        size="lg"
        title={busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        disabled={!valid || busy}
        onPress={submit}
      />
      <Button
        variant="ghost"
        title={mode === 'signup' ? 'I already have an account' : 'Create a new account'}
        onPress={() => {
          setMode(mode === 'signup' ? 'signin' : 'signup');
          setError(null);
          setNotice(null);
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  field: { gap: 6 },
  apple: { height: 52, width: '100%' },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  input: {
    minWidth: 0,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
  },
});
