# Phase 3 — Cooking Core

**Status:** Open design questions answered. Ready to scope code work.

The core shift: main dish wrestlers are not in the deck. They emerge from cooking ingredients in **appliances** when you have the matching recipe in your **cookbook**. The deck is filled with ingredients, with a few quick-eat ingredients and (Phase 4) garnishes/side-dishes/tutors.

---

## Locked-in design (from user answers)

### Appliances
- **3-slot appliance inventory.** Slots can be **swapped between rounds** within a match.
- Each appliance has its own **ingredient capacity**.
- Starting appliances (Phase 3):

| Appliance | Capacity | Modifier |
|---|---|---|
| **Cast Iron Pan** | 3 ingredients | Balanced default (no modifier) |
| **Microwave** | 2 ingredients | –1 cook time, but resulting wrestler stats halved |
| **BBQ** | 3 ingredients | +1 cook time, +50% wrestler attack |

Future appliances (Phase 5+): air fryer, searing pan, smoker, pressure cooker. Upgradeable tiers per appliance unlock more capacity + new specials.

### Recipes & Cookbook
- **Cookbook (meta):** up to 10 owned recipes.
- **Readied per match:** 3 recipes (Phase 3: hardcoded; Phase 4: in-match swappable).
- Multiple cook paths can produce the **same wrestler with stat variants** (e.g., side-dish-promoted Burrito vs recipe-summoned Burrito have different numbers but same identity).

### Wild Dish + Chef Abilities
- Unrecognized ingredient combos roll a **dice mechanic** for Wild Dish quality.
- Phase 3: no dice yet — Wild Dish produces a generic weak wrestler from summed stats.
- Phase 5: chef ability sheet (D&D-style) buffs Wild Dish rolls and other cooking mechanics.

### Quick-eat ingredients
- Tagged `quickEat: true`.
- Skip prep entirely — toss directly to ring as a low-stat wrestler (1/1 default).
- Example: Poptart, raw celery, jerky.

### Food waste & rotting terrain
- Tossing uncooked non-quickEat ingredients → +1 to a **Food Waste Meter**.
- High meter = crowd debuff.
- Ring spots can become **rough terrain** if waste accumulates → unusable until cleaned.
- Trade-off: speed costs you board space + crowd favor.

### Recipe acquisition rewards
- After-fight loot includes:
  - **Steal a recipe** the rival played this match (un-mask their dish)
  - **Appliances** from their kitchen
  - **Coupon cards** (e.g., 50% off market)
  - Currency

---

## Card type shapes

### Ingredient

```js
{
  id: 'corn-masa',
  name: 'Corn Masa',
  type: 'ingredient',
  tags: ['masa', 'starch', 'grain'],
  cost: 0,                            // energy to play
  quickEat: false,
  prepBonus: { attack: +1, health: 0, cookTime: +1 },
  flavor: 'The foundation of everything good.',
}

// Quick-eat example
{
  id: 'poptart-of-pain',
  name: 'Poptart of Pain',
  type: 'ingredient',
  tags: ['sweet', 'instant', 'snack'],
  cost: 0,
  quickEat: true,
  quickEatStats: { attack: 1, health: 1 },
  flavor: 'No cooking required. No dignity either.',
}
```

### Appliance

```js
{
  id: 'cast-iron-pan',
  name: 'Cast Iron Pan',
  type: 'appliance',
  capacity: 3,
  modifier: { cookTime: 0, statMultiplier: 1.0 },
  tier: 1,
  flavor: 'Reliable. Heavy. Old as time.',
}

{
  id: 'microwave',
  name: 'Microwave',
  type: 'appliance',
  capacity: 2,
  modifier: { cookTime: -1, statMultiplier: 0.5 },
  tier: 1,
  flavor: 'Fast food, fast loss.',
}

{
  id: 'bbq',
  name: 'BBQ Grill',
  type: 'appliance',
  capacity: 3,
  modifier: { cookTime: +1, attackMultiplier: 1.5, statMultiplier: 1.0 },
  tier: 1,
  flavor: 'Smoke in the eyes. Char on the gloves.',
}
```

### Recipe (in cookbook, not deck)

```js
{
  id: 'recipe-tamale-tornado',
  name: 'Tamale Tornado',
  type: 'recipe',
  requires: [
    { tag: 'masa',    count: 1 },
    { tag: 'protein', count: 1 },
    { tag: 'spice',   count: 1 },
  ],
  produces: {
    archetype: 'carb',
    baseAttack: 4,
    baseHealth: 5,
    baseCookTime: 2,
    crashAfter: 2,
    crashAmount: 3,
  },
}
```

### Cookbook & Pantry

```js
// Cookbook (between-match meta)
{
  ownedRecipes: ['recipe-tamale-tornado', 'recipe-burrito-bouncer', ...],  // up to 10
  readiedRecipes: ['recipe-tamale-tornado', 'recipe-empanada-enforcer', 'recipe-burrito-bouncer'],  // exactly 3 for this match
}

// Pantry (between-match ingredient stock — Phase 6)
{
  stock: [
    { ingredientId: 'corn-masa', count: 5 },
    { ingredientId: 'wagyu-beef', count: 1 },
  ],
}

// Match deck (built from pantry, shuffled, drawn from during play)
// For Phase 3: hardcoded a starter deck. Pantry comes in Phase 6.
```

---

## Recipe-matching engine

When an appliance's cook timer reaches 0:

1. Collect tags of all ingredients placed in this appliance.
2. For each recipe in player's `readiedRecipes` (only readied recipes count):
   - Check if pot tags satisfy `recipe.requires`.
   - If yes → produce the wrestler from `recipe.produces`, modified by:
     - Sum of ingredient `prepBonus.attack/health`
     - Appliance `modifier.statMultiplier` / `attackMultiplier`
3. If no readied recipe matches → **Wild Dish fallback:** generic wrestler with summed ingredient stats (Phase 3: deterministic; Phase 5: dice roll modified by chef Luck score).

---

## State.js additions needed (Phase 3)

```js
state.player = {
  ...existing,
  appliances: [                            // 3 slots, may be null
    { applianceId: 'cast-iron-pan', cooking: null },
    { applianceId: 'microwave',     cooking: null },
    { applianceId: 'bbq',           cooking: null },
  ],
  cookbook: {
    ownedRecipes:   [...],
    readiedRecipes: [...],                 // exactly 3
  },
  foodWaste: 0,
  ring: [null, null, null],                // each slot may be a wrestler OR { roughTerrain: true, turnsLeft: N }
}

// A `cooking` entry inside an appliance:
{
  uid,
  ingredients: ['corn-masa', 'beef-chuck', 'chili'],  // ids placed in this appliance
  cookTurnsLeft: 2,
  potentialRecipeId: 'recipe-tamale-tornado' | null,   // computed for UI hint
}
```

---

## Implementation order (Phase 3)

1. **Data files** — `ingredients.js`, `appliances.js`, `recipes.js`. ~12 ingredients (with 2 quick-eats), 3 appliances, 6 recipes (existing wrestlers re-expressed).
2. **Pure functions** — `matchRecipe(tags, readiedRecipes) → recipe | null`. Test in isolation.
3. **State.js rewrite** — replace single-card prep slots with appliance slots holding ingredient pots.
4. **UI: hand** — cards in hand now show as ingredient cards (one design) or quick-eat cards (variant).
5. **UI: appliance slots** — each slot shows the appliance, its capacity meter, and the ingredients currently inside.
6. **UI: cookbook reference** — a sidebar widget showing the 3 readied recipes (so you know what you're cooking toward).
7. **Food waste meter** — UI bar somewhere visible; "toss raw" action on ingredients in hand.
8. **Rough terrain** — when waste meter exceeds threshold, a random ring slot becomes terrain for N turns.

---

## Sample data (first cut)

### Ingredients (~12)

| Name | Tags | Cost | Prep bonus | Quick eat? |
|---|---|---|---|---|
| Corn Masa | masa, starch, grain | 0 | +1 atk, +1 cook | no |
| Flour | flour, starch, grain | 0 | +0/+1, +1 cook | no |
| Tortilla | tortilla, starch | 1 | +0/+2, +0 cook | no |
| Sugar | sugar, sweet | 0 | +1/+0, +0 cook | no |
| Cinnamon | sugar, spice, aromatic | 0 | +1/+0, +0 cook | no |
| Beef Chuck | protein, red-meat | 1 | +2/+1, +1 cook | no |
| Pork | protein, red-meat | 1 | +2/+1, +1 cook | no |
| Chicken | protein, white-meat | 1 | +1/+2, +1 cook | no |
| Onion | vegetable, aromatic | 0 | +0/+1, +0 cook | no |
| Chili | spice, vegetable | 0 | +1/+0, +0 cook | no |
| Habanero | spice, spice-premium, acid | 1 | +2/+0, +1 cook | no |
| **Poptart of Pain** | sweet, instant, snack | 0 | quickEat 1/1 | **yes** |
| **Raw Celery** | fresh, vegetable, instant | 0 | quickEat 1/2 | **yes** |

### Recipes (the existing 6 wrestlers)

| Recipe | Required tags | Produces |
|---|---|---|
| Tamale Tornado | masa + protein + spice | carb 4/5, crash 3 after 2t |
| Pan Dulce Punch | flour + sugar | carb 2/3, crash 2 after 2t |
| Empanada Enforcer | flour + protein + aromatic | protein 3/6, regen 1 |
| Burrito Bouncer | tortilla + protein + starch | greasy 2/10, wrestlers-only |
| Habanero Haymaker | spice-premium + acid | spicy 6/3, hot 1 |
| Churro Chainsaw | flour + sugar + spice | sugar 4/2, crash 2 after 1t |
