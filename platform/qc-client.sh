#!/usr/bin/env bash
# ============================================================
# qc-client.sh — QC driver for a client demo site (site.html).
#
# Serves platform/clients/<slug>/ and screenshots site.html at
# desktop + mobile, plus tall full-page shots. Same headless-
# Chrome path as .claude/skills/run-cinematic-section/driver.sh.
#
# Usage: ./qc-client.sh <slug>
#   PORT=8777 OUT=/tmp/qc-shots ./qc-client.sh house-of-brothers
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLUG="${1:?usage: qc-client.sh <slug>}"
PORT="${PORT:-8777}"
OUT="${OUT:-/tmp/qc-shots}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$ROOT/platform/clients/$SLUG"

[ -f "$DIR/site.html" ] || { echo "FAIL: no site.html in $DIR"; exit 1; }
[ -x "$CHROME" ]        || { echo "FAIL: Google Chrome not found"; exit 1; }
mkdir -p "$OUT"

# --- serve ---
python3 -m http.server "$PORT" --directory "$DIR" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
for i in $(seq 1 40); do
  curl -sf "http://localhost:$PORT/site.html" >/dev/null 2>&1 && break
  sleep 0.2
done

curl -sf "http://localhost:$PORT/site.html" >/dev/null || { echo "FAIL: site.html not served on :$PORT"; exit 1; }

# --- asset integrity: every local image referenced in site.html must resolve ---
miss=0
for a in $(grep -oE '(assets/[A-Za-z0-9_./-]+\.(webp|png|jpg|jpeg))' "$DIR/site.html" | sort -u); do
  curl -sf -o /dev/null "http://localhost:$PORT/$a" || { echo "MISSING ASSET: $a"; miss=1; }
done
[ "$miss" = 0 ] || { echo "FAIL: one or more assets 404"; exit 1; }

shoot () { # w h name
  "$CHROME" --headless=new --hide-scrollbars --disable-gpu --force-color-profile=srgb \
    --virtual-time-budget=4500 --window-size="$1,$2" \
    --screenshot="$OUT/$SLUG-$3.png" "http://localhost:$PORT/site.html" >/dev/null 2>&1
}
# viewport shots
shoot 1440 900  desktop
shoot 390  844  mobile
# tall shots to see below the fold
shoot 1440 3600 desktop-full
shoot 390  4800 mobile-full

ls -la "$OUT/$SLUG-desktop.png" "$OUT/$SLUG-mobile.png" "$OUT/$SLUG-desktop-full.png" "$OUT/$SLUG-mobile-full.png"
echo "PASS: $SLUG served on :$PORT, screenshots in $OUT"
