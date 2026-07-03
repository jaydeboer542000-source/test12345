# AGENTS.md — rules for any AI working in this project

This file is the source of truth for how an AI (Claude Code CLI, the embedded dashboard agent, or any other) should work in the Cinematic Rebuild project. Read it first.

## What this project is
"Cinematic Rebuild" — turn a local business's boring website into a cinematic one, mostly automated. **Any local business** (restaurant, gym, florist, dentist, barber…) — barber examples in this file are just examples, never a constraint. Founder = Jay (solo, Dutch). Sell cinematic rebuilds at **~€1.500–2.500** + a **Care Plan ~€79/mo** (the recurring engine: 32 care clients = €2500/mo). **Jay's role = thumb-giver: he approves/rejects, zero manual design work.** Command center lives in `platform/` (see `platform/VISION.md`).

## Absolute rules (non-negotiable)
1. **Never fabricate client data.** No invented hours, prices, reviews, ratings, addresses, phones, taglines, or brand colors. Extract the REAL data first (their site, Google Places, Facebook) and build from truth. If a fact is missing → mark `needs-confirm`, never guess. (This has failed before — it is the #1 rule.)
2. **Client site language = the client's local audience.** A Wijchen barber = Dutch. Jay's own marketing (reels/IG) = English. Do not force English onto a client site.
3. **Match the real brand.** Colors/fonts/tone come from the client's real identity (e.g. Kapsalon Milano = red #D8222A on white, NOT generic dark/gold).
4. **Photos = the main character, and must be real.** Cinematic = real stills brought to life (CSS/JS motion; optionally Replicate image-to-video on REAL photos, only after Jay approves — NEVER Higgsfield/Veo/Runway, they cost money). NEVER generate a fake interior/storefront. For a paid live site the photos must be client-owned (client sends / quick shoot); scraped Google/FB photos are `demo-only`.
5. **Verify before claiming done.** Run the QC gate (below). Watch/scrub the real output — never call something finished from a single still or an unrun check. Open the result for Jay after making it (`open <file>`).
6. **QC gate is fail-closed.** No real source = don't show it. No mobile check = not done. `status.json.qc.pass` stays false until every check passes.

## Data contracts (files under platform/)
- `clients/<slug>/business.json` — the ONLY content source of truth (real data + `needs-confirm` flags). No design/CSS values in it.
- `clients/<slug>/status.json` — `stage` enum (available→contacted→demo_built→sent→replied→sold→live) + `flags` (building/needs_revision/paid/has_questions/wants_meeting) + `lead` score + `qc`.
- `clients/<slug>/activity.jsonl` — one JSON per line {ts, stage, msg, ok}.
- `clients/<slug>/site.html` — the rendered cinematic site (config-driven from business.json).
- `clients/index.json` — derived cache of all clients (rebuilt when a status changes).

## QC gate checklist (all must pass before a demo is shared)
- 0 fabricated facts; every shown fact traces to a real source or is omitted.
- Client language correct (Dutch for a local NL business).
- Brand colors match the real brand.
- Legible text over imagery; no dead margins; mobile (390px) looks great.
- Loads fast; hero present; honest "demo / photo source" note where using scraped imagery.

## Agents available
- `site-mapper` (.claude/agents) — crawls the client's CURRENT site and records its real structure into business.json.site_structure (pages, nav, hub/spoke). RUN THIS BEFORE rebuilding — a rebuild must honor the real structure (e.g. Milano = homepage that links to two branch pages, each with its own hours/phone → both branches represented, not merged).
- `cinematic-designer` (.claude/agents) — BUILDS a client site in their real house-style from business.json (incl. site_structure). Never fabricates.
- `visual-design-critic` (.claude/agents) — critiques only, never builds. One of the jury lenses.

## Fixed build steps (the wow-machine — every build, in this order)
**Eén bouwer per bestand:** never run two build/fix processes on the same site.html simultaneously (2026-07-03: two parallel runs corrupted each other's jury rounds). Check for running builds before starting a new one.

0. **LAAD HET FUNDAMENT: `platform/lib/`** — motion-tokens.css (beweging komt ALLEEN hieruit), typografie-recepten.md (kies één duo), blokken/ (start van bewezen bouwstenen, bouw daarop voort), grain-licht.css (standaard korrel+licht), referentie/ANKER.md (de jury vergelijkt hiertegen). Na elke build MOET `node platform/lib/craft-lint.mjs <site.html>` slagen VÓÓR de jury-lus. Geen fundament geladen = niet bouwen.
1. **Concept-trekker** — BEFORE building: distill THE ONE brand idea from logo/name/real data into `concept.json` (the red thread every scene must serve).
2. **Build to THE FORM** (below), driven by concept.json.
3. **JURY LOOP** (replaces a single visual-design-critic pass): **6 lenses** score the site using REAL screenshots (desktop + 390px) — concept/red-thread, typography/luxury, motion craft, honesty/data, mobile, **deelbaarheid** (can a partner watching at 22:30, with zero explanation, tell what this is, why it's good, and what the next step is? — see `platform/lib/verkoop-regels.md`). Each lens gives a score /10 + top fix. A fixer applies the fixes. **Repeat until ALL scores ≥ 8.** Write rounds to `status.json.jury.rondes` and final scores to `status.json.jury.eind`. No jury pass = not built.
4. Decor via the photo-picker/Replicate flow (THE FORM), then the QC gate.
5. **POORTWACHTER (server-side, fail-closed)** — after every build/qc run the SERVER itself verifies the evidence: craft-lint passes (allowlist: every image is approved, decor or brand asset) + `jury.eind` all ≥ 8 with `jury.rondes` as work-proof + `qc.pass` true **with qc screenshots on disk newer than site.html** + photo approvals anchored to Jay's real photo-picker clicks (`platform/approvals/<slug>.json`, written only by the server). Verdict lands in `status.json.gate`; `gate`/`qc`/`jury` are stripped from any incoming status patch, evidence is wiped at build start and invalidated when chat edits site.html, and the sent/live gate re-runs fresh every time. Without a passing gate the run is registered as FAILED, the dashboard shows "Concept — nog niet goedgekeurd" and the stage can never move to sent/live. The AI never approves its own work — typing "done" without evidence does nothing.

**Milano lesson (2026-07-02, jury scored 3–5.5):** the failure mode is not missing effects but an UNFINISHED IDEA — pick the one concept, give the site a continuous NARRATOR (one line/voice/element that carries through every scene) and a clear MAIN CHARACTER, and finish that idea end-to-end. Top fix was: make the narrator continuous.

## THE FORM (learned 2026-07-02 via Milano v3→v5 — this IS the wow, don't rediscover it)
- **Every client site is a STAGE (toneel):** ONE viewport height, pinned. Scrolling goes DOWN (natural thumb gesture — Jay definitief 2026-07-03, drie keer bevestigd: nooit zijwaarts), and the scenes change INSIDE the fixed frame as you scroll: each scene cinematically hands over to the next VERTICALLY (departing scene rises and fades, new scene comes up from below — filmic transitions, not hard swaps), snap on scene-COMPLETE. Progress dots. NEVER endless stacked sections. **Hard enforced:** craft-lint check 9 rejects any horizontal scene strip (x-tween on viewport width / 100vw-flex-strook) — a sideways build cannot pass the poortwachter anymore (this slipped through in Milano v6; never again).
- **Decor videos SCRUB with scroll** — background video time is driven by scroll position (the thumb moves the film), never plain autoplay-loop. Requires the server's Range-support (present) and preload.
- **Scene order:** brand entrance → promise/ritual → PROOF (reviews before the ask) → offer/locations → prices → booking finale. Practical info (full hours/addresses) lives in the footer.
- **Line/graphic accents: SUBTLE.** Thin, slow, max ONE small gesture per scene (an underline drawing itself, a dot appearing), NEVER through text. Scene 1 may have one elegant arc through empty space (time-driven, visible without scrolling).
- **Backgrounds = Replicate decor, chosen by Jay:** per scene 2-3 abstract mood candidates (brand colors, silk/light/paper textures, NO text in image, NO fake interiors) → Jay picks via the dashboard photo-picker → only winners ship. Stills first (~€0.05), motion only after approval.
- **CTA visible from first paint** (floating button + mobile sticky bar) — verify on a FRESH load.
- Wow = this form + the craft rules below, executed strictly. Not more effects.

## COPY RULES (Jay, 2026-07-03 — a dedicated TEXT jury lens enforces these)
- **The form is invisible to the visitor.** NEVER let build metaphors leak into visible text: no "scène", "akte", "het doek", "programma", "slotapplaus", "toneel" on a client site. A barber talks like a barber, not like a theater.
- **Say everything ONCE.** Each fact (hours, addresses, "met en zonder afspraak", pin-info) appears exactly one time in the flow; the footer is the only allowed second place for practical info. One CTA-repetition max (floating button doesn't count).
- **No filler scenes.** If a scene only repeats what an earlier scene said, the scene must be cut or given unique content.
- **Natural warm Dutch (je/jij), short sentences, zero jargon.** Read every line aloud-test: would the owner say this to a customer? If not, rewrite.
- Jury lens "tekst & toon" scores /10 on exactly these rules, quoting offending lines verbatim.

## Cinematic craft rules (what makes it NOT AI-slop)
- **One idea per site.** Pick a single cinematic concept from the client's world (barber = the ritual: chair, mirror, clippers) and let every section serve it. No grab-bag of effects.
- **Typography does the luxury.** One display face + one text face, big confident hero type, generous whitespace. Never more than 2 fonts, never default system-look.
- **Motion = slow and physical.** Scroll-driven reveals, subtle parallax on real photos, ease-out everything. Duration ≥ 600ms, movement ≤ 40px. NO bouncy easing, NO floating cards, NO particle demos, NO spinning icons.
- **Light and depth from the photos.** Real photos full-bleed; depth via gradients/overlays sampled from the photo's own tones — not generic dark-luxury.
- **Fly-through hero (when available):** a Luma walkthrough video of the real space beats everything as hero. Until then: slow Ken Burns on the best real photo.
- **Banned as DEFAULTS** (AI reaches for these without reason — that's what makes slop): stock-photo look, gradient-purple SaaS vibes, dark-gold "luxury" template feel, bouncy easing, particles, floating cards, emoji as icons. Exception: any of these MAY be used as a deliberate brand choice when the client's identity clearly calls for it (toy store → playful bounce; club → neon) — but only with an explicit reason AND Jay's approval. Never as filler.
- **Always banned, no exceptions:** fake metrics, invented testimonials, fabricated facts, fake interiors.
- **The 1-thumb test:** Jay scrolls it once on his phone — if nothing makes him stop, it's not done.

## Structure & sales-asset rules
- Always capture `site_structure` (via site-mapper) before a rebuild so the new site reflects how the real one is organized.
- **Walk the WHOLE route:** visit every page of the client's real site, and grep the raw HTML for third-party widgets (salonized/treatwell/booksy/planity, chat, pixels) — text-readers miss script-injected buttons. A booking widget = the client's real conversion route; the rebuild must keep/mirror it (e.g. floating "Maak afspraak").
- Scraped/streetview photos require Jay's confirmation before use (wrong-building/outdated risk — happened with Milano). Craft-lint enforces this: any `assets/scraped/` or `*streetview*` reference must be in `business.json.photos.approved`.
- **Scraped/streetview photos are NEVER background wallpaper.** Washing a raw client photo dark and centering text over it = the standard-template failure (Duo 4 You, 2026-07-03). Real photos are a HERO (framed, composed, captioned — like Milano's branch cards) or they don't appear. Scene atmosphere comes from Replicate decor. Without strong approved photos → the held-formule (see Stijl-les). Craft-lint rejects real photos in CSS backgrounds or decor layers.
- The before/after comparison (old site vs cinematic) is a SALES/pitch asset for the DASHBOARD — NOT a section inside the client's own site. Never bake "here's how bad we used to look" into a client's product.

## Reference
- `REEL_BLUEPRINT.md` — cinematic craft + QC rubric for reels.
- `platform/VISION.md` — the command-center product vision + roadmap.
- `platform/lib/verkoop-regels.md` — sales rules (BM-BASIS + BM-VERSNELLER distilled) for every outreach mail, follow-up and demo delivery; also defines the "deelbaarheid" jury lens.

## Les 2026-07-03 (Duo 4 You): regels zonder handhaving zijn wensen
A fast cheap build (237s, $2.58) skipped the jury loop, used scraped photos as dark wallpaper before Jay's approval, and still got a green checkmark — because "done" was defined as "the process exited", not "the evidence exists". Fix: the server-side POORTWACHTER (build step 5). The failure mode to watch for: an agent that *narrates* compliance ("jury done, all ≥8") without artifacts. Never trust the narration; check `status.json.jury.eind`, `qc.pass`, craft-lint output.

## Stijl-les (2026-07-03, hard bewijs uit jury-runs)
Wit/papier-minimalisme ZONDER echte foto's plafonneert op jury-score ~6 (drie runs, drie rondes elk, nooit ≥8 — en Jay's duim zei hetzelfde). De bewezen wow-formule zonder klantfoto's = de AURELIAN/NERO-aanpak: donkere sfeerwereld (Replicate) + één zwevende HELD in merk-gloed + grote typografie. Wit werkt pas als er sterke echte fotografie is. Kies de formule op basis van beschikbare assets, niet op smaak-gok.
