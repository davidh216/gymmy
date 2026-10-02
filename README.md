# Gymmy

**Log workouts. Level up. Build a squad of gym buddies.**

Gymmy is an iOS-first workout tracker with a game loop on top: every set you log earns XP,
personal records and weekly goals earn gems, and gems summon new companions who boost your XP.

## Features

- **Fast logging**: weight × reps, reps, time and distance (with pace). Last time's numbers fill in,
  with "Last" and "Best" shown for every exercise. Warm-up sets, RPE, per-exercise rest timers,
  notes, reordering and a plate calculator. Custom exercises can be submitted for everyone.
- **Records and progress**: automatic PRs (estimated 1RM for lifts), per-exercise progress charts,
  a weekly recap (shareable as text), and CSV/JSON export.
- **Training plans**: HYROX, marathon, first 5K, 5×5 strength, muscle building, or build your own.
  Sessions get lighter when readiness is low or after a long break.
- **Recovery**: daily check-ins, a readiness score (check-in, training load, and Apple Health heart
  rate variability and resting heart rate), a muscle recovery map and rest days.
- **Apple Health**: imports Watch runs, walks, rides, rows and swims, reads sleep, heart data and
  weight, and saves Gymmy workouts. Health data never leaves the phone.
- **Game loop**: XP and levels, weekly streaks, milestones that pay gems, and companions to summon.
- **Gyms**: leaderboards at public gyms, your home gym or globally, for lifts, pull-ups, rows, runs
  and carries. Post a video, take the top spot, and finish a monthly season at #1 for a 👑.
  Reports, blocks, an admin queue and optional automatic video scanning. See
  [docs/gyms-spec.md](docs/gyms-spec.md).
- **Local-first with optional cloud sync**: everything works offline without an account; signing
  in backs up and syncs across devices. Anonymous usage stats (opt-out) and crash reporting.

## Stack

Expo SDK 57 · React Native 0.86 · React 19 (with React Compiler) · Expo Router (native iOS tabs) ·
TypeScript (strict) · Zustand · Reanimated 4 · SF Symbols via `expo-symbols`

```
src/
  app/          routes (expo-router): onboarding, tabs, workout, picker, session detail, summon reveal
  components/   UI kit (buttons, cards, avatars) and tab bars (native iOS + web fallback)
  lib/          pure domain logic: exercises, companions, XP, streaks, PRs, gacha, formatting
  services/     gyms backend interface, local implementation and React Query hooks
  store/        persisted Zustand store and derived selectors
  theme/        colors, spacing, type scale
```

Game rules live in `src/lib` as plain functions with unit tests. Screens only render state.

## Development

```bash
npm install
npm start          # then press i for the iOS simulator, or scan the QR code with Expo Go
npm run web        # browser preview
npm test           # unit tests for the game logic
npm run typecheck
npm run lint
npm run preview:web  # single-file web build in dist/gymmy-preview.html
```

## Backend (Supabase)

Accounts, gyms, cloud sync and analytics use the Supabase project in `.env` (public URL and
publishable key; access is enforced by row level security). Without an account everything stays
on the device.

- **Set up the database:** paste all of `supabase/setup.sql` into the Supabase SQL Editor and run it.
  It's every migration combined, and safe to re-run: it fills in whatever is missing. Regenerate it
  with `npm run db:setup` after adding a migration.
- **Make yourself an admin:** in the SQL Editor run
  `update public.profiles set is_admin = true where username = 'your_username';`
  A **Review reports** button then appears in Profile.
- **Video scan (Hive):** deploy `supabase/functions/moderate-entry/index.ts` as an Edge Function
  named `moderate-entry`, add the `HIVE_API_KEY` secret, then switch it on with
  `update public.app_settings set value = 'true' where key = 'moderation_enabled';`
  New entries then wait as "processing" until the scan clears them; flagged or unscannable videos
  go to the admin review queue.
- **Sign in with Apple (currently off):** the first signing profile was created without the capability,
  and automated builds can't add it. To turn it back on: `npx expo install expo-apple-authentication`,
  restore the button (see git history of `src/components/account-card.tsx`), add
  `"usesAppleSignIn": true` under `ios` in `app.json`, then run one interactive
  `npx eas-cli@latest build -p ios` from a computer so EAS can update the Apple profile. Also enable
  Apple under Supabase → Authentication → Providers with client ID `com.davidh216.gymmy`.
- **Test the rules locally:** `npm run test:db` runs the migration plus scenario tests against a
  throwaway local Postgres database.
- **Offline preview:** `npm run preview:web` builds with `EXPO_PUBLIC_GYMS_BACKEND=local`, which
  swaps in the on-device stand-in with sample gyms.

## Shipping to TestFlight

You need an [Apple Developer Program](https://developer.apple.com/programs/) membership and a free
[Expo account](https://expo.dev/signup). No Mac or Xcode is required. EAS builds in the cloud.

```bash
npx testflight        # log in to Expo + Apple, then build, sign and upload in one step
```

The first run links the project to EAS, which adds `extra.eas.projectId` to `app.json` (commit that change).
It also registers the bundle ID and creates the signing certificates and the App Store Connect app.
The build shows up in TestFlight about 10–30 minutes later.

To do it in separate steps:

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

### Apple Health (HealthKit)

Gymmy reads sleep and Apple Watch runs, walks, rides, rows and swims, and saves logged workouts
to Health (`@kingstinct/react-native-healthkit`, configured in `app.json`). HealthKit is an app
capability, so the App ID and provisioning profile must include it. CI builds run
non-interactively and can't add capabilities themselves; do one of these once:

- In the Apple Developer portal: Certificates, IDs & Profiles → Identifiers →
  `com.davidh216.gymmy` → tick **HealthKit** → Save. The next `[ios build]` regenerates the
  profile with the App Store Connect API key EAS already has.
- Or from a computer: `npx eas-cli@latest build -p ios --profile production` and log in to Apple
  when asked; EAS syncs capabilities and updates the profile.

### Supabase from GitHub (no SQL Editor)

`.github/workflows/supabase.yml` applies database changes from CI. Put a marker in a commit
message on the app branch (or run it from the Actions tab):

| Marker | Does |
|---|---|
| `[db push]` | Applies new files in `supabase/migrations` (all safe to re-run) |
| `[db sql]` | Runs `supabase/ops/run.sql` once (one-off fixes; git keeps the history) |
| `[functions deploy]` | Deploys `gym-places` (shared, cached nearby-gym search) and smoke-tests it; deploys `moderate-entry` and sets `HIVE_API_KEY` only when that secret exists |
| `[db check]` | Read-only status report (also printed after every run) |
| `[db report]` | Read-only anonymous analytics report (last 28 days) |

Repository secrets: `SUPABASE_ACCESS_TOKEN` (supabase.com → Account → Access Tokens) and
`SUPABASE_DB_PASSWORD` (Project Settings → Database); optionally `HIVE_API_KEY`.

### End-to-end tests (Maestro)

Flows in `.maestro/` (onboarding, logging a workout, recovery check-in, a plan session, a custom
exercise) run in an iOS simulator on a GitHub macOS runner (`.github/workflows/e2e.yml`, free
for public repos): the iOS project is generated in CI, built for the simulator with the offline
gyms backend, and driven by Maestro. Start them with a commit containing `[e2e]`. Results and
failure screenshots are uploaded as the `maestro-results` artifact. Elements without stable text
use `testID`s (`set-1-weight`, `set-1-reps`, `set-1-done`, `plan-day-1-start`).
