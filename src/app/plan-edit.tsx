import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Icon, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { getExercise } from '@/lib/exercises';
import { distanceUnit, fromDisplayDistance, toDisplayDistance } from '@/lib/format';
import {
  CUSTOM_PLAN_EMOJI,
  MAX_PLAN_DAYS,
  MAX_PLAN_WEEKS,
  validCustomProgram,
  type PlanExercise,
  type PlanSession,
} from '@/lib/programs';
import type { Units } from '@/lib/types';
import { useGymmy } from '@/store/gymmy';
import { usePicked } from '@/store/picker';
import { colors, radius, space } from '@/theme';

/** A sensible starting target for a newly added exercise. */
function defaultTarget(exerciseId: string, units: Units): PlanExercise {
  const kind = getExercise(exerciseId).kind;
  if (kind === 'duration') return { exerciseId, sets: 1, minutes: 20 };
  // A round number in your units: 3 mi or 5 km.
  if (kind === 'distance') return { exerciseId, sets: 1, distance: fromDisplayDistance(units === 'lb' ? 3 : 5, units) };
  return { exerciseId, sets: 3, reps: kind === 'reps' ? '10' : '8–10' };
}

const blankDay = (n: number): PlanSession => ({ name: `Day ${n}`, focus: '', exercises: [] });

export default function PlanEditScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useGymmy((s) => (id ? s.customPrograms.find((p) => p.id === id) : undefined));
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const { saveCustomProgram, deleteCustomProgram } = useGymmy.getState();
  const request = usePicked((s) => s.request);
  const take = usePicked((s) => s.take);

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? CUSTOM_PLAN_EMOJI[0]);
  const [weeks, setWeeks] = useState(existing?.weeks ?? 8);
  const [days, setDays] = useState<PlanSession[]>(existing?.days ?? [blankDay(1), blankDay(2), blankDay(3)]);
  const [pickingFor, setPickingFor] = useState<number | null>(null);

  // Exercises chosen in the picker arrive when this screen is shown again.
  useFocusEffect(
    useCallback(() => {
      if (pickingFor === null) return;
      // Runs again as soon as a pick starts, before the picker opens; wait until picks arrive.
      const ids = take(`plan-day-${pickingFor}`);
      if (!ids) return;
      setPickingFor(null);
      if (!ids.length) return;
      setDays((ds) =>
        ds.map((d, i) =>
          i === pickingFor
            ? {
                ...d,
                exercises: [
                  ...d.exercises,
                  ...ids.filter((x) => !d.exercises.some((e) => e.exerciseId === x)).map((x) => defaultTarget(x, units)),
                ],
              }
            : d,
        ),
      );
    }, [pickingFor, take, units]),
  );

  const updateDay = (index: number, patch: Partial<PlanSession>) =>
    setDays((ds) => ds.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  const updateExercise = (day: number, index: number, patch: Partial<PlanExercise>) =>
    updateDay(day, { exercises: days[day].exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)) });

  const valid = validCustomProgram({ name, weeks, days });
  const emptyDay = days.findIndex((d) => d.exercises.length === 0);

  const save = () => {
    if (!valid) return;
    haptic('success');
    const savedId = saveCustomProgram(
      { name, emoji, weeks, days: days.map((d, i) => ({ ...d, name: d.name.trim() || `Day ${i + 1}` })) },
      existing?.id,
    );
    if (existing) router.back();
    else router.replace({ pathname: '/program/[id]', params: { id: savedId } });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <T variant="title">{existing ? 'Edit plan' : 'New plan'}</T>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <T variant="heading" color={colors.textDim}>
            Cancel
          </T>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
        <T variant="label" color={colors.textFaint}>
          Name
        </T>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Push Pull Legs"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={40}
          autoCapitalize="words"
          accessibilityLabel="Plan name"
          testID="plan-name"
        />
        <View style={styles.chips}>
          {CUSTOM_PLAN_EMOJI.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              accessibilityRole="button"
              accessibilityState={{ selected: e === emoji }}
              style={[styles.emoji, e === emoji && styles.emojiOn]}>
              <T style={{ fontSize: 22 }}>{e}</T>
            </Pressable>
          ))}
        </View>

        <View style={[styles.row, { marginTop: space.lg }]}>
          <T variant="heading" style={{ flex: 1 }}>
            Length
          </T>
          <Stepper value={weeks} min={1} max={MAX_PLAN_WEEKS} format={(w) => `${w} ${w === 1 ? 'week' : 'weeks'}`} onChange={setWeeks} />
        </View>
        <T variant="caption" color={colors.textFaint}>
          The days below repeat every week. Add weight or reps as they get easier.
        </T>

        {days.map((day, d) => (
          <Card key={d} style={styles.day}>
            <View style={styles.row}>
              <TextInput
                value={day.name}
                onChangeText={(t) => updateDay(d, { name: t })}
                placeholder={`Day ${d + 1}`}
                placeholderTextColor={colors.textFaint}
                style={styles.dayName}
                maxLength={30}
                accessibilityLabel={`Name of day ${d + 1}`}
              />
              {days.length > 1 && (
                <Pressable
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${day.name || `day ${d + 1}`}`}
                  onPress={() => setDays((ds) => ds.filter((_, i) => i !== d))}>
                  <Icon name={{ ios: 'trash', web: 'delete' }} size={18} color={colors.textFaint} />
                </Pressable>
              )}
            </View>
            {day.exercises.map((e, i) => (
              <ExerciseTarget
                key={e.exerciseId}
                target={e}
                units={units}
                onChange={(patch) => updateExercise(d, i, patch)}
                onRemove={() => updateDay(d, { exercises: day.exercises.filter((_, j) => j !== i) })}
              />
            ))}
            <Button
              title={day.exercises.length ? 'Add more exercises' : 'Add exercises'}
              icon={{ ios: 'plus', web: 'add' }}
              variant="secondary"
              testID={`plan-day-${d + 1}-add`}
              onPress={() => {
                request(`plan-day-${d}`);
                setPickingFor(d);
                router.push({ pathname: '/exercise-picker', params: { for: 'plan' } });
              }}
            />
          </Card>
        ))}

        {days.length < MAX_PLAN_DAYS && (
          <Button
            title="Add a day"
            variant="ghost"
            onPress={() => setDays((ds) => [...ds, blankDay(ds.length + 1)])}
          />
        )}

        {!valid && (
          <T variant="caption" color={colors.textFaint} style={{ textAlign: 'center' }}>
            {!name.trim()
              ? 'Give your plan a name.'
              : emptyDay >= 0
                ? `Add an exercise to ${days[emptyDay].name || `day ${emptyDay + 1}`}.`
                : ''}
          </T>
        )}
        <Button
          title={existing ? 'Save changes' : 'Create plan'}
          size="lg"
          disabled={!valid}
          onPress={save}
          testID="plan-save"
        />
        {existing && (
          <Button
            title="Delete plan"
            variant="danger"
            style={{ marginTop: space.md }}
            onPress={() =>
              confirm(`Delete ${existing.name}?`, 'Workouts you did from it stay in your history.', 'Delete', () => {
                deleteCustomProgram(existing.id);
                router.dismissTo('/programs');
              })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** One exercise's target: sets plus reps, minutes or distance depending on the exercise. */
function ExerciseTarget({
  target,
  units,
  onChange,
  onRemove,
}: {
  target: PlanExercise;
  units: Units;
  onChange: (patch: Partial<PlanExercise>) => void;
  onRemove: () => void;
}) {
  const exercise = getExercise(target.exerciseId);
  const [draft, setDraft] = useState<string | null>(null);
  const field =
    exercise.kind === 'duration'
      ? { label: 'min', value: String(target.minutes ?? ''), parse: (t: string) => ({ minutes: Number(t) || undefined }) }
      : exercise.kind === 'distance'
        ? {
            label: distanceUnit(units),
            value: target.distance !== undefined ? String(toDisplayDistance(target.distance, units)) : '',
            parse: (t: string) => ({ distance: Number(t) ? fromDisplayDistance(Number(t), units) : undefined }),
          }
        : { label: 'reps', value: target.reps ?? '', parse: (t: string) => ({ reps: t.trim() || undefined }) };

  return (
    <View style={styles.exercise}>
      <T variant="body" style={{ flex: 1 }} numberOfLines={1}>
        {exercise.name}
      </T>
      <Stepper value={target.sets} min={1} max={10} format={(n) => `${n}×`} onChange={(sets) => onChange({ sets })} small />
      <TextInput
        value={draft ?? field.value}
        onChangeText={(t) => {
          setDraft(t);
          onChange(field.parse(t.replace(',', '.')));
        }}
        onBlur={() => setDraft(null)}
        keyboardType={exercise.kind === 'weight' || exercise.kind === 'reps' ? 'numbers-and-punctuation' : 'decimal-pad'}
        placeholder={field.label}
        placeholderTextColor={colors.textFaint}
        style={styles.target}
        maxLength={10}
        accessibilityLabel={`${exercise.name} ${field.label}`}
      />
      <T variant="caption" color={colors.textFaint} style={{ width: 28 }}>
        {field.label}
      </T>
      <Pressable hitSlop={10} onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${exercise.name}`}>
        <Icon name={{ ios: 'xmark', web: 'close' }} size={14} color={colors.textFaint} />
      </Pressable>
    </View>
  );
}

function Stepper({
  value,
  min,
  max,
  format,
  onChange,
  small,
}: {
  value: number;
  min: number;
  max: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
  small?: boolean;
}) {
  const step = (d: number) => {
    haptic();
    onChange(Math.min(max, Math.max(min, value + d)));
  };
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => step(-1)}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel="Fewer"
        style={[styles.stepBtn, small && styles.stepSmall, value <= min && { opacity: 0.35 }]}>
        <T variant="heading">−</T>
      </Pressable>
      <T variant={small ? 'caption' : 'heading'} style={{ minWidth: small ? 24 : 72, textAlign: 'center' }}>
        {format(value)}
      </T>
      <Pressable
        onPress={() => step(1)}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel="More"
        style={[styles.stepBtn, small && styles.stepSmall, value >= max && { opacity: 0.35 }]}>
        <T variant="heading">+</T>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg },
  content: { paddingHorizontal: space.lg, gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  emojiOn: { borderWidth: 2, borderColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  day: { gap: space.sm, marginTop: space.md },
  dayName: { flex: 1, minWidth: 0, fontSize: 17, fontWeight: '700', color: colors.text, paddingVertical: 4 },
  exercise: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  target: {
    width: 64,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  stepSmall: { width: 28, height: 28, borderRadius: 14 },
});
