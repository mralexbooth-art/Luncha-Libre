# Phase 6 — Knife, Crowd Pleaser, Wrestling Arena, Immediate Combat

**Status:** Shipped 2026-06.

Adds a chef-only knife system with sharpen counter + injury cascade, a
crowd-pleaser holding pattern for dishes that can't enter a full ring, a
turn-start choice (draw / sharpen / maintain) that replaces auto-draw, and
the wrestling-ring visual treatment around the 6 fighter slots. Also makes
combat actions resolve immediately on click instead of queued for end-of-turn.

## Locked decisions

### Immediate combat (one action per card per round)
- Attack and Springboard resolve **the instant the player clicks the target**. Block stays queued (it's reactive).
- Each wrestler has `usedThisRound: bool`. Once set, can't be reactivated until next player turn.
- Spring participants (allies used as springboards) are also marked `usedThisRound`.

### Crowd Pleaser holding pattern
- If a dish finishes cooking but the ring is full, it becomes the side's `crowdPleaser` (only one held at a time).
- While held: gives **+stacks ATK** to all your ring wrestlers (attack only; not HP, not regen, not specials).
- **Cap +3**. Stacks bump by 1 per turn the ring stays full.
- When any ring slot opens, the pleaser bursts in (placed in empty slot) and the buff dissolves entirely.
- A second ready dish while a pleaser exists stays in its pot (held; doesn't merge into the existing pleaser).

### Knife system (player only)
- Top-level `state.knife = { sharpenCounter: 0-3, bleeding: false }`.
- Each chop consumes 1 sharpen counter if > 0, applies **+1 ATK / +1 HP** bonus to the chop result.
- Roll-of-1 injury cascade triggers when `sharpenCounter > 0`:
  - 1 counter → chef -1 HP, sharpen resets to 0
  - 2 counters → chef -3 HP, sharpen resets
  - 3 counters → chef -2 HP **and** `bleeding = true` (severed finger): -2 HP per turn + chops permanently -1/-1 until Med Kit
- Roll-of-1 with **0 sharpen** is just a Mangled chop, no injury.

### Action Market additions
- **Knife Sharpener** (0⚡, common): +1 sharpen counter (cap 3)
- **Automatic Dicer** (2⚡, rare): installed on a cutting board slot. Targeting `'board'`. Next 2 ingredients dropped on this slot chop as PERFECT automatically. Dicer removes itself when `life` hits 0.
- **Med Kit** (1⚡, common): heal chef +5 HP, stop bleeding.

### Turn-start choice (REPLACES auto-draw)
- At the start of every player turn (after turn 1), `state.turnStartChoice = 'pending'`. The player must pick ONE before doing anything else:
  - **Draw 3** ingredient cards
  - **Sharpen Knife** (+1 counter)
  - **Maintain** (clear fire on a chosen appliance — only available if a pot is on fire)
- Rival auto-draws TURN_DRAW (3) per turn — no menu.

### Eat dish (REMOVED, then replaced by spring → own chef)
- Phase 6 initially added an Eat button on the order menu (costs 1⚡, chef gains current HP of dish).
- In the Phase 6 **spring rework**, Eat was removed entirely. Eating is now exclusively Spring → Own Chef (see below).

### Springboard rework (this phase, mid-build)
- Old Phase 5 spring: target a wrestler with combo damage (attacker.attack + ally.attack).
- New rule:
  - Spring is **chef-only** — attacker leaps over enemy wrestlers and hits the chef directly (or your own chef to feed it).
  - Multi-ally select: `state.ordering.springs[]` is a toggle list.
  - **1 spring = HALF damage / heal. 2+ springs = FULL.** (Each unbuffed ally = 1 spring. Each `springBuff` ally = 2 springs.)
  - **Energy cost = ally count** (1⚡ per ally, regardless of springBuff).
  - **Attacker is removed from ring** after the spring (sacrificed). Springs are usedThisRound but stay.
  - `springBuff: true` is a recipe property. **Habanero Haymaker** has it (high-jumping speedster).
- UI: click Spring → pick allies (toggle) → click rival chef (attack) or own chef (feed for heal).

### Block adjacency rule (carried from Phase 5)
- Block halves damage to self AND adjacent ring slots (slot-1 and slot+1).

### Wrestling ring visual
- The 6 fighter slots (rival ring + midline + player ring) sit inside a `.wrestling-ring` container with rope graphics (top/bottom/left/right + 4 corner posts) and a canvas-floor background.
- Pleaser slots sit **outside** the ropes — rival pleaser above the top rope, player pleaser below the bottom rope.
- Kitchens and other zones are outside the ring.
- Originally also tried a left rail for the knife widget; rolled back. Knife widget lives in the right sidebar (between status card and cookbook).

### Appliance fire status
- Kitchen Fire action now adds `onFire: true` to ALL player appliances. Fire pots freeze + add +1 to cookTurnsLeft each turn until maintained.
- Maintain (turn-start choice) clears fire on one chosen appliance.

## State shape additions

```
state.knife = { sharpenCounter: 0..3, bleeding: bool }
state.turnStartChoice = 'pending' | 'made'
state.turnMaintMode = bool                      // during maintenance click target picking
state.ordering.springs = number[] | undefined   // pick-spring-allies step

side.crowdPleaser = null | { syn, stacks, justCreated }
side.appliances[i].onFire = bool

wrestler.usedThisRound = bool
wrestler.springBuff = bool                       // copied from recipe.produces
```

## Implementation pointers

- `src/game/state.js` — `selectCard` (gated on turnStartChoice), `resolveSpringAttack`, `tickCrowdPleaser`, `chooseTurnStart`, `maintainAppliance`, `clickOwnChef`
- `src/game/effects.js` — `knife-sharpener`, `auto-dicer`, `med-kit` handlers; `kitchen-fire` updated to set `onFire`
- `src/components/Knife.jsx`, `CrowdPleaserSlot.jsx`, `TurnStartMenu.jsx` — new components
- `src/App.css` — wrestling-ring ropes/posts/canvas, knife pips + bleed pulse, crowd-pleaser glow, turn-start overlay

## Out of scope

- Cookbook editing UI (still hardcoded).
- Chef ability sheet / Wild Dish dice (deferred to a later phase).
- Pantry / between-match deck building.
