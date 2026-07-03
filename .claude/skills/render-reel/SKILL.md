---
name: render-reel
description: "VEROUDERD — rendert de afgekeurde canvas-namaak-reel uit launch/reel-render.html. Niet meer gebruiken voor nieuwe reels; de goedgekeurde route is echte-pagina-opname (deterministische virtual-clock capture, 30fps, zie REEL_BLUEPRINT.md en capture_det.js)."
disable-model-invocation: true
---

# render-reel — ⚠️ VEROUDERD

> **Niet meer gebruiken.** Deze skill rendert de canvas-NAMAAK-reel, en Jay heeft die route afgekeurd: de reel moet 1:1 de échte engine-animaties zijn. De goedgekeurde route = **echte-pagina-opname met deterministische virtual-clock capture (30fps CFR)** — zie `REEL_BLUEPRINT.md` §1.1 en `capture_det.js`. Onderstaande staat er alleen nog als naslag.

Turns `launch/reel-render.html` (a self-contained canvas reel: dead template → light-sweep →
4 watch worlds with per-world ambient particles → offer end-card) into an IG-ready MP4.

Paths are relative to the unit root (`cinematic-section/`). Helper: `.claude/skills/render-reel/transcode.sh`.

## Prerequisites
`python3`, `ffmpeg`, and a browser-automation controller (Playwright MCP — already in use this project).

## Steps

1. **Serve** the launch folder:
   ```bash
   python3 -m http.server 8754 --directory launch
   ```

2. **Capture** the canvas with the browser controller (Playwright MCP):
   - navigate to `http://localhost:8754/reel-render.html`
   - run, saving the result to a file (the page plays the ~24.5s timeline in real time and
     returns a base64 VP9 webm):
     ```js
     async () => { return await window.__renderReel(); }
     ```
     (Playwright MCP `browser_evaluate` with `filename: "reel-b64.txt"`.)
   - To eyeball one frame instead: `await window.__seek(16.0)` then screenshot `#c`.

3. **Transcode + open**:
   ```bash
   .claude/skills/render-reel/transcode.sh reel-b64.txt
   # -> ~/Desktop/jay-reel.mp4  (1080x1920, ~24.5s, ~6MB), opens automatically
   ```

4. Stop the server: `pkill -f "http.server 8754"`.

## Editing the reel
All timing/content lives in `launch/reel-render.html`:
- `const T = {...}` — phase timings. Each world holds ~5s; swipes are ~0.3s.
- `drawAmbient(mood, t)` — per-world particles (aqua sweep / abyss fog / crystal sparks / verde motes).
- `render(t)` — the master timeline (dead → sweep → worlds → end-card).
- Captions are the `caption(...)` calls; end-card text is in the final `else` block.

## Gotchas
- **One frame per input** if you ever post-process with ffmpeg `zoompan`: a looped multi-frame
  input multiplies the duration (a 12s reel became 232s once).
- `__renderReel()` uses `MediaRecorder` on `canvas.captureStream(60)` — it plays in **real time**,
  so the evaluate call takes ~25s. That's expected, not a hang.
- The reel shows the **clean original watch worlds** — no funnel pill / maker-mark on the scenes;
  branding + offer only on the end-card.
