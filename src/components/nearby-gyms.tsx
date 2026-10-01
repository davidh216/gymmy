import { useQuery } from '@tanstack/react-query';
import { useEffect, useEffectEvent, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, SectionHeader, T, haptic } from '@/components/ui';
import { formatDistance, type NearbyPlace } from '@/lib/places';
import { gymsApi, type Gym } from '@/services/gyms';
import { useJoinPlace } from '@/services/gyms/queries';
import { PlacesError, currentCoords, hasLocationPermission, nearbyGyms } from '@/services/places';
import { useGymmy } from '@/store/gymmy';
import { colors, space } from '@/theme';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; places: NearbyPlace[] }
  | { status: 'error'; message: string };

/** Real gyms near the user (OpenStreetMap), joined into Gymmy on tap. */
export function NearbyGyms({
  filter,
  onOpen,
  onPlaces,
}: {
  filter: string;
  onOpen: (gym: Gym) => void;
  /** Reports which map places are listed, so other lists can skip them. */
  onPlaces?: (placeIds: string[]) => void;
}) {
  const imperial = useGymmy((s) => s.profile?.units !== 'kg');
  const [state, setState] = useState<State>({ status: 'idle' });
  const join = useJoinPlace();
  const [joining, setJoining] = useState<string | null>(null);

  const load = async () => {
    setState({ status: 'loading' });
    try {
      const coords = await currentCoords();
      const places = await nearbyGyms(coords);
      onPlaces?.(places.map((p) => p.placeId));
      setState({ status: 'ready', places });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof PlacesError ? e.message : 'Couldn’t load nearby gyms. Try again.',
      });
    }
  };

  // Search straight away when location access was already granted.
  const loadIfAllowed = useEffectEvent(() => {
    hasLocationPermission().then((granted) => {
      if (granted) load();
    });
  });
  useEffect(() => {
    loadIfAllowed();
  }, []);

  const places = state.status === 'ready' ? state.places : [];
  const placeIds = places.map((p) => p.placeId);
  const { data: linked = {} } = useQuery({
    queryKey: ['gyms', 'places', placeIds],
    queryFn: () => gymsApi.gymsForPlaces(placeIds),
    enabled: placeIds.length > 0,
  });

  const q = filter.trim().toLowerCase();
  const shown = q
    ? places.filter((p) => `${p.name} ${p.area ?? ''}`.toLowerCase().includes(q))
    : places;

  return (
    <View>
      <SectionHeader title="Near you" />
      {state.status === 'idle' && (
        <Card style={styles.prompt}>
          <T variant="body" color={colors.textDim} style={{ lineHeight: 21 }}>
            See real gyms around you and claim yours. Your location is only used for this search.
          </T>
          <Button
            title="Show gyms near me"
            icon={{ ios: 'location.fill', web: 'near_me' }}
            onPress={() => {
              haptic();
              load();
            }}
          />
        </Card>
      )}
      {state.status === 'loading' && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <T variant="caption" color={colors.textDim}>
            Finding gyms near you…
          </T>
        </View>
      )}
      {state.status === 'error' && (
        <Card style={styles.prompt}>
          <T variant="body" color={colors.textDim}>
            {state.message}
          </T>
          <Button title="Try again" variant="secondary" onPress={load} />
        </Card>
      )}
      {state.status === 'ready' && shown.length === 0 && (
        <T variant="body" color={colors.textDim} style={styles.empty}>
          {places.length === 0
            ? 'No gyms found nearby on the map. Add yours below.'
            : `No nearby gyms match “${filter}”.`}
        </T>
      )}
      {shown.map((place) => {
        const gym = linked[place.placeId];
        const busy = joining === place.placeId;
        return (
          <Card key={place.placeId} style={styles.row}>
            <Icon name={{ ios: 'mappin.circle.fill', web: 'location_on' }} size={22} color={colors.accent} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T variant="heading" numberOfLines={1}>
                {place.name}
              </T>
              <T variant="caption" color={colors.textFaint} numberOfLines={1}>
                {[place.area, formatDistance(place.distanceKm, imperial)].filter(Boolean).join(' · ')}
              </T>
              <T variant="caption" color={gym ? colors.accent : colors.textDim}>
                {gym
                  ? `${gym.memberCount} ${gym.memberCount === 1 ? 'lifter' : 'lifters'} on Gymmy`
                  : 'New on Gymmy, titles up for grabs'}
              </T>
            </View>
            {gym?.isMember ? (
              <Button title="Open" variant="secondary" onPress={() => onOpen(gym)} />
            ) : (
              <Button
                title={busy ? '…' : 'Join'}
                disabled={busy}
                onPress={async () => {
                  setJoining(place.placeId);
                  try {
                    const joined = await join.mutateAsync(place);
                    haptic('success');
                    onOpen(joined);
                  } catch {
                    setState({ status: 'error', message: 'Couldn’t join that gym. Check your connection and try again.' });
                  } finally {
                    setJoining(null);
                  }
                }}
              />
            )}
          </Card>
        );
      })}
      {state.status === 'ready' && places.length > 0 && (
        <T variant="caption" color={colors.textFaint} style={styles.credit}>
          Gym locations © OpenStreetMap contributors
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { gap: space.md },
  loading: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  empty: { textAlign: 'center', marginVertical: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  credit: { textAlign: 'center', marginTop: space.xs },
});
