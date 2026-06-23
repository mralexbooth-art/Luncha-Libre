# Scene backgrounds

Drop a 1920×1080 (or 2560×1440 retina) image here for each scene the player
sees. The CSS layers a dark gradient on top so text stays readable.

If a file doesn't exist, the scene's gradient-only background renders instead
— so you can fill these in one at a time without breaking anything.

## Expected filenames

| File | Scene | Vibe target |
|---|---|---|
| `awake.png` | First beat — rain, near-black | Dripping black trees, distant lights, almost pure dark |
| `food-court.png` | The abandoned outdoor food court at night | Picnic tables, broken neon, marigolds, an altar in the back, candles in jars |
| `candle-lit.png` | Close-up of the altar, candle burning | Marigolds bloomed, radio mounted, warm-but-uneasy chiaroscuro |
| `wandering.png` | Same food court but visibly more alive | Brighter, more candles lit, hints of figures, marigolds scattered |
| `kitchen.png` | Abuela's small home kitchen | Single cast iron pan on a worn counter, zip-tied radio overhead, painted tile |
| `altar.png` | Returning to altar with the cooked dish | The dish sits on the altar, smoke curling, marigolds bowing |
| `choice.png` | The moment of decision | Sparse, candle-only, two phantom paths |
| `arcana.png` | Undying Light reveal | Golden bloom, a single candle that refuses to go out |
| `slice-end.png` | Predawn food court | Lighter, blue-grey, a distant figure between picnic tables |
| `end.png` | "Wake up again" placeholder | Soft, ambient, neutral |

## Format suggestions

- **JPG** for photorealistic / painterly art (200–500 KB per scene)
- **PNG** if you need transparency or you want crisp linework (1–2 MB)
- Avoid hard borders/vignettes in the art — the CSS already darkens the edges

## Style direction (consistent across all scenes)

Match the prompt template from the Midjourney brief:

> Mexican folk-horror lucha libre, sepia parchment + championship gold +
> dried-blood red palette, papel-picado borders, Día de los Muertos marigold
> motifs, oil-painted card art, candlelit cantina chiaroscuro lighting

Generate at `--ar 16:9 --style raw` and keep the same `--seed` across all
scenes so the whole set looks like one painter made it.

## How they get into the game

Just drop them in this folder with the exact filename above. Then commit + push:

```powershell
cd C:\Users\alex\projects\LUNCHA_LIBRES_V4
git add public/scenes/
git commit -m "scenes: add background art"
git push
```

Netlify rebuilds in ~60 seconds and the images show up on the live site.
