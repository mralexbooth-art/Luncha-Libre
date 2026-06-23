# Phase 7 — Heat, Stir/Flip, Procedure Compliance, Cook Quality

**Status:** Shipped 2026-06-18.

Cooking becomes a multi-axis minigame. Heat per appliance, stir/flip to speed
up + reset burn risk, recipe procedures defining the ideal cook sequence, and
4-tier quality that rewards or punishes the player's process. Wires the art
pipeline to a multi-URL fallback chain so quality and ingredient stage
variants can be added incrementally.

## Locked decisions

### Heat per appliance
- Cast Iron and BBQ have a 3-position heat selector: **Low / Medium / High**.
- Microwave has no heat dial (no nozzle).
- Heat changes are **free** — click anytime, no energy cost.
- Default: `medium`.

### Stir / Flip (universal `agitate` action)
- One per pot per turn. Costs **1⚡**.
- Effect: `cookTurnsLeft -= 1`, sets `lastStirTurn = state.turn` (resets burn risk for this turn).
- Cast Iron labels the button **Stir**, BBQ labels it **Flip**, both invoke the same `agitatePot` reducer.
- Microwave can't be agitated.

### Burn risk
- At end-of-turn, for each player pot:
  - if `heat === 'high'` AND `lastStirTurn !== state.turn` → **25% chance** to become `burnt`
- Burnt flag is permanent. Quality at synthesis = `'burnt'` regardless of procedure.

### Recipe procedures
Each recipe carries `procedure: [{ tag, heat }, ...]` describing the ideal
add-order and heat per step. Locked-in procedures:

| Recipe | Procedure |
|---|---|
| Tamale Tornado | spice (Med) → protein (High) → masa (Med) |
| Pan Dulce Punch | flour (Low) → sugar (Med) |
| Empanada Enforcer | aromatic (Med) → protein (High) → flour (Low) |
| Burrito Bouncer | protein (High) → starch (Med) → tortilla (Low) |
| Habanero Haymaker | spice-premium (High) |
| Churro Chainsaw | flour (Med) → sugar (High) → spice (High) |

### Quality computation
`computeQuality(steps, burnt, recipe)`:
- `burnt === true` → `'burnt'` (overrides all else)
- All procedure steps matched by tag in order, all heats correct → `'perfect'`
- All matched by tag in order, ≥ 1 heat wrong → `'good'`
- Any tag mismatch / wrong order → `'plain'`
- Wild Dish (no matching recipe) defaults to `'plain'` (or `'burnt'` if burned)

### Quality stat + special modifiers
Applied to the synthesized wrestler:

| Quality | Stat modifier | Recipe special | Art variant |
|---|---|---|---|
| `perfect` | +1 ATK / +1 HP | kept | `<id>-perfect.png` (gold tint) |
| `good` | base | kept | `<id>-good.png` (silver tint) |
| `plain` | -1 ATK / -1 HP | **dropped** | `<id>-plain.png` (desaturated) |
| `burnt` | floor(stats / 2) | **dropped** | `<id>-burnt.png` (sepia, charred) |

Ingredient specials (e.g. Onion's Tear Gas, Garlic's Aromatic Infusion) are
always preserved — only the recipe-intrinsic special (Whirlwind, Sugar Rush,
Shell, Heavy Wrap, Spicy Spit, Berserk) is gated by quality.

The recipe-intrinsic special is tagged `recipeIntrinsic: true` at attachment
time so the quality filter can find and strip it.

### Rival quality override
- Rival side passes `forceQuality: 'good'` to `synthesizeWrestler`. AI cooks competently but never perfectly. Procedure-following AI was out of scope.

### Art pipeline (multi-URL fallback chain)
- `art.js` exports `recipeArtUrls(id, quality)` and `ingredientArtUrls(id, stage)` returning **arrays** of URLs to try in order.
- `CardArt.jsx` accepts either a string `src` or an array, tries each in order via `<img onError>`, falls back to emoji glyph.
- Filename convention:
  - `recipes/<bare-id>.png` — base (used when quality file missing OR quality is `'good'`)
  - `recipes/<bare-id>-{perfect,good,plain,burnt}.png` — optional quality variants
  - `ingredients/<bare-id>.png` — base (raw stage)
  - `ingredients/<bare-id>-{chopped,cooking,cooked,burnt}.png` — optional stage variants
- Files added incrementally over time. Game never breaks on missing files.

### Art generation scaffolding
- `scripts/art-prompts.json` — manifest of 167 prompts (style + per-card subject).
- `scripts/generate-art.ps1` — driver that auto-detects provider (Replicate / OpenAI / local Automatic1111 SD) via env var, batches generation, idempotent.
- `scripts/README.md` — setup instructions and cost table.
- Pixel-art aesthetic chosen as the style direction.
- alex opted to generate art externally rather than wire up an MCP/API. The scaffolding is there if they change their mind.

## State shape additions

```
side.appliances[i].heat = 'low' | 'medium' | 'high'
side.appliances[i].cooking.steps = [{ type: 'add' | 'stir' | 'flip', ingredientId?, heat, turn }, ...]
side.appliances[i].cooking.burnt = bool
side.appliances[i].cooking.lastStirTurn = number | null

wrestler.quality = 'perfect' | 'good' | 'plain' | 'burnt'
```

## Implementation pointers

- `src/data/recipes.js` — `procedure` arrays on all 6 recipes
- `src/game/recipe.js` — `computeQuality`, `applyQuality`, synthesis with quality
- `src/game/state.js` — `setApplianceHeat`, `agitatePot`, `tickBurnRisk`, step logging in `placeInAppliance`
- `src/game/art.js` — multi-URL functions
- `src/components/CardArt.jsx` — multi-URL fallback chain (failedUrls Set, no useEffect)
- `src/components/ApplianceSlot.jsx` — heat L/M/H pills, Stir/Flip button, burnt indicator, per-add heat chip
- `src/components/RingSlot.jsx` — quality badge bottom-right, quality CSS filter on the slot art
- `src/App.css` — heat pills (blue/orange/red), agitate button, quality badges (gold/silver/gray/red), quality art filters

## Out of scope

- Ingredient-stage art (raw/chopped/cooking/cooked/burnt) — URLs wired, files not yet created.
- Visual swap of ingredient art across cutting board → pot → done states. Currently just emoji.
- Cookbook editing UI.
- Pantry / between-match meta.
