# App Store submission notes (draft)

## App Privacy ("nutrition label") answers

Data **linked to the user** (only when they create an account):

| Data type | Used for | Notes |
|---|---|---|
| Contact Info → Email address | App functionality (account) | Supabase Auth |
| User Content → Photos or videos | App functionality | Leaderboard attempt videos |
| User Content → Other user content | App functionality | Usernames, results, reports |
| Health & Fitness → Fitness | App functionality | Workouts and check-ins in the cloud backup |
| Health & Fitness → Health | App functionality | Check-in ratings, sleep hours, body weights and the height, birth year and sex the user types in (Apple Health data is never uploaded) |
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
> **No demo account needed:** create one in the app in under a minute (Gyms tab → Create account), with Sign in with Apple or an email and password. Apple sign-ins pick a username afterwards. Every leaderboard shows labelled baseline rows (e.g. "1 plate · 135 lb × 5 · Baseline"), so boards have rankings to compete against before anyone posts.
>
> **Apple Health:** Profile → Apple Health → Connect. Gymmy reads sleep, workouts, heart rate variability, resting heart rate and body weight for readiness and history, and saves workouts (with estimated active calories when allowed). Nothing from Health is used for ads or shared.
>
> **Notifications:** Profile → Reminders. Off until the user turns one on, which is when iOS asks for permission. They're local reminders (training days at a chosen time, a Sunday weigh-in, a Monday recap); nothing is sent from a server.
>
> **Location:** Gyms → Find, add or join a gym asks for When-In-Use location to list gyms within 5 km from OpenStreetMap.
>
> **User-generated content (Guideline 1.2):** leaderboard entries are videos. Every entry has Report (with reasons) and Block. Three "invalid" reports or one "inappropriate" report hides an entry until a moderator reviews it in the in-app admin queue. Before posting, users confirm the challenge standards one by one. Profile → Delete account removes the account and all of its content.

## Store listing

Paste each field into App Store Connect → Gymmy → the 1.0 version page. Character limits are checked.

**Name (30):** Gymmy
**Subtitle (30):** Workout log, coach & gym ranks
**Promotional text (170):** New: Kong sets your weights. Hit every rep and the bar goes up next time. Build a plan in 5 questions, see calories burned, and take #1 on your gym's leaderboard.

**Description:**

Gymmy is a workout log with a coach in your pocket and a leaderboard at your gym.

A COACH THAT SETS THE WEIGHT
• Kong, your gym buddy, fills in every set: hit all your reps and the weight goes up next time
• Miss a few and it holds; stall twice and it eases off so you can build back
• Weekly notes on what went well, what you skipped and when to take a lighter week

A PLAN BUILT FOR YOU
• Answer 5 questions (goal, days, experience, equipment, time) and get an 8-week plan
• Or follow HYROX, marathon, first 5K, 5×5 strength and muscle plans, or build your own
• Lighter sessions when you're tired or coming back from a break

LOG FAST
• Sets, reps, weight, time and distance, with last time's numbers right there
• Warm-up sets, RPE, rest timers, plate calculator and notes
• Fix a past workout any time: sets, reps, start time and length
• Personal records and progress charts for every lift and run
• Estimated calories burned from your height, weight and workout

CLAIM YOUR GYM
• Leaderboards for the big lifts, pull-ups, rows, runs and carries
• Rank lifts by total (weight × reps), max weight or bodyweight %
• Post a video of your attempt and take the top spot
• Monthly seasons: finish #1 and keep the crown

STAY ON TRACK
• Reminders on your training days, skipped when you've already trained
• Streaks, milestones, gems and 14 gym buddies to collect
• Daily readiness from your check-in, training load and Apple Health
• Workouts and calories saved to Apple Health

Works offline. Your data stays on your phone unless you create an account.

**Keywords (100):** tracker,lifting,weightlifting,strength,plan,overload,hyrox,pr,calories,running,fitness,exercise

(Words already in the name and subtitle, like workout, log, coach and gym, are indexed anyway, so they're left out of the keywords.)

**What's New (first release):** leave empty; App Store Connect doesn't show it for version 1.0.

### Screenshots

`docs/launch/screenshots/` has eight 1320 × 2868 PNGs for the **6.9" iPhone** slot (Apple scales them for smaller iPhones). Upload them in this order:

1. `01-today.png`: Your gym buddy levels up with you
2. `02-workout.png`: Your coach sets every weight
3. `03-plan.png`: A plan built for you in 5 questions
4. `04-board.png`: Claim #1 at your gym
5. `05-recap.png`: Weekly notes from your coach
6. `06-progress.png`: Watch every lift climb
7. `07-history.png`: Every set, rep and record
8. `08-squad.png`: Collect 14 gym buddies

They're taken from the app with demo data: about ten weeks of training on a "Muscle · 4 days" plan, and an Iron Temple leaderboard.

## Web pages

Published by `.github/workflows/pages.yml` from `docs/launch/privacy-policy.md` and `docs/site/`:

- Support URL: `https://davidh216.github.io/gymmy/`
- Privacy Policy URL: `https://davidh216.github.io/gymmy/privacy.html`
