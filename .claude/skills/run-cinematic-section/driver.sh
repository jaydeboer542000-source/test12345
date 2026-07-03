#!/usr/bin/env bash
# ============================================================
# driver.sh — launch + drive the cinematic-section static site.
#
# Serves one target folder (launch | proto | magnet | dist-demo),
# verifies the page + every image asset resolves, then takes a
# desktop AND a mobile screenshot via the installed headless Chrome.
#
# Usage:   ./driver.sh [target]      (default: launch)
#   PORT=8771 OUT=/tmp/shots ./driver.sh proto
#
# Exit 0 = served, assets ok, screenshots written. Non-zero = problem.
# ============================================================
set -euo pipefail

# repo root = three levels up from this skill dir (.claude/skills/run-cinematic-section)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TARGET="${1:-launch}"
PORT="${PORT:-8770}"
OUT="${OUT:-/tmp/cinematic-shots}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$ROOT/$TARGET"

[ -d "$DIR" ]    || { echo "FAIL: no target dir $DIR"; exit 1; }
[ -x "$CHROME" ] || { echo "FAIL: Google Chrome not found at $CHROME"; exit 1; }
mkdir -p "$OUT"

# --- serve ---
python3 -m http.server "$PORT" --directory "$DIR" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
for i in $(seq 1 40); do
  curl -sf "http://localhost:$PORT/index.html" >/dev/null 2>&1 && break
  sleep 0.2
done

# --- page sanity: every deployable loads engine.js ---
html=$(curl -sf "http://localhost:$PORT/index.html") || { echo "FAIL: index.html not served on :$PORT"; exit 1; }
echo "$html" | grep -q 'engine.js' || { echo "FAIL: engine.js not referenced — not the cinematic app?"; exit 1; }

# --- asset integrity: pull image names out of config.js, fetch each ---
assets=$(curl -sf "http://localhost:$PORT/config.js" | grep -oE '[A-Za-z0-9_./-]+\.(webp|png|jpg)' | sort -u || true)
miss=0
for a in $assets; do
  curl -sf -o /dev/null "http://localhost:$PORT/$a" || { echo "MISSING ASSET: $a"; miss=1; }
done
[ "$miss" = 0 ] || { echo "FAIL: one or more assets 404"; exit 1; }

# --- screenshots (virtual-time lets the intro animation + webfonts settle) ---
SAFE="${TARGET//\//-}"   # nested targets (sections/foo) -> sections-foo for filenames
shoot () { # w h name
  "$CHROME" --headless=new --hide-scrollbars --disable-gpu --force-color-profile=srgb \
    --virtual-time-budget=3500 --window-size="$1,$2" \
    --screenshot="$OUT/${SAFE}-$3.png" "http://localhost:$PORT/index.html" >/dev/null 2>&1
}
shoot 1440 900 desktop
shoot 390  844 mobile

ls -la "$OUT/${SAFE}-desktop.png" "$OUT/${SAFE}-mobile.png"
echo "PASS: '$TARGET' served on :$PORT, ${assets:+assets ok, }screenshots in $OUT"
