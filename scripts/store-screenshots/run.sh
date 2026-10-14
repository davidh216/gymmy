#!/usr/bin/env bash
# Regenerates the App Store screenshots in docs/launch/screenshots from the web build,
# with demo data (seed.js). Needs Chromium; set CHROMIUM_PATH if Playwright can't find one.
#   scripts/store-screenshots/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
HERE=scripts/store-screenshots
export WORK="$PWD/$HERE/.work" OUT="$PWD/docs/launch/screenshots"
PORT=8130
rm -rf "$WORK/web" "$WORK/final" && mkdir -p "$WORK/fonts" "$WORK/final"

# Web build with the on-device leaderboard backend, so gyms have sample rivals.
EXPO_PUBLIC_GYMS_BACKEND=local npx expo export -p web --output-dir "$WORK/web"

# Inter and Nunito stand in for SF Pro and SF Rounded.
# Its own package.json keeps these out of the app's node_modules.
[ -f "$WORK/package.json" ] || echo '{"private":true}' > "$WORK/package.json"
( cd "$WORK" && npm install --no-save --silent playwright-core@1.56.1 @fontsource/inter@5.1.0 @fontsource/nunito@5.1.0 )
mkdir -p "$WORK/web/fonts" "$WORK/fonts/inter/package" "$WORK/fonts/nunito/package"
cp -r "$WORK/node_modules/@fontsource/inter/files" "$WORK/fonts/inter/package/"
cp -r "$WORK/node_modules/@fontsource/nunito/files" "$WORK/fonts/nunito/package/"
cp "$WORK"/node_modules/@fontsource/inter/files/inter-latin-{400,500,600,700,800,900}-normal.woff2 "$WORK/web/fonts/"
cp "$WORK"/node_modules/@fontsource/nunito/files/nunito-latin-{600,700,800,900}-normal.woff2 "$WORK/web/fonts/"

node "$HERE/serve.js" "$WORK/web" $PORT &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1
export NODE_PATH="$WORK/node_modules"
node "$HERE/capture.js"
node "$HERE/compose.js"
echo "Screenshots in $OUT; contact sheet in $WORK/contact.png"
