# Phase 4 — Thematic Effects, Order, and the Action Market

**Status:** Locked-in by user feedback on 2026-05-26.

Phase 3 shipped the cooking core. Phase 4 adds *flavor*: ingredients and
dishes now have Radlands-style thematic specials, order-of-cooking matters,
the cook timer is realistic, an Action Market joins the ingredient deck, and
the rival upgrades to the same toolset.

---

## Locked decisions

### Cook timer realism
- Only ingredients with `cookTimeAdds: true` extend an appliance's cook timer.
- Qualifying tags (the realistic ones that *take* time to cook): `protein`,
  `red-meat`, `white-meat`, `masa`, `tortilla` (dough), and certain dense
  starches. Spices, aromatics, fats, acids, sweets, and fresh items contribute
  +0 to the timer.

### Order matters
- Each ingredient may carry a `position` trigger on its special:
  - `firstIn` — only fires if this ingredient was added **before** any protein
    in the pot. Models aromatics infused early.
  - `lastIn` — only fires if this ingredient was added **last** to its pot.
    Models finishing acids, salt cures.
  - `always` — fires regardless.
- The cooking pot stores `ingredients` as an ordered list; position is derived
  at synthesis time, not stored separately.

### Ingredient specials (Phase 4 set)
Each ingredient has at most one `special` with shape:
```
{
  id: string,              // dispatcher key
  name: string,            // shown in UI
  trigger: 'onCook' | 'onAttack' | 'onTakeDamage' | 'onTurnInRing' | 'static',
  position: 'firstIn' | 'lastIn' | 'always',
  description: string,
}
```

| Ingredient | Special id | Trigger | Position | Effect |
|---|---|---|---|---|
| Onion | `tear-gas` | onCook | always | Rival chef takes 1 chip damage when dish enters ring |
| Garlic | `aromatic-infusion` | static | firstIn | Dish gains +1 ATK; aura: ally ring wrestlers regen +1/turn |
| Habanero | `lingering-burn` | onAttack | always | Target takes +1 damage next turn |
| Cinnamon | `caramelize` | onTurnInRing | firstIn | If sugar is also in pot: +1 ATK per turn in ring (cap +3) |
| Cilantro | `polarizing` | onCook | always | 50/50: +3 or –1 ATK |
| Lime | `acid-pierce` | static | always | Dish ignores wrestlersOnly blockers, can hit chef anyway |
| Salt | `cured` | onTakeDamage | lastIn | Survives the first lethal hit with 1 HP |
| Butter | `browning-catalyst` | static | firstIn | Doubles every other ingredient's firstIn bonus in this pot |
| Tomato | `stew-base` | onTurnInRing | always | Heals 1 to one other ally ring wrestler per turn |
| Cheese | `sticky-melt` | static | always | +2 HP at synthesis (passive stat buff) |
| Lard | `slippery` | onTakeDamage | always | First incoming attack on this dish reduced by 2 |
| Rice | `filler` | static | always | +1 HP per other ingredient in pot |

### Dish specials (Phase 4 set)
Each recipe gets an intrinsic `special`. Same shape as ingredient special
but `position` is always `always` (recipes don't have first/last meaning).

| Recipe | Special id | Trigger | Effect |
|---|---|---|---|
| Tamale Tornado | `whirlwind` | onAttack | Also deal 1 damage to wrestler in next ring slot |
| Pan Dulce Punch | `sugar-rush` | onCrash | +2 ATK on the turn it crashes (one last hurrah) |
| Empanada Enforcer | `shell` | onTakeDamage | Halve damage from non-protein attackers |
| Burrito Bouncer | `heavy-wrap` | static | Adjacent ally ring wrestlers gain +1 max HP aura |
| Habanero Haymaker | `spicy-spit` | onCook | Deal 1 damage to ALL enemy ring wrestlers on entry |
| Churro Chainsaw | `berserk` | onTurnInRing | +1 ATK while HP below half |

### Action Market (shared communal pile)
- One shared, shuffled deck of action cards exists for the match.
- Both players draw from it.
- Action cards mix into each player's hand alongside ingredients.
- Each end-of-turn, each side draws cards back up to `HAND_SIZE` from their
  ingredient deck PLUS attempts to draw 1 action card from the shared pile
  (skipped if empty).
- Played action cards go to a shared discard. When the shared deck empties,
  reshuffle the shared discard.
- 15 starting action cards (rarity = `common` | `rare`):

| Card | Cost | Rarity | Effect |
|---|---|---|---|
| Mise en Place | 1 | common | Look at top 3 of your ingredient deck, keep 1, discard 2 |
| Pressure Cooker | 2 | common | Reduce chosen appliance's cook timer by 2 |
| Open Flame | 1 | common | +1 cook timer on chosen pot; dish gains +2 ATK and crash-immune |
| Guest Chef: Abuela Inferno | 0 | rare | Add a random unowned recipe to your readied list this match |
| Salt Bae | 0 | common | Add salt as lastIn to chosen pot (no energy cost ingredient drop) |
| Kitchen Fire! | 2 | common | 3 dmg to all enemy ring wrestlers AND all your cooking pots |
| Taste Test | 1 | common | Peek at rival's hand for 1 turn |
| Snack Break | 0 | common | Heal chef 3; discard 1 random ingredient from hand |
| Family Recipe | 0 | rare | Treat chosen pot as having every tag — guaranteed match |
| Spice Rack | 1 | common | +1 ATK to all currently-cooking dishes (applied at next synthesis) |
| Bonus Tip | 0 | common | Draw 2 ingredient cards |
| Pantry Raid | 2 | common | Tutor a specific ingredient from your deck to your hand |
| Sous Chef | 3 | rare | This turn, place 2 ingredients in a single action |
| Crowd Pleaser | 1 | common | If 3 wrestlers in ring, deal 2 to rival chef |
| Composter | 0 | common | Discard from hand; each card → –1 food waste |

### Rival upgrade
- Rival gets the same shape: 3 appliances, cookbook with 3 readied recipes,
  food waste meter, ingredient deck, draws from shared action market.
- Rival cookbook is themed differently per character (El Bistec runs heavy
  red-meat dishes — readied recipes lean protein).
- Rival AI:
  - Pick best affordable ingredient that progresses a readied recipe in some
    pot (greedy match scorer).
  - 50% chance per turn to play one affordable action card.

---

## Trigger dispatcher

A new `src/game/effects.js` exposes:
```
applyTrigger(state, side, wrestler, trigger, context) → state
```

Internally it iterates `wrestler.specials` (a string-id list), looks up
the handler in a `HANDLERS` table, and runs each.

Trigger points wired into `state.js`:
- `onCook`        — fires in `tickAppliances` when a wrestler enters the ring.
- `onAttack`      — fires in `resolveCombat` for the attacker.
- `onTakeDamage`  — fires in `resolveCombat` for the defender being hit.
- `onTurnInRing`  — fires once per wrestler at end of `tickRing`.
- `onCrash`       — fires when crash damage actually lands.
- `static`        — never fires; consulted directly via helpers like
                    `hasStatic(wrestler, 'acid-pierce')`.

---

## Specials compilation at synthesis

When an appliance finishes cooking, `synthesizeWrestler` collects specials:
1. Recipe's intrinsic special (always included on match; absent on Wild Dish).
2. For each ingredient in the pot:
   - If `special.position === 'firstIn'`: include only if no protein was
     added before this ingredient.
   - If `special.position === 'lastIn'`: include only if this is the final
     ingredient in the pot.
   - If `'always'`: always include.
3. Apply static-at-synthesis effects to base stats (Rice's +1 HP per other
   ingredient; Cheese's +2 HP; Garlic's +1 ATK; Open Flame action's +2 ATK
   and crash immunity).
4. Attach `specials: [id, ...]` to the wrestler object.

---

## Out of scope for Phase 4

- Cookbook editing UI (still hardcoded; Phase 5 lets players swap readied).
- Chef ability sheets / dice-rolled Wild Dish quality (Phase 5).
- Pantry / between-match deck building (Phase 6).
- Multi-match meta (relics, currency, market shopping).

---

## Implementation order

1. `ingredients.js` — flags, specials, 9 new ingredients.
2. `recipes.js` — dish specials.
3. `actions.js` — action card data.
4. `effects.js` — handler registry + dispatcher.
5. `recipe.js` — new cook-time logic, position-aware specials.
6. `state.js` — shared action deck, mixed hand, action play, symmetric rival,
   trigger wiring, food-waste mechanics unchanged.
7. UI updates: Card, ApplianceSlot, Cookbook, RingSlot, GameTable, App.css.
8. Smoke test and verify.
