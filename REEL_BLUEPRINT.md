# REEL BLUEPRINT — Premium Cinematic Product Reels

A durable, reusable checklist for every Cinematic IG reel built with **this exact toolchain**:
ffmpeg (no drawtext/freetype), Playwright/Chromium capture of live web pages, Pillow PNG text overlays.

Target spec for every reel unless stated otherwise:
**1080×1920, 30fps CFR, H.264, vertical 9:16.** All on-screen text **English only**.

---

## 0. Golden Rules (never break these)

1. **Real animation, never fake.** Always capture the live page, never re-create motion in ffmpeg.
2. **Deterministic capture first.** Frame-by-frame virtual-clock capture is the default. Everything else is a downgrade.
3. **30fps CFR, frame-exact.** Every clip is conformed to exactly 30 frames per second, constant frame rate, before assembly.
4. **No `recordVideo`.** Playwright's `context.recordVideo` is banned (VP8 ~864 kbps → blocking). Never ship it.
5. **Full-bleed always.** No frame may show empty dead margin. The boring "before" must fill the frame too.
6. **English text only.** Every readable word on screen is English.
7. **Sound is the spine.** Cuts, reveals and chapter changes land on the music, not on round seconds.
8. **Grade with the rubric (§9) before shipping.** No subjective "looks good" — run the measurable tests.

> **Client-rebuild reels (2026-07-02).** Reels now show REAL client rebuilds (before = their actual site, after = the cinematic demo). Nuance on rule 6: the client's page shown in frame may be Dutch (that's the real product); Jay's own OVERLAY text stays English. And: any scraped (Google/FB) photos visible in public material require a "demo-only" photo disclaimer on screen or in the caption.

---

## 1. Capture Rules — sharp + smooth 30fps real motion

### 1.1 Default: deterministic virtual-clock capture (THE pro technique)
Goal: perfectly smooth 30fps, lossless real animation, zero judder.

- Before the page animates, **override the clocks**: `requestAnimationFrame`, `performance.now`, and `Date.now` all read from one virtual clock.
- Advance the virtual clock **exactly 1/30s (33.333 ms) per captured frame**, render, take a PNG screenshot, repeat.
- Capture at the **final pixel size** (1080×1920) or an exact integer multiple, `deviceScaleFactor` 2 for sharpness, then downscale with Lanczos.
- Frame count = duration × 30 (e.g. 13.0s payoff → 390 frames exactly).
- Result: each output frame is a unique, fully-rendered moment → `mpdecimate` finds ~0% duplicates.

**Precondition (check this or it silently fails):** the page animation must honor the overridden clocks. Particle/bokeh loops driven by `requestAnimationFrame(t)` or `performance.now()` work. Anything using `setInterval`, CSS animations on the compositor thread, or its own `Date.now()` baseline must be patched to read the virtual clock too. **Verify by capturing 2 frames at different virtual times and confirming the pixels differ.**

### 1.2 Fallbacks (only if 1.1 is truly impossible) and their costs
- **CDP `Page.startScreencast`, jpeg quality 100** — sharp frames, BUT captures ~21fps variable. Conforming to 30fps duplicates frames → **judder (the #1 'looks bad' bug)**. Only acceptable for near-static shots; never for live particle motion.
- **High-bitrate offscreen MP4** (if a real screen-record path exists) — acceptable only at ≥12–16 Mbps; still risks variable frame timing. Re-encode to CFR 30 immediately.
- **`context.recordVideo`** — **BANNED.** VP8 low bitrate → macroblock smearing. Never use, even as a "quick test."

### 1.3 Sharpness hygiene
- Capture at `deviceScaleFactor: 2`, downscale to target with `-sws_flags lanczos`.
- Encode final master: `-c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p`.
- Never up-scale a small capture to fill the frame. Capture big, scale down.

---

## 2. Framing Rules — full-bleed 9:16, no dead margins

1. **Render the page at 9:16 directly when possible.** Set the Chromium viewport to 1080×1920 (or 540×960 ×2) so the layout reflows vertically. A page built mobile-first should fill top-to-bottom.
2. **Landscape/desktop-only page in vertical:** do NOT letterbox. Choose one:
   - Reflow to a vertical viewport (preferred), or
   - **Crop-to-fill**: scale the landscape capture so its *height* fills 1920 and crop the sides, keeping the subject centered (`scale=-2:1920,crop=1080:1920`). Never `scale=1080:-2` with black bars.
3. **The boring "before" must also be full-bleed.** A small product card floating in grey margin reads as amateur/empty. Fixes (pick one, bake into the before-page):
   - Give the before-page a **full-bleed background** (the shop's own light surface, a soft gradient, or a large blurred version of the product) so no raw empty margin shows.
   - **Push-in framed on the card**, not on the whole empty page — start already tight enough that the card occupies the dominant center mass.
   - Keep believable browser chrome, but ensure chrome + content together fill the frame; no large blank canvas.
4. **No single-color margin > ~8% of frame area** on any edge (see rubric §9.4).
5. **Safe zones:** keep key text/subjects clear of the top ~220px and bottom ~320px (IG UI: caption, profile, buttons).

---

## 3. Motion Rules — gentle, eased, never juddery

1. **Continuous gentle push-in** across a held shot (e.g. scale 1.00 → ~1.06 over the shot). Slow and luxurious, never a fast zoom.
2. **Ease, never constant velocity.** A linear zoom looks robotic. Use ease-in-out so the move accelerates and settles. If using ffmpeg `zoompan`, drive zoom with an eased curve, not a fixed `+0.001` per frame; better, bake the move into the deterministic capture (camera state as a function of virtual time) so easing is exact.
3. **Add subtle motion blur** on camera moves for a filmic feel (`tblend`/`minterpolate` sparingly, or a real shutter in-page). Keep it subtle — no smear.
4. **No judder.** Judder = duplicated/variable frames. Caused by non-CFR capture or wrong fps conform. Prevent with §1.1 + §4.
5. **One motion idea per shot.** Don't push-in AND pan AND rotate. Calm > busy.

---

## 4. 30fps CFR + Frame-Exact Discipline

1. Every source clip → conform to CFR 30 immediately: `-vsync cfr -r 30`.
2. Plan timings in **frames** (1 frame = 1/30s = 33.33 ms). Round all cut points to whole frames.
3. Assemble from frame sequences or CFR clips with the **concat demuxer**; avoid mixing variable-rate sources.
4. After assembly, **verify** with `ffprobe` that `r_frame_rate` and `avg_frame_rate` both read `30/1`.
5. Final master is one continuous 30fps CFR stream; audio muxed last.

---

## 5. Sound-Sync Rules

Music is fixed and authored; the edit serves it.

1. **Map the track first:** note build, the pre-drop silence, the DROP, payoff, and fade. Write down exact timestamps in seconds AND frames.
2. **Reveal/cut lands ON the drop.** The hero swap cut must sit within **±1 frame** of the drop sample (e.g. 7.0s → frame 210).
3. **Honor the pre-drop silence.** A ~0.3s near-silence before the drop = built-in tension. Darken / hold / freeze during it; never fill it with a transition.
4. **Beat-aligned chapter changes.** Each carousel slide / chapter advance lands on a beat or accent in the payoff, not on arbitrary times. Distribute slide changes across musical phrases, holding the final/hero slide longest into the fade.
5. **Fade visual + audio together** at the tail (e.g. 19–20s), so the reel ends, not stops.

---

## 6. Swap / Transition Craft

1. **Match-cut the swap.** Before and after frame the SAME subject in roughly the same position/scale so the eye stays locked — only the world upgrades.
2. **White-bloom flash, frame-tight.** The flash peaks ON the drop frame: ramp up over ~2–3 frames into the cut, hard-cut to the after, decay the bloom over ~3–4 frames. Total flash ≤ ~7 frames so it reads as a hit, not a fade.
3. **Darken-to-tension before the swap.** In the last ~0.3s of the before (during the pre-drop silence), dip exposure/contrast down so the flash hits brighter by contrast.
4. **Hard cut on the beat, never a slow dissolve** for the hero moment. Dissolves are for soft, secondary transitions only.
5. Keep transition vocabulary tiny: one signature swap (flash match-cut) per reel. Don't invent a new transition per slide.

---

## 7. Typography Rules (Pillow PNG overlays)

1. **English only. Lowercase serif.** White serif (e.g. Georgia), lowercase for an editorial, premium tone. No all-caps shouting, no sans hype.
2. **Render as transparent PNG** (no drawtext available). One PNG per text card, overlaid with ffmpeg `overlay` + `fade`.
3. **Upper vs lower third to avoid collisions:**
   - If the live page already shows its own lower-third text (carousel chapter/tagline), put YOUR overlay in the **upper third**.
   - If the page area is clean (the before), lower third is fine.
   - Never stack two texts in the same third at the same time.
4. **Legibility:** add a soft drop shadow or subtle dark scrim behind text so it survives bright/busy backgrounds. Text must pass over both light and dark frames.
5. **Fade timing:** fade each card in ~0.3–0.4s, hold readable, fade out ~0.3–0.4s. Minimum on-screen hold ≈ readable-once + 1s. Never hard-pop text.
6. **One line, maybe two. Short.** A reel caption is a beat, not a paragraph. Keep within the horizontal safe zone (≥80px side padding).
7. **Consistent type system across reels:** same font, case, color, shadow, position logic every time — that consistency is the brand.

---

## 8. Pacing Rules

1. **Hook in frame 1.** Something legible/intriguing on the very first frame — first text card already fading in by ~0.8s, motion already underway. No cold empty start.
2. **A static 'before' may run only as long as it stays alive.** Rule of thumb: **≤ 7s**, and only if it has continuous motion (push-in) AND changing text. If it's just a slow zoom on an empty card, it feels long — cut it shorter or make the frame richer (§2.3). Better: 2 short text beats over the before so something changes every ~2.5–3s.
3. **Payoff rhythm:** after the drop, change something on every musical phrase — new slide, new color world, new lower-third — so the back half never stalls. Hold the hero/final slide longest.
4. **Accelerate into the drop, breathe after.** Tighten attention right before the swap (darken, silence), then let the payoff feel spacious.
5. **End clean:** last ~1s settles on the hero slide and fades. No abrupt stop, no extra dangling beat.

---

## 9. QC / REVIEW RUBRIC — grade before shipping

Run these on the final master. Each is pass/fail. **Ship only at 0 fails on the blocking items (★).**

### Capture & smoothness
1. ★ **Duplicate frames < 5%** — `ffmpeg -i out.mp4 -vf mpdecimate -loglevel debug -f null -` ; count dropped frames / total. (Judder bug = fail. Target ~0% via §1.1.)
2. ★ **CFR 30 confirmed** — `ffprobe` shows `r_frame_rate=30/1` AND `avg_frame_rate=30/1`.
3. **Sharpness** — no macroblocking/smearing on motion; confirm bitrate ≥ ~10 Mbps and CRF ≤ 17 on master. (Auto-fail if `recordVideo` was used anywhere.)

### Framing
4. ★ **No dead margin** — sample frames across the timeline; no single flat-color region covers > ~8% of frame area on any edge. The before fills the frame as fully as the after.
5. **Resolution** — exactly 1080×1920. No letterbox bars. No upscaled-soft regions.
6. **Safe zones** — no key text/subject inside top 220px / bottom 320px.

### Motion
7. **Push-in present and eased** — held shots have continuous gentle move; no constant-velocity robotic zoom; no sudden jumps.

### Sound sync
8. ★ **Hero reveal on the drop** — swap cut within **±1 frame** of the drop (e.g. within frame 209–211 for a 7.0s/210-frame drop).
9. **Pre-drop silence respected** — the ~0.3s before the drop is a held/darkened tension beat, not a transition.
10. **Chapter changes beat-aligned** — every slide/chapter change sits on a musical accent, not a round number; hero slide held longest into the fade.
11. **Tail fade** — picture + audio fade together at the end; no hard stop.

### Transition
12. **Flash is a hit, not a fade** — bloom total ≤ ~7 frames, peaks on the drop frame; before/after match-cut keeps the subject locked.

### Typography
13. ★ **Every on-screen word is English.** No stray Dutch/placeholder text anywhere.
14. **Type system correct** — lowercase white serif, with shadow/scrim; readable over its actual background.
15. **No text collision** — your overlay and the page's own lower-third never share the same third at the same time (upper vs lower split honored).
16. **Text fades, never pops** — each card fades in/out ~0.3–0.4s and holds long enough to read once + ~1s.

### Pacing
17. **Hook by frame 1** — something legible/moving immediately; first text beat in by ~0.8s.
18. **Before not too long/static** — before section ≤ ~7s and has ≥2 changing beats (motion + text), or it's shortened.
19. **No dead stretch** — no >~3s window in the payoff with zero change (slide/color/text).

### Final
20. **Length & container** — exact target duration (e.g. 20.00s), H.264, yuv420p, audio muxed, plays in IG without re-encode artifacts.

---

## 10. One-glance ship checklist

- [ ] Deterministic capture used (or documented why not) — duplicate frames < 5%
- [ ] 30fps CFR confirmed by ffprobe
- [ ] 1080×1920 full-bleed, before fills frame, no dead margin
- [ ] Gentle eased push-in, no judder
- [ ] Swap lands within ±1 frame of the drop; pre-drop silence held
- [ ] Flash bloom ≤ 7 frames, match-cut subject locked
- [ ] All text English, lowercase white serif, shadowed, no collisions, fades not pops
- [ ] Hook in frame 1; before ≤7s with changing beats; payoff never stalls; tail fades
- [ ] Rubric §9 run, 0 blocking (★) fails
