# Gyms: leaderboards you can conquer

Status: design agreed, stage 1 (app UI on a local stand-in backend) in progress.

## The loop

Join a gym → see its boards → record an attempt on video → post it → you land on the board
immediately → someone beats you, you get notified → go reclaim it.

## Rules

**Gyms**
- *Public gyms* are real places, found by map search and shared by everyone (deduplicated by map place ID).
- *Private gyms* (home and garage gyms) are joined with an invite code.
- Every challenge also has a *Global* board across all gyms.

**Challenges** (starting set)

| Challenge | Metric | Better |
|---|---|---|
| Bench Press, Back Squat, Deadlift, Overhead Press | heaviest single rep (kg) | higher |
| Pull-ups | max reps | higher |
| Push-ups | max reps in 1 minute | higher |
| Plank | longest hold (s) | higher |
| 500 m Row | fastest time (s) | lower |

Each challenge has a short standards checklist (e.g. "plates visible", "full lockout") the poster confirms.

**Boards**
- Top 10 per challenge, medals for 1–3, and your own rank always shown.
- Only each person's best live entry counts.
- Two views for the lifts: *Open* (raw weight) and *Pound-for-pound* (weight ÷ bodyweight, entered
  with each attempt). Rep and time challenges have a single view.

**Entries**
- Every entry needs a video, max 60 seconds, recorded in the app camera.
- Self-verified: an entry goes live as soon as it passes the automatic content scan.
- Videos are deleted 30 days after an entry drops out of the top 10.

**Reports** (two different problems)
- *Invalid lift* (depth, lockout, wrong weight, not the same person, edited): 3 counted reports hide
  the entry until an admin reviews it. A report counts only if the reporter's account is 7+ days old;
  reporters with repeated rejected reports lose weight.
- *Inappropriate content* (nudity, violence, harassment, spam): hidden for the reporter immediately,
  hidden for everyone after 1 counted report, top of the review queue.

**Content safety** (server, stage 2)
- Clips stay `processing` until an automated video moderation API clears them (e.g. AWS Rekognition
  or Hive), plus hash matching for known abuse material (e.g. Thorn Safer / PhotoDNA) with the
  legally required reporting path.
- Sign in with Apple accounts, blocking, strikes and bans, upload rate limits, 17+ age rating,
  published contact. Private gym content is visible to members only; boards show a still until tapped.

**Identity**: username required; real name and home gym are hidden unless the user opts in.

**Rewards**: holding a medal pays gems daily (🥇 30 · 🥈 20 · 🥉 10). Push notification when you
drop off the podium. Your active buddy appears next to your entries.

## Data model

- `gyms` (id, kind public/private, name, address, lat/lng, place_id, invite_code, created_by)
- `gym_members` (gym_id, user_id, joined_at)
- `profiles` (id, username, display_name?, show_name, show_home_gym, companion_id, created_at, strikes)
- `entries` (id, gym_id, challenge_id, user_id, value, bodyweight_kg, video_path, status
  processing/live/hidden/removed, created_at)
- `reports` (entry_id, reporter_id, kind invalid/inappropriate, reason, counted, resolved)
- `blocks` (user_id, blocked_id)
- Boards are a query: best live entry per user per challenge, filtered by gym (or none for global).

## Stages

1. **App UI on a local backend** – Gyms tab, gym and board screens, posting with video, reporting.
   Sample gyms and rival entries so the preview is playable. The backend sits behind `GymsApi`
   (`src/services/gyms`) so it can be swapped.
2. **Supabase** – accounts (Sign in with Apple), tables and row-level security, video storage,
   moderation scan, admin review screen.
3. **Engagement** – dethrone push notifications, daily medal gems, map search for public gyms.
