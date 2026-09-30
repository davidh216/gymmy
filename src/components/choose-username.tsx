import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, T, haptic } from '@/components/ui';
import { AuthError, chooseUsername } from '@/services/auth';
import { toUsername, useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Shown to accounts created without a username (Sign in with Apple). */
export function ChooseUsername() {
  const updateProfile = useGymmy((s) => s.updateProfile);
  const [username, setUsername] = useState(useGymmy.getState().profile?.username ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card style={styles.card}>
      <T variant="title">Pick your username</T>
      <T variant="body" color={colors.textDim}>
        This is how other lifters see you on the boards.
      </T>
      <View style={styles.row}>
        <T variant="heading" color={colors.textFaint}>
          @
        </T>
        <TextInput
          value={username}
          onChangeText={(t) => {
            setUsername(toUsername(t));
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          placeholder="username"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          accessibilityLabel="Username"
        />
      </View>
      {error && (
        <T variant="body" color={colors.danger}>
          {error}
        </T>
      )}
      <Button
        title={busy ? 'Saving…' : 'Save username'}
        disabled={username.length < 3 || busy}
        onPress={async () => {
          setBusy(true);
          try {
            await chooseUsername(username);
            updateProfile({ username });
            haptic('success');
          } catch (e) {
            setError(e instanceof AuthError ? e.message : 'Couldn’t save your username. Try again.');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, borderColor: colors.accent, marginBottom: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  input: {
    flex: 1,
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
