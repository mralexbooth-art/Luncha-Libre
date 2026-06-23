# Phase 9 — Combat Economy, Spice Rack, Market, Cookware

**Status:** Sections 1, 2, 4, 5, 6, 7 (market), 8, 14 shipped 2026-06-18. Section 3 (spice rack) deferred to **Phase 9.1**.

This phase reshapes the resource economy of every turn. Attacks now cost energy
(so combat competes with cooking instead of being free upside). The turn-start
menu pivots away from utility (sharpen/maintain) toward strategy (Flex for VP,
Visit Market). A spice rack opens a third "card class" with phased activations.
Combat gets a positional grid (range matters; Fiber extends reach). Burn becomes
ingredient-level rather than pot-level, and liquid coolants give players a
counter. The market system turns VP-as-currency from a one-shot effect bank into
a draft mechanic — including the ability to **swap cookware** mid-match.

This builds **on top of** Phase 8 nutrition + thresholds, Phase 7 heat/quality,
and the existing Phase 4–6 systems. None of those are replaced — the new
arithmetic layers in.

---

## 1. Energy-cost attacks

Combat actions now charge energy. Cooking still costs 1⚡ per ingredient placed,
so a player with 3⚡ must choose between a 3-ingredient cook turn, 3 attacks, or
a mix. This is the headline strategic tension Phase 9 introduces.

| Order | Energy cost | Notes |
|---|---|---|
| **Attack** (vs wrestler or chef) | **1⚡** | Was free. Now matches placement. |
| **Block** | 0⚡ | Defensive — stays free. |
| **Spring** (chef-only launch) | 1⚡ per springboard ally | Unchanged. |
| **Flex** (dish-level Sodium roll) | 0⚡ | Crowd-appeal action, stays free. |
| **Feed Manager** | 1⚡ | Unchanged. |

**UI:** Attack button in the OrderMenu gets a `1⚡` badge and is disabled
when `player.energy < 1`. Tooltip explains the cost.

**Edge case:** if an attacker is mid-ordering (in `pick-attack` step) and the
player's energy drops to 0 (e.g., from another effect), cancel the order with a
"not enough energy" log.

---

## 2. Turn-start menu rework

**Old menu:** Draw 3 / Sharpen Knife / Maintain Cookware
**New menu:** **Draw 3 / Crowd Please (Flex) / Visit Market**

Sharpen and Maintain are not deleted — they relocate:
- **Sharpen** stays as the existing VP-spend ("Sharpen on the Fly", 1 VP).
- **Maintain** becomes a free out-of-band action: clicking a burning appliance
  directly puts it out for **1⚡**, available any time it's the player's turn.
  No more turn-start gate. (This makes fires more punishing than free, but
  doesn't burn the whole turn-start.)

### 2.1 New "Crowd Please" turn-start option

The turn-start crowd-please is distinct from the per-dish Flex order; it
rewards VP based on the *current state of your ring* with a D6 fallback when
the ring is empty.

**Algorithm:**
```
let dishes = count of player.ring slots with a living wrestler
let buff   = sum of crowd-please buffs from chef rewards + spices + actions

if dishes >= 3:       VP += 3 + buff       // "ring is full — showmanship"
elif dishes == 2:     VP += 2 + buff
elif dishes == 1:     VP += 1 + buff
else /* dishes == 0 */:
  roll d6 + buff
  if roll >= 3: VP += 1
  if roll >= 6: also draw 1 ingredient   // bonus crit
  if roll < 3:  VP += 0                  // crowd unimpressed
```

Buffs come from:
- Chef rewards (e.g., a future chef ability "Showman" → +1 to crowd-please)
- Active spice cards that buff crowd-please
- Action cards (the existing "Crowd-Pleaser" action could grant +1)

**UI:** the TurnStartMenu shows the player's current ring count and the
projected VP gain so the choice is fully transparent. For 0-dish state, it
shows "Roll D6: 3+ for 1 VP, 6 for +1 card" instead of a fixed projection.

### 2.2 New "Visit Market" turn-start option

Opens the market modal (Section 7). Player spends VP on one offering and the
turn-start is consumed. Cannot also Draw or Flex this turn.

---

## 3. Spice rack

Spices become a new card class — **rare, powerful, time-limited buffs that
pin to specific procedure steps**.

### 3.1 Card shape

```js
{
  id: 'spice-rare-saffron',
  name: 'Saffron',
  type: 'spice',
  cost: 1,             // ⚡ to place
  rarity: 'rare',
  duration: 3,         // rounds it stays in rack ("amount number")
  pinning: 'any',      // 'any' = any pot/step OR specific tag e.g., 'protein'
  onActivate: {
    effect: 'boost-attack', amount: 2,
    description: '+2 ATK to the resulting dish.',
  },
  flavor: '...',
}
```

### 3.2 Where they come from

Spices live in the **shared action deck** but are tagged as `type: 'spice'`.
When drawn, they enter the player's hand like an action card. They can also be
purchased from the market.

### 3.3 Playing a spice card

1. Player selects a spice from hand.
2. UI prompts for a target pot (must be cooking).
3. UI prompts for a procedure step ordinal (1, 2, 3...).
4. Spice moves from hand to **spice rack** with `{spiceId, pot, step,
   roundsLeft: duration}`.

### 3.4 Activation

When the player adds an ingredient to a cooking pot that matches the spice's
pinned step (i.e., the next ingredient added is at the spice's pinned step
ordinal), the spice activates. Its `onActivate` effect fires immediately:
- `boost-attack`: pot's `produces.baseAttack` += amount when synthesized
- `boost-stat`: target stat (e.g., 'sodium') += amount at synthesis
- `extend-cook`: pot.cookTurnsLeft += amount
- `crash-immune`: future dish is crash-immune
- `reach-boost`: dish gets +N Fiber (extends reach permanently)

The spice card moves to "consumed" pile and is removed from the rack.

### 3.5 Expiration

Each round-end, every active spice's `roundsLeft -= 1`. At 0, the spice expires
unfired and is discarded. Visual: spice card fades on the rack.

### 3.6 State shape

```js
side.spiceRack = [{ spiceId, pinnedPot, pinnedStep, roundsLeft }, ...]
side.spiceRackSlots = 3  // max active spices
```

If rack is full, player can't play another spice until one expires or
activates.

### 3.7 UI

- New panel in the right sidebar OR below cutting board: "Spice Rack" with up
  to 3 slots.
- Each slot shows: spice icon, name, target pot (e.g., "Cast Iron · step 2"),
  rounds left.
- Hovering a slot highlights the target pot.
- Tooltip explains the effect.

### 3.8 Starter spice roster (5 cards)

| Spice | Cost⚡ | Duration | Effect on activation |
|---|---|---|---|
| **Saffron** | 1 | 3 | +2 ATK to dish |
| **Smoked Paprika** | 1 | 2 | Dish gains "Lingering Burn" — adjacent enemy -1 HP at end of turn |
| **Fresh Mint** | 0 | 3 | +3 Fiber (extends reach to row tier) |
| **Black Pepper** | 1 | 2 | Dish gets +1 attack vs chef directly |
| **Sea Salt Crystals** | 1 | 3 | +4 Sodium (boosts Flex DC tier) |

---

## 4. Combat reach (positional)

Combat is now positional. Players must consider which ring slot a dish lands in.

### 4.1 Default reach table

| Attacker slot | Default reach (rival slots) |
|---|---|
| 0 (left) | 0, 1 — front + diagonal |
| 1 (middle) | 0, 1, 2 — natural full reach |
| 2 (right) | 1, 2 — front + diagonal |

### 4.2 Fiber extends reach

If the attacker's Fiber stat hits the **row tier** (Fiber ≥ 6, from Phase 8's
`fiberTier()`), they can attack ANY rival slot regardless of position.

| Fiber | Reach modifier |
|---|---|
| < 6 | Default positional |
| ≥ 6 | Full row (all 3 rival slots) |

### 4.3 Chef-attack rule update

A dish can attack the rival chef **only if all reachable rival slots are
empty** (or contain dead wrestlers). Wrestlers in NON-reachable slots no longer
block chef attacks — meaning an edge-slot dish CAN bypass a wrestler in the
opposite-edge slot.

Example: Player slot 0 attacker (Fiber 3) can reach rival slots 0 + 1. Rival
has a dish in slot 2 only. → Player can attack the rival chef directly because
nothing in reach blocks them.

### 4.4 UI

- When a player picks "Attack" and starts target selection, only reachable
  rival slots highlight as valid targets.
- Out-of-reach slots get a "✕ out of reach" indicator on hover.
- Reach summary chip on each dish: `"reach: ▣▣▢"` showing which slots it can
  hit. Updates dynamically with Fiber buffs.

---

## 5. Burn system (ingredient-level + coolants)

Replaces the current Phase 7 25%-chance-per-turn pot-level burn risk with a
deterministic, ingredient-level system.

### 5.1 Heat units per turn

| Heat | Units/turn |
|---|---|
| Low (simmer) | 0 |
| Medium | 1 |
| High | 2 |
| Microwave | 0 (no heat concept) |

**Default heat:** When a pot starts cooking, its heat defaults to **low**
(simmer) — pots can sit indefinitely without burning unless the player
actively cranks the heat up.

### 5.2 Ingredient burn limit

New field on ingredients:

```js
ingredient.burnLimit: N   // null = never burns (e.g., water, frozen things)
```

Examples (added to ingredient roster):
- `chili`: burnLimit 2 (spices burn fast)
- `garlic`: burnLimit 2
- `cilantro`: burnLimit 1 (herbs burn fastest)
- `beef-chuck`: burnLimit 6 (robust)
- `corn-masa`: burnLimit 5
- `crema`: null (it IS the coolant)
- `egg`: burnLimit 3

### 5.3 Pot-level heat accumulation

```js
pot.cooking.heatUnits  // accumulator
```

At each turn-end, `heatUnits += heatPerTurn(pot.heat)`.

### 5.4 Pot burn threshold

```js
burnThreshold = min(burnLimit of all ingredients in pot, ignoring nulls)
```

When `heatUnits >= burnThreshold`, the pot **burns** — Phase 7's `burnt: true`
flag gets set, and quality at synthesis becomes `burnt` (the -3 stat
additive). The first ingredient to burn (lowest burnLimit) is highlighted in
the UI as the "culprit".

### 5.5 Stir/Flip resets

The existing Phase 7 `agitatePot` action (1⚡) resets `heatUnits` to 0. This
remains the primary defensive move.

### 5.6 Coolants

New field on certain ingredients:

```js
ingredient.coolant: N   // amount of heatUnits removed when added to a pot
```

Coolants:
- `crema`: coolant 2
- `butter`: coolant 1
- `lard`: coolant 1
- Future: water (new ingredient, coolant 3)

Adding a coolant to a cooking pot subtracts N from `heatUnits` (min 0)
**after** the ingredient is placed and before the pot's `addedThisRound`
increments. This gives players a non-stir alternative to manage heat.

### 5.7 UI: heat meter per pot

Every cooking pot displays a **horizontal heat meter** below the ingredient
list:

```
Heat: [████░░░░░░] 4 / 6  ⚠ chili burns first
```

- Bar fills proportionally to `heatUnits / burnThreshold`.
- Color: green (0-50%), yellow (50-80%), red (>80%).
- When over threshold: bar full red + 🔥 icon.
- Tooltip shows: total heatUnits, burnThreshold, which ingredient has lowest
  limit ("culprit").
- Stir button glows when heatUnits >= burnThreshold × 0.5.

---

## 6. VP currency visibility

VP is already shown in chef-row vital chip + VPPanel. Phase 9 promotes it:

- New **VP banner** in the table header: large gold coin icon with current VP
  count, prominent enough to scan during play.
- Animated +N pop when VP is earned (slides up from chef-row to banner).
- "Open Market" button next to the banner when player has ≥ minimum offering
  cost.

---

## 7. Market system

Mid-match shop. Turn-start option (`Visit Market`) opens a modal where the
player browses 4 random offerings drawn from the market pool and can purchase
**one** with VP.

### 7.1 Offering pool

Categories:

| Category | Cost range (VP) | What it does on purchase |
|---|---|---|
| Spice card | 2-4 | Added to player's hand. Plays normally. |
| Ingredient | 1-3 | Shuffled into player's ingredient deck. |
| Action card | 2-5 | Added to player's hand. |
| Utensil | 3-6 | Added to inventory (e.g., better cutting board). |
| Cookware | 5-10 | Player chooses one of their 3 appliance slots to **swap** with the new cookware. Replaced appliance is permanently lost this match. |

### 7.2 Refresh logic

Each "Visit Market" reroll generates a fresh set of 4 random offerings. If the
player declines all (cancel button), the turn-start is still consumed. (No
back-out — Market visits are committed.)

### 7.3 Sample offerings (seed pool)

| Name | Category | Cost | Effect |
|---|---|---|---|
| Air Fryer (cookware) | Cookware | 7 | Replaces an appliance. Cooks all dishes with +1 Fiber. Capacity 2/round. |
| Stockpot (cookware) | Cookware | 6 | Capacity 3/round (slow). All ingredients burn at 2× rate (i.e., burnLimit doubled). |
| Wok (cookware) | Cookware | 8 | First ingredient placed each round gets free "Clean" chop. |
| Mortar & Pestle | Utensil | 4 | While owned: spice cards play for -1⚡ cost. |
| Steel Cleaver | Utensil | 5 | While owned: chops roll 2d6 take highest (advantage). |
| Saffron | Spice | 3 | (see roster) |
| Caffeine Pill | Action | 3 | (see Section 14) |
| Mystery Crate | Mystery | 4 | Reveals to be a random ingredient, action, OR spice on purchase. |

> **Note:** Espresso Machine (+1 max energy passive) was considered for the
> market pool but is reserved as a **future chef signature reward** instead —
> kept as identity payoff for a "Barista"-style chef in a later phase.

### 7.4 UI

- Modal overlay with grid of 4 offering cards.
- Each card: name, category badge, cost in VP, description, art (or emoji fallback).
- "Buy" button per card (disabled if VP insufficient).
- "Skip Market" button at bottom (still consumes turn-start).

### 7.5 State

```js
state.market = {
  offerings: [{id, category, cost, ...}, ...],
  rerollTurn: N,   // turn it was last generated
}
```

Offerings are NOT discarded between visits — a fresh roll happens each visit.

---

## 8. Cookware abilities

Every appliance gets a unique passive. Phase 9 introduces 3 starter abilities
+ 3 new appliances available in the market.

### 8.1 Starter appliances (always own these by default)

| Appliance | Ability | Effect |
|---|---|---|
| **Cast Iron** | **Heat Retention** | Burn limit on every ingredient inside is +1 (gentler accumulation). |
| **Microwave** | **Quick Zap** | First ingredient placed has cookTime -1. No heat = no burn risk. |
| **BBQ** | **Char Mark** | If heat was on HIGH for at least 1 turn during cooking, dish gets +2 ATK at synthesis. |

### 8.2 Market appliances

| Appliance | Ability | Effect |
|---|---|---|
| **Air Fryer** | **Crisp Edge** | All dishes cooked here get +1 Fiber (passive). |
| **Stockpot** | **Slow Cook** | Per-round capacity is 3 instead of 1, cook time is +1. burnLimit on every ingredient is +2. |
| **Wok** | **Sear** | First ingredient placed each round automatically gets a "Clean" chop bonus (+1⚔ +2❤). Cuttable ingredients only. |

### 8.3 State

Appliance shape adds optional ability metadata:

```js
{
  applianceId: 'cast-iron',
  cooking: ...,
  onFire: false,
  heat: 'low',                  // default changes to 'low' per Section 5.1
  ability: { id: 'heat-retention', applied: bool },
}
```

Ability `id` keys into a dispatcher (similar to `effects.js` action handlers).

### 8.4 Ability dispatcher

New file `src/game/appliance-abilities.js`:

```js
export const APPLIANCE_ABILITIES = {
  'heat-retention': {
    name: 'Heat Retention',
    apply: (ingredient) => ({ ...ingredient, burnLimit: ingredient.burnLimit + 1 }),
    triggers: 'on-place',
  },
  'quick-zap':       { ... },
  'char-mark':       { ... },
  'crisp-edge':      { ... },
  'slow-cook':       { ... },
  'sear':            { ... },
}
```

Triggers: `on-place`, `on-synthesize`, `on-each-turn`.

### 8.5 UI

Appliance head shows ability tag:

```
🥘 Cast Iron · ★ Heat Retention
```

Hover reveals full description.

---

## 9. Implementation order

Suggested commit order to keep each batch testable:

1. **Energy-cost attacks** + OrderMenu energy badge. (1 commit)
2. **Turn-start menu rework** + Maintain → 1⚡ direct click. (1 commit)
3. **Crowd-please turn-start algorithm + UI projection**. (1 commit)
4. **Combat reach + reach UI**. (1 commit)
5. **Burn system** (heat units, ingredient burnLimit, coolant, heat meter UI). (1-2 commits)
6. **Cookware abilities** (starter set, dispatcher, label UI). (1 commit)
7. **Spice rack system** (card type, placement UI, activation, expiration). (2 commits)
8. **VP banner promotion**. (1 commit)
9. **Market system** (modal, offering pool, purchase flow, cookware swap). (2 commits)
10. **Market expansion** (Air Fryer / Stockpot / Wok wired). (1 commit)

Total estimate: 12-13 commits across 4-5 working sessions.

---

## 10. Open questions

- **Spice rack max slots**: 3 reasonable? More?
- **Crowd-please buff stacking**: cap at +3 to avoid runaway?
- **Cookware swap economy**: should the replaced appliance be recoverable, or
  permanently lost this match? (Doc says lost.)
- **Reach + chef-attack edge case**: should the rival chef rule mirror the
  player's, or stay simpler for AI?
- **Market refresh during the same turn**: should re-rolling cost VP, or is it
  one-shot per visit?

---

## 11. Phase 8 systems carried forward unchanged

- Nutritional 6-stat system
- Threshold engine (Fiber row tier now drives reach, see Section 4)
- VP-spend universal + chef-signature effects
- Manager tracker + allergies + bloat
- Force-feed / Feed Manager
- Shared Recipe Bounty
- Chef pick screen
- Field cookbook

## 12. Phase 7 systems modified

- **Heat / agitate / quality**: still core. Burn risk model changes per Section
  5 (now deterministic & ingredient-level rather than 25% chance).
- **Procedures**: still in. Spice cards reference procedure step ordinals (Section 3).

## 13. Phase 5–6 systems modified

- **Knife sharpener**: stays. Sharpen-on-the-Fly VP-spend is the only access path now
  (no more turn-start option).
- **Combat orders**: still in. Attack now costs 1⚡ (Section 1). Reach restricts
  valid targets (Section 4).

---

## 14. Energy gain economy

With attacks now costing energy (Section 1), the 3⚡/turn baseline gets very
tight — players need real recovery paths. Phase 9 adds **two** sources:

### 14.1 Sugar haste → +1⚡ on entry

Phase 8's `sugarTier()` already grants "haste" at Sugar ≥ 5. Layer in:
**when a dish with Sugar ≥ 5 enters the ring, the player gains +1⚡ that
turn**. Reinforces sugar's burst-energy theme without new state.

State: dispatched inside `tickAppliances`/`tickCrowdPleaser` when the wrestler
is placed on the ring — increments `side.energy` by 1 (capped at `maxEnergy`).

Edge case: if the dish enters above maxEnergy, the refund is wasted (no
overflow). Worth showing a "+1⚡ haste" log entry.

### 14.2 Caffeine Pill — new action card

| Field | Value |
|---|---|
| `id` | `action-caffeine-pill` |
| `name` | Caffeine Pill |
| `cost` | 0⚡ |
| `rarity` | `common` |
| `effect.id` | `caffeine-pill` |
| `effect.targeting` | `'none'` |
| `description` | `+2⚡ this turn.` |
| `flavor` | "Tastes like a dishwasher in a hurry." |

Handler in `effects.js`:
```js
'caffeine-pill': (state, side, _target, log) => {
  const refund = 2
  log.push(pushLog('action', `+${refund}⚡.`))
  return { ...state, [side]: { ...state[side], energy: state[side].energy + refund } }
}
```

Lives in the shared action deck. Buyable from market (3 VP) for a guaranteed burst.

### 14.3 Sources we evaluated but DROPPED for Phase 9

These came up during design but didn't make the cut:

- **Stimulant ingredients** (coffee beans, maté, energy drink with `stimulant: N` refund on placement) — felt like too many parallel mechanisms; ingredient deck stays cleaner without them. Revisit if the economy proves too tight in playtest.
- **Eat Dish order** — would have refunded `ceil(calories / 15)⚡` for removing a dish from the ring. Skipped to preserve combat tension; eating dishes is currently always strategic (Feed Manager fills tracker), and adding a third "eat for energy" path muddied the choice.
- **Espresso Machine market utensil** — reserved as a future chef signature reward unlock instead of market commodity.

### 14.4 Tight-economy observation

With only these two sources, energy will be **scarce**. A typical turn might
go:
- Start: 3⚡
- Place 2 ingredients: 1⚡ left
- Attack with a dish: 0⚡

That's a fully-committed turn with no slack. Players will be forced to pick
their spots carefully — which is the strategic tension the user asked for in
Section 1.

If playtesting shows the economy is too punishing, levers to loosen it:
1. Drop attack cost from 1⚡ to 0⚡ for the first attack per turn ("free swing").
2. Raise starting energy from 3 to 4.
3. Bring back stimulant ingredients with cheap 0⚡ refunds.
4. Add a chef whose tracker reward grants +1⚡/turn permanent.

All are reversible cheap changes — flag them as "Phase 9.1 tuning" if needed.

---

End of doc.
