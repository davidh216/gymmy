import {
  OVERPASS_ENDPOINTS,
  OVERPASS_HEADERS,
  overpassQuery,
  parseOverpass,
  type Coords,
  type NearbyPlace,
} from '@/lib/places';

/** Public Overpass instances, tried in order. */
const TIMEOUT_MS = 20_000;

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

/** Real gyms near a point, from OpenStreetMap. */
export async function nearbyGyms(origin: Coords): Promise<NearbyPlace[]> {
  const body = `data=${encodeURIComponent(overpassQuery(origin))}`;
  let lastError: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: OVERPASS_HEADERS,
        body,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      return parseOverpass(await res.json(), origin);
    } catch (e) {
      lastError = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new PlacesError(
    `Couldn’t load nearby gyms. Check your connection and try again. (${lastError instanceof Error ? lastError.message : 'unknown error'})`,
    'network',
  );
}
