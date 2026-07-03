#!/usr/bin/env bash
# transcode.sh — turn the base64 .webm string from window.__renderReel() into an
# Instagram-ready MP4 and open it.
#
# Usage:  ./transcode.sh <reel-b64.txt> [out.mp4]
#   reel-b64.txt = the file a browser controller saved from __renderReel()
#   out.mp4      = default ~/Desktop/jay-reel.mp4
set -euo pipefail
B64="${1:?usage: transcode.sh <reel-b64.txt> [out.mp4]}"
OUT="${2:-$HOME/Desktop/jay-reel.mp4}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# strip the JSON quotes the evaluate step wraps around the base64, decode, transcode
sed 's/^"//; s/"$//' "$B64" | base64 -D > "$TMP/reel.webm"
ffmpeg -y -loglevel error -i "$TMP/reel.webm" -r 30 \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 19 -movflags +faststart "$OUT"

echo "wrote $OUT  ($(du -h "$OUT" | cut -f1), $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s, 1080x1920)"
open "$OUT" 2>/dev/null || true
