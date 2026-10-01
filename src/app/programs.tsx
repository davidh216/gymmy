import Animated, { FadeInDown } from 'react-native-reanimated';

import { BackHeader } from '@/components/back-header';
import { ProgramCard } from '@/components/program-card';
import { Screen } from '@/components/screen';
import { PROGRAMS } from '@/lib/programs';
import { useGymmy } from '@/store/gymmy';

export default function ProgramsScreen() {
  const current = useGymmy((s) => s.plan?.programId);
  return (
    <Screen header={<BackHeader title="Training plans" subtitle="Pick a goal and follow it week by week" />}>
      {PROGRAMS.map((p, i) => (
        <Animated.View key={p.id} entering={FadeInDown.delay(i * 60)}>
          <ProgramCard program={p} active={p.id === current} />
        </Animated.View>
      ))}
    </Screen>
  );
}
