import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { CompanionAvatar } from '@/components/companion-avatar';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, SectionHeader, T, haptic } from '@/components/ui';
import { getCompanion } from '@/lib/companions';
import { confirm } from '@/lib/confirm';
import { getExercise } from '@/lib/exercises';
import { formatTarget } from '@/lib/format';
import {
  DAY_CHOICES,
  EQUIPMENT,
  EXPERIENCE,
  GENERATED_WEEKS,
  GOALS,
  MINUTE_CHOICES,
  generatePlan,
  generatedName,
  type GeneratorInput,
} from '@/lib/plan-generator';
import { getProgram } from '@/lib/programs';
import { useCompanionName, useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

/** Your buddy builds a plan from a few answers; it saves as one of your plans. */
export default function PlanGeneratorScreen() {
  const profile = useGymmy((s) => s.profile);
  const companionId = useGymmy((s) => s.companionId);
  const buddy = useCompanionName(companionId);
  const units = profile?.units ?? 'lb';
  const current = useGymmy((s) => s.plan?.programId);
  const { saveCustomProgram, startPlan } = useGymmy.getState();
  const [input, setInput] = useState<GeneratorInput>(() => ({
    goal: profile?.focus === 'strength' ? 'strength' : 'general',
    days: Math.min(6, Math.max(2, profile?.weeklyGoal ?? 3)),
    experience: 'some',
    equipment: 'gym',
    minutes: 60,
  }));
  const set = (patch: Partial<GeneratorInput>) => setInput((i) => ({ ...i, ...patch }));
  const days = generatePlan(input);

  const save = () => {
    const { name, emoji } = generatedName(input);
    const go = () => {
      haptic('success');
      const id = saveCustomProgram({
        name,
        emoji,
        weeks: GENERATED_WEEKS,
        days,
      });
      startPlan(id);
      router.replace({ pathname: '/program/[id]', params: { id } });
    };
    const active = current ? getProgram(current) : undefined;
    if (active) confirm('Switch plans?', `This replaces ${active.name} as your current plan.`, 'Switch', go);
    else go();
  };

  return (
    <Screen header={<BackHeader title="Build me a plan" subtitle={`${buddy} will set the weights each session`} />}>
      <Card style={styles.intro}>
        <CompanionAvatar companion={getCompanion(companionId)} size={40} ring={false} />
        <T variant="caption" color={colors.textDim} style={{ flex: 1 }}>
          Answer a few questions and {buddy} builds your week. Log your sets and the weights go up as you get stronger.
        </T>
      </Card>

      <SectionHeader title="Goal" />
      <View style={styles.goals}>
        {GOALS.map((g) => (
          <Card
            key={g.id}
            onPress={() => set({ goal: g.id })}
            style={[styles.goal, input.goal === g.id && styles.goalOn]}
            accessibilityLabel={`${g.label}${input.goal === g.id ? ', selected' : ''}`}
            testID={`gen-goal-${g.id}`}>
            <T style={{ fontSize: 22 }}>{g.emoji}</T>
            <View style={{ flex: 1 }}>
              <T variant="heading">{g.label}</T>
              <T variant="caption" color={colors.textDim}>
                {g.blurb}
              </T>
            </View>
          </Card>
        ))}
      </View>

      <SectionHeader title="Days a week" />
      <View style={styles.chips}>
        {DAY_CHOICES.map((d) => (
          <Chip key={d} label={String(d)} active={input.days === d} onPress={() => set({ days: d })} />
        ))}
      </View>

      <SectionHeader title="Experience" />
      <View style={styles.chips}>
        {EXPERIENCE.map((e) => (
          <Chip
            key={e.id}
            label={e.label}
            active={input.experience === e.id}
            onPress={() => set({ experience: e.id })}
          />
        ))}
      </View>

      <SectionHeader title="Equipment" />
      <View style={styles.chips}>
        {EQUIPMENT.map((e) => (
          <Chip key={e.id} label={e.label} active={input.equipment === e.id} onPress={() => set({ equipment: e.id })} />
        ))}
      </View>

      <SectionHeader title="Session length" />
      <View style={styles.chips}>
        {MINUTE_CHOICES.map((m) => (
          <Chip key={m} label={`${m} min`} active={input.minutes === m} onPress={() => set({ minutes: m })} />
        ))}
      </View>

      <SectionHeader title={`Your week · ${GENERATED_WEEKS} weeks`} />
      {days.map((d, i) => (
        <Card key={i} style={styles.day}>
          <T variant="heading">{d.name}</T>
          <T variant="caption" color={colors.textFaint}>
            {d.focus}
          </T>
          {d.exercises.map((e) => (
            <View key={e.exerciseId} style={styles.exercise}>
              <T variant="body" style={{ flex: 1 }}>
                {getExercise(e.exerciseId).name}
              </T>
              <T variant="caption" color={colors.textDim}>
                {formatTarget(e, units)}
              </T>
            </View>
          ))}
        </Card>
      ))}

      <Button
        size="lg"
        title="Save and start"
        icon={{ ios: 'checkmark', web: 'check' }}
        onPress={save}
        style={{ marginTop: space.md }}
        testID="gen-save"
      />
      <T variant="caption" color={colors.textFaint} style={styles.note}>
        It saves under Your plans, where you can edit any day.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  goals: { gap: space.sm },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  goalOn: { borderColor: colors.accent },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  day: { gap: 2, marginBottom: space.sm, borderRadius: radius.lg },
  exercise: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  note: { textAlign: 'center', marginTop: space.sm },
});
