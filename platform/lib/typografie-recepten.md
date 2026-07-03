# Typografie-recepten (letter-recepten)

Simpel gezegd: **de letters doen de luxe.** Niet de effecten.
Dit bestand kiest de letters VOOR je. Bouwer: kies het gevoel dat bij de klant past,
pak één duo uit dat gevoel, en neem de maten letterlijk over. Niet zelf mixen.

Harde regels (uit AGENTS.md, herhaald zodat je ze niet mist):

- **Maximaal 2 lettertypes per site.** Eén display (de kop) + één tekst (de rest). Nooit drie.
- Het duo moet passen bij de ECHTE identiteit van de klant. Heeft de klant al een
  herkenbaar lettertype in z'n logo/huisstijl? Dan zoek je het duo dat DAAR bij hoort,
  niet je eigen smaak.
- Alles hieronder is **Google Fonts** (gratis, altijd laadbaar).
- Laad ALLEEN de gewichten die het recept noemt (sneller = beter).

---

## 1. De maat-basis (geldt voor ÉLK duo)

Dit is het skelet. Elk duo hieronder zegt alleen wat er ANDERS moet (letter-spacing,
gewicht, regelhoogte). De rest is altijd dit:

```css
/* DISPLAY-KOP — de held van scene 1. Groot en zelfverzekerd. */
.display {
  font-size: clamp(3rem, 11vw, 8.5rem);   /* mobiel nooit onder 3rem, desktop max ~136px */
  line-height: 1.0;                        /* koppen staan strak op elkaar */
  letter-spacing: -0.02em;                 /* per duo aangepast, zie recepten */
}

/* SCENE-KOP — de kop van elke volgende scene, kleiner dan de held */
.scene-kop {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.08;
}

/* SUBKOP — de zin onder de kop */
.subkop {
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
  line-height: 1.4;
  /* meestal het TEKST-font, licht gewicht (300-400), NIET het display-font */
}

/* BODY — gewone lopende tekst */
.body {
  font-size: clamp(1rem, 1.1vw, 1.125rem); /* 16-18px */
  line-height: 1.65;
  max-width: 62ch;                          /* regels nooit te breed */
}

/* KICKER-LABEL — het kleine kapitalen-label met nummer dat award-sites gebruiken.
   Voorbeeld: "01 — HET AMBACHT" klein boven een scene-kop. Dit is 50% van de
   premium-look en kost bijna niks. ALTIJD gebruiken boven elke scene-kop. */
.kicker {
  font-size: 0.75rem;                       /* 12px, klein en netjes */
  text-transform: uppercase;
  letter-spacing: 0.22em;                   /* véél lucht tussen de kapitalen */
  font-weight: 500;
  font-variant-numeric: tabular-nums;       /* nummers even breed: 01, 02, 03 */
  opacity: 0.65;                            /* iets terugliggend, nooit schreeuwen */
}
/* HTML-patroon: <p class="kicker">01 · Het ambacht</p>
   Scheidingsteken: een dun streepje (—), puntje (·) of 24px-lijntje. Kies er één
   en gebruik OVERAL dezelfde. Het nummer telt de scenes: 01, 02, 03… */
```

Extra basisregels:

- Subkop en body komen ALTIJD uit het tekst-font, nooit uit het display-font.
- Display-font gebruik je alleen groot (koppen). Nooit voor body — veel display-fonts
  zijn op klein formaat slecht leesbaar.
- Cijfers in prijzen: gebruik het tekst-font met `font-variant-numeric: tabular-nums`.
- Witruimte is deel van het recept: boven een kicker minimaal 1 lege "ademruimte"
  (±8-12vh in een scene), kicker → kop ±1rem, kop → subkop ±1.25rem.

---

## 2. De duo's per gevoel

Per duo: exacte namen + te laden gewichten, waarom het werkt, wat er afwijkt van de
maat-basis, en wanneer het duo NIET past.

### GEVOEL A — Warm-ambachtelijk
(bakker, barbier, koffiebar, brouwerij, schoenmaker — "handen die iets maken")

**A1. Fraunces + Work Sans** ⭐ eerste keus
- Laden: Fraunces 500 + 600 (met `opsz` as als beschikbaar), Work Sans 400 + 500.
- Waarom: Fraunces heeft zachte, bijna handgetekende krullen — voelt als een oud
  uithangbord maar dan modern. Work Sans is nuchter en warm, vecht er niet mee.
- Afwijking: display letter-spacing `-0.015em`, gewicht 600, line-height 1.02.
- Past NIET bij: strakke tech, tandarts/klinisch, sportschool.

**A2. DM Serif Display + DM Sans**
- Laden: DM Serif Display 400 (+ italic), DM Sans 400 + 500.
- Waarom: zelfde ontwerpfamilie, dus ze passen als vanzelf. DM Serif heeft hoog
  contrast (dik/dun) → chique maar toegankelijk. Veilige warme keus.
- Afwijking: display letter-spacing `-0.01em`; de italic mag voor ÉÉN woord in de
  kop (het gevoelswoord), nooit hele zinnen.
- Past NIET bij: robuuste mannenzaken (te lieflijk), speelse kinderzaken.

**A3. Young Serif + Nunito Sans**
- Laden: Young Serif 400 (heeft maar één gewicht — prima, gebruik hem groot),
  Nunito Sans 400 + 600.
- Waarom: Young Serif is mollig en retro, als een broodzak uit 1962. Nunito Sans
  heeft zachte rondingen die die warmte doortrekken.
- Afwijking: display letter-spacing `0em` (hij is al breed), line-height 1.05.
- Past NIET bij: luxe/chic (te knus), moderne zaken. Dit is echt voor "gezellig".

### GEVOEL B — Strak-modern
(architect, tech, moderne kapper, interieurstudio, fysio-nieuw — "clean, precies")

**B1. Space Grotesk + Inter** ⭐ eerste keus
- Laden: Space Grotesk 500 + 700, Inter 400 + 500.
- Waarom: Space Grotesk heeft nét genoeg karakter (rare g, open vormen) om geen
  systeemfont te lijken; Inter verdwijnt netjes op de achtergrond. Klassieker.
- Afwijking: display letter-spacing `-0.03em`, gewicht 500 (700 alleen mobiel klein).
- Past NIET bij: ambacht/warm, chic-editorial (te technisch).

**B2. Archivo + Figtree**
- Laden: Archivo 600 + 800 (gebruik de brede/Expanded variant als beschikbaar),
  Figtree 400 + 500.
- Waarom: Archivo breed en 800 zwaar = poster-gevoel, zelfverzekerd zonder schreeuwen.
- Afwijking: display in UPPERCASE mag hier, dan letter-spacing `+0.01em`;
  lowercase: `-0.02em`. Display iets kleiner: `clamp(2.5rem, 9vw, 7rem)` (breed font!).
- Past NIET bij: zacht-verzorgend, klein & knus.

**B3. Schibsted Grotesk + IBM Plex Sans**
- Laden: Schibsted Grotesk 500 + 700, IBM Plex Sans 400 + 500.
- Waarom: Schibsted is een krantenfont uit Scandinavië — koel, redactioneel,
  volwassen. Plex geeft een licht technisch randje. Minder gezien dan Inter-duo's.
- Afwijking: display letter-spacing `-0.025em`, line-height 1.0.
- Past NIET bij: warm/speels; te koud voor horeca.

### GEVOEL C — Chic-editorial
(boutique, juwelier, fine-dining, beautysalon-hoogsegment — "modetijdschrift")

**C1. Instrument Serif + Instrument Sans** ⭐ eerste keus
- Laden: Instrument Serif 400 + 400-italic (meer is er niet — dat is oké),
  Instrument Sans 400 + 500.
- Waarom: dé award-site-look van nu. Instrument Serif is dun en scherp, gemaakt om
  ENORM groot te staan. De italic voor één woord = instant mode-gevoel.
- Afwijking: display mag hier extra groot: `clamp(3.5rem, 13vw, 10rem)`,
  letter-spacing `-0.02em`, line-height 0.95. NOOIT onder 2rem gebruiken (te dun).
- Past NIET bij: robuust, ambachtelijk-knus, alles wat "stoer" moet zijn.

**C2. Cormorant Garamond + Karla**
- Laden: Cormorant Garamond 500 + 600 (+ italic 500), Karla 400 + 500.
- Waarom: klassiek hoog contrast, lange sierlijke stokken — parfumdoos-gevoel.
  Karla is licht eigenwijs, houdt het van "bruiloftskaart" af.
- Afwijking: display gewicht 500, letter-spacing `0em` (Garamond wil lucht),
  line-height 1.05. LET OP: Cormorant is dun — alleen groot gebruiken, en op
  donkere foto's een tikje zwaarder (600).
- Past NIET bij: modern-tech, kinderen, sport. En niet op drukke foto-achtergronden.

**C3. Gloock + Figtree**
- Laden: Gloock 400 (één gewicht), Figtree 300 + 400 + 500.
- Waarom: Gloock is een dikke didone — dramatisch, zwart, hoge hakken. Figtree licht
  ernaast = maximaal contrast tussen kop en tekst, en dát contrast is de luxe.
- Afwijking: display letter-spacing `-0.01em`; subkop in Figtree 300.
- Past NIET bij: zacht-verzorgend (te hard), budget-uitstraling.

### GEVOEL D — Speels
(speelgoedwinkel, ijssalon, kinderopvang, feestzaak — "lachen mag")

**D1. Bricolage Grotesque + Inter** ⭐ eerste keus
- Laden: Bricolage Grotesque 600 + 800, Inter 400 + 500.
- Waarom: speels ZONDER kinderachtig — gekke details (schuine snedes, rare oren)
  maar volwassen gebouwd. Werkt ook voor "speelse volwassenen" (borrelbar, festival).
- Afwijking: display gewicht 800, letter-spacing `-0.02em`.
- Past NIET bij: chic, klinisch, notaris-serieus.

**D2. Baloo 2 + Nunito Sans**
- Laden: Baloo 2 600 + 800, Nunito Sans 400 + 600.
- Waarom: Baloo is rond en mollig als een knuffel, maar strak genoeg om niet
  goedkoop te worden. Nunito Sans trekt de rondheid door in de leestekst.
- Afwijking: display letter-spacing `-0.01em`, line-height 1.05.
- Past NIET bij: alles voor volwassenen-luxe; dit is echt kind/zoet/vrolijk.

**D3. Fredoka + Nunito**
- Laden: Fredoka 500 + 600, Nunito 400 + 700.
- Waarom: Fredoka is de vriendelijkste rondbouw op Google Fonts — ijssalon-energie.
- Afwijking: display gewicht 600, letter-spacing `0em`; kicker-labels hier GEEN
  0.22em spacing maar 0.15em (ronde fonts vallen anders uit elkaar).
- Past NIET bij: alles wat serieus of duur moet voelen. Twijfel je → pak D1.

### GEVOEL E — Robuust
(sportschool, garage, bouwbedrijf, slager, tattoo — "sterke handen, geen poespas")

**E1. Anton + Inter** ⭐ eerste keus
- Laden: Anton 400 (één gewicht, meer heb je niet nodig), Inter 400 + 500.
- Waarom: Anton is een smalle zwarte poster-letter — vult het scherm als een
  gevelreclame. Inter houdt de rest nuchter.
- Afwijking: display ALTIJD uppercase, letter-spacing `+0.01em`, line-height 0.95,
  en mag extra groot: `clamp(3.5rem, 14vw, 11rem)` (smal font = groot mag).
- Past NIET bij: zacht, chic, ambachtelijk-lieflijk.

**E2. Archivo Black + Archivo**
- Laden: Archivo Black 400, Archivo 400 + 500.
- Waarom: zelfde familie in twee sterktes — kop en tekst zijn duidelijk familie,
  dat oogt als een doordacht merk in plaats van twee losse keuzes.
- Afwijking: display letter-spacing `-0.02em`, lowercase kán hier (stoer-modern),
  display iets kleiner: `clamp(2.75rem, 10vw, 7.5rem)` (zwart + breed font).
- Past NIET bij: fijn/elegant; alles waar vrouwelijk-zacht de doelgroep is.

**E3. Barlow Condensed + Barlow**
- Laden: Barlow Condensed 600 + 700, Barlow 400 + 500.
- Waarom: condensed = werkplaats/motorsport-DNA, en omdat beide Barlow zijn klikt
  het automatisch. Iets vriendelijker dan Anton.
- Afwijking: display uppercase met letter-spacing `+0.02em`, gewicht 600.
- Past NIET bij: luxe en zorg. En NIET verwarren met Oswald-cliché (zie verbodslijst)
  — het verschil zit 'm in de uitvoering: kicker-labels + witruimte erbij, anders
  wordt dit alsnog een sjabloon-gym-site.

### GEVOEL F — Zacht-verzorgend
(spa, schoonheidssalon, therapeut, tandarts, yoga, verloskundige — "je bent in
goede handen")

**F1. Marcellus + Mulish** ⭐ eerste keus
- Laden: Marcellus 400 (één gewicht), Mulish 300 + 400 + 500.
- Waarom: Marcellus is rustig en klassiek (Romeinse kapitalen-DNA) zonder deftig te
  doen. Mulish is zacht en open. Samen: kalmte, geen ziekenhuis en geen bling.
- Afwijking: display letter-spacing `+0.01em` (Marcellus wil ademen),
  line-height 1.1; subkop in Mulish 300.
- Past NIET bij: stoer, speels, urgentie ("NU boeken!"-schreeuwsites).

**F2. Newsreader + Work Sans**
- Laden: Newsreader 400 + 500 (met `opsz` as: groot = elegant, klein = leesbaar),
  Work Sans 400 + 500.
- Waarom: Newsreader is een kalme leesletter met een warme, menselijke toon —
  voelt als een goed tijdschrift over gezondheid, niet als een folder.
- Afwijking: display gewicht 500, letter-spacing `-0.01em`, line-height 1.08.
- Past NIET bij: tech, sport, kinderen.

**F3. Petrona + Hanken Grotesk**
- Laden: Petrona 400 + 500, Hanken Grotesk 400 + 500.
- Waarom: Petrona heeft organische, plantachtige vormen — natuurlijk en verzorgd,
  perfect voor spa/natuur/huidverzorging. Hanken Grotesk is warm-neutraal.
- Afwijking: display gewicht 500, letter-spacing `-0.015em`.
- Past NIET bij: klinisch-modern (dan B1), luxe-glamour (dan C1/C2).

---

## 3. VERBODSLIJST — de AI-standaardkeuzes

Dit zijn de keuzes die elke AI uit zichzelf doet. Ze zijn niet "lelijk", ze zijn
**herkenbaar als AI/sjabloon** — en dat is precies wat we verkopen dat we NIET zijn.

| Verboden | Waarom |
|---|---|
| **Playfair Display + Montserrat** | HET AI-restaurant-cliché nummer 1. Iedereen ziet: sjabloon. |
| **Playfair Display + Lato / Raleway / Open Sans** | Zelfde cliché, ander sausje. Playfair alleen met expliciete reden + goedkeuring Jay. |
| **Montserrat als display** | De geur van 2016-templates. Nooit als kop-font. |
| **Poppins voor alles** | Dé AI-slop-signatuur van dit moment. Verboden als display én als body-default. |
| **Oswald + Open Sans** | Het gym/bouw-sjabloonduo. Wil je condensed → E3 (Barlow Condensed). |
| **Bebas Neue als luie stoer-keus** | Alleen met reden; standaard pak je E1 (Anton). |
| **Roboto / Open Sans / Lato als gedachteloze body** | Niet fout, wel systeemfont-saai. Kies bewust uit de duo's hierboven. |
| **Dancing Script / Great Vibes / Pacifico / Lobster voor "elegantie"** | Script-fonts = bruiloftskaart uit de supermarkt. Chic doe je met C1/C2/C3. |
| **Raleway thin als hero-kop** | Dun + breed + grijs = de startup-template van 2017. |
| **Drie of meer fonts** | Altijd verboden, geen uitzondering. |
| **Alles in font-weight 100-200 voor "luxe"** | Onleesbaar op foto's en op mobiel. Luxe = contrast + witruimte, niet dunheid. |
| **letter-spacing op lopende body-tekst** | Spacing is voor KICKERS (kapitalen), nooit voor gewone zinnen. |

Uitzonderingsregel (zelfde als AGENTS.md): een verboden keus mag alléén als de echte
huisstijl van de klant er aantoonbaar om vraagt, mét genoemde reden én goedkeuring
van Jay. Nooit als standaard.

---

## 4. Kies-hulp in 10 seconden (voor de bouwer)

1. Lees `concept.json` / `business.json`: wat VOELT deze zaak?
2. Handwerk & warmte → A. Precies & modern → B. Duur & mooi → C.
   Vrolijk & jong → D. Kracht & no-nonsense → E. Rust & zorg → F.
3. Pak binnen het gevoel het ⭐-duo, tenzij een ander duo duidelijk beter bij de
   echte huisstijl past.
4. Check de "Past NIET bij"-regel van je keuze. Klopt het toch niet → ander duo.
5. Neem maat-basis + afwijkingen letterlijk over. Kickers met nummers (01, 02…)
   boven ELKE scene-kop. Klaar.
