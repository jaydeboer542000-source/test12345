#!/usr/bin/env node
// ============================================================
// CRAFT-LINTER — de kwaliteits-scheidsrechter van de wow-machine
// ============================================================
// Wat doet dit? Simpel gezegd: dit script leest een site.html
// en checkt of de bouwer zich aan de craft-regels uit AGENTS.md
// heeft gehouden. Zo hoeft niemand die regels uit z'n hoofd te
// kennen — het bestand bewaakt de kwaliteit, niet het model.
//
// Gebruik:   node lib/craft-lint.mjs pad/naar/site.html
// Output:    JSON { pass, fouten: [], waarschuwingen: [] }
// Exitcode:  0 = geslaagd, 1 = fouten gevonden, 2 = kon niet lezen
//
// Geen dependencies. Alleen Node zelf.
// ============================================================

import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

// ---------- 1. Bestand inlezen ----------
const pad = process.argv[2];
if (!pad) {
  console.error('Gebruik: node craft-lint.mjs <pad/naar/site.html>');
  process.exit(2);
}

let html;
try {
  html = readFileSync(resolve(pad), 'utf8');
} catch (e) {
  console.log(JSON.stringify({ pass: false, fouten: [`Kan bestand niet lezen: ${pad} (${e.message})`], waarschuwingen: [] }, null, 2));
  process.exit(2);
}

const fouten = [];          // harde overtredingen → site is NIET klaar
const waarschuwingen = [];  // let-op-punten → mag, maar kijk er even naar

// Kleine helper: regelnummer van een positie in de tekst,
// zodat een bouwer meteen weet WAAR het misgaat.
const regelVan = (index) => html.slice(0, index).split('\n').length;

// ============================================================
// CHECK 1 — Geen bounce/elastic easing
// Regel uit AGENTS.md: "NO bouncy easing". Stuiterende animaties
// voelen speels/goedkoop, niet cinematisch. Dus: verboden woorden
// in easing-strings, en cubic-bezier curves die "overschieten".
// ============================================================
{
  // Verboden easing-namen (CSS én GSAP schrijfwijzen)
  const stuiter = /\b(bounce|elastic|back\.(out|in|inOut)|easeOutBack|easeOutBounce|easeOutElastic)\b/gi;
  let m;
  while ((m = stuiter.exec(html)) !== null) {
    fouten.push(`Stuiter-easing "${m[0]}" gevonden (regel ${regelVan(m.index)}) — bounce/elastic is verboden, gebruik rustige ease-out.`);
  }

  // cubic-bezier die overschiet: y-waarden buiten 0..1 = stuiter-effect
  const bez = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi;
  while ((m = bez.exec(html)) !== null) {
    const y1 = parseFloat(m[2]), y2 = parseFloat(m[4]);
    if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) {
      fouten.push(`Overschietende cubic-bezier "${m[0]}" (regel ${regelVan(m.index)}) — dit stuitert; hou y-waarden tussen 0 en 1.`);
    }
  }
}

// ============================================================
// CHECK 2 — Geen animatie/transition korter dan 600ms
// Regel: "Motion = slow and physical. Duration >= 600ms."
// Snelle flitsjes voelen als een goedkope app. We parsen alle
// duur-waarden uit CSS (transition/animation) en GSAP (duration:).
// Duur 0 = animatie UIT, dat mag wel.
// ============================================================
{
  const MIN_MS = 600;

  // Zet "0.3s" of "300ms" om naar milliseconden
  const naarMs = (getal, eenheid) => eenheid.toLowerCase() === 's' ? parseFloat(getal) * 1000 : parseFloat(getal);

  // a) CSS shorthand + losse duration-properties
  //    Pakt: transition: opacity .3s ...;  animation: spin 2s ...;
  //          transition-duration: 300ms;   animation-duration: .2s;
  const cssDuur = /\b(transition|animation)(?:-duration)?\s*:\s*([^;{}]+)[;}]/gi;
  let m;
  while ((m = cssDuur.exec(html)) !== null) {
    const soort = m[1].toLowerCase();
    const waarde = m[2];
    // Eerste tijd-waarde in de declaratie = de duur (tweede = delay, die mag kort)
    const tijd = waarde.match(/(\d*\.?\d+)\s*(ms|s)\b/i);
    if (tijd) {
      const ms = naarMs(tijd[1], tijd[2]);
      // < 50ms = animatie feitelijk UIT (o.a. het standaard reduced-motion-patroon
      // met 0.01ms) — dat is geen "snelle animatie" en mag dus gewoon.
      if (ms >= 50 && ms < MIN_MS) {
        fouten.push(`Te snelle ${soort}: "${tijd[0]}" (regel ${regelVan(m.index)}) — minimaal ${MIN_MS}ms, langzaam voelt duur.`);
      }
    }
  }

  // b) GSAP / JS: duration: 0.4  (seconden) of duration: 400 (>=50 = ms aannemen)
  //    Lookbehind voorkomt dat CSS 'animation-duration:'/'transition-duration:'
  //    hier nogmaals (fout) geteld wordt; die beoordeelt check 2a al.
  //    Een eenheid erachter (s/ms) = CSS, dus overslaan. En scrub-timelines
  //    gebruiken eigen eenheden — binnen 80 tekens 'scrub' = overslaan.
  const jsDuur = /(?<![-\w])duration\s*:\s*(\d*\.?\d+)(?!\s*m?s\b)/gi;
  while ((m = jsDuur.exec(html)) !== null) {
    const context = html.slice(Math.max(0, m.index - 80), m.index + 80);
    if (/scrub/i.test(context)) continue;
    const n = parseFloat(m[1]);
    const ms = n >= 50 ? n : n * 1000; // klein getal = seconden (GSAP), groot = ms
    if (ms >= 50 && ms < MIN_MS) {
      fouten.push(`Te snelle JS-animatie: duration ${m[1]} (regel ${regelVan(m.index)}) — minimaal ${MIN_MS}ms.`);
    }
  }
}

// ============================================================
// CHECK 3 — Maximaal 2 font-families
// Regel: "One display face + one text face. Never more than 2 fonts."
// We tellen: (a) families in de Google Fonts link,
//            (b) echte font-namen in font-family declaraties.
// var(--x) en systeem-fallbacks (sans-serif etc.) tellen niet mee.
// ============================================================
{
  const families = new Set();

  // a) Google Fonts link: family=Fraunces:...&family=Inter:...
  const gf = html.match(/fonts\.googleapis\.com\/css2?\?[^"'\s>]+/gi) || [];
  for (const url of gf) {
    for (const fam of url.matchAll(/family=([^&:@]+)/gi)) {
      families.add(decodeURIComponent(fam[1]).replace(/\+/g, ' ').trim().toLowerCase());
    }
  }

  // b) font-family declaraties in CSS — alleen de EERSTE echte naam per declaratie
  //    telt als keuze; alles erna is fallback (Georgia, Arial, -apple-system…) en
  //    dat is juist nette professionele praktijk, geen extra font.
  const generiek = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'inherit', 'initial', 'unset']);
  for (const decl of html.matchAll(/font-family\s*:\s*([^;{}]+)/gi)) {
    for (let naam of decl[1].split(',')) {
      naam = naam.trim().replace(/^['"]|['"]$/g, '');
      if (!naam || naam.startsWith('var(') || generiek.has(naam.toLowerCase())) continue;
      families.add(naam.toLowerCase());
      break; // eerste echte naam = de gekozen face; fallbacks overslaan
    }
  }

  if (families.size > 2) {
    fouten.push(`Te veel fonts: ${families.size} families gevonden (${[...families].join(', ')}) — maximaal 2 (1 display + 1 tekst).`);
  }
}

// ============================================================
// CHECK 4 — Verplichte onderdelen
// Deze dingen MOETEN er altijd in zitten.
// ============================================================
{
  // a) viewport meta — anders is mobiel kapot, en mobiel is een harde gate
  if (!/<meta[^>]+name\s*=\s*["']viewport["'][^>]*>/i.test(html)) {
    fouten.push('Geen <meta name="viewport"> — mobiel wordt dan piepklein weergegeven. Verplicht.');
  }

  // b) demo-notitie — eerlijkheid: bij scraped beeld/demo moet dat erbij staan
  if (!/demo/i.test(html)) {
    fouten.push('Geen demo-notitie gevonden (tekst met "demo") — eerlijke bronvermelding is verplicht op demo-sites.');
  }

  // c) tel:-link — de bezoeker moet met 1 tik kunnen bellen
  if (!/href\s*=\s*["']tel:/i.test(html)) {
    fouten.push('Geen tel:-link gevonden — bellen met 1 tik is de belangrijkste conversie voor een lokale zaak.');
  }

  // d) prefers-reduced-motion — respect voor mensen die geen beweging willen
  if (!/prefers-reduced-motion/i.test(html)) {
    fouten.push('Geen @media (prefers-reduced-motion) blok — animaties moeten uit kunnen voor wie daar last van heeft.');
  }
}

// ============================================================
// CHECK 5 — Geen <img> behalve toegestane assets
// Regel: alleen echte, goedgekeurde assets (logo/decor uit assets/).
// Externe of losse plaatjes = risico op nep/ongekeurd beeld.
// ============================================================
{
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = (tag.match(/src\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    const toegestaan = /^\.?\/?assets\//i.test(src);
    if (!toegestaan) {
      fouten.push(`Niet-toegestane <img> src="${src || '(leeg)'}" (regel ${regelVan(m.index)}) — alleen plaatjes uit assets/ (logo/decor, door Jay goedgekeurd).`);
    }
  }
}

// ============================================================
// CHECK 6 — Waarschuwing bij te veel mega-koppen
// Meer dan 6 h1/h2's = waarschijnlijk een eindeloze stapel secties,
// en dat is precies wat THE FORM verbiedt (één toneel, geen stapel).
// ============================================================
{
  const koppen = (html.match(/<h[12]\b/gi) || []).length;
  if (koppen > 6) {
    waarschuwingen.push(`${koppen} h1/h2 koppen gevonden (>6) — ruikt naar eindeloos gestapelde secties; THE FORM wil één toneel met scènes.`);
  }
}

// ============================================================
// CHECK 7 — ALLOWLIST: elk gebruikt beeld moet verantwoord zijn
// Fail-closed geleerd van de omzeil-test (2026-07-03): op mapnaam
// filteren ("scraped") is te omzeilen door bestanden te hernoemen.
// Daarom omgekeerd: een beeld mag ALLEEN als het
//   a) door Jay is goedgekeurd (business.json → photos.approved), of
//   b) Replicate-decor is (assets/decor/…), of
//   c) een merk-asset is (logo*/favicon*).
// Al het andere — hoe de map ook heet — is een fout.
// ============================================================
{
  const norm = (s) => s.replace(/^\.?\//, '');
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|poster)\s*=\s*["']([^"']+)["']/gi)) refs.add(norm(m[1]));
  for (const m of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.add(norm(m[1]));

  // Alleen lokale asset-verwijzingen beoordelen (geen data:, http-fonts, ankers)
  const beelden = [...refs].filter(r => /^assets\//i.test(r) && /\.(jpe?g|png|webp|avif|mp4|webm)$/i.test(r));

  let photos = undefined;
  try {
    const biz = JSON.parse(readFileSync(join(dirname(resolve(pad)), 'business.json'), 'utf8'));
    photos = biz.photos;
  } catch { /* geen business.json → niets is goedgekeurd */ }
  const approved = photos?.approved || [];

  const isDecor = (r) => /^assets\/decor\//i.test(r);
  const isMerk  = (r) => /(^|\/)(logo[^/]*|favicon[^/]*)$/i.test(r);

  for (const r of beelden) {
    if (approved.includes(r) || isDecor(r) || isMerk(r)) continue;
    fouten.push(`Beeld "${r}" is niet verantwoord: niet door Jay goedgekeurd (photo-picker), geen Replicate-decor (assets/decor/) en geen merk-asset (logo/favicon). Echte foto's alleen ná de duim — hernoemen helpt niet.`);
  }
}

// ============================================================
// CHECK 8 — Echte foto's nooit als achtergrond-behang
// Regel (les van Duo 4 You, 2026-07-03): een rauwe klantfoto
// donker wassen en er tekst overheen zetten = standaard-template,
// geen cinema. Echte foto's zijn HELD (gekaderd, gecomponeerd)
// of ze doen niet mee. Achtergrond-sfeer = Replicate-decor.
// "Echte foto" = elk beeld dat GEEN decor en GEEN merk-asset is
// (dus ook goedgekeurde foto's: die mogen wél als held, niet als behang).
// ============================================================
{
  // Comments één keer strippen: voorkomt catastrofaal terugzoeken in de regex
  // én verstop-trucs via commentaar tussen decor-div en img.
  const kaal = html.replace(/<!--[\s\S]*?-->/g, '');
  const regelVanKaal = (i) => kaal.slice(0, i).split('\n').length;
  const norm = (s) => s.replace(/^\.?\//, '');
  const isFotoAsset = (r) => /^assets\//i.test(r) && /\.(jpe?g|png|webp|avif)$/i.test(r)
    && !/^assets\/decor\//i.test(r) && !/(^|\/)(logo[^/]*|favicon[^/]*)$/i.test(r);

  let approved8 = [];
  try {
    const biz = JSON.parse(readFileSync(join(dirname(resolve(pad)), 'business.json'), 'utf8'));
    approved8 = biz.photos?.approved || [];
  } catch { /* geen business.json → niets goedgekeurd */ }

  // Ongoedgekeurde foto als achtergrond = harde fout.
  // Goedgekeurde foto in een decor-laag = waarschuwing: MAG (held/Ken Burns-hero
  // op een echte foto is vakwerk), maar de jury moet expliciet oordelen dat het
  // geen donker-behang-met-tekst is (de Duo-fout).
  const meld = (r, plek, regelnr) => {
    if (approved8.includes(r)) {
      waarschuwingen.push(`Goedgekeurde foto "${r}" als ${plek} (regel ~${regelnr}) — mag als held-compositie, maar jury moet bevestigen dat dit geen donker-behang-met-tekst is.`);
    } else {
      fouten.push(`Echte foto "${r}" als ${plek} (regel ~${regelnr}) zonder goedkeuring — foto's nooit als behang; held-compositie of Replicate-decor (zie AGENTS.md Stijl-les).`);
    }
  };

  // a) In CSS als background/url()
  for (const m of kaal.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const r = norm(m[1]);
    if (isFotoAsset(r)) meld(r, 'CSS-achtergrond', regelVanKaal(m.index));
  }

  // b) <img> als DIRECT kind van een decor-laag (div/figure met "decor" in de class).
  //    Bewust strak: een gekaderde foto-kaart elders in de scène (held-compositie,
  //    zoals Milano's vestigings-kaarten) is juist goed en mag niet vals afgekeurd worden.
  for (const m of kaal.matchAll(/<(?:div|figure)\b[^>]*class\s*=\s*["'][^"']*decor[^"']*["'][^>]*>\s*<img\b[^>]*src\s*=\s*["']([^"']+)["']/gi)) {
    const r = norm(m[1]);
    if (isFotoAsset(r)) meld(r, 'decor-laag', regelVanKaal(m.index));
  }
}

// ============================================================
// CHECK 9 — Scènes bewegen NOOIT zijwaarts (Jay-regel, definitief,
// 3× bevestigd op 2026-07-03). Signatuur van een horizontale
// filmstrook: een x-tween op schermbreedte, of een flex-strook
// van meerdere viewports breed.
// ============================================================
{
  if (/[{,\s]x\s*:[^,}\n]*innerWidth/.test(html)) {
    fouten.push('Zijwaartse scène-beweging gevonden (x-tween op schermbreedte) — scènes wisselen ALTIJD verticaal binnen het vaste kader, nooit naar links/rechts.');
  }
  if (/width\s*:\s*max-content[^}]*}\s*/.test(html) && /flex\s*:\s*0\s+0\s+100vw/.test(html)) {
    fouten.push('Horizontale filmstrook-CSS gevonden (flex-strook van 100vw-scènes) — scènes wisselen ALTIJD verticaal, nooit zijwaarts.');
  }
}

// ---------- Uitkomst ----------
const resultaat = {
  pass: fouten.length === 0,
  fouten,
  waarschuwingen,
};

console.log(JSON.stringify(resultaat, null, 2));
process.exit(resultaat.pass ? 0 : 1);
