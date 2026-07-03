/* ============================================================
   HET KAARTJE — dit is het ENIGE bestand dat je aanpast.
   Verander de tekst, de kleur en het plaatje. De motor raak je nooit aan.

   De 5 dingen die je kunt wijzigen per scene:
     bg      = achtergrondplaatje (bestand in deze map)
     product = jouw product, uitgeknipt, transparante PNG (in deze map)
     glow    = gloedkleur achter het product (hex, bv "#4db6ff")
     kicker  = klein labeltje bovenaan
     title   = grote titel
     sub     = ondertitel / zin
   ============================================================ */
window.CINEMATIC = {
  brand: "YOUR BRAND",   // jouw merknaam linksboven (leeg "" = verbergen)
  worlds: [
    {
      bg:      "world_water.webp",
      product: "watch_aqua_n.webp",   // <-- vervang door jouw product: zet je eigen transparante PNG in deze map (zie placeholder_product.png) en zet de naam hier
      glow:    "#4db6ff",             // <-- jouw gloedkleur
      mood:    "aqua",
      grade:   0.45,
      tint:    0,
      kicker:  "Chapter I",
      title:   "Your Product",        // <-- jouw titel
      sub:     "Your tagline goes here."  // <-- jouw zin
    }
  ]
};
