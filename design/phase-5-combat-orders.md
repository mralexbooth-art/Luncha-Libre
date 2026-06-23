# Phase 5 — Combat Orders & Cutting Board

**Status:** Shipped 2026-06.

Phase 4 left combat automatic (same-slot wrestler vs wrestler). Phase 5 hands
all combat decisions to the player and adds a D6 cutting-board minigame.

## Locked decisions

### Per-wrestler combat orders
- Each ring wrestler must be ordered each turn. No automatic same-slot attacks.
- Three order types:
  - **Attack** — pick any enemy wrestler OR the rival chef as target.
  - **Block** — wrestler takes no action; halves damage to **self AND adjacent** allies until end of round.
  - **Springboard** (replaced in Phase 6 spring rework — see below).
- Counter-attacks **removed**. If wrestler B wants to swing at A, B needs an explicit attack order.
- Wrestlers with `wrestlersOnly` can't target the chef unless they carry the `acid-pierce` static (Lime).

### Ordering UI flow
- Click own ring wrestler → activates ordering (`state.ordering`).
- Order menu appears with Attack / Block / Springboard buttons.
- Attack → enter `pick-attack` step → click enemy target.
- Block → committed immediately.

### Cutting board
- New zone with 2 slots.
- Ingredients flagged `cuttable: true` MUST go through the board before reaching an appliance. Cuttable = all vegetables + proteins (10 ingredients: beef-chuck, pork, chicken, onion, garlic, cilantro, chili, habanero, lime, tomato).
- Flow: select cuttable from hand → click empty board slot → ingredient lands raw → click again → D6 rolls → result fills `chopBonus` → select board item → click appliance → ingredient placed with bonus.
- D6 bell-curve outcomes:
  - **1** = Mangled (-1 ATK, 0 HP)
  - **2-3** = Fine (+0 ATK, +1 HP)
  - **4-5** = Clean (+1 ATK, +2 HP)
  - **6** = Perfect (+3 ATK, +1 HP)
- Chop bonuses ride the ingredient through to wrestler synthesis (`cooking.chops[]` parallel to `ingredients[]`).

### Combat animations
- Per-wrestler `combatFx` flag set during resolveCombat: `'attacking' | 'damaged' | 'blocking' | 'springing'`.
- CSS keyframes drive the visual (shake / flash / lunge / bounce).
- Cleared on next user action.

### Rival upgrade
- Rival assigns orders too — 20% block, 80% random enemy attack (or chef if no enemies).

## State shape additions

```
side.cuttingBoard = [null, null]                 // 2 slots
wrestler.pendingOrder = null | { action, target, springAllySlot? }
wrestler.combatFx = null | 'attacking' | ...

state.ordering = null | { slot, step, springAllySlot? }
```

## Implementation pointers

- `src/game/state.js` — `selectCard`, `clickRingSlot`, `clickEnemyChef`, `setOrderAction`, `clickCuttingBoard`, `resolvePlayerAttack`, `rollChop`
- `src/components/RingSlot.jsx` — order badges, target outlines, fx classes
- `src/components/CuttingBoard.jsx` — new component
- `src/App.css` — combat fx keyframes, target highlights, board styling

## Removed in later phases

- Springboard combo attack on a wrestler (combat targeting) was replaced in Phase 6 spring rework. See `phase-6-knife-arena.md`. Steps `pick-spring` / `pick-attack-after-spring` retired.
