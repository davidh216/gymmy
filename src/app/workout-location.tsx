import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Icon, SectionHeader, T, haptic } from '@/components/ui';
import { customLocation, locationKey, recentLocations } from '@/lib/locations';
import { formatDistance, type NearbyPlace } from '@/lib/places';
import type { WorkoutLocation } from '@/lib/types';
import { useMeId } from '@/services/gyms';
import { useMyGyms } from '@/services/gyms/queries';
import { PlacesError, currentCoords, nearbyGyms } from '@/services/places';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

type Nearby =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; places: NearbyPlace[] }
  | { status: 'error'; message: string };

/** Picks where a workout happened: the active one, or a finished one via `?workoutId=`. */
export default function WorkoutLocationScreen() {
  const insets = useSafeAreaInsets();
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>();
  const current = useGymmy((s) =>
    workoutId ? s.workouts.find((w) => w.id === workoutId)?.location : s.active?.location,
  );
  const workouts = useGymmy((s) => s.workouts);
  const imperial = useGymmy((s) => s.profile?.units !== 'kg');
  const setWorkoutLocation = useGymmy((s) => s.setWorkoutLocation);
  const meId = useMeId();
  const { data: myGyms = [] } = useMyGyms(Boolean(meId));
  const [name, setName] = useState('');
  const [nearby, setNearby] = useState<Nearby>({ status: 'idle' });

  const pick = (location: WorkoutLocation | null) => {
    haptic();
    setWorkoutLocation(location, workoutId);
    router.back();
  };

  const findNearby = async () => {
    setNearby({ status: 'loading' });
    try {
      setNearby({ status: 'ready', places: await nearbyGyms(await currentCoords()) });
    } catch (e) {
      setNearby({
        status: 'error',
        message: e instanceof PlacesError ? e.message : 'Couldn’t load nearby gyms. Try again.',
      });
    }
  };

  const currentKey = current ? locationKey(current) : null;
  const recent = recentLocations(workouts);
  const recentKeys = new Set(recent.map(locationKey));
  const gyms = myGyms
    .map((g): WorkoutLocation => ({ name: g.name, area: g.area, gymId: g.id, placeId: g.placeId }))
    .filter((l) => !recentKeys.has(locationKey(l)));
  const typed = customLocation(name);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <T variant="title">Where are you training?</T>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <T variant="heading" color={colors.textDim}>
            Done
          </T>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.search}>
          <Icon name={{ ios: 'mappin.and.ellipse', web: 'location_on' }} size={16} color={colors.textFaint} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Type a gym name"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
            returnKeyType="done"
            onSubmitEditing={() => typed && pick(typed)}
            maxLength={60}
            accessibilityLabel="Gym name"
          />
        </View>
        {typed && <Button title={`Use “${typed.name}”`} onPress={() => pick(typed)} />}

        {recent.length > 0 && <SectionHeader title="Recent" />}
        {recent.map((l) => (
          <LocationRow
            key={locationKey(l)}
            location={l}
            selected={locationKey(l) === currentKey}
            onPress={() => pick(l)}
          />
        ))}

        {gyms.length > 0 && <SectionHeader title="Your gyms" />}
        {gyms.map((l) => (
          <LocationRow
            key={locationKey(l)}
            location={l}
            selected={locationKey(l) === currentKey}
            onPress={() => pick(l)}
          />
        ))}

        <SectionHeader title="Near you" />
        {nearby.status === 'idle' && (
          <Button
            title="Find gyms near me"
            variant="secondary"
            icon={{ ios: 'location.fill', web: 'near_me' }}
            onPress={findNearby}
          />
        )}
        {nearby.status === 'loading' && (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: space.lg }} />
        )}
        {nearby.status === 'error' && (
          <Card style={{ gap: space.sm }}>
            <T variant="body" color={colors.textDim}>
              {nearby.message}
            </T>
            <Button title="Try again" variant="secondary" onPress={findNearby} />
          </Card>
        )}
        {nearby.status === 'ready' && nearby.places.length === 0 && (
          <T variant="caption" color={colors.textDim}>
            No gyms found within 5 km. Type its name above instead.
          </T>
        )}
        {nearby.status === 'ready' &&
          nearby.places.map((p) => {
            const l: WorkoutLocation = { name: p.name, area: p.area, placeId: p.placeId };
            return (
              <LocationRow
                key={p.placeId}
                location={l}
                detail={formatDistance(p.distanceKm, imperial)}
                selected={locationKey(l) === currentKey}
                onPress={() => pick(l)}
              />
            );
          })}

        {current && (
          <Button title="Remove gym" variant="ghost" onPress={() => pick(null)} style={{ marginTop: space.lg }} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LocationRow({
  location,
  detail,
  selected,
  onPress,
}: {
  location: WorkoutLocation;
  detail?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const sub = [location.area, detail].filter(Boolean).join(' · ');
  return (
    <Card onPress={onPress} style={[styles.row, selected && styles.rowSelected]} accessibilityLabel={location.name}>
      <T style={{ fontSize: 20 }}>📍</T>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T variant="heading" numberOfLines={1}>
          {location.name}
        </T>
        {sub ? (
          <T variant="caption" color={colors.textFaint} numberOfLines={1}>
            {sub}
          </T>
        ) : null}
      </View>
      {selected && <Icon name={{ ios: 'checkmark', web: 'check' }} size={16} color={colors.accent} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg },
  content: { paddingHorizontal: space.lg, gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  searchInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 16, height: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rowSelected: { borderColor: colors.accent, borderWidth: 1.5 },
});
