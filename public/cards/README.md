# Card Art

Drop generated art into the matching subfolder. Filenames must match the card ID exactly (minus the prefix). The game looks for files via this convention and falls back to a styled placeholder + emoji if the file doesn't exist.

## File expectations

- **Format:** PNG with transparent background preferred (JPG/WebP also work).
- **Aspect:** square — the game crops to a square frame. Suggested **512×512** source.
- **Background:** transparent or single flat color. Avoid full scene backdrops (they fight with the card frame).
- **Style brief:** Mexican lucha libre wrestling × food/kitchen. Painterly, bold, slightly stylized — Slay-the-Spire / Inscryption energy. Warm earth tones: gold, ochre, deep reds, ember orange, charcoal. High contrast. Subject centered.

## Suggested AI generation prompt template

```
A {SUBJECT}, drawn as a Mexican lucha libre wrestling card illustration.
Painterly digital art, bold linework, warm earth palette (gold, ochre,
deep red, ember orange, charcoal). Subject centered, transparent
background. Square composition. No text. No card frame.
```

## Filename checklist

### Ingredients → `public/cards/ingredients/<id>.png`

- [ ] `corn-masa.png` — golden corn dough
- [ ] `flour.png` — sack of white flour
- [ ] `tortilla.png` — stack of tortillas
- [ ] `rice.png` — bowl of white rice
- [ ] `beef-chuck.png` — wrestler-styled cut of red beef
- [ ] `pork.png` — slab of pork
- [ ] `chicken.png` — whole chicken with wrestling mask
- [ ] `onion.png` — onion shedding tears
- [ ] `garlic.png` — head of garlic
- [ ] `cilantro.png` — leafy herb sprig
- [ ] `sugar.png` — sugar cube or pile
- [ ] `cinnamon.png` — cinnamon stick
- [ ] `chili.png` — red chili pepper
- [ ] `habanero.png` — orange habanero, snarling
- [ ] `lime.png` — sliced lime
- [ ] `salt.png` — pinch of salt / salt cellar
- [ ] `butter.png` — stick of butter
- [ ] `lard.png` — pail of lard
- [ ] `tomato.png` — red tomato
- [ ] `cheese.png` — melty wedge of cheese
- [ ] `poptart-of-pain.png` — sugary toaster pastry, menacing
- [ ] `raw-celery.png` — crunchy celery stalk

### Actions → `public/cards/actions/<id-without-action-prefix>.png`

- [ ] `mise-en-place.png` — organized prep board
- [ ] `pressure-cooker.png` — pressure cooker hissing steam
- [ ] `open-flame.png` — burning grill flames
- [ ] `guest-chef.png` — Abuela Inferno, fearsome grandma chef
- [ ] `salt-bae.png` — silhouette of theatrical salt drop
- [ ] `kitchen-fire.png` — kitchen engulfed in flame
- [ ] `taste-test.png` — sneaky tongue / tasting spoon
- [ ] `snack-break.png` — chef on a break, snacking
- [ ] `family-recipe.png` — open family recipe book
- [ ] `spice-rack.png` — wall of spice jars
- [ ] `bonus-tip.png` — tip jar of pesos
- [ ] `crowd-pleaser.png` — roaring lucha crowd
- [ ] `composter.png` — compost bin with worms
- [ ] `sous-chef.png` — second cook helping out
- [ ] `pantry-raid.png` — flashlight in a stocked pantry

### Recipes (cooked dishes that appear in the ring) → `public/cards/recipes/<id-without-recipe-prefix>.png`

- [ ] `tamale-tornado.png` — masked tamale wrestler mid-spin
- [ ] `pan-dulce-punch.png` — pan-dulce wrestler throwing a punch
- [ ] `empanada-enforcer.png` — burly empanada bodyguard
- [ ] `burrito-bouncer.png` — massive burrito doorman
- [ ] `habanero-haymaker.png` — habanero wrestler, fists ablaze
- [ ] `churro-chainsaw.png` — sugar-mad churro with revving sound

### Special

- [ ] `wild-dish.png` — placed at `public/cards/recipes/wild-dish.png` for the Wild Dish fallback wrestler.

## Phase 7: quality variants for recipes

The cook quality is determined by how well the player followed the recipe's procedure (right ingredient order + right heat per step) and whether the pot burned. The game tries quality-suffixed art first and falls back to the base file you've already drawn.

For each recipe (e.g. `tamale-tornado`), add any of these optional variants. The base file is the fallback when a quality file is missing:

- `recipes/tamale-tornado-perfect.png` — Followed procedure flawlessly. Stats +1⚔/+1❤. Best art.
- `recipes/tamale-tornado-good.png` — Right ingredients in order, heat was off on a step. Same stats, special preserved.
- `recipes/tamale-tornado-plain.png` — Procedure ignored. Stats -1⚔/-1❤. No special. Slightly worse art.
- `recipes/tamale-tornado-burnt.png` — Cooked on high heat without stirring. Stats halved. No special. Charred/ashen art.

Repeat for: `pan-dulce-punch`, `empanada-enforcer`, `burrito-bouncer`, `habanero-haymaker`, `churro-chainsaw`. **24 quality variants total** (6 recipes × 4 tiers), all optional.

## Phase 7: ingredient stage variants

Optional stage variants for each cookable ingredient. Fallback chain: stage-specific → base → emoji.

- `ingredients/<id>-raw.png` — Pre-chopped, in hand.
- `ingredients/<id>-chopped.png` — On the cutting board after a D6 chop.
- `ingredients/<id>-cooking.png` — In a pot, timer > 0.
- `ingredients/<id>-cooked.png` — In a pot, ready.
- `ingredients/<id>-burnt.png` — Overcooked.

For 22 ingredients × 5 stages = **110 optional ingredient stage variants**.

## License attribution

If your generator requires attribution, add it to the project's main README.
