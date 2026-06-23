# Phase 8 — Nutritional Stats, Crowd VP, Chefs, Markets

**Status:** Design locked 2026-06-18. No code yet.

This is the biggest mechanical rework in the game's history. It replaces the
attack/defense foundation with a 6-stat nutritional system that drives almost
every combat, support, sabotage, and victory mechanic. Chefs become strategic
identities with trackers, allergies, and unlock abilities. VP doubles as
points and currency. A new Flex action turns Sodium into crowd hype. Calories
gate manager fullness. Ingredient and recipe rosters expand to 34 + 14.

This design is built **on top of** the Phase 5–7 mechanics (combat orders,
cutting board, heat, stir/flip, procedures, quality, crowd pleaser, knife,
turn-start choice, art chain). Those systems stay; Phase 8 layers a new
arithmetic foundation under them.

---

## Core: six nutritional stats + calories

Every ingredient carries values across these axes. Dishes inherit summed
values from their ingredients (capped at 20 per axis).

| Stat | Purpose | Drives |
|---|---|---|
| **Protein** | Physical strength | Attack = floor(Protein / 2), grapples, contributes to maxHP |
| **Carbs** | Energy + buff range | Carb threshold tiers expand buff reach across the ring |
| **Fat** | Durability + mitigation | Fat threshold tiers reduce incoming damage; contributes to maxHP |
| **Fiber** | Support radius | Fiber threshold tiers expand ability reach (self → adj → row → all → enemy) |
| **Sugar** | Burst + crash | Sugar threshold tiers grant haste / extra action / immediate flex, with crash penalty |
| **Sodium** | Crowd Appeal | Sodium threshold determines Flex success (D6 roll) and VP earned |
| **Calories** *(derived)* | Manager fullness gate | `Calories = Protein + Carbs + (Fat × 2) + Fiber + Sugar`. Sodium contributes 0 cal. |

**Stat cap:** 20 per axis on any single dish. Excess is wasted at synthesis.

**Quality additive (Phase 7 interaction):** the cook quality tier applies a flat additive across all 6 stats.
- Perfect: +2 each
- Good: 0
- Plain: -1 each
- Burnt: -3 each (stats clamped at 0 minimum)

---

## Combat formulas

```
attack = floor(Protein / 2)
maxHP = 5 + floor((Protein + Fat) / 2)
```

Damage taken is reduced by Fat threshold, then by any block / shell / slippery / cured effects already in the game.

### Fat threshold (damage mitigation)
| Fat | Mitigation |
|---|---|
| 0-4 | none |
| 5-9 | -1 incoming damage |
| 10-14 | -2 incoming damage |
| 15+ | **Intercept** — may absorb attacks aimed at the chef once per round |

### Fiber threshold (ability reach)
| Fiber | Reach |
|---|---|
| 1-2 | self only |
| 3-5 | self + adjacent |
| 6-9 | full row (this side) |
| 10-14 | all friendly wrestlers |
| 15+ | extends to enemy wrestlers |

### Carbs threshold (buff radius)
| Carbs | Buff reach |
|---|---|
| 1-4 | self |
| 5-9 | adjacent allies |
| 10-14 | row |
| 15+ | all allies (and grants +1 turn-action this round if dish in ring) |

### Sodium threshold (Flex / Crowd Appeal)
Sodium drives the **Flex** action — see Flex section below.

### Sugar threshold (burst + crash)
| Sugar | Burst on entry | Crash penalty (2 turns later) |
|---|---|---|
| 0-4 | nothing | none |
| 5-9 | **Haste** — acts on entry turn (bypasses turnsInRing<1) | none |
| 10-14 | **Double action** — two of {attack/block/spring/flex/feed} this turn | -2 ATK for 2 turns |
| 15+ | **Immediate Flex** on entry (auto-flex, no round-action consumed) | -2 ATK and -2 HP for 2 turns |

Sugar crashes **stack with** existing recipe `crashAfter` (e.g. Pan Dulce Punch still has its 2t/2dmg crash AND a sugar crash if Sugar ≥ 10).

---

## Flex (new player action)

Sodium = Crowd Appeal. Players take the **Flex** action to convert ring presence into VP.

**Mechanic:** Flex consumes the dish's round-action (alternative to Attack / Block / Spring / Feed Manager). Roll a D6. Result must meet the Sodium-tier DC. Failed flex = nothing (crowd ignores it). Successful flex earns VP per the tier.

| Sodium | DC (D6 ≥) | Success rate | Success reward |
|---|---|---|---|
| 0-2 | impossible | 0% | (cannot flex — crowd doesn't notice) |
| 3-5 | 5 | 33% | +1 VP |
| 6-9 | 4 | 50% | +2 VP |
| 10-14 | 3 | 67% | +3 VP |
| 15+ | auto | 100% | +4 VP **and** crowd chant (draw 1 card OR perform another flex this round) |

Flex EV scales nonlinearly with Sodium — low-Sodium dishes barely break even; high-Sodium dishes are reliable VP engines.

---

## Victory conditions

Two parallel win paths. Either ends the match instantly.

1. **First to 30 VP wins** (Flex + universal VP rewards).
2. **Chef HP → 0** ("**De-mask**" win — the loser is shamed, mask pulled).

VP doubles as **currency** — players can spend VP on prefab one-shot powerful effects (see VP catalog below). Spending VP trades win progress for in-match power, creating real tension.

---

## VP-spend catalog (universal — any chef can use)

| Name | Cost (VP) | Effect |
|---|---|---|
| **Sharpen on the Fly** | 1 | +1 knife sharpen counter |
| **Catering Call** | 2 | Draw 2 ingredient cards |
| **Manager's Moxie** | 3 | Refund 2 energy this turn |
| **First Aid** | 3 | Heal one of your ring dishes by 3 HP |
| **Recipe Sabotage** | 3 | Add a salt-bomb to an enemy pot — +5 Sodium and scramble their procedure |
| **Crowd Surge** | 4 | All your ring dishes gain +2 Sodium until end of round |
| **Health Inspector** | 5 | Restore chef +5 HP |
| **Boos to Cheers** | 6 | All enemy Flex actions auto-fail this round |

Chefs also get **signature** VP-spends (see chef roster).

---

## Manager system

Each chef card carries:

- **HP / maxHP** — chef health (KO at 0).
- **Appetite** — calorie ceiling. Each Feed Manager action consumes the eaten dish's calories into a Fullness counter. When Fullness > Appetite, the chef is **Bloated**.
- **Allergies** — dietary weaknesses. Force-feeding the chef a dish matching their allergy tags amplifies sabotage damage.
- **Tracker Goal** — stat targets across nutrient axes. Filled by Feed Manager and (partially) by hostile Spring overfeeding.
- **Reward Unlock** — permanent ability granted when tracker goal is hit during the match.
- **Signature VP-spend** — chef-exclusive one-shot.

### Bloated
- Triggered when Fullness > Appetite.
- Effect: **skip your next turn entirely** (food coma).
- Bloated state clears at end of skipped turn; Fullness resets to 0.

### Feed Manager (player action)
- Cost: 1 energy.
- Select your own ring wrestler → wrestler is removed → its 6 nutrient values add to your tracker; its calorie count adds to Fullness.
- If Fullness exceeds Appetite from this feed, manager becomes Bloated *after* the tracker fills (so you can hit a tracker goal on the same feed that bloats you).

### Sabotage (three layered vectors)
1. **Force-Feed action card** in the shared Action Market — pick an enemy ring dish, it gets fed to THEIR manager (their tracker adds nutrition + their Fullness adds calories). High-calorie force-feeds are bloat-bombs.
2. **Chef-specific allergies** — when a force-fed dish has a tag in the chef's allergy list, the chef takes additional chip damage equal to the dish's matching-tag count.
3. **Hostile Spring overfeed** — Spring → enemy chef now also adds nutrition + calories to the target chef's tracker. Overshoots can trigger Bloated.

---

## Initial chef roster (4 chefs, pickable at match start)

| Chef | HP | Appetite | Allergies | Tracker Goal | Reward Unlock | Signature VP-Spend |
|---|---|---|---|---|---|---|
| **Chef Rivera** *(default)* | 30 | 80 | none | 20 Pro + 15 Carb | Free Stir/Flip — agitate costs 0⚡ for rest of match | — (universal only) |
| **The Gobbler** | 35 | 120 | Raw quick-eats (instant tag) — 2× sabotage damage when force-fed | 50 total nutrition consumed (any stat) | Gobble — Feed Manager also heals chef by dish's HP value | **Devour** (5 VP) — destroy an enemy ring dish (no spring needed) |
| **Vegan Fury** | 25 | 60 | red-meat / white-meat / dairy / animal-fat tags | 30 Fiber + 20 Carb | Poison Meat — any enemy ring dish with meat tag loses 1 HP/turn | **Herbal Surge** (4 VP) — all your veg/fresh ingredient dishes +2 Fiber until end of round |
| **Top Chef** | 28 | 70 | high-sugar OR high-sodium dishes (>10 either) — 2× sabotage damage | 25 Pro + 20 Carb | Recipe Fusion — combine 2 ready recipes into one fusion wrestler with summed stats (once per match, stat caps still apply) | **Improvise** (3 VP) — chosen pot has every tag this turn (Family-Recipe equivalent) |

---

## Ingredient roster (34 total — 22 existing + 12 new)

### Existing 22 (with nutritional values added)

| Ingredient | Tags | Pro | Carb | Fat | Fib | Sug | Sod | Cal |
|---|---|---|---|---|---|---|---|---|
| corn-masa | masa, starch, grain | 2 | 8 | 1 | 3 | 1 | 0 | 16 |
| flour | flour, starch, grain | 2 | 9 | 0 | 1 | 0 | 0 | 12 |
| tortilla | tortilla, starch | 2 | 7 | 2 | 2 | 0 | 3 | 15 |
| rice | rice, starch, grain | 2 | 9 | 0 | 1 | 0 | 0 | 12 |
| beef-chuck | protein, red-meat | 9 | 0 | 7 | 0 | 0 | 1 | 23 |
| pork | protein, red-meat | 8 | 0 | 8 | 0 | 0 | 1 | 24 |
| chicken | protein, white-meat | 9 | 0 | 3 | 0 | 0 | 1 | 15 |
| onion | vegetable, aromatic | 1 | 2 | 0 | 3 | 2 | 0 | 8 |
| garlic | vegetable, aromatic | 1 | 2 | 0 | 2 | 0 | 0 | 5 |
| cilantro | herb, aromatic, fresh | 1 | 0 | 0 | 4 | 0 | 0 | 5 |
| sugar | sugar, sweet | 0 | 5 | 0 | 0 | 9 | 0 | 14 |
| cinnamon | sugar, spice, aromatic | 0 | 2 | 0 | 3 | 1 | 0 | 6 |
| chili | spice, vegetable | 1 | 1 | 0 | 2 | 1 | 1 | 5 |
| habanero | spice, spice-premium, acid | 0 | 1 | 0 | 2 | 2 | 1 | 5 |
| lime | acid, fresh, citrus | 0 | 2 | 0 | 1 | 1 | 0 | 4 |
| salt | mineral, cure, finisher | 0 | 0 | 0 | 0 | 0 | 9 | 0 |
| butter | fat, dairy | 1 | 0 | 9 | 0 | 0 | 2 | 19 |
| lard | fat, animal | 0 | 0 | 10 | 0 | 0 | 0 | 20 |
| tomato | vegetable, fresh, acid | 1 | 2 | 0 | 2 | 3 | 0 | 8 |
| cheese | dairy, fat | 6 | 1 | 7 | 0 | 1 | 4 | 22 |
| poptart-of-pain | sweet, instant, snack | 2 | 6 | 3 | 0 | 9 | 4 | 23 |
| raw-celery | fresh, vegetable, instant | 1 | 1 | 0 | 5 | 1 | 0 | 8 |

### New 12

| Ingredient | Tags | Cut? | Pro | Carb | Fat | Fib | Sug | Sod | Cal | Special |
|---|---|---|---|---|---|---|---|---|---|---|
| **egg** | protein, binder, dairy | — | 6 | 0 | 4 | 0 | 0 | 1 | 14 | `firstIn`: +1 Sodium to dish |
| **black-beans** | bean, protein, vegetable | — | 6 | 4 | 0 | 6 | 1 | 0 | 17 | Provides 'protein' tag without meat (Vegan-safe) |
| **avocado** | fruit, fat, fresh | ✓ | 2 | 3 | 7 | 5 | 1 | 0 | 22 | Dish takes -1 incoming dmg (creamy buffer) |
| **jalapeño** | spice, vegetable | ✓ | 0 | 1 | 0 | 2 | 2 | 0 | 5 | Mid-tier spice option |
| **mushroom** | vegetable, umami, fungus | ✓ | 3 | 2 | 0 | 2 | 1 | 1 | 8 | +2 Protein to dish (umami meat-sub) |
| **potato** | starch, vegetable | ✓ | 2 | 8 | 0 | 3 | 1 | 0 | 14 | Bulk filler |
| **bell-pepper** | vegetable, sweet, fresh | ✓ | 1 | 3 | 0 | 2 | 4 | 0 | 10 | Sweet-veg hybrid |
| **chorizo** | protein, red-meat, spice | ✓ | 7 | 1 | 8 | 0 | 0 | 3 | 24 | Counts as **BOTH** protein and spice in recipe matching |
| **tomatillo** | vegetable, fresh, acid | ✓ | 1 | 2 | 0 | 2 | 2 | 0 | 7 | Green-sauce ingredient |
| **chocolate** | sugar, sweet, premium | — | 2 | 6 | 5 | 3 | 8 | 1 | 30 | Counts as **spice** when paired with chili (mole synergy) |
| **crema** | dairy, fat, fresh | — | 2 | 1 | 6 | 0 | 1 | 2 | 18 | Cools spice — dish's Sugar burst tier -1 |
| **plantain** | fruit, starch, sweet | ✓ | 1 | 9 | 0 | 3 | 7 | 0 | 20 | Sweet-starch hybrid |

---

## Recipe roster (14 total — 6 existing + 8 new)

### Existing 6 — kept as-is, specials still layered

(Tamale Tornado, Pan Dulce Punch, Empanada Enforcer, Burrito Bouncer,
Habanero Haymaker, Churro Chainsaw — procedures and specials unchanged
from Phase 7. Stats now flow through Protein/Fat to compute attack and HP.)

### New 8

| Recipe | Requires | Procedure | Special |
|---|---|---|---|
| **Mole Marauder** | chocolate(1) + chili(1) + protein(1) | choc(Low) → chili(Med) → protein(High) | On attack: all enemy wrestlers get "Mole Stain" (-1 ATK next turn) |
| **Carnitas Crusher** | pork(1) + lard(1) + spice(1) | pork(High) → lard(Med) → spice(High) | On entry: 1 dmg to each adjacent enemy |
| **Guacamole Guerrero** | avocado(1) + lime(1) + cilantro(1) | avocado(Low) → lime(Low) → cilantro(Low) | Block reduces dmg by **75%** and protects whole ring side |
| **Pozole Powerhouse** | masa(1) + protein(1) + cilantro(1) | masa(Low) → protein(Med) → cilantro(Low) | Soup Slosh: +1 HP to all friendly ring wrestlers per turn |
| **Queso Fundido Fury** | cheese(2) + protein(1) | cheese(Low) → cheese(Med) → protein(High) | Sticky Melt: attackers lose 1 ATK for 2 turns |
| **Sopes Strongman** | masa(1) + cheese(1) + protein(1) | masa(Med) → protein(High) → cheese(Low) | Layered Defense: Fat-mitigation tier +1 |
| **Flan Flexer** | egg(1) + sugar(1) + dairy(1) | egg(Low) → sugar(Med) → dairy(Low) | Auto-Flex on entry (regardless of Sugar) |
| **Tostada Throwdown** | tortilla(1) + protein(1) + acid(1) | tortilla(High) → protein(High) → acid(Low) | Crunchy Counter: when attacked, deals 1 dmg back |

El Bistec's cookbook adds **Carnitas Crusher** as a 4th readied option to match his red-meat theme.

---

## State shape additions

```js
state.victoryPoints = { player: 0, rival: 0 }
state.chefs = { player: <chefId>, rival: <chefId> }       // picked at game start

side.tracker = { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
side.fullness = 0                                          // calories eaten this match
side.bloated = false                                       // skip next turn flag
side.unlocked = false                                      // chef reward unlock fired

wrestler.nutrition = { protein, carbs, fat, fiber, sugar, sodium, calories }
wrestler.maxHp = 5 + floor((nutrition.protein + nutrition.fat) / 2)
// attack is now derived: floor(nutrition.protein / 2)
// Phase 4 wrestler.attack is REPLACED by this derivation at synthesis.
```

---

## Implementation order

1. **Data layer** — extend `ingredients.js` with the 6-stat nutritional values + calories on every ingredient (22 existing + 12 new = 34). Extend `recipes.js` with the 8 new recipes. Add `chefs.js` with the 4-chef roster.
2. **Stat aggregation** — `recipe.js synthesizeWrestler` sums ingredient nutrition into the wrestler. Apply quality additive. Apply stat cap (20). Derive attack, maxHp.
3. **Threshold engine** — `src/game/thresholds.js` with `getTier(stat, value) → 'self' | 'adj' | 'row' | 'all' | 'enemy'` and similar for Fat/Carbs/Sodium/Sugar. Used everywhere mitigation, reach, buffs are computed.
4. **Flex action** — `flexDish(state, slot)` reducer. D6 roll. Sodium-tier DC. Award VP per tier. Crowd chant tier triggers card draw or re-flex.
5. **Manager tracker + Feed Manager** — `feedManager(state, slot)` reducer. Add `state.player.tracker` + `state.player.fullness`. Bloated check after each feed. Reward unlock check after each feed.
6. **VP economy** — `spendVP(state, effectId, target?)` reducer. Universal catalog + chef-specific catalog. 30 VP win condition.
7. **Sabotage** — new Force-Feed action card. Hostile Spring → enemy chef now adds nutrition + calories. Chef allergy check applies chip damage.
8. **Chef pick screen** — new initial screen before match start. Stores `state.chefs.player`.
9. **UI** — dish cards show 6-stat bar; manager card shows tracker progress + Appetite gauge; new Flex button on order menu; new VP counter; new chef pick screen.

Build complexity: ~3× Phase 7. Will likely split into 8a (mechanics + data) and 8b (UI + chef screen) during implementation, but design is unified.

---

## What this absorbs from the V1 triage list

- ✅ VP as second win path (Sodium → Flex → VP)
- ✅ Crowd Favor system (Sodium drives it)
- ✅ Legendary Dish (naturally emerges from high-stat builds)
- ✅ Chef cards with strengths AND weaknesses (4 chefs with tracker / allergy / unlock)
- ✅ Chef pick screen at match start
- ✅ Recipe Mastery (folded into chef tracker rewards)
- ✅ Recipe Fusion (Top Chef's unlock)
- ✅ Dice-based combat with chance (Flex roll; sabotage interactions)

## Still on the triage list, not absorbed by Phase 8

- Event cards as separate auto-trigger deck (independent)
- Allergy mechanic (touched by chef allergies but could expand to dish-level)
- Manager's Bet (independent VP side game)
- Course-based gameplay (game length structure)
- Multi-phase round structure (Draw → Event → Action → Combat → Crowd → End)
- Multiplayer 3+ players
- Buy-from-face-up market (Phase 8 uses VP-spend prefab effects instead — supersedes)
- Raw ingredients as defenders (still independent)

These remain as future-phase candidates.

---

## Out of scope for Phase 8

- Course-based gameplay (Phase 9 candidate)
- Event card deck (Phase 9 candidate)
- Multiplayer (Phase 10+)
- Per-ingredient stage art (URLs wired in Phase 7, files still to be drawn)
- Custom chef portraits (need art)
