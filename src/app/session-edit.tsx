import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SetInput, setColumns } from '@/components/set-input';
import { Button, Card, Icon, T, haptic } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { confirm } from '@/lib/confirm';
import { getExercise } from '@/lib/exercises';
import { formatDate, uid } from '@/lib/format';
import { healthExport } from '@/lib/health';
import type { SetEntry, Units, Workout, WorkoutExercise } from '@/lib/types';
import { MAX_EDIT_MINUTES, MINUTE, durationMinutes, editProblem, shiftDays } from '@/lib/workout-edit';
import { replaceWorkoutInHealth } from '@/services/health';
import { useGymmy } from '@/store/gymmy';
import { usePicked } from '@/store/picker';
import { colors, radius, space } from '@/theme';

const PICK_TARGET = 'session-edit';
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function healthChanged(a: Workout, b: Workout): boolean {
  const ha = healthExport(a);
  const hb = healthExport(b);
  return (
    a.startedAt !== b.startedAt ||
    a.endedAt !== b.endedAt ||
    ha.activityType !== hb.activityType ||
    ha.distanceMeters !== hb.distanceMeters
  );
}

/** Fix a finished workout: its name, when it happened, how long it took, and every set. */
export default function SessionEditScreen() {
  const insets = useSafeAreaInsets();
  const now = useNow(60_000);
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useGymmy((s) => s.workouts.find((w) => w.id === id));
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const updateWorkout = useGymmy((s) => s.updateWorkout);
  const request = usePicked((s) => s.request);
  const take = usePicked((s) => s.take);

  const [name, setName] = useState(workout?.name ?? '');
  // Length keeps the finish time; moving the day or start shifts the whole workout.
  const [endedAt, setEndedAt] = useState(workout?.endedAt ?? 0);
  const [minutes, setMinutes] = useState(workout ? durationMinutes(workout) : 0);
  const [minutesText, setMinutesText] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(workout?.exercises ?? []);
  const [picking, setPicking] = useState(false);

  // Exercises chosen in the picker arrive when this screen is shown again.
  useFocusEffect(
    useCallback(() => {
      if (!picking) return;
      const ids = take(PICK_TARGET);
      if (!ids) return;
      setPicking(false);
      setExercises((xs) => [
        ...xs,
        ...ids.map((exerciseId) => ({ id: uid(), exerciseId, sets: [{ id: uid(), done: true }] })),
      ]);
    }, [picking, take]),
  );

  if (!workout) {
    return (
      <View style={[styles.root, styles.center]}>
        <T variant="heading">Workout not found</T>
        <Button title="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const startedAt = endedAt - minutes * MINUTE;
  const edit = { name, startedAt, endedAt, exercises };
  const problem = editProblem(edit, now);

  const updateExercise = (weId: string, fn: (e: WorkoutExercise) => WorkoutExercise) =>
    setExercises((xs) => xs.map((e) => (e.id === weId ? fn(e) : e)));
  const updateSet = (weId: string, setId: string, patch: Partial<SetEntry>) =>
    updateExercise(weId, (e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }));
  const setDuration = (m: number) => {
    setMinutes(Math.max(1, Math.min(MAX_EDIT_MINUTES, Math.round(m))));
    setMinutesText(null);
  };

  const save = () => {
    if (problem) return;
    haptic('success');
    updateWorkout(workout.id, edit);
    // Health keeps its own copy: replace it when what it shows (times, activity, distance) changed.
    const saved = useGymmy.getState().workouts.find((w) => w.id === workout.id);
    if (saved && healthChanged(workout, saved)) replaceWorkoutInHealth(saved);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <T variant="heading" color={colors.textDim}>
            Cancel
          </T>
        </Pressable>
        <T variant="heading">Edit workout</T>
        <Pressable onPress={save} disabled={!!problem} hitSlop={12} accessibilityRole="button" testID="edit-save">
          <T variant="heading" color={problem ? colors.textFaint : colors.accent}>
            Save
          </T>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Workout name"
          placeholderTextColor={colors.textFaint}
          style={styles.name}
          maxLength={60}
          accessibilityLabel="Workout name"
          testID="edit-name"
        />

        <Card style={styles.when}>
          <Row label="Day">
            <Step label="Day before" icon="minus" onPress={() => setEndedAt((t) => shiftDays(t, -1))} />
            <T variant="heading" style={styles.value}>
              {formatDate(startedAt)}
            </T>
            <Step
              label="Day after"
              icon="plus"
              disabled={shiftDays(endedAt, 1) > now}
              onPress={() => setEndedAt((t) => shiftDays(t, 1))}
            />
          </Row>
          <Row label="Start">
            <Step label="15 minutes earlier" icon="minus" onPress={() => setEndedAt((t) => t - 15 * MINUTE)} />
            <T variant="heading" style={styles.value}>
              {formatTime(startedAt)}
            </T>
            <Step
              label="15 minutes later"
              icon="plus"
              disabled={endedAt + 15 * MINUTE > now}
              onPress={() => setEndedAt((t) => t + 15 * MINUTE)}
            />
          </Row>
          <Row label="Length">
            <Step label="5 minutes shorter" icon="minus" onPress={() => setDuration(minutes - 5)} />
            <View style={styles.minutesBox}>
              <TextInput
                value={minutesText ?? String(minutes)}
                onChangeText={(t) => {
                  setMinutesText(t);
                  const n = parseInt(t, 10);
                  if (Number.isFinite(n) && n > 0) setMinutes(Math.min(MAX_EDIT_MINUTES, n));
                }}
                onBlur={() => setMinutesText(null)}
                keyboardType="number-pad"
                selectTextOnFocus
                style={styles.minutes}
                accessibilityLabel="Length in minutes"
                testID="edit-duration"
              />
              <T variant="caption" color={colors.textDim}>
                min
              </T>
            </View>
            <Step label="5 minutes longer" icon="plus" onPress={() => setDuration(minutes + 5)} />
          </Row>
          <T variant="caption" color={colors.textFaint}>
            Ends {formatTime(endedAt)}. Changing the length keeps the end time.
          </T>
        </Card>

        {exercises.map((e, ei) => (
          <ExerciseEditor
            key={e.id}
            index={ei}
            exercise={e}
            units={units}
            onSet={(setId, patch) => updateSet(e.id, setId, patch)}
            onRemoveSet={(setId) => updateExercise(e.id, (x) => ({ ...x, sets: x.sets.filter((s) => s.id !== setId) }))}
            onAddSet={() =>
              updateExercise(e.id, (x) => {
                const last = x.sets[x.sets.length - 1];
                const next: SetEntry = {
                  id: uid(),
                  weight: last?.weight,
                  reps: last?.reps,
                  minutes: last?.minutes,
                  distance: last?.distance,
                  done: true,
                };
                return { ...x, sets: [...x.sets, next] };
              })
            }
            onRemove={() =>
              confirm(
                `Remove ${getExercise(e.exerciseId).name}?`,
                'Its sets are removed when you save.',
                'Remove',
                () => setExercises((xs) => xs.filter((x) => x.id !== e.id)),
              )
            }
          />
        ))}

        <Button
          title="Add exercises"
          icon={{ ios: 'plus', web: 'add' }}
          variant="secondary"
          onPress={() => {
            request(PICK_TARGET);
            setPicking(true);
            router.push({ pathname: '/exercise-picker', params: { for: 'edit' } });
          }}
          testID="edit-add-exercises"
        />

        {problem ? (
          <T variant="caption" color={colors.flame} style={styles.note}>
            {problem}
          </T>
        ) : (
          <T variant="caption" color={colors.textFaint} style={styles.note}>
            Empty sets are dropped. Records are re-checked; XP and gems stay as earned.
          </T>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ExerciseEditor({
  index,
  exercise,
  units,
  onSet,
  onRemoveSet,
  onAddSet,
  onRemove,
}: {
  index: number;
  exercise: WorkoutExercise;
  units: Units;
  onSet: (setId: string, patch: Partial<SetEntry>) => void;
  onRemoveSet: (setId: string) => void;
  onAddSet: () => void;
  onRemove: () => void;
}) {
  const ex = getExercise(exercise.exerciseId);
  const cols = setColumns(ex.kind, units);
  let working = 0;
  return (
    <Card style={styles.exercise}>
      <View style={styles.exerciseHead}>
        <T variant="heading" color={colors.accent} style={{ flex: 1 }}>
          {ex.name}
        </T>
        <Pressable onPress={onRemove} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Remove ${ex.name}`}>
          <Icon name={{ ios: 'trash', web: 'delete' }} size={16} color={colors.textFaint} />
        </Pressable>
      </View>
      <View style={styles.setRow}>
        <T variant="label" color={colors.textFaint} style={styles.colSet}>
          Set
        </T>
        {cols.map((c) => (
          <T key={c.field} variant="label" color={colors.textFaint} style={styles.colHead}>
            {c.label}
          </T>
        ))}
        <View style={styles.colDelete} />
      </View>
      {exercise.sets.map((s, si) => {
        const label = s.warmup ? 'W' : String(++working);
        return (
          <View key={s.id} style={styles.setRow}>
            <Pressable
              onPress={() => onSet(s.id, { warmup: !s.warmup || undefined })}
              hitSlop={6}
              style={styles.colSet}
              accessibilityRole="button"
              accessibilityLabel={`Set ${si + 1}${s.warmup ? ', warm-up' : ''}. Tap to toggle warm-up.`}>
              <T variant="heading" color={s.warmup ? colors.flame : colors.textDim} style={{ textAlign: 'center' }}>
                {label}
              </T>
            </Pressable>
            {cols.map((c) => (
              <SetInput
                key={c.field}
                label={`${c.label}, ${ex.name} set ${si + 1}`}
                testID={`edit-${index + 1}-set-${si + 1}-${c.field}`}
                column={c}
                value={s[c.field]}
                placeholder="—"
                done={false}
                onChange={(v) => onSet(s.id, { [c.field]: v })}
              />
            ))}
            <Pressable
              onPress={() => onRemoveSet(s.id)}
              hitSlop={8}
              style={styles.colDelete}
              accessibilityRole="button"
              accessibilityLabel={`Delete set ${si + 1}`}>
              <Icon name={{ ios: 'xmark', web: 'close' }} size={14} color={colors.textFaint} />
            </Pressable>
          </View>
        );
      })}
      <Pressable onPress={onAddSet} style={styles.addSet} accessibilityRole="button">
        <T variant="caption" color={colors.textDim}>
          + Add set
        </T>
      </Pressable>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <T variant="label" color={colors.textFaint} style={styles.rowLabel}>
        {label}
      </T>
      {children}
    </View>
  );
}

function Step({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: 'plus' | 'minus';
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress();
      }}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.step, disabled && { opacity: 0.35 }]}>
      <Icon name={{ ios: icon, web: icon === 'plus' ? 'add' : 'remove' }} size={16} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg },
  content: { paddingHorizontal: space.lg, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 52,
    minWidth: 0,
  },
  when: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowLabel: { width: 56 },
  value: { flex: 1, textAlign: 'center' },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  minutes: {
    width: 64,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  exercise: { gap: space.xs },
  exerciseHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  colSet: { width: 32 },
  colHead: { flex: 1, minWidth: 0, textAlign: 'center' },
  colDelete: { width: 24, alignItems: 'center' },
  addSet: {
    marginTop: space.xs,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { textAlign: 'center' },
});
