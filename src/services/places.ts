import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/services/supabase';

import {
  fetchOverpass,
  overpassQuery,
  parseOverpass,
  placesCacheKey,
  type Coords,
  type NearbyPlace,
  type OverpassElement,
} from '@/lib/places';

/** Gyms rarely move; reuse a search of the same ~1 km area for a week. */
const CACHE_MS = 7 * 24 * 3600 * 1000;

/**
 * Gymmy's shared cache (the gym-places Edge Function), so people in the same area share
 * one lookup. Null when it isn't available, and the app asks OpenStreetMap directly.
 */
async function viaProxy(origin: Coords): Promise<{ elements: OverpassElement[] } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke<{ elements: OverpassElement[] }>('gym-places', {
      body: { lat: origin.lat, lng: origin.lng },
    });
    return !error && Array.isArray(data?.elements) ? { elements: data.elements } : null;
  } catch {
    return null;
  }
}

export class PlacesError extends Error {
  constructor(
    message: string,
    readonly reason: 'unsupported' | 'permission' | 'location' | 'network',
  ) {
    super(message);
  }
}

type LocationModule = typeof import('expo-location');

/**
 * Loads expo-location on demand. Builds made before location support don't contain the
 * native module, and an over-the-air update must not crash them, so this never throws on import.
 */
async function locationModule(): Promise<LocationModule> {
  try {
    return await import('expo-location');
  } catch {
    throw new PlacesError('Update Gymmy from TestFlight to see gyms near you.', 'unsupported');
  }
}

/** True when location access was already granted (no prompt). */
export async function hasLocationPermission(): Promise<boolean> {
  try {
    const Location = await locationModule();
    return (await Location.getForegroundPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Asks for When-In-Use location and returns a rough position (city-block accuracy is plenty). */
export async function currentCoords(): Promise<Coords> {
  const Location = await locationModule();
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new PlacesError('Location is off for Gymmy. Turn it on in Settings to see gyms near you.', 'permission');
  }
  try {
    const last = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000 });
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    throw new PlacesError('Couldn’t get your location. Try again outdoors or with Wi-Fi on.', 'location');
  }
}

/** Real gyms near a point, from OpenStreetMap. Cached on the device per ~1 km area. */
export async function nearbyGyms(origin: Coords): Promise<NearbyPlace[]> {
  const key = placesCacheKey(origin);
  try {
    const cached = JSON.parse((await AsyncStorage.getItem(key)) ?? 'null') as
      | { at: number; elements: OverpassElement[] }
      | null;
    if (cached && Date.now() - cached.at < CACHE_MS) return parseOverpass(cached, origin);
  } catch {
    // Unreadable cache: fetch fresh.
  }
  let json: { elements?: OverpassElement[] };
  try {
    json = (await viaProxy(origin)) ?? (await fetchOverpass(overpassQuery(origin)));
  } catch (e) {
    throw new PlacesError(
      `Couldn’t load nearby gyms. The map service may be busy; try again in a minute. (${e instanceof Error ? e.message : 'unknown error'})`,
      'network',
    );
  }
  AsyncStorage.setItem(key, JSON.stringify({ at: Date.now(), elements: json.elements ?? [] })).catch(() => {});
  return parseOverpass(json, origin);
}
