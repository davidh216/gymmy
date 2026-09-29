import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GymCard } from '@/components/gym-parts';
import { Screen } from '@/components/screen';
import { Button, Card, Icon, SectionHeader, T } from '@/components/ui';
import { useMyGyms, useMyMedals } from '@/services/gyms/queries';
import { colors, space } from '@/theme';

export default function Gyms() {
  const { data: gyms = [], isLoading } = useMyGyms();
  const { data: medals = [] } = useMyMedals();

  return (
    <Screen header={<T variant="hero" style={{ marginBottom: space.lg }}>Gyms</T>}>
      {!isLoading && gyms.length === 0 && (
        <Card style={styles.intro}>
          <T style={{ fontSize: 44 }}>🏆</T>
          <T variant="title" style={{ textAlign: 'center' }}>
            Claim your gym
          </T>
          <T variant="body" color={colors.textDim} style={{ textAlign: 'center', lineHeight: 21 }}>
            Every gym has leaderboards for the big lifts and classic challenges. Post a video of your
            attempt to take a spot, and hold the podium to earn gems.
          </T>
        </Card>
      )}

      <Button
        title="Find, add or join a gym"
        icon={{ ios: 'magnifyingglass', web: 'search' }}
        size="lg"
        variant={gyms.length ? 'secondary' : 'primary'}
        onPress={() => router.push('/gym-find')}
      />

      {gyms.length > 0 && (
        <>
          <SectionHeader title="Your gyms" />
          {gyms.map((g) => (
            <GymCard key={g.id} gym={g} medals={medals.filter((m) => m.gymId === g.id).map((m) => m.rank)} />
          ))}
        </>
      )}

      <SectionHeader title="Everywhere" />
      <Card onPress={() => router.push({ pathname: '/gym/[id]', params: { id: 'global' } })} style={styles.global}>
        <T style={{ fontSize: 28 }}>🌍</T>
        <View style={{ flex: 1 }}>
          <T variant="heading">Global boards</T>
          <T variant="caption" color={colors.textFaint}>
            The best entry from every gym
          </T>
        </View>
        <Icon name={{ ios: 'chevron.right', web: 'chevron_right' }} size={14} color={colors.textFaint} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl, marginBottom: space.lg },
  global: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
