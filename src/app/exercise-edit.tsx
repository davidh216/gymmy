import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import {
  EXERCISE_KINDS,
  MUSCLE_GROUPS,
  exerciseNamed,
  tidyExerciseName,
  type ExerciseKind,
  type MuscleGroup,
} from '@/lib/exercises';
import { exerciseInUse } from '@/lib/records';
import { track } from '@/services/analytics';
import { submitExercise } from '@/services/exercises';
import { useGymmy, type CustomExercise } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const STATUS_TEXT = {
  pending: 'Submitted, waiting for review.',
  approved: 'Approved. It’s now in everyone’s exercise list.',
  rejected: 'Not added to the shared list. It still works for you.',
} as const;

/**
 * Create a custom exercise (saved on this phone), or edit one with `?id=`.
 * Opened from the picker with `?add=1` (and `with=` any exercises already picked there),
 * a new exercise goes straight into the workout.
 */
export default function ExerciseEdit() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; name?: string; add?: string; with?: string }>();
  const existing = useGymmy((s) => s.customExercises.find((e) => e.id === params.id));
  const inUse = useGymmy((s) => (existing ? exerciseInUse(existing.id, s.workouts, s.active) : false));
  const { addCustomExercise, updateCustomExercise, deleteCustomExercise, addExercises } = useGymmy.getState();

  const [name, setName] = useState(existing?.name ?? params.name ?? '');
  const [group, setGroup] = useState<MuscleGroup>(existing?.group ?? 'chest');
  const [kind, setKind] = useState<ExerciseKind>(existing?.kind ?? 'weight');
  const [share, setShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tidy = tidyExerciseName(name);
  const duplicate = tidy ? exerciseNamed(tidy, existing?.id) : undefined;
  const valid = tidy.length >= 2 && !duplicate;

  const submit = async (exercise: CustomExercise) => {
    setBusy(true);
    try {
      await submitExercise(exercise);
      track({ event: 'custom_exercise_submit' });
      return true;
    } catch (e) {
      setError(`Saved on this phone, but couldn’t submit: ${e instanceof Error ? e.message : 'unknown error'}`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!valid) return;
    setError(null);
    haptic('success');
    if (existing) {
      updateCustomExercise(existing.id, { name: tidy, group, kind: inUse ? existing.kind : kind });
      router.back();
      return;
    }
    const created = addCustomExercise({ name: tidy, group, kind });
    track({ event: 'custom_exercise_create', props: { submitted: share } });
    if (share && !(await submit(created))) {
      // Stay here showing the error; the exercise is saved and can be submitted again.
      router.setParams({ id: created.id });
      return;
    }
    if (params.add && useGymmy.getState().active) {
      addExercises([...(params.with ? params.with.split(',') : []), created.id]);
      router.dismissTo('/workout');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <T variant="title">{existing ? 'Edit exercise' : 'New exercise'}</T>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <T variant="heading" color={colors.textDim}>
            {existing ? 'Done' : 'Cancel'}
          </T>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
        <T variant="label" color={colors.textFaint}>
          Name
        </T>
        <TextInput
          autoFocus={!existing}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Landmine Press"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={40}
          autoCapitalize="words"
          returnKeyType="done"
        />
        {duplicate && (
          <T variant="caption" color={colors.danger}>
            {duplicate.name} already exists{duplicate.source === 'custom' ? ' in your exercises' : ''}.
          </T>
        )}

        <T variant="label" color={colors.textFaint} style={styles.label}>
          Muscle group
        </T>
        <View style={styles.chips}>
          {MUSCLE_GROUPS.map((g) => (
            <Chip key={g.id} label={g.label} active={group === g.id} onPress={() => setGroup(g.id)} />
          ))}
        </View>

        <T variant="label" color={colors.textFaint} style={styles.label}>
          Track by
        </T>
        <View style={styles.chips}>
          {EXERCISE_KINDS.map((k) => (
            <Chip
              key={k.id}
              label={k.label}
              active={kind === k.id}
              onPress={() => !inUse && setKind(k.id)}
            />
          ))}
        </View>
        {inUse && (
          <T variant="caption" color={colors.textFaint}>
            Already logged, so how it’s tracked can’t change.
          </T>
        )}

        {!existing && (
          <Card style={styles.share}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="heading">Submit for review</T>
              <T variant="caption" color={colors.textDim}>
                If approved, it’s added for everyone. Yours works right away either way.
              </T>
            </View>
            <Switch
              value={share}
              onValueChange={setShare}
              trackColor={{ true: colors.accent, false: colors.cardHigh }}
            />
          </Card>
        )}

        {existing && (
          <Card style={styles.share}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="heading">Shared list</T>
              <T variant="caption" color={colors.textDim}>
                {existing.submission
                  ? STATUS_TEXT[existing.submission.status]
                  : 'Submit it for review to add it for everyone.'}
              </T>
            </View>
            {!existing.submission && (
              <Button
                title={busy ? 'Sending…' : 'Submit'}
                variant="secondary"
                disabled={busy || !valid}
                onPress={async () => {
                  setError(null);
                  if (await submit({ ...existing, name: tidy, group, kind })) haptic('success');
                }}
              />
            )}
          </Card>
        )}

        {error && (
          <T variant="caption" color={colors.danger}>
            {error}
          </T>
        )}

        <Button
          title={existing ? 'Save changes' : share ? 'Save and submit' : 'Save exercise'}
          size="lg"
          disabled={!valid || busy}
          onPress={save}
          style={{ marginTop: space.lg }}
        />
        {existing && !inUse && (
          <Button
            title="Delete exercise"
            variant="danger"
            onPress={() =>
              confirm(`Delete ${existing.name}?`, 'It will be removed from this phone.', 'Delete', () => {
                deleteCustomExercise(existing.id);
                router.back();
              })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
  },
  content: { paddingHorizontal: space.lg, gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  label: { marginTop: space.lg },
  input: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 52,
    minWidth: 0,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  share: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
});
