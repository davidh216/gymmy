# Gymmy

**Log workouts. Level up. Build a squad of gym buddies.**

Gymmy is an iOS-first workout tracker with a game loop on top: every set you log earns XP,
personal records and weekly goals earn gems, and gems summon new companions who boost your XP.

## Features

- **Fast workout logging**: weight × reps, bodyweight reps, and timed sets. The previous session
  pre-fills each exercise, and a rest timer starts when you check off a set.
- **40+ exercises** across 7 muscle groups, plus Push / Pull / Legs / Full Body quick starts.
- **Personal records** detected automatically (estimated 1RM for weighted lifts, best reps or duration otherwise).
- **Progression**: XP and levels, a weekly training-day goal, and week streaks that multiply XP (up to +50%).
- **Companions**: pick a starter, then summon more with gems (14 buddies across 4 rarities, with pity).
  Duplicates add stars, and your active buddy grants bonus XP and reacts to how recently you trained.
- **Gyms**: leaderboards you can conquer at any public gym, your home gym (invite code) or globally.
  Post a video of your attempt, climb the top 10 and hold a medal. Other lifters can report entries.
  Backed by Supabase (accounts, shared boards, video storage); see [docs/gyms-spec.md](docs/gyms-spec.md).
- **History**: an 8-week consistency chart, lifetime volume, PR count, and per-workout detail with "repeat workout".
- Local-first: all data lives on the device (AsyncStorage). No account needed.

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

Gyms use the Supabase project in `.env` (public URL and publishable key; access is enforced by
row level security). Workouts, XP and the squad stay on the device.

- **Set up the database:** run each file in `supabase/migrations/` once, in name order, in the
  Supabase SQL Editor. Together they create the tables, security rules, triggers, the `attempts`
  video bucket, the admin review queue and account deletion.
- **Make yourself an admin:** in the SQL Editor run
  `update public.profiles set is_admin = true where username = 'your_username';`
  A **Review reports** button then appears in Profile.
- **Video scan (Hive):** deploy `supabase/functions/moderate-entry/index.ts` as an Edge Function
  named `moderate-entry`, add the `HIVE_API_KEY` secret, then switch it on with
  `update public.app_settings set value = 'true' where key = 'moderation_enabled';`
  New entries then wait as "processing" until the scan clears them; flagged or unscannable videos
  go to the admin review queue.
- **Sign in with Apple:** Authentication → Sign In / Providers → Apple → enable, and add the bundle ID
  `com.davidh216.gymmy` under Client IDs. Works in TestFlight/dev builds, not in Expo Go.
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
