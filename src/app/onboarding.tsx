import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, Chip, T, haptic } from '@/components/ui';
import { STARTER_IDS, getCompanion } from '@/lib/companions';
import { getProgram } from '@/lib/programs';
import type { Units } from '@/lib/types';
import { toUsername, useGymmy, type Focus } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const STEPS = 6;

type FocusOption = { id: Focus; emoji: string; title: string; blurb: string; plans: string[] };

/** What brings you here, and the plans each answer suggests (first is the default). */
const FOCUS: FocusOption[] = [
  { id: 'strength', emoji: '🏋️', title: 'Get stronger', blurb: 'Lift more, build muscle', plans: ['strength-5x5', 'build-muscle'] },
  { id: 'event', emoji: '🏁', title: 'Train for an event', blurb: 'HYROX, a 5K or a marathon', plans: ['hyrox', 'first-5k', 'marathon'] },
  { id: 'consistency', emoji: '📅', title: 'Stay consistent', blurb: 'Show up every week', plans: [] },
  { id: 'log', emoji: '📝', title: 'Just log my lifts', blurb: 'I have my own program', plans: [] },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useGymmy((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [starter, setStarter] = useState<string>(STARTER_IDS[0]);
  const [nickname, setNickname] = useState('');
  const [focus, setFocus] = useState<Focus | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  // No default: choosing it yourself is the commitment.
  const [goal, setGoal] = useState<number | null>(null);
  const [units, setUnits] = useState<Units>('lb');

  const chosen = getCompanion(starter);
  const buddyName = nickname.trim() || chosen.name;
  const last = step === STEPS - 1;

  const next = () => {
    if (!last) return setStep(step + 1);
    if (goal === null) return;
    haptic('success');
    const displayName = name.trim() || 'Champ';
    completeOnboarding(
      { name: displayName, username: toUsername(displayName), weeklyGoal: goal, units, focus: focus ?? undefined },
      starter,
      { nickname, planId: planId ?? undefined },
    );
  };

  const pickFocus = (f: FocusOption) => {
    haptic();
    setFocus(f.id);
    setPlanId(f.plans[0] ?? null);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={step === 2 || step === 3 ? [chosen.colors[0], colors.bg] : ['#1A2600', colors.bg]}
        style={StyleSheet.absoluteFill}
        end={{ x: 0.5, y: 0.6 }}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.xl }]}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        {step === 0 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.center}>
            <T style={styles.logoEmoji}>🏋️</T>
            <T style={styles.logo}>GYMMY</T>
            <T variant="heading" color={colors.textDim} style={styles.centerText}>
              Log workouts. Level up.{'\n'}Build a squad of gym buddies.
            </T>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View key="name" entering={FadeInRight} style={styles.step}>
            <T variant="hero">What should we call you?</T>
            <TextInput
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={next}
              maxLength={24}
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View key="buddy" entering={FadeInRight} style={styles.step}>
            <T variant="hero">Pick your first buddy</T>
            <T variant="body" color={colors.textDim}>
              They’ll train with you and grow as you do. Summon more with gems you earn.
            </T>
            <View style={styles.grid}>
              {STARTER_IDS.map((id) => {
                const c = getCompanion(id);
                const selected = id === starter;
                return (
                  <Pressable
                    key={id}
                    onPress={() => {
                      haptic();
                      setStarter(id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.starter, selected && { borderColor: colors.accent }]}>
                    <CompanionAvatar companion={c} size={64} ring={false} />
                    <T variant="heading">{c.name}</T>
                    <T variant="caption" color={colors.textDim}>
                      {c.title}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View key="hatch" entering={FadeIn} style={[styles.step, { alignItems: 'center' }]}>
            <Animated.View entering={ZoomIn.springify().damping(9)} style={{ marginVertical: space.lg }}>
              <CompanionAvatar companion={chosen} size={140} />
            </Animated.View>
            <T variant="hero" style={styles.centerText}>
              {chosen.name} is here!
            </T>
            <T variant="body" color={colors.textDim} style={styles.quote}>
              “{chosen.lines[0]}”
            </T>
            <T variant="label" color={colors.textFaint} style={{ marginTop: space.lg }}>
              Give them a name (optional)
            </T>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder={chosen.name}
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { marginTop: 0, alignSelf: 'stretch', textAlign: 'center' }]}
              returnKeyType="done"
              maxLength={16}
              accessibilityLabel="Buddy name"
            />
          </Animated.View>
        )}

        {step === 4 && (
          <Animated.View key="focus" entering={FadeInRight} style={styles.step}>
            <T variant="hero">What brings you here?</T>
            <T variant="body" color={colors.textDim}>
              {buddyName} will line up your first workout.
            </T>
            {FOCUS.map((f) => {
              const selected = focus === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => pickFocus(f)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${f.title}. ${f.blurb}`}
                  style={[styles.option, selected && styles.optionActive]}>
                  <T style={{ fontSize: 26 }}>{f.emoji}</T>
                  <View style={{ flex: 1 }}>
                    <T variant="heading">{f.title}</T>
                    <T variant="caption" color={colors.textDim}>
                      {f.blurb}
                    </T>
                  </View>
                </Pressable>
              );
            })}
            {focus && FOCUS.find((f) => f.id === focus)!.plans.length > 0 && (
              <Animated.View entering={FadeInDown} style={{ gap: space.sm }}>
                <T variant="label" color={colors.textFaint} style={{ marginTop: space.sm }}>
                  Start a plan
                </T>
                <View style={styles.row}>
                  {FOCUS.find((f) => f.id === focus)!.plans.map((id) => {
                    const p = getProgram(id);
                    return p ? (
                      <Chip key={id} label={`${p.emoji} ${p.name}`} active={planId === id} onPress={() => setPlanId(id)} />
                    ) : null;
                  })}
                  <Chip label="Not yet" active={planId === null} onPress={() => setPlanId(null)} />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {step === 5 && (
          <Animated.View key="goal" entering={FadeInRight} style={styles.step}>
            <T variant="hero">How many days a week will you train?</T>
            <T variant="body" color={colors.textDim}>
              Hit it every week to build a streak. Streaks multiply your XP. Start with what you can keep up.
            </T>
            <View style={styles.goalRow}>
              {[2, 3, 4, 5, 6].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => {
                    haptic();
                    setGoal(n);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} days a week`}
                  accessibilityState={{ selected: goal === n }}
                  testID={`goal-${n}`}
                  style={[styles.goal, goal === n && styles.goalActive]}>
                  <T variant="title" color={goal === n ? colors.accentInk : colors.text}>
                    {n}
                  </T>
                </Pressable>
              ))}
            </View>
            <T variant="label" color={colors.textFaint} style={{ marginTop: space.xl }}>
              Units
            </T>
            <View style={styles.row}>
              <Chip label="Pounds (lb)" active={units === 'lb'} onPress={() => setUnits('lb')} />
              <Chip label="Kilograms (kg)" active={units === 'kg'} onPress={() => setUnits('kg')} />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {step > 0 && <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} />}
        <Button
          title={step === 0 ? "Let's go" : last ? `Start with ${buddyName}` : 'Continue'}
          size="lg"
          style={{ flex: 1 }}
          disabled={last && goal === null}
          onPress={next}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingHorizontal: space.xl, paddingBottom: space.xl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginBottom: space.xxl },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.cardHigh },
  dotActive: { backgroundColor: colors.accent },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingBottom: 80 },
  centerText: { textAlign: 'center', lineHeight: 24 },
  logoEmoji: { fontSize: 72, lineHeight: 88 },
  logo: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    color: colors.accent,
    fontStyle: 'italic',
  },
  step: { gap: space.md },
  input: {
    marginTop: space.lg,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: space.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.md },
  starter: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,20,24,0.85)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quote: { textAlign: 'center', fontStyle: 'italic', marginTop: space.sm },
  goalRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  goal: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalActive: { backgroundColor: colors.accent },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,20,24,0.85)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: { borderColor: colors.accent },
  row: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  footer: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.xl,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
});
