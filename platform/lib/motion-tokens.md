# Motion-tokens — het beweging-woordenboek (handleiding)

Dit is de wet voor ALLE beweging op elke klant-site. Laad `motion-tokens.css` in en gebruik alleen wat hierin staat. Je hoeft niets zelf te verzinnen — dat is precies de bedoeling: de smaak zit al in dit bestand.

**Het huis-gevoel in één zin:** beweging start snel en rolt heel lang zacht uit, als een zwaar theatergordijn. Langzaam, fysiek, duur.

---

## VERBODEN (hard, geen uitzonderingen zonder expliciete reden + akkoord van Jay)

1. **Geen bounce / elastic / spring easing.** Niets stuitert. Stuiteren = speelgoed = AI-slop. Alleen `--ease-huis` (en `--ease-exit` voor dingen die weggaan).
2. **Geen animaties korter dan 600ms.** Snel = goedkoop. De drie duren zijn 700 / 900 / 1200ms en dat zijn de enige drie.
3. **Nooit alles tegelijk.** Als meerdere elementen verschijnen, komen ze OM DE BEURT (stagger). Alles-tegelijk leest als een pagina die "aan floept" in plaats van een scene die opkomt.
4. Extra (uit AGENTS.md): verplaatsing max 40px, max één grafisch gebaar per scene, lijnen nooit door tekst.

---

## Wanneer gebruik je wat

### `.fade-rise` — de standaard (90% van de gevallen)
Zachtjes omhoog + infaden. Voor koppen, alinea's, knoppen, kaarten.

```html
<h2 class="fade-rise" style="--i: 0">De kop</h2>
<p  class="fade-rise" style="--i: 1">De tekst eronder.</p>
<a  class="fade-rise" style="--i: 2" href="#boek">Maak afspraak</a>
```
`--i` = het volgnummer. Elk nummer wacht één stagger-stap (120ms) langer → ze komen om de beurt.

- `.fade-rise fade-rise--klein` → kleine tekstjes, footnotes, labels (16px, 700ms).
- `.fade-rise fade-rise--groot` → hero-kop, groot moment (40px, 1200ms).

(De varianten zijn toevoegingen: altijd SAMEN met `.fade-rise` op het element.)

### `.clip-reveal` — voor beelden
Het beeld wordt "opengeschoven" alsof een gordijn opengaat; de foto zelf schuift niet. Voor foto's, decor, grote hero-koppen.

```html
<figure class="clip-reveal">
  <img src="salon.jpg" alt="De salon">
</figure>
```
- `.clip-reveal--links` → opent van links naar rechts, mooi voor brede beelden.

### `.draw-line` — het ene grafische gebaar
Een dun lijntje (1px) dat zichzelf tekent. **Max één per scene.** Als los element onder een kop, nooit door tekst heen.

```html
<h2 class="fade-rise">Onze prijzen</h2>
<span class="draw-line" style="--i: 1"></span>
```
Voor een SVG-boog (alleen scene 1 mag er één hebben, door lege ruimte): gebruik `.draw-line--svg` op het `<path>` en zet in JS eerst `stroke-dasharray` en `stroke-dashoffset` op de padlengte.

### `.fade-only` — voor achtergronden en scene-wissels
Puur infaden, geen verplaatsing. Achtergronden mogen nooit "springen", dus die krijgen nooit fade-rise.

---

## Zo zet je het aan (de trigger)

De classes zetten alles "klaar" (verstopt). Zodra je `.is-visible` toevoegt, speelt het één keer af. Standaard-trigger:

```html
<script>
  // Kijkt wanneer een element in beeld komt en zet 'm dan aan. Eén keer.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target); // speelt maar één keer, nooit opnieuw
      }
    }
  }, { threshold: 0.2 }); // pas aan als 20% zichtbaar is

  document
    .querySelectorAll('.fade-rise, .fade-rise--klein, .fade-rise--groot, .clip-reveal, .clip-reveal--links, .draw-line, .draw-line--svg, .fade-only')
    .forEach((el) => io.observe(el));
</script>
```

Werk je met GSAP/ScrollTrigger (THE FORM, gepinde scenes)? Prima — maar gebruik dan nog steeds de tokens: `duration: 0.9` of `1.2`, `ease: "expo.out"` (dat is dezelfde familie als `--ease-huis`), en stagger `0.12`.

---

## Lenis smooth-scroll — standaard op elke site

Zware, filmische scroll hoort bij het huis. Dit is de standaard init (CDN, geen build nodig):

```html
<script src="https://unpkg.com/lenis@1.3.4/dist/lenis.min.js"></script>
<script>
  // Maakt scrollen zwaar en zacht, past bij de huis-easing.
  const lenis = new Lenis({
    duration: 1.2,                                        // zwaarte van de scroll
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // zelfde staart als --ease-huis
    smoothWheel: true,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // Gebruik je GSAP ScrollTrigger? Koppel ze dan zo:
  // lenis.on('scroll', ScrollTrigger.update);
  // gsap.ticker.add((t) => lenis.raf(t * 1000));
  // gsap.ticker.lagSmoothing(0);
</script>
```

Let op: bij `prefers-reduced-motion` hoort Lenis uit te staan — check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` en sla de init dan over.

---

## Spiekbriefje

| Situatie | Class | Duur |
|---|---|---|
| Kop / tekst / knop verschijnt | `.fade-rise` | 900ms |
| Klein label / footnote | `.fade-rise--klein` | 700ms |
| Hero-kop, groot moment | `.fade-rise--groot` | 1200ms |
| Foto / decor onthullen | `.clip-reveal` | 1200ms |
| Lijntje onder een kop | `.draw-line` | 1200ms |
| Achtergrond / scene-crossfade | `.fade-only` | 1200ms |
| Meerdere dingen in één scene | zelfde class + `--i: 0,1,2…` | +120ms per stuk |

Twijfel je? Kies `.fade-rise` met `--dur-basis`. Saai-maar-goed wint altijd van druk-maar-slordig.
