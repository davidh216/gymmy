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

import { Button, Chip, Icon, T, haptic } from '@/components/ui';
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
import { BARS, PLATES, RPE_CHOICES, formatPlates, plateLoad, rpeLabel } from '@/lib/plates';
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

  const startRest = (seconds: number) => {
    if (seconds <= 0) return;
    setRestTotal(seconds);
    setRestUntil(Date.now() + seconds * 1000);
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

        {active.exercises.map((we, i) => (
          <Animated.View key={we.id} layout={LinearTransition} entering={FadeInDown}>
            <ExerciseCard
              workoutExercise={we}
              index={i}
              count={active.exercises.length}
              units={units}
              now={now}
              onSetDone={startRest}
            />
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
  index,
  count,
  units,
  now,
  onSetDone,
}: {
  workoutExercise: WorkoutExercise;
  index: number;
  count: number;
  units: Units;
  now: number;
  onSetDone: (restSeconds: number) => void;
}) {
  const exercise = getExercise(workoutExercise.exerciseId);
  const history = useGymmy((s) => s.workouts);
  const askRpe = useGymmy((s) => s.profile?.rpe ?? false);
  const { addSet, removeExercise, updateExercise, moveExercise, updateSet } = useGymmy.getState();
  const [tools, setTools] = useState(false);
  const [plates, setPlates] = useState(false);
  const [rpeFor, setRpeFor] = useState<string | null>(null);
  const last = lastSession(exercise.id, history);
  const best = bestSet(exercise.id, history);
  const previous = last?.sets;
  const rest = workoutExercise.rest ?? DEFAULT_REST;
  const weId = workoutExercise.id;

  // Working sets are numbered 1, 2, 3…; warm-ups show as W.
  let working = 0;
  const labels = workoutExercise.sets.map((set) => (set.warmup ? 'W' : String(++working)));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <T variant="heading" color={colors.accent}>
            {exercise.name}
          </T>
          <T variant="caption" color={colors.textFaint} style={{ textTransform: 'capitalize' }}>
            {exercise.group}
            {rest !== DEFAULT_REST ? ` · rest ${rest ? formatClock(rest / 60) : 'off'}` : ''}
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
          accessibilityRole="button"
          accessibilityLabel={`${exercise.name} options`}
          testID={`exercise-${index + 1}-options`}
          onPress={() => {
            haptic();
            setTools(!tools);
          }}
          style={[styles.more, tools && styles.moreOn]}>
          <Icon name={{ ios: 'ellipsis', web: 'more_horiz' }} size={18} color={tools ? colors.accentInk : colors.textDim} />
        </Pressable>
      </View>

      {tools && (
        <View style={styles.tools}>
          <TextInput
            value={workoutExercise.note ?? ''}
            onChangeText={(t) => updateExercise(weId, { note: t || undefined })}
            placeholder="Note for next time (seat height, grip…)"
            placeholderTextColor={colors.textFaint}
            style={styles.noteInput}
            maxLength={140}
            multiline
            testID={`exercise-${index + 1}-note`}
          />
          <View style={styles.toolRow}>
            <T variant="caption" color={colors.textDim} style={{ flex: 1 }}>
              Rest timer
            </T>
            <ToolButton
              label="−15"
              disabled={rest === 0}
              onPress={() => updateExercise(weId, { rest: Math.max(0, rest - 15) })}
            />
            <T variant="heading" style={styles.restValue}>
              {rest ? formatClock(rest / 60) : 'Off'}
            </T>
            <ToolButton label="+15" onPress={() => updateExercise(weId, { rest: Math.min(600, rest + 15) })} />
          </View>
          <View style={styles.toolRow}>
            <ToolButton label="↑ Up" disabled={index === 0} onPress={() => moveExercise(weId, -1)} />
            <ToolButton label="↓ Down" disabled={index === count - 1} onPress={() => moveExercise(weId, 1)} />
            {exercise.kind === 'weight' && (
              <ToolButton label="Plates" active={plates} onPress={() => setPlates(!plates)} />
            )}
            <View style={{ flex: 1 }} />
            <ToolButton
              label="Remove"
              danger
              onPress={() =>
                confirm(`Remove ${exercise.name}?`, 'Its sets will be removed from this workout.', 'Remove', () =>
                  removeExercise(weId),
                )
              }
            />
          </View>
          <T variant="caption" color={colors.textFaint}>
            Tap a set number to mark it as a warm-up. Hold it to delete the set.
          </T>
        </View>
      )}

      {!tools && workoutExercise.note ? (
        <T variant="caption" color={colors.textDim} style={{ marginBottom: space.xs }}>
          📝 {workoutExercise.note}
        </T>
      ) : null}
      {workoutExercise.target?.note && (
        <T variant="caption" color={colors.textDim} style={{ marginBottom: space.xs }}>
          {workoutExercise.target.note}
        </T>
      )}
      {plates && exercise.kind === 'weight' && <PlatePanel sets={workoutExercise.sets} units={units} />}
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
        <View key={set.id}>
          <SetRow
            index={i}
            label={labels[i]}
            set={set}
            kind={exercise.kind}
            units={units}
            previous={previous?.[i]}
            workoutExerciseId={weId}
            onDone={() => {
              setRpeFor(askRpe && !set.warmup ? set.id : null);
              onSetDone(set.warmup ? Math.min(rest, 60) : rest);
            }}
          />
          {rpeFor === set.id && set.done && (
            <RpePicker
              value={set.rpe}
              onPick={(rpe) => {
                updateSet(weId, set.id, { rpe });
                setRpeFor(null);
              }}
              onSkip={() => setRpeFor(null)}
            />
          )}
        </View>
      ))}

      <Pressable
        onPress={() => {
          haptic();
          addSet(weId);
        }}
        style={styles.addSet}>
        <T variant="caption" color={colors.textDim}>
          + Add set
        </T>
      </Pressable>
    </View>
  );
}

function ToolButton({
  label,
  onPress,
  disabled,
  active,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.toolBtn, active && { backgroundColor: colors.accent }, disabled && { opacity: 0.35 }]}>
      <T variant="caption" color={active ? colors.accentInk : danger ? colors.danger : colors.text}>
        {label}
      </T>
    </Pressable>
  );
}

/** Plates per side for the next set to lift (or the heaviest, once all are done). */
function PlatePanel({ sets, units }: { sets: SetEntry[]; units: Units }) {
  const [bar, setBar] = useState(BARS[units][0]);
  const next = sets.find((s) => !s.done && s.weight) ?? [...sets].filter((s) => s.weight).sort((a, b) => b.weight! - a.weight!)[0];
  const total = next?.weight ? toDisplayWeight(next.weight, units) : 0;
  const load = plateLoad(total, bar, units);
  const heaviest = PLATES[units][0];

  return (
    <View style={styles.plates}>
      <T variant="label" color={colors.textFaint}>
        {total ? `Plates per side for ${total} ${units}` : 'Enter a weight to see the plates'}
      </T>
      <View style={styles.toolRow}>
        {BARS[units].map((b) => (
          <Chip key={b} label={`${b} ${units} bar`} active={bar === b} onPress={() => setBar(b)} />
        ))}
      </View>
      {total > 0 && (
        <>
          <View style={styles.barViz}>
            <View style={styles.barShaft} />
            {load.perSide.map((p, i) => (
              <View
                key={i}
                style={[styles.plate, { height: 28 + 40 * Math.sqrt(p / heaviest), backgroundColor: plateColor(p, units) }]}
              />
            ))}
            <View style={styles.barEnd} />
          </View>
          <T variant="heading">{load.perSide.length ? formatPlates(load.perSide) : total <= bar ? 'Just the bar' : '—'}</T>
          {load.short > 0 && (
            <T variant="caption" color={colors.flame}>
              Plates make {load.loaded} {units}, {load.short} {units} short.
            </T>
          )}
        </>
      )}
    </View>
  );
}

/** Rough competition plate colors so the picture reads at a glance. */
function plateColor(plate: number, units: Units): string {
  const kg = units === 'kg' ? plate : plate / 2.2;
  if (kg >= 24) return '#E5484D';
  if (kg >= 19) return '#3E63DD';
  if (kg >= 14) return '#F5D90A';
  if (kg >= 9) return '#30A46C';
  return colors.textDim;
}

function RpePicker({ value, onPick, onSkip }: { value?: number; onPick: (rpe: number) => void; onSkip: () => void }) {
  return (
    <Animated.View entering={FadeInDown} style={styles.rpe}>
      <T variant="label" color={colors.textFaint}>
        How hard? RPE
      </T>
      <View style={styles.rpeRow}>
        {RPE_CHOICES.map((r) => (
          <Pressable
            key={r}
            onPress={() => {
              haptic();
              onPick(r);
            }}
            accessibilityRole="button"
            accessibilityLabel={`RPE ${r}, ${rpeLabel(r)}`}
            style={[styles.rpeChip, value === r && { backgroundColor: colors.accent }]}>
            <T variant="caption" color={value === r ? colors.accentInk : colors.text}>
              {r}
            </T>
          </Pressable>
        ))}
        <Pressable onPress={onSkip} hitSlop={8} accessibilityRole="button" style={styles.rpeSkip}>
          <T variant="caption" color={colors.textFaint}>
            Skip
          </T>
        </Pressable>
      </View>
    </Animated.View>
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
  label,
  set,
  kind,
  units,
  previous,
  workoutExerciseId,
  onDone,
}: {
  index: number;
  label: string;
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
          onPress={() => {
            haptic();
            updateSet(workoutExerciseId, set.id, { warmup: !set.warmup || undefined, rpe: undefined });
          }}
          onLongPress={() => removeSet(workoutExerciseId, set.id)}
          delayLongPress={400}
          accessibilityRole="button"
          accessibilityLabel={`Set ${label === 'W' ? 'warm-up' : label}. Tap to ${set.warmup ? 'make it a working set' : 'mark as warm-up'}, hold to delete.`}
          testID={`set-${index + 1}-label`}>
          <T variant="heading" color={set.warmup ? colors.gold : set.done ? colors.accent : colors.textDim}>
            {label}
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
      {(kind === 'distance' && set.distance && set.minutes) || set.rpe ? (
        <T variant="caption" color={colors.textDim} style={styles.pace}>
          {[
            kind === 'distance' && set.distance && set.minutes ? `${formatPace(set.distance, set.minutes, units)} pace` : '',
            set.rpe ? `RPE ${set.rpe}` : '',
          ]
            .filter(Boolean)
            .join(' · ')}
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
  more: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  moreOn: { backgroundColor: colors.accent },
  tools: {
    gap: space.sm,
    padding: space.md,
    marginBottom: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
  },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  toolBtn: {
    paddingHorizontal: space.md,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restValue: { minWidth: 48, textAlign: 'center', fontFamily: fonts.mono },
  noteInput: {
    minHeight: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  plates: { gap: space.sm, padding: space.md, marginBottom: space.sm, borderRadius: radius.md, backgroundColor: colors.cardHigh },
  barViz: { flexDirection: 'row', alignItems: 'center', height: 72, gap: 2 },
  barShaft: { width: 36, height: 8, borderRadius: 2, backgroundColor: colors.textFaint },
  plate: { width: 12, borderRadius: 3 },
  barEnd: { width: 18, height: 8, borderRadius: 2, backgroundColor: colors.textFaint },
  rpe: { gap: 6, marginLeft: 32 + space.sm * 2, marginBottom: space.xs },
  rpeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  rpeChip: {
    minWidth: 36,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeSkip: { paddingHorizontal: space.sm },
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
