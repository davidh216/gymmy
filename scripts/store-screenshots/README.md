# App Store screenshots

`run.sh` rebuilds the eight 1320 × 2868 screenshots in `docs/launch/screenshots/`:

1. Exports the web build with the on-device leaderboard backend.
2. Goes through onboarding, builds a "Muscle · 4 days" plan, then loads ten weeks of demo training from `seed.js` (today is pinned to Thu Oct 15, 2026).
3. Captures each screen (`capture.js`) and frames it under a caption (`compose.js`; captions are in `FRAMES`).

Run it from anywhere: `scripts/store-screenshots/run.sh`. Set `CHROMIUM_PATH` if Playwright can't find Chromium.
