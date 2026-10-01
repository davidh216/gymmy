// Live check of the nearby-gym search against OpenStreetMap (run in CI; needs network).
// Usage: node --experimental-strip-types scripts/osm-check.mjs
import { overpassQuery, parseOverpass } from '../src/lib/places.ts';

const spots = [
  { label: 'Times Square, New York', lat: 40.758, lng: -73.9855 },
  { label: 'Downtown Austin', lat: 30.2672, lng: -97.7431 },
  { label: 'Central London', lat: 51.5072, lng: -0.1276 },
];

let failed = false;
for (const spot of spots) {
  const started = Date.now();
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: `data=${encodeURIComponent(overpassQuery(spot))}`,
  });
  if (!res.ok) {
    console.log(`${spot.label}: HTTP ${res.status}`);
    failed = true;
    continue;
  }
  const json = await res.json();
  const places = parseOverpass(json, spot);
  console.log(`\n${spot.label}: ${json.elements?.length ?? 0} raw, ${places.length} named, ${Date.now() - started} ms`);
  for (const p of places.slice(0, 8)) console.log(`  ${p.distanceKm.toFixed(2)} km  ${p.name}  [${p.area ?? '-'}]  ${p.placeId}`);
  if (places.length === 0) failed = true;
}
process.exit(failed ? 1 : 0);
