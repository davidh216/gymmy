import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, Chip, T, haptic } from '@/components/ui';
import { STARTER_IDS, getCompanion } from '@/lib/companions';
import type { Units } from '@/lib/types';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const STEPS = 4;

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useGymmy((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [starter, setStarter] = useState<string>(STARTER_IDS[0]);
  const [goal, setGoal] = useState(3);
  const [units, setUnits] = useState<Units>('lb');

  const next = () => {
    if (step < STEPS - 1) setStep(step + 1);
    else {
      haptic('success');
      completeOnboarding({ name: name.trim() || 'Champ', weeklyGoal: goal, units }, starter);
    }
  };

  const chosen = getCompanion(starter);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={step === 2 ? [chosen.colors[0], colors.bg] : ['#1A2600', colors.bg]}
        style={StyleSheet.absoluteFill}
        end={{ x: 0.5, y: 0.6 }}
      />
      <View style={[styles.content, { paddingTop: insets.top + space.xl }]}>
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
            <T variant="body" color={colors.textDim} style={styles.quote}>
              “{chosen.lines[0]}”
            </T>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View key="goal" entering={FadeInRight} style={styles.step}>
            <T variant="hero">How many days a week?</T>
            <T variant="body" color={colors.textDim}>
              Hit your weekly goal to build a streak. Streaks multiply your XP.
            </T>
            <View style={styles.goalRow}>
              {[2, 3, 4, 5, 6].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => {
                    haptic();
                    setGoal(n);
                  }}
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
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {step > 0 && (
          <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} />
        )}
        <Button
          title={step === 0 ? "Let's go" : step === STEPS - 1 ? `Start with ${chosen.name}` : 'Continue'}
          size="lg"
          style={{ flex: 1 }}
          onPress={next}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: space.xl, maxWidth: 560, width: '100%', alignSelf: 'center' },
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
