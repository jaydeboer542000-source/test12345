#!/usr/bin/env bash
# new-section.sh — scaffold a fresh cinematic section from the shared engine.
# Usage: ./new-section.sh <slug>     e.g. ./new-section.sh sneaker-drop
set -euo pipefail
NAME="${1:?usage: new-section.sh <slug>}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
DEST="$ROOT/sections/$NAME"
[ -e "$DEST" ] && { echo "already exists: $DEST"; exit 1; }
mkdir -p "$DEST"

# canonical engine (never edited per-section)
cp "$ROOT/launch/engine.js" "$ROOT/launch/engine.css" "$DEST/"
cp "$ROOT/magnet/placeholder_product.png" "$DEST/" 2>/dev/null || true

cat > "$DEST/index.html" <<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>cinematic section</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..560&family=Inter:wght@500;600&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="engine.css"/></head><body>
<div class="carousel" id="carousel"><div class="track" id="track"></div></div>
<div class="scrim"></div><div class="brand" id="brand"></div>
<div class="arrow prev" id="prev">&lsaquo;</div><div class="arrow next" id="next">&rsaquo;</div>
<div class="dots" id="dots"></div>
<script src="config.js"></script><script src="engine.js"></script></body></html>
HTML

cat > "$DEST/config.js" <<'JS'
/* The ONLY file you edit. Per world: bg + product (transparent PNG) + glow + mood
   (aqua | abyss | crystal | verde) + kicker/title/sub. Drop image files in this folder. */
window.CINEMATIC = {
  brand: "YOUR BRAND",
  worlds: [
    { bg:"placeholder_product.png", product:"placeholder_product.png", glow:"#4db6ff", mood:"aqua", grade:0.45, tint:0,
      kicker:"Chapter I", title:"Your Title", sub:"Your one-line subtitle." }
  ]
};
JS

echo "created sections/$NAME"
echo "next:"
echo "  1. drop a bg image + a transparent product PNG into $DEST"
echo "  2. edit config.js (title, glow, mood, image names; add more worlds by copying a line)"
echo "  3. preview:  .claude/skills/run-cinematic-section/driver.sh sections/$NAME"
