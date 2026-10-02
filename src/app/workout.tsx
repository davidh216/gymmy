import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, T, haptic } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { confirm } from '@/lib/confirm';
import { getExercise, type ExerciseKind } from '@/lib/exercises';
import {
  distanceUnit,
  formatAgo,
  formatClock,
  formatDuration,
  formatPace,
  formatSet,
  formatTarget,
  fromDisplayDistance,
  fromDisplayWeight,
  parseClock,
  toDisplayDistance,
  toDisplayWeight,
} from '@/lib/format';
import { bestSet, lastSession } from '@/lib/records';
import type { SetEntry, Units, WorkoutExercise } from '@/lib/types';
import { saveWorkoutToHealth } from '@/services/health';
import { useGymmy } from '@/store/gymmy';
import { colors, fonts, radius, space } from '@/theme';

const DEFAULT_REST = 90;

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const active = useGymmy((s) => s.active);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const { renameWorkout, discardWorkout, finishWorkout } = useGymmy.getState();
  const now = useNow();
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(DEFAULT_REST);

  const restLeft = restUntil ? Math.ceil((restUntil - now) / 1000) : 0;
  const resting = restLeft > 0;
  // Buzz once when a rest period runs out.
  const buzzedFor = useRef<number | null>(null);
  useEffect(() => {
    if (restUntil && !resting && buzzedFor.current !== restUntil) {
      buzzedFor.current = restUntil;
      haptic('success');
    }
  }, [resting, restUntil]);

  if (!active) return null;

  const startRest = () => {
    setRestTotal(DEFAULT_REST);
    setRestUntil(Date.now() + DEFAULT_REST * 1000);
  };

  const doneCount = active.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);

  const finish = () => {
    if (doneCount === 0) {
      confirm(
        'Nothing logged yet',
        'Check off at least one set to finish. Discard this workout instead?',
        'Discard',
        () => {
          discardWorkout();
          router.back();
        },
      );
      return;
    }
    haptic('success');
    const workout = finishWorkout();
    if (workout) {
      saveWorkoutToHealth(workout);
      router.replace({ pathname: '/session/[id]', params: { id: workout.id, celebrate: '1' } });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <Icon name={{ ios: 'chevron.down', web: 'expand_more' }} color={colors.textDim} />
        </Pressable>
        <View style={styles.timer}>
          <T style={styles.timerText}>{formatDuration(now - active.startedAt)}</T>
        </View>
        <Button title="Finish" onPress={finish} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}>
        <TextInput
          value={active.name}
          onChangeText={renameWorkout}
          style={styles.name}
          placeholder="Workout name"
          placeholderTextColor={colors.textFaint}
          maxLength={40}
        />
        <T variant="caption" color={colors.textFaint} style={{ marginBottom: space.lg }}>
          {doneCount} {doneCount === 1 ? 'set' : 'sets'} done · tap ✓ to log a set
        </T>

        {active.exercises.map((we) => (
          <Animated.View key={we.id} layout={LinearTransition} entering={FadeInDown}>
            <ExerciseCard workoutExercise={we} units={units} now={now} onSetDone={startRest} />
          </Animated.View>
        ))}

        {active.exercises.length === 0 && (
          <View style={styles.empty}>
            <T style={{ fontSize: 48 }}>🏋️</T>
            <T variant="heading">Empty workout</T>
            <T variant="caption" color={colors.textDim}>
              Add your first exercise to get going.
            </T>
          </View>
        )}

        <Button
          title="Add exercises"
          icon={{ ios: 'plus', web: 'add' }}
          variant="secondary"
          size="lg"
          onPress={() => router.push('/exercise-picker')}
          style={{ marginTop: space.md }}
        />
        <Button
          title="Discard workout"
          variant="danger"
          onPress={() =>
            confirm('Discard workout?', 'Everything logged in this session will be lost.', 'Discard', () => {
              discardWorkout();
              router.back();
            })
          }
          style={{ marginTop: space.xl }}
        />
      </ScrollView>

      {restUntil && resting && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={[styles.rest, { bottom: insets.bottom + space.lg }]}>
          <View style={[styles.restProgress, { width: `${(restLeft / restTotal) * 100}%` }]} />
          <Pressable
            onPress={() => {
              setRestUntil(restUntil - 15000);
              setRestTotal(Math.max(15, restTotal - 15));
            }}
            style={styles.restBtn}>
            <T variant="caption">−15</T>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <T variant="label" color={colors.textDim}>
              Rest
            </T>
            <T style={styles.restTime}>{formatDuration(restLeft * 1000)}</T>
          </View>
          <Pressable
            onPress={() => {
              setRestUntil(restUntil + 15000);
              setRestTotal(restTotal + 15);
            }}
            style={styles.restBtn}>
            <T variant="caption">+15</T>
          </Pressable>
          <Pressable onPress={() => setRestUntil(null)} style={[styles.restBtn, styles.skip]}>
            <T variant="caption" color={colors.accentInk}>
              Skip
            </T>
          </Pressable>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

function ExerciseCard({
  workoutExercise,
  units,
  now,
  onSetDone,
}: {
  workoutExercise: WorkoutExercise;
  units: Units;
  now: number;
  onSetDone: () => void;
}) {
  const exercise = getExercise(workoutExercise.exerciseId);
  const history = useGymmy((s) => s.workouts);
  const { addSet, removeExercise } = useGymmy.getState();
  const last = lastSession(exercise.id, history);
  const best = bestSet(exercise.id, history);
  const previous = last?.sets;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <T variant="heading" color={colors.accent}>
            {exercise.name}
          </T>
          <T variant="caption" color={colors.textFaint} style={{ textTransform: 'capitalize' }}>
            {exercise.group}
          </T>
        </View>
        {workoutExercise.target && (
          <View style={styles.target}>
            <T variant="label" color={colors.textFaint}>
              Target
            </T>
            <T variant="heading" color={colors.accent}>
              {formatTarget(workoutExercise.target, units)}
            </T>
          </View>
        )}
        <Pressable
          hitSlop={10}
          accessibilityLabel={`Remove ${exercise.name}`}
          onPress={() =>
            confirm(`Remove ${exercise.name}?`, 'Its sets will be removed from this workout.', 'Remove', () =>
              removeExercise(workoutExercise.id),
            )
          }>
          <Icon name={{ ios: 'trash', web: 'delete' }} size={18} color={colors.textFaint} />
        </Pressable>
      </View>

      {workoutExercise.target?.note && (
        <T variant="caption" color={colors.textDim} style={{ marginBottom: space.xs }}>
          {workoutExercise.target.note}
        </T>
      )}
      {last ? (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <T variant="label" color={colors.textFaint}>
              Last · {formatAgo(last.endedAt, now)}
            </T>
            <T variant="heading">{formatSet(last.top, exercise.kind, units)}</T>
          </View>
          {best && (
            <View style={styles.stat}>
              <T variant="label" color={colors.textFaint}>
                Best
              </T>
              <T variant="heading" color={best === last.top ? colors.accent : colors.text}>
                {formatSet(best, exercise.kind, units)}
              </T>
            </View>
          )}
        </View>
      ) : (
        <T variant="caption" color={colors.textFaint} style={{ marginBottom: space.xs }}>
          First time logging this. Your numbers will show here next time.
        </T>
      )}

      <View style={styles.setRow}>
        <T variant="label" color={colors.textFaint} style={styles.colSet}>
          Set
        </T>
        <T variant="label" color={colors.textFaint} style={styles.colPrev}>
          Previous
        </T>
        {columns(exercise.kind, units).map((c) => (
          <T key={c.field} variant="label" color={colors.textFaint} style={styles.colInput}>
            {c.label}
          </T>
        ))}
        <View style={styles.colCheck} />
      </View>

      {workoutExercise.sets.map((set, i) => (
        <SetRow
          key={set.id}
          index={i}
          set={set}
          kind={exercise.kind}
          units={units}
          previous={previous?.[i]}
          workoutExerciseId={workoutExercise.id}
          onDone={onSetDone}
        />
      ))}

      <Pressable
        onPress={() => {
          haptic();
          addSet(workoutExercise.id);
        }}
        style={styles.addSet}>
        <T variant="caption" color={colors.textDim}>
          + Add set
        </T>
      </Pressable>
    </View>
  );
}

type Field = 'weight' | 'reps' | 'minutes' | 'distance';

type Column = {
  field: Field;
  label: string;
  /** Stored value -> text in the box. */
  format: (v: number) => string;
  /** Typed text -> stored value (undefined while incomplete or empty). */
  parse: (text: string) => number | undefined;
  keyboard: 'decimal-pad' | 'number-pad' | 'numbers-and-punctuation';
};

const decimal = (text: string) => {
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function columns(kind: ExerciseKind, units: Units): Column[] {
  const reps: Column = { field: 'reps', label: 'Reps', format: String, parse: (t) => decimal(t) && Math.round(decimal(t)!), keyboard: 'number-pad' };
  if (kind === 'weight') {
    return [
      {
        field: 'weight',
        label: units,
        format: (v) => String(toDisplayWeight(v, units)),
        parse: (t) => decimal(t) && fromDisplayWeight(decimal(t)!, units),
        keyboard: 'decimal-pad',
      },
      reps,
    ];
  }
  if (kind === 'reps') return [reps];
  if (kind === 'distance') {
    return [
      {
        field: 'distance',
        label: distanceUnit(units),
        format: (v) => String(toDisplayDistance(v, units)),
        parse: (t) => decimal(t) && fromDisplayDistance(decimal(t)!, units),
        keyboard: 'decimal-pad',
      },
      // Typed like a race clock, e.g. 25:30.
      { field: 'minutes', label: 'Time', format: formatClock, parse: parseClock, keyboard: 'numbers-and-punctuation' },
    ];
  }
  return [{ field: 'minutes', label: 'Min', format: (v) => String(Math.round(v * 10) / 10), parse: decimal, keyboard: 'decimal-pad' }];
}

/** Whether a set has enough to be checked off. Distance sets need a distance or a time. */
function isLoggable(kind: ExerciseKind, cols: Column[], set: SetEntry) {
  if (kind === 'distance') return Boolean(set.distance || set.minutes);
  return cols.every((c) => (set[c.field] ?? 0) > 0);
}

function formatPrevious(set: SetEntry | undefined, kind: ExerciseKind, units: Units) {
  if (!set) return '—';
  if (kind === 'weight' && set.weight && set.reps) return `${toDisplayWeight(set.weight, units)}×${set.reps}`;
  if (kind === 'reps' && set.reps) return `${set.reps}`;
  if (kind === 'duration' && set.minutes) return `${Math.round(set.minutes * 10) / 10}m`;
  if (kind === 'distance' && set.distance) return `${toDisplayDistance(set.distance, units)}${distanceUnit(units)}`;
  if (kind === 'distance' && set.minutes) return formatClock(set.minutes);
  return '—';
}

function SetRow({
  index,
  set,
  kind,
  units,
  previous,
  workoutExerciseId,
  onDone,
}: {
  index: number;
  set: SetEntry;
  kind: ExerciseKind;
  units: Units;
  previous?: SetEntry;
  workoutExerciseId: string;
  onDone: () => void;
}) {
  const { updateSet, removeSet } = useGymmy.getState();
  const cols = columns(kind, units);
  const valid = isLoggable(kind, cols, set);

  const onChange = (field: Field, value: number | undefined) => {
    const next = { ...set, [field]: value };
    updateSet(workoutExerciseId, set.id, { [field]: value, done: set.done && isLoggable(kind, cols, next) });
  };

  const toggle = () => {
    if (!set.done && !valid) {
      // Fill from previous session on first tap, like most lifting apps.
      if (previous && isLoggable(kind, cols, previous)) {
        const patch: Partial<SetEntry> = { done: true };
        for (const c of cols) patch[c.field] = set[c.field] ?? previous[c.field];
        updateSet(workoutExerciseId, set.id, patch);
        haptic('medium');
        onDone();
      }
      return;
    }
    const done = !set.done;
    updateSet(workoutExerciseId, set.id, { done });
    if (done) {
      haptic('medium');
      onDone();
    }
  };

  return (
    <View>
      <View style={[styles.setRow, set.done && styles.setDone]}>
        <Pressable
          style={styles.colSet}
          onLongPress={() => removeSet(workoutExerciseId, set.id)}
          delayLongPress={400}>
          <T variant="heading" color={set.done ? colors.accent : colors.textDim}>
            {index + 1}
          </T>
        </Pressable>
        <T variant="caption" color={colors.textFaint} style={styles.colPrev} numberOfLines={1}>
          {formatPrevious(previous, kind, units)}
        </T>
        {cols.map((c) => (
          <SetInput
            key={c.field}
            testID={`set-${index + 1}-${c.field}`}
            column={c}
            value={set[c.field]}
            placeholder={previous?.[c.field] !== undefined ? c.format(previous[c.field]!) : c.field === 'minutes' && kind === 'distance' ? 'mm:ss' : '0'}
            done={set.done}
            onChange={(v) => onChange(c.field, v)}
          />
        ))}
        <Pressable
          onPress={toggle}
          testID={`set-${index + 1}-done`}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: set.done }}
          accessibilityLabel={`Complete set ${index + 1}`}
          style={[styles.colCheck, styles.check, set.done && styles.checkDone]}>
          <Icon
            name={{ ios: 'checkmark', web: 'check' }}
            size={16}
            color={set.done ? colors.accentInk : colors.textFaint}
          />
        </Pressable>
      </View>
      {kind === 'distance' && set.distance && set.minutes ? (
        <T variant="caption" color={colors.textDim} style={styles.pace}>
          {formatPace(set.distance, set.minutes, units)} pace
        </T>
      ) : null}
    </View>
  );
}

/**
 * A number box that keeps what you type (e.g. "62." or "25:") while you're editing,
 * and shows the stored value otherwise.
 */
function SetInput({
  testID,
  column,
  value,
  placeholder,
  done,
  onChange,
}: {
  testID: string;
  column: Column;
  value: number | undefined;
  placeholder: string;
  done: boolean;
  onChange: (value: number | undefined) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <TextInput
      value={draft ?? (value === undefined ? '' : column.format(value))}
      onChangeText={(t) => {
        setDraft(t);
        onChange(column.parse(t));
      }}
      onBlur={() => setDraft(null)}
      keyboardType={column.keyboard}
      selectTextOnFocus
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      accessibilityLabel={column.label}
      testID={testID}
      style={[styles.colInput, styles.input, done && styles.inputDone]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    gap: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { flex: 1, alignItems: 'center' },
  timerText: { fontFamily: fonts.mono, fontSize: 20, fontWeight: '700', color: colors.text },
  content: { padding: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' },
  name: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5, paddingVertical: 4 },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xxl },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    gap: space.xs,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  stats: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  target: { alignItems: 'flex-end', marginRight: space.md },
  stat: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
  },
  setDone: { backgroundColor: 'rgba(198,255,61,0.08)' },
  colSet: { width: 32, alignItems: 'center' },
  colPrev: { flex: 1.2, minWidth: 0, textAlign: 'center' },
  colInput: { flex: 1, minWidth: 0, textAlign: 'center' },
  colCheck: { width: 36 },
  input: {
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  inputDone: { backgroundColor: 'transparent' },
  pace: { marginLeft: 32 + space.sm * 2, marginTop: -2, marginBottom: 2 },
  check: {
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.accent },
  addSet: {
    marginTop: space.sm,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rest: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    maxWidth: 608,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.cardHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  restProgress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(198,255,61,0.12)',
  },
  restTime: { fontFamily: fonts.mono, fontSize: 22, fontWeight: '800', color: colors.text },
  restBtn: {
    paddingHorizontal: space.md,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { backgroundColor: colors.accent },
});
