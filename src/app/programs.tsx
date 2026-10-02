import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BackHeader } from '@/components/back-header';
import { ProgramCard } from '@/components/program-card';
import { Screen } from '@/components/screen';
import { Button, SectionHeader } from '@/components/ui';
import { PROGRAMS, programFromCustom } from '@/lib/programs';
import { useGymmy } from '@/store/gymmy';
import { space } from '@/theme';

export default function ProgramsScreen() {
  const current = useGymmy((s) => s.plan?.programId);
  const custom = useGymmy((s) => s.customPrograms);
  return (
    <Screen header={<BackHeader title="Training plans" subtitle="Pick a goal and follow it week by week" />}>
      {PROGRAMS.map((p, i) => (
        <Animated.View key={p.id} entering={FadeInDown.delay(i * 60)}>
          <ProgramCard program={p} active={p.id === current} />
        </Animated.View>
      ))}

      <SectionHeader title="Your plans" />
      {custom.map((c) => (
        <ProgramCard key={c.id} program={programFromCustom(c)} active={c.id === current} />
      ))}
      <Button
        title="Build your own plan"
        icon={{ ios: 'plus', web: 'add' }}
        variant="secondary"
        style={{ marginTop: custom.length ? space.sm : 0 }}
        onPress={() => router.push('/plan-edit')}
        testID="plan-create"
      />
    </Screen>
  );
}
