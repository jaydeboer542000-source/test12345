# Command Center — VISION

The `platform/` dashboard must be a **workplace**, not a viewer. Jay operates his whole Cinematic Rebuild business from here — ideally by talking to an AI inside the dashboard instead of the Claude Code terminal.

**Business model:** rebuild **€1.500–2.500** + **Care Plan ~€79/mo** (recurring engine: 32 care clients = €2500/mo). **Jay = thumb-giver:** he only approves/rejects (photos, decor, demos, mails) — zero manual design work; the machine does the building.

**The wow-machine (what "Bouw site" must run):** concept-trekker (brand idea → concept.json) → team build to THE FORM (AGENTS.md) → **jury loop** (5 lenses score real screenshots, fixer fixes, repeat until all scores ≥ 8) → decor factory (Replicate stills → Jay picks → motion only after approval) → QC gate fail-closed.

## What Jay wants (his spec)
1. **Summary tiles** (top): 9 clickable count-tiles — klanten, afgerond, beschikbaar, nog bezig, aanpassing nodig, gecontacteerd, hebben betaald, hebben vragen, willen meeting. Click a tile → filtered client list.
2. **Lead list**: prospects from the lead-finder, each with a **circular success-probability gauge** (ring, % centered, color red→amber→green by chance). Best on top. See at a glance what's worth it.
3. **Per-client MAKER WORKSPACE** (click a client): tools to build the site —
   - **Photo sourcing**: view photos scraped from Google Places AND their own website; pick which to use.
   - **Contact / email drafter**: generate a reviewable/editable Dutch email; incl. an "ask for photos" mail ("stuur ~8 foto's van je zaak, nodig voor de site"). Never auto-send.
   - **Website builder**: (re)build `site.html` from `business.json` + selected photos, then QC.
   - **Embedded AI chat**: work on the site by talking to the AI, right here.
4. **Operate via AI in the dashboard, not the CLI** — "talk to Claude through the project". All rules/skills/working-methods live in FILES (`AGENTS.md`, `.claude/`) so any agent can load them.

## Architecture (resolved)
- **One small local Node server** (`platform/server.mjs`, ~150-200 lines) replaces the static `http.server`. Serves the folder **+ `/api/*`** (status/activity writes, build, chat). This single change unblocks writes, tools, chat, and the QC gate.
- **Data model**: `status.json` = one `stage` enum (available→contacted→demo_built→sent→replied→sold→live) + independent `flags` (building/needs_revision/paid/has_questions/wants_meeting) + `lead` score + `qc`. `index.json` = derived cache, rebuilt when a status changes. `status.json` is truth.
- **Tiles = queries** over stage+flags (counts overlap on purpose).
- **Lead score** (transparent, no ML): `BUDGET` (ads, multi-location, review count/rating, domain age, niche fit) and `NEED` (site badness, not-mobile, no-https/slow, stale design) → `core = .55·BUDGET + .45·NEED`, gated by `reach` (email/phone/IG). `score = round(100·core·reach)`. Bands: 0-39 red, 40-69 amber, 70-100 green. Flaky-to-scrape signals contribute only with confidence, else 0 (never guessed).
- **Gauge**: pure SVG (two concentric circles, dashoffset by %, `hsl(pct*1.3 70% 45%)` continuous color). Same component at 72px (rows) and 140px (header).
- **Embedded AI**: week-1 prototype = chat route shells `claude -p --output-format stream-json` in the client dir (reads AGENTS.md + .claude/agents for free). Destination = Claude Agent SDK (scoped file tools, reuses cinematic-designer + visual-design-critic). Anthropic key server-side (`~/.config/cinematic/anthropic.env`). MCP later so CLI + dashboard share tools.

## QC gate (mandatory, fail-closed)
The AI may never falsely call things done. No real source = don't show. No mobile check = not done. Guards the fabrication failure that happened before. See `../AGENTS.md`.

## Roadmap (fastest-to-value first)
- **Step 1 ✅ DONE**: local `server.mjs` (files + `/api`) + working "Bouw site" button that calls the AI + the QC gate. "Work via dashboard" proven.
- **Step 2**: embedded chat panel (talk to the AI per client).
- **Step 3**: summary tiles + tile→list→detail nav + lead list with gauges.
- **Step 4**: maker tools — **photo-picker ✅ DONE** (`/api/assets` + `/api/photos-select`), **email drafter ✅ DONE** (`/api/draft`); contact log still open.
- **Step 5**: lead-finder feeding real prospects; Places/Street-View photo tools; Replicate image-to-video on real photos — **only after Jay's approval per render** (Higgsfield/Veo/Runway are banned, cost money).
- **Step 6**: the jury loop as a first-class dashboard action (lens scores visible per client, rebuild until ≥8).

## 10x horizon (worth doing, ranked)
1. **Before/after slider** — their old site vs the cinematic rebuild, as a **DASHBOARD/pitch asset** (and outreach material). NEVER inside the client's own product/demo site (see AGENTS.md: never bake "how bad we used to look" into a client's site).
2. **Demo view-tracking** — notify when a prospect opens the demo link (buying signal → time the follow-up).
3. **Auto follow-up sequence** — drafted, Jay approves; most sales are in the follow-up.
4. **One-click deploy + expiry** — secret URL, auto-delete after N days (GDPR story built in).
5. **"Photo shoot in a box"** — a 1-page guide so clients send great photos (fixes the imagery bottleneck at the root).
6. **Care Plan hooks** — the client CMS/login = recurring revenue; design demos to upsell it.
7. **Performance/Lighthouse as a selling point** — "your old site scores 40, this scores 98".

## Known v1 fixes (from code critique)
- (fixed) dashboard read English day-keys / `reviews.google` while data uses Dutch keys / `google_centrum` → showed false data.
- Add server-side validation on writes; QC gate before any "sent/deploy"; auth on send actions; don't trust browser to be truth.
