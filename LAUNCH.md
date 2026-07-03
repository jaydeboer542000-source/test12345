# LANCERING — reel + funnel samen live

> Regel: **funnel eerst klaarzetten, reel als laatste posten.** Zo landt "link in bio" altijd op iets dat werkt.

Alles staat klaar. Jij hoeft alleen de stappen onder **"JOUW STAPPEN"** te doen — de rest is gebouwd.

> **STATUS update:** MailerLite-formulier is gemaakt **en al in de pagina gewired** (account 2478661, form KyKPjd). De hero toont nu één knop **"Get the free section"**; die opent een rustig donker **paneel** met het formulier (desktop = kaart in 't midden, mobiel = bottom-sheet, toetsenbord-veilig). Getest desktop + mobiel. → Stap 1 (MailerLite-form) is dus klaar; jij hoeft alleen nog **deployen + bio-link + auto-levering** (+ later de reel).

---

## DE 3 MAPPEN (in `cinematic-section/`)

| Map | Wat | Waarvoor |
|-----|-----|----------|
| `launch/` | De **landingspagina** (nu: Milano-rebuild-demo als bewijs + e-mailformulier = **wachtlijst voor de rebuild-dienst**). | Dit sleep je naar Netlify → wordt je bio-link. |
| `magnet/` | De gratis give. **Nieuwe invulling:** niet meer de watch-ZIP maar de Milano-case (before/after + hoe het werkt). | Dit krijgen mensen ná hun e-mail. |
| `reel/` | De **"before"** = de échte saaie klantsite (Milano). | De eerste seconden van je before/after-reel. |

> **Reel-regel (hard):** de reel = opname van de **echte engine-pagina via Playwright** (deterministische capture, zie REEL_BLUEPRINT.md) — geen canvas-namaak. En: gebruik je scraped foto's in publiek materiaal, dan altijd de **demo-only fotodisclaimer** in beeld/caption.

---

## JOUW STAPPEN (de enige dingen die ik niet kan doen)

### 1. MailerLite (e-mail opvangen) — gratis
1. Ga naar **mailerlite.com** → Sign up (EU-servers, GDPR-veilig).
2. Klik de bevestigingslink in je mail (verifieert je afzender → minder spam).
3. Links: **Subscribers → Groups** → maak groep **"Free section signups"**.
4. Links: **Forms → Embedded forms → Create form**. Naam: "Free cinematic section", kies die groep.
5. In de editor: hou **alleen het e-mailveld** (minder velden = meer inschrijvingen), knoptekst "Send me the section".
6. Voeg de **GDPR-checkbox** toe met tekst: *"I agree to receive the free file and occasional emails. Unsubscribe anytime."*
7. Zet **double opt-in** AAN (schoonste GDPR-bewijs). Accepteer eenmalig de **DPA** onder Account settings.
8. Succesbericht: *"Thanks! Your free section is on its way — check your inbox."*
9. **Embed code:** Forms → Embedded forms → jouw form → Overview → "Embed form" → **HTML tab → Copy** → **plak die code aan mij in de chat**. Ik zet 'm in de pagina (jij raakt geen code aan).

### 2. Netlify (pagina online) — gratis
1. Open **netlify.com/drop**.
2. Sleep de **`launch/`-map** op het vlak → enkele seconden → live URL.
3. Klik **Sign up / Claim site** (Google-login) zodat hij blijft staan.
4. **Site settings → Domain management → Edit site name** → maak er bv. `jay-webdesign.netlify.app` van. Kopieer die URL.
5. Test: open de URL, vul je eigen e-mail in, check dat hij binnenkomt.
6. **Updaten later:** Deploys-pagina → nieuwe map erop slepen. Geen code.

### 3. Bio-link
- Instagram-app → **Edit profile → Website** → plak je netlify-URL → Save. Dát is je funnel-ingang.

### 4. Auto-levering (1× instellen, dan klaar)
- MailerLite → **Automations** → trigger "joins waitlist" → action "send email" met de welkomstmail (Milano-demo-link, zie hieronder). Daarna gaat levering vanzelf.
- (Tot dat staat: lever met de hand — Gmail-template hieronder.)

### 5. Domein
- **Niet nu.** `netlify.app` is prima bij 0 volgers. Later (na je eerste tractie + studio-naambesluit): Cloudflare Registrar ~$10/jaar (`jaydeboer.com` / `jay.design`).

---

## ALLE TEKSTEN (klaar voor gebruik)

### Bio (staat al goed)
```
I make websites that move like a movie.
Scroll down and watch them come alive.
↓ See it
```
Naam-veld: `Jay de Boer • Cinematic Web Design`

### Welkomstmail
**Onderwerp:** `See a boring website come back to life ↓`

```
Hey, Jay here.

Thanks for joining the list. Here's what I do: I take a real local business's
boring website and rebuild it as a cinematic experience — same brand, same
facts, but it moves like a movie.

See the first one live (a real barbershop, real data, demo photos):
[Milano demo link]

Scroll it on your phone — that's the whole pitch.

If you (or someone you know) has a site that just sits there, reply to this
mail and I'll show you what yours could look like. First look is free —
you only pay if you want it live.

— Jay
I make websites that move like a movie.
Instagram: @jay.webdesign
```

### Het aanbod (wat de wachtlijst is)
> Waitlist for the **cinematic rebuild service**: I rebuild your existing site as a cinematic experience — real brand, real facts, built to move. You see a free demo of YOUR site first; you only buy when you love it. (Prijs — rebuild + Care Plan — staat alleen op de bio-pagina, niet in posts.)

---

## DE BEFORE/AFTER-REEL (opnemen + posten als láátste)

**Lengte:** ~15–20s, 9:16, loop. **Haak:** de échte saaie klantsite (Milano) die tot leven komt als cinematic demo.

**Verhaal:** 0–3s = de echte oude site (before, full-bleed, push-in) → swap op de muziek-drop → de cinematic Milano-demo, scène voor scène (TONEEL-vorm) → eindkaart `@jay.webdesign`.

**Harde regels:**
- Reel = **opname van de echte engine-pagina via Playwright** (deterministische virtual-clock capture, 30fps CFR) — nooit canvas-namaak, nooit `recordVideo`. Volledige craft + QC-rubriek: `REEL_BLUEPRINT.md`.
- Klantpagina in beeld mag NL zijn; overlay-tekst blijft Engels.
- Scraped foto's in beeld → **demo-only fotodisclaimer** in beeld of caption.
- Geen bedragen in de caption; zachte CTA ("link in bio").
- Browser-frame in beeld = leest als wébsite. Laatste frame = frame 1 (naadloze loop). Exporteer 1080×1920. Check op je telefoon mét geluid.

**Hashtags:**
`#webdesign #scrollanimation #motiondesign #webdevelopment #frontend #uidesign #awwwards #creativecoding #webdesigninspiration #uxdesign #interactiondesign`

**Audio:** trending, rustige/cinematische track uit Instagram's eigen Reels-bibliotheek (licentie geregeld). Beat-drop = precies op de before→after-swap.

---

## VOLGORDE (snelste pad, geen lek)
1. ✅ (klaar) Pagina + magnet + before-frame gebouwd
2. ✅ (klaar) MailerLite-form gemaakt
3. ✅ (klaar) Embed in pagina gewired → `launch/`-map
4. **Jij:** Netlify-deploy + subdomein + test met eigen mail
5. **Jij:** auto-levering aanzetten (welkomstmail + ZIP-link)
6. **Jij:** netlify-URL in bio
7. **Jij:** reel opnemen + stitchen → **als laatste posten** (bio-link werkt nu)
