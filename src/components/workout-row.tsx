import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, T } from '@/components/ui';
import { getExercise } from '@/lib/exercises';
import { formatDate, formatMinutes, formatVolume } from '@/lib/format';
import { volume } from '@/lib/records';
import type { Workout } from '@/lib/types';
import { useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

export function WorkoutRow({ workout }: { workout: Workout }) {
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const names = workout.exercises.map((e) => getExercise(e.exerciseId).name);
  const vol = volume(workout.exercises);
  return (
    <Card
      onPress={() => router.push({ pathname: '/session/[id]', params: { id: workout.id } })}
      style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <T variant="heading" numberOfLines={1}>
            {workout.name}
          </T>
          <T variant="caption" color={colors.textFaint} numberOfLines={1}>
            {formatDate(workout.endedAt)} · {formatMinutes(workout.endedAt - workout.startedAt)}
            {vol > 0 ? ` · ${formatVolume(vol, units)}` : ''}
            {workout.location ? ` · 📍 ${workout.location.name}` : ''}
          </T>
        </View>
        {workout.prs.length > 0 && (
          <View style={styles.pr}>
            <T variant="caption" color={colors.flame}>
              🏆 {workout.prs.length}
            </T>
          </View>
        )}
        <Icon name={{ ios: 'chevron.right', web: 'chevron_right' }} size={14} color={colors.textFaint} />
      </View>
      <T variant="caption" color={colors.textDim} numberOfLines={1}>
        {names.join(' · ') || 'No exercises'}
      </T>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, marginBottom: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pr: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,138,61,0.14)',
  },
});
