# App Store submission notes (draft)

## App Privacy ("nutrition label") answers

Data **linked to the user** (only when they create an account):

| Data type | Used for | Notes |
|---|---|---|
| Contact Info → Email address | App functionality (account) | Supabase Auth |
| User Content → Photos or videos | App functionality | Leaderboard attempt videos |
| User Content → Other user content | App functionality | Usernames, results, reports |
| Health & Fitness → Fitness | App functionality | Workouts and check-ins in the cloud backup |
| Health & Fitness → Health | App functionality | Check-in ratings, sleep hours and body weights the user types in (Apple Health data is never uploaded) |
| Identifiers → User ID | App functionality | Account id |

Data **not linked to the user**:

| Data type | Used for |
|---|---|
| Usage Data → Product interaction | Analytics (anonymous install id, opt-in) |
| Diagnostics → Crash data | App functionality (Sentry, when enabled) |
| Location → Coarse location | App functionality (nearby gym search, not stored) |

Tracking: **No** (no data is used for tracking or shared with data brokers).

## Age rating

Likely **12+**: user-generated videos and usernames with reporting, blocking and moderation. No mature content is allowed by the standards.

## App Review notes

> Gymmy is a workout log with gym leaderboards. Everything except the leaderboards works without an account.
>
> **Support:** davidh216+gymmy@gmail.com · Support URL and Privacy Policy URL: see "Web pages" below.
>
> **No demo account needed:** create one in the app in under a minute (Gyms tab → Create account, with an email and password). Every leaderboard shows labelled baseline rows (e.g. "1 plate · 135 lb × 5 · Baseline"), so boards have rankings to compete against before anyone posts.
>
> **Apple Health:** Profile → Apple Health → Connect. Gymmy reads sleep, workouts, heart rate variability, resting heart rate and body weight for readiness and history, and saves workouts. Nothing from Health is used for ads or shared.
>
> **Location:** Gyms → Find, add or join a gym asks for When-In-Use location to list gyms within 5 km from OpenStreetMap.
>
> **User-generated content (Guideline 1.2):** leaderboard entries are videos. Every entry has Report (with reasons) and Block. Three "invalid" reports or one "inappropriate" report hides an entry until a moderator reviews it in the in-app admin queue. Before posting, users confirm the challenge standards one by one. Profile → Delete account removes the account and all of its content.

## Store listing

**Name:** Gymmy
**Subtitle (30):** Lift, log and claim your gym
**Promotional text (170):** Log workouts in seconds, follow HYROX, marathon or strength plans, and take the #1 spot on your gym's leaderboard. New: monthly seasons with champion crowns.

**Description:**

Gymmy makes training a game you actually want to play.

LOG FAST
• Sets, reps, weight, time and distance, with last time's numbers right there
• Warm-up sets, RPE, rest timers, plate calculator and notes
• Personal records and progress charts for every lift and run

FOLLOW A PLAN
• HYROX, marathon, first 5K, 5×5 strength and muscle-building plans, or build your own
• Lighter sessions when you're tired or coming back from a break

RECOVER SMARTER
• Daily readiness from your check-in, training load and Apple Health heart data
• Muscle recovery map and rest-day tracking

CLAIM YOUR GYM
• Leaderboards for the big lifts, pull-ups, rows, runs and carries
• Rank lifts by total (weight × reps), max weight or bodyweight %
• Post a video of your attempt and take the top spot
• Monthly seasons: finish #1 and keep the crown

STAY MOTIVATED
• Streaks, milestones, gems and companions that grow with you
• A weekly recap of everything you did

Works offline. Your data stays on your phone unless you create an account.

**Keywords (100):** workout,gym,log,tracker,hyrox,strength,leaderboard,pr,running,plan,lifting,fitness,recovery

**Screenshots to capture (6.9" iPhone):** Today, workout logging, plan, progress chart, leaderboard, weekly recap.

## Web pages

Published by `.github/workflows/pages.yml` from `docs/launch/privacy-policy.md` and `docs/site/`:

- Support URL: `https://davidh216.github.io/gymmy/`
- Privacy Policy URL: `https://davidh216.github.io/gymmy/privacy.html`
