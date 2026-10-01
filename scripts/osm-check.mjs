// Live check of the nearby-gym search against OpenStreetMap (run in CI; needs network).
// Usage: node --experimental-strip-types scripts/osm-check.mjs
import { OVERPASS_ENDPOINTS, OVERPASS_HEADERS, fetchOverpass, overpassQuery, parseOverpass } from '../src/lib/places.ts';

const spots = [
  { label: 'Times Square, New York', lat: 40.758, lng: -73.9855 },
  { label: 'Downtown Austin', lat: 30.2672, lng: -97.7431 },
  { label: 'Central London', lat: 51.5072, lng: -0.1276 },
];

// Which endpoints accept the app's headers (and, for diagnosis, without a User-Agent).
const probe = spots[0];
for (const url of OVERPASS_ENDPOINTS) {
  for (const [label, headers] of [
    ['app headers', OVERPASS_HEADERS],
    ['no user-agent', { 'Content-Type': OVERPASS_HEADERS['Content-Type'] }],
  ]) {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: `data=${encodeURIComponent(overpassQuery(probe))}`, signal: AbortSignal.timeout(30_000) });
      console.log(`${url} (${label}): HTTP ${res.status}${res.ok ? '' : ` ${(await res.text()).slice(0, 200).replace(/\s+/g, ' ')}`}`);
    } catch (e) {
      console.log(`${url} (${label}): ${e.message}`);
    }
  }
}

// The app's own path: all mirrors raced, first good answer wins.
let failed = false;
for (const spot of spots) {
  const started = Date.now();
  try {
    const json = await fetchOverpass(overpassQuery(spot));
    const places = parseOverpass(json, spot);
    console.log(`\n${spot.label}: ${json.elements?.length ?? 0} raw, ${places.length} named, ${Date.now() - started} ms`);
    for (const p of places.slice(0, 8)) console.log(`  ${p.distanceKm.toFixed(2)} km  ${p.name}  [${p.area ?? '-'}]  ${p.placeId}`);
    if (places.length === 0) failed = true;
  } catch (e) {
    console.log(`\n${spot.label}: failed after ${Date.now() - started} ms (${e.message})`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
