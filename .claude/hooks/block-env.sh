#!/usr/bin/env bash
# PreToolUse guard: refuse edits to .env files (they hold MailerLite / Replicate keys).
# Reads the tool-call JSON on stdin; exit 2 = block (message goes back to Claude).
path=$(python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null)
case "$path" in
  *.env|*/.env|*.env.*)
    echo "Blocked: $path holds secrets (MailerLite/Replicate keys). Edit it by hand outside Claude." >&2
    exit 2 ;;
esac
exit 0
