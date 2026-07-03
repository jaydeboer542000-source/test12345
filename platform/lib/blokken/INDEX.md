# Winnaars-bouwstenen — INDEX

Dit zijn de BEWEZEN stukken uit de Milano-build (site.html + drafts/site-v15-toneel-jay.html),
gedestilleerd tot losse blokken. Doel: elke bouwer (ook een dommer model) laadt deze in
en produceert automatisch high-end — de kwaliteit zit in de bestanden, niet in het model.

**Lees eerst `/Users/jaydeboer/cinematic-section/AGENTS.md`.** De blokken volgen THE FORM;
de regels daar (nooit data verzinnen, echte merk-kleuren, mobiel-gate, QC fail-closed)
gelden altijd.

## Hoe je een blok gebruikt (voor elke bouwer)
1. Open het blok — bovenin staat een commentaarblok met precies hoe het werkt.
2. Elk blok is een zelfstandige .html: open hem direct in de browser om hem te zien.
3. Kopieer CSS + HTML + JS naar de klant-site. Pas ALLEEN de CSS-variabelen in `:root`
   aan (merk-kleur, fonts) en vul echte data uit `business.json` in.
4. Alles wat `(vervang)` of `VERVANG-MIJ` heet MOET vervangen worden door echte data.
   Onbekend feit = weglaten + `needs-confirm`. Nooit gokken.
5. Elk blok heeft een nette terugval: reduced-motion / geen GSAP → statische, leesbare pagina.

## De blokken

| Blok | Wat het is | Wanneer gebruiken |
|---|---|---|
| `01-toneel-stage.html` | Het gepinde toneel: één 100svh-kamer, scrollen wisselt scènes met kalme crossfades, **snap op scène-COMPLEET** (rustpunt op p≈0.7), voortgangsstipjes rechts, statische terugval. Levert de helpers `frac`/`comp`/`fadeUp` en het `window.SCENES[n](p, gsap)`-contract. | **Altijd** — dit is THE FORM, het skelet van elke klant-site. Nooit eindeloos gestapelde secties. |
| `02-maak-afspraak-cta.html` | De conversie-route: zwevende "Maak afspraak"-knop rechtsonder (desktop, met mini-keuzemenu bij meerdere vestigingen) + mobiele sticky balk onderin (≤640px, safe-area-proof). **Zichtbaar vanaf de eerste paint** — geen scroll-drempel. | **Altijd** als de klant een boek-route heeft (eigen widget: Salonized/Treatwell/…). Link ALTIJD naar hun echte widget, nooit een nep-formulier. Check op een verse load, desktop én 390px. |
| `03-prijslijst-leaderlijnen.html` | Menukaart-prijslijst: naam + stille duur …puntjeslijn… prijs. Plus het **knip-accent**: regels worden regel-voor-regel van links naar rechts open-geclipt. Werkt los (IntersectionObserver) of in het toneel via `PRIJSLIJST.knip()` in een scène-callback. | In de prijzen-scène (vlak voor de finale). Knip-accent past bij kappers/knippen; ander vak → alleen fadeUp, knip weglaten. Alleen echte prijzen. |
| `04-reviewscore-finale.html` | Het bewijs-moment: kop met één zelf-tekenende onderstreping (het enige lijn-gebaar), grote exacte reviewscores + aantal stemmen, verplichte bron-regel. Geen tel-animatie — het echte cijfer verschijnt exact. | In de bewijs-scène, **vóór** het aanbod/de vraag (THE FORM: proof before the ask). Score onbekend → blok weglaten, nooit verzinnen. |
| `05-footer-praktisch.html` | Rustig einde ná het toneel: naam + belofte, per vestiging adres/telefoon/mail/openingstijden-tabel/boek-knop, praktisch-regel, en de **verplichte demo-notitie** (eerlijk over databron + peildatum). Beweegt niet. | **Altijd.** Alle praktische info woont hier — de scènes blijven schoon. Demo-notitie mag pas weg als de site live + betaald is met klant-materiaal. |
| `06-logo-deeltjes-overgang.html` | Het echte logo lost bij het scrollen op in deeltjes (knip-metafoor) als overgang scène 1 → 2; terugscrollen zet het exact terug. Canvas sampelt de échte logo-pixels — scherp, juiste merkkleuren, deterministisch (geen timers, geen AI-video die letters vervormt). Contract: `LOGODEELTJES.init({img,canvas})` + `LOGODEELTJES.scrub(p)` vanuit de scène-motor. | Als de klant een sterk logo heeft en de scène-1-overdracht een statement mag zijn. Niet stapelen op andere grote gebaren (max één gebaar per scène). Terugval: reduced-motion/mobiel-statisch → logo blijft gewoon staan. |

## Standaard-opbouw van een klant-site (de blokken samen)
```
<body>
  blok 01  → #stage-wrap met scènes in THE FORM-volgorde:
             entree → belofte → BEWIJS (blok 04) → aanbod → prijzen (blok 03) + finale
  blok 05  → footer ná het toneel
  blok 02  → CTA-lagen (fixed; plek in de HTML maakt niet uit, onderaan is netjes)
</body>
```
Decor: per scène een `.decor-video` (Replicate-decor, door Jay gekozen via de photo-picker)
achter de inhoud — nooit als hoofdrolspeler, opacity ~0.28.

## Craft-regels die in de blokken gebakken zitten (niet slopen)
- Motion traag en fysiek: duur ≥ 600ms, verplaatsing ≤ 40px, ease-out; geen bounce.
- Max één klein lijn-gebaar per scène, nooit door tekst.
- Reveals klaar op p=0.6 (`comp`) zodat elk snap-rustpunt een compleet beeld toont.
- `prefers-reduced-motion` + geen-GSAP → volwaardige statische pagina.
- Mobiel (390px) is een gate, geen bijzaak: elke laag heeft een mobiele variant.
