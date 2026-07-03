---
name: run-cinematic-section
description: Run, serve, preview, screenshot, or build a reel of the cinematic-section watch site. Use when asked to launch/start/open the landing page, the flagship demo (proto), or the free give (magnet), to screenshot it at desktop/mobile, or to render the Instagram reel.
---

# Run cinematic-section

A **static, build-less web app**: a scroll/swipe carousel of a luxury watch floating
over four themed "worlds". No bundler, no `npm install` — you serve a folder and a
browser runs it. Several deployables share one engine (`engine.js` + `engine.css`):

| Target (folder) | What it is |
|---|---|
| `launch/`    | The old watch landing page (maker-mark + email form). LEGACY — the funnel now centers on the Milano rebuild (see LAUNCH.md). |
| `proto/`     | The original 4-world flagship demo (AURELIAN), no funnel chrome. |
| `magnet/`    | The free single-scene "lite" give (zipped as `Cinematic-Section.zip`). |
| `dist-demo/` | Older PNG/JPG build of the demo. |

All paths below are relative to the unit root (`cinematic-section/`). The driver is
`.claude/skills/run-cinematic-section/driver.sh`.

## Prerequisites

Everything here was already on the machine — nothing to install to run it:

- `python3` (serves the folder)
- **Google Chrome** at `/Applications/Google Chrome.app` (headless screenshots)
- `ffmpeg` (only for the reel) — `brew install ffmpeg`
- `node` v24 (only if you re-render the reel via a browser controller)

There is **no build step**. The WebP assets are committed. (They were made with
Pillow, not `sips` — see Gotchas.)

## Run (agent path) — the driver

Serve a target, verify the page + every image asset resolves, and write a desktop
**and** mobile screenshot. This is the command to use:

```bash
.claude/skills/run-cinematic-section/driver.sh launch
# -> /tmp/cinematic-shots/launch-desktop.png  (1440x900)
# -> /tmp/cinematic-shots/launch-mobile.png   (390x844)
```

Other targets / options (all verified):

```bash
.claude/skills/run-cinematic-section/driver.sh proto
.claude/skills/run-cinematic-section/driver.sh magnet
PORT=8771 OUT=/tmp/shots .claude/skills/run-cinematic-section/driver.sh launch
```

It prints `PASS: ...` and exits 0 on success; any 404 asset or unserved page exits
non-zero with the reason. **Look at the PNG** — a real render shows the watch + world
+ title; blank/grey means the intro never settled (bump `--virtual-time-budget` in the
driver).

### Driving other worlds (interactive)

Headless-Chrome `--screenshot` only captures **slide 1** (it can't press keys). To
reach Abyss / Violet / Emerald, serve the folder and drive a real browser-automation
tool (Playwright MCP, Puppeteer) with arrow keys:

```bash
python3 -m http.server 8754 --directory launch    # then navigate a controller to it
# in the controller: press 'ArrowRight' to advance worlds, screenshot between presses
```

## Run (human path)

```bash
python3 -m http.server 8754 --directory launch
# open http://localhost:8754/ in a browser; Ctrl-C to stop
```

Opening `index.html` as a `file://` is not recommended (relative asset + font loads
are happier over HTTP).

## Reel generation (secondary capability)

`launch/reel-render.html` is a self-contained **canvas reel renderer** (1080×1920) for
Instagram. It exposes two entry points on `window`:

- `await window.__seek(tSeconds)` — draw one frame (for poster checks)
- `await window.__renderReel()` — play the full ~11.6s timeline, capture the canvas
  with `MediaRecorder`, and **return a base64 VP9 `.webm` string**

Drive it with a headless-browser controller (this session used Playwright MCP
`browser_evaluate` to call `__renderReel()` and save the returned string). Then decode
+ transcode to an IG-ready MP4 — these shell steps are verified:

```bash
# reel-b64.txt = the JSON-quoted base64 string returned by __renderReel()
sed 's/^"//; s/"$//' reel-b64.txt | base64 -D > reel.webm
ffmpeg -y -i reel.webm -r 30 -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 19 -movflags +faststart reel.mp4
# poster frame to eyeball it:
ffmpeg -y -ss 4.0 -i reel.mp4 -frames:v 1 poster.png
```

## Gotchas (battle scars)

- **Headless `--screenshot` = slide 1 only.** No key input in that mode. Use
  `--virtual-time-budget=3500` so the one-shot intro animation + Google Fonts settle
  before capture; for other worlds you must drive arrow keys via Playwright/Puppeteer.
- **`reel-render.html` zoompan / single-frame rule.** When building the reel with
  ffmpeg `zoompan`, feed **one frame per input image** (`-i img.png`, *not*
  `-loop 1 -t 3 -i img.png`). With a looped multi-frame input, `zoompan d=90` multiplies
  per input frame and the clip balloons (a 12s reel came out 232s).
- **Reel must show the *original* watch, not the funnel.** Render the cinematic worlds
  clean (no "Get the free section" pill, no maker-mark on the scenes); put branding +
  offer only on the end card. The pill-on-every-frame version reads as an ad.
- **MailerLite CSS wins via ID scope.** The embed ships `#mlb2-...`-scoped CSS that
  beats any stylesheet rule. `launch/landing.js` restyles the form with **inline**
  styles (`setProperty(..., 'important')`) via a `MutationObserver` — don't try to
  override it from `landing.css`.
- **Engine is null-safe for missing controls.** `magnet/` has no `#next/#prev/#dots`;
  `engine.js` guards every `getElementById` so it doesn't crash on those shells. Keep
  that when editing the engine.
- **Mobile layout.** Breakpoint is `≤768px`; `landing.css` overrides `engine.css`
  mobile defaults (watch height/position). The hero watch is `42vh` on mobile — if it
  looks small/stranded, that override is why.
- **WebP on this Mac.** `sips` has no WebP encoder here; assets were converted with
  Python Pillow. Use Pillow if you regenerate them.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `OSError: [Errno 48] Address already in use` | A server is already on that port (e.g. a stray `8754`). Use `PORT=8771 ...` or `pkill -f "http.server <port>"`. |
| Screenshot is blank / unstyled | `--virtual-time-budget` too low or fonts not loaded — raise it in `driver.sh`. |
| `FAIL: Google Chrome not found` | Set `CHROME=/path/to/chrome` (driver hardcodes the macOS app path). |
| `MISSING ASSET: …` | An image name in `config.js` has no matching file in the target folder. |
