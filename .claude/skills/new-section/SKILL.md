---
name: new-section
description: Scaffold a new cinematic section from the shared engine. Use when starting a new section type / new client demo / new entry for the library. Creates sections/<slug>/ with engine + a ready-to-edit config.js + minimal index.html.
disable-model-invocation: true
---

# new-section

Spin up a fresh section that reuses the canonical engine (`engine.js` + `engine.css` from `launch/`)
so you only ever edit one file: `config.js`. Paths relative to the unit root (`cinematic-section/`).

## Use
```bash
.claude/skills/new-section/new-section.sh <slug>     # e.g. sneaker-drop
```
Creates `sections/<slug>/` with `engine.js`, `engine.css`, `index.html`, a template `config.js`,
and a placeholder product PNG.

## Then
1. Drop a background image + a transparent product PNG into `sections/<slug>/`.
2. Edit `config.js` — title, `glow` hex, `mood` (`aqua` | `abyss` | `crystal` | `verde`), image
   names. Add more worlds by copying a `{ ... }` line.
3. Preview (desktop + mobile screenshots): `.claude/skills/run-cinematic-section/driver.sh sections/<slug>`.

## Notes
- `mood` drives the ambient feel: aqua=light-sweep, abyss=fog, crystal=sparkles, verde=falling motes.
- The engine is null-safe — arrows/dots are optional; a single-world section works fine.
- Don't edit `engine.js/.css` per section; they're the shared machine.
