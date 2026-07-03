# Korrel-en-licht-pakket — wanneer welke laag

Doorzichtige sfeer-vellen die je op een scene legt, zoals kleurfolie op een theaterlamp. Puur CSS, geen downloads. Bestand: `grain-licht.css`.

## Basisrecept (kopieer dit)

```html
<link rel="stylesheet" href="lib/grain-licht.css">

<section class="hero fx-scene">
  ...echte inhoud (foto, tekst, CTA)...
  <div class="fx fx-grain"></div>
  <div class="fx fx-vignette"></div>
</section>
```

Regels:
1. Ouder krijgt `fx-scene` (zorgt dat de vellen passen + blend niet lekt).
2. Elk vel = lege `<div class="fx fx-...">` als LAATSTE kinderen in de scene.
3. Stapelen mag; laatste div ligt bovenop.
4. Vellen zijn sfeer, nooit hoofdrolspeler. Twijfel = weglaten.

## Wanneer welke laag

| Laag | Class | Gebruik wanneer | Niet gebruiken bij |
|---|---|---|---|
| Filmkorrel | `fx-grain` | Bijna altijd: haalt de "digitale gladheid" van foto's en gradients af. Standaard op elke scene met beeld. | Kleine tekst op lage-resolutie schermen als het korrelig oogt — dan `fx-grain--zacht`. |
| Korrel sterk | `fx-grain--sterk` (erbij) | Donkere avond-scenes, moody hero's. | Lichte scenes (oogt vies). |
| Korrel zacht | `fx-grain--zacht` (erbij) | Lichte, kalme scenes (prijzen, tekst). | — |
| Bewegende korrel | `fx-grain--bewegend` (erbij) | Alleen bewust, op 1 hero-achtige scene, echt film-gevoel. Staat automatisch stil bij reduced-motion. | Meerdere scenes tegelijk; scenes met veel andere beweging. |
| Venster-licht | `fx-venster` (of `--rechts`) | Warm "gouden uur"-gevoel op een foto of ontvangst-scene. Kies de kant waar het licht in de FOTO al vandaan komt. | Scenes zonder foto; koude/strakke merken. |
| Vignette | `fx-vignette` | Oog naar het midden trekken: hero, proof, booking-finale. | Lichte/witte scenes → gebruik `fx-vignette--licht`. |
| Avond-gloed | `fx-avond` | Slot-scenes, booking-finale, restaurant/bar 's avonds, "kom vanavond langs"-momenten. | Ochtend-frisse merken (bakker, gym-ochtend). |
| Papier | `fx-papier` | Lichte tekst-secties: prijslijst, menukaart, footer-info. Geeft drukwerk-gevoel. | Bovenop donkere foto's (multiply maakt ze vlekkerig). |

## Goede combinaties (bewezen stapels)

- **Hero met foto:** `fx-grain` + `fx-vignette` (+ `fx-venster` als het licht klopt)
- **Avond-finale / booking:** `fx-grain fx-grain--sterk` + `fx-avond` + `fx-vignette`
- **Lichte prijzen/tekst-scene:** `fx-papier` + `fx-grain fx-grain--zacht` + `fx-vignette--licht`

Max 3 vellen per scene. Meer = modder.

## Ingebouwde veiligheid (zit al in de CSS, niets voor doen)

- `pointer-events: none` — klikken en scrollen gaat er dwars doorheen.
- `prefers-reduced-motion: reduce` — bewegende korrel staat stil.
- `prefers-contrast: more` — ALLE vellen gaan uit; leesbaarheid wint.
- `isolation: isolate` op `fx-scene` — blend-modes lekken niet naar de rest van de pagina.

## Merk-tint aanpassen

De warme tinten (goud `255,214,156` / oranje `255,148,84`) zijn neutrale "zonlicht"-kleuren en passen bij de meeste merken. Vraagt het merk om een andere lichtkleur (bv. Milano-rood-warm), maak dan een lokale override in de site zelf en verander alleen de rgba-kleur — nooit de opacity's verhogen boven wat er nu staat.
