/* ============================================================
   HET KAARTJE  —  dit is het ENIGE bestand dat je aanpast.
   Pas tekst, kleur en plaatjes aan. De machine raak je nooit aan.

   Per wereld (slide):
     bg      = achtergrondplaatje (bestand in deze map)
     product = uitgeknipt product, transparante PNG (in deze map)
     glow    = gloedkleur achter het product, hex, bv "#4db6ff"
     mood    = het gevoel / de beweging:
               "aqua"    = water, lichtsweep, flits-intro
               "abyss"   = diep & rustig, trage mist, geen flits
               "crystal" = levendig, twinkels, snelle puls
               "verde"   = fris, zwevende stofjes, zacht
     kicker  = klein labeltje bovenaan
     title   = grote titel
     sub     = ondertitel / zin

   Meer of minder slides? Voeg gewoon regels toe of haal ze weg.
   ============================================================ */
window.CINEMATIC = {
  brand: "",   // leeg op landing: maker-mark staat in de overlay
  // grade = hoeveel wereld-licht op de scene valt. tint = hoe sterk de wijzerplaat de wereldkleur pakt. (0 = uit, 1 = vol)
  worlds: [
    { bg:"world_water.webp",  product:"watch_aqua_n.webp", glow:"#4db6ff", mood:"aqua",    grade:0.45, tint:0,
      kicker:"Chapter I · Aqua",       title:"Aqua Nocturne",  sub:"Born in the deep. Rose gold, sapphire glass." },
    { bg:"world_dark.webp",   product:"watch_abyss_n.webp", glow:"#3a7bff", mood:"abyss",   grade:0.35, tint:0,
      kicker:"Chapter II · Abyss",     title:"Midnight Abyss", sub:"Sapphire. Deep, cool and still." },
    { bg:"world_purple.webp", product:"watch_purple_n.webp", glow:"#b06cff", mood:"crystal", grade:0.48, tint:0,
      kicker:"Chapter III · Amethyst", title:"Violet Aurora",  sub:"Crystal and mystery." },
    { bg:"world_green.webp",  product:"watch_green_n.webp",  glow:"#4fd99a", mood:"verde",   grade:0.45, tint:0,
      kicker:"Chapter IV · Verde",     title:"Emerald Wild",   sub:"Alive, raw, natural." },
  ]
};
