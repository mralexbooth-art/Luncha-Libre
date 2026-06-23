# Phase 11 — Intro Vertical Slice ("The Prelude")

**Status:** Building 2026-06-23. Vertical-slice only — the opening 15–30 min,
NOT the rest of the game.

This phase wraps EVERYTHING else (La Gira, match engine, market, etc.) in a
**one-time prelude** that plays the first time a player loads the game.
Completing the slice flips a flag in `localStorage` (`luncha-libre.meta.introCompleted`)
and unlocks the run loop.

## 1. Tone bible (READ EVERY TIME)

| Dimension | Target |
|---|---|
| Cozy | 40% |
| Funny | 20% |
| Mysterious | 30% |
| Slightly unsettling | 10% |

**Player MUST believe** they are helping spirits move on through cooking.

**Player MUST NOT suspect** any of the following — all of these are reserved
for much later phases:
- They are dead
- They are recovering memories
- Their father existed
- The "real world" existed
- The restaurant existed
- The lake existed
- The radio has narrative significance

**Narration:** Second person, present tense, dreamlike. Never explain.
Examples:
- "You wonder why this place feels familiar."
- "You almost recognize that smell."
- "You aren't sure why hearing static comforts you."

## 2. The six beats (state machine)

```
'awake'
  ↓  (player clicks to fade in)
'food-court'
  ↓  (player offers something to Sabia, then explores, then lights candle)
'candle-lit'
  ↓  (radio crackles; Abuela whispers the quest; clue cards revealed)
'kitchen-cooking'   ← reuses GameTable in dish-only mode
  ↓  (dish synthesizes as El Dulce Campeón)
'altar'
  ↓  (bring dish to Abuela; she gasps; reveals it was her husband)
'choice'              KEEP FIGHTER  vs  RELEASE SPIRIT
  ↓
'arcana-reward'      Undying Light shown
  ↓
'unlock'             → flip introCompleted=true, transition to LaGira
```

Pre-phase: `'intro'` (the wrapper). Post-phase: existing La Gira flow.

## 3. Architecture

Existing top-level `LaGira` is wrapped by a new `Prelude` container:

```
App
└── PreludeGate
    ├── if (!introCompleted): <Prelude />
    └── else: <LaGira />
```

`Prelude` owns its own reducer + scene state machine. When the slice ends,
the Arcana + intro flag are committed to meta storage; the gate flips to
LaGira for the rest of the session.

Files to create:
- `src/game/prelude-state.js` — scene state machine
- `src/game/inventory.js` — starter items + offering logic
- `src/data/prelude-script.js` — all dialogue, narration, scene definitions
- `src/data/arcana.js` — Arcana data model + Undying Light
- `src/components/PreludeGate.jsx` — top-level gate
- `src/components/Prelude.jsx` — scene orchestrator
- `src/components/scenes/AwakeScene.jsx`
- `src/components/scenes/FoodCourtScene.jsx`
- `src/components/scenes/CandleLitScene.jsx`
- `src/components/scenes/AltarScene.jsx`
- `src/components/scenes/ChoiceScene.jsx`
- `src/components/scenes/ArcanaRewardScene.jsx`
- `src/components/Narrator.jsx` — second-person voiceover overlay
- `src/components/Radio.jsx` — physical radio that emits text
- `src/components/Inventory.jsx` — carryable items + offering UI

Files to modify:
- `src/App.jsx` → render `<PreludeGate />` instead of `<LaGira />`
- `src/components/GameTable.jsx` → accept `dishMode={true}` prop that hides
  rival, combat, ring; shows only one big cast-iron pan to fill
- `src/game/run-persistence.js` → add `introCompleted` to meta blob

## 4. Inventory — opening items

The player wakes up holding five things. Each is offerable to Sabia. Each
has a different Sabia response and (in some cases) a downstream consequence.

| Item | Sabia's response | Downstream |
|---|---|---|
| Torn colorful cape fragment | Pauses. "…You've worn this." | Adds "wrestler" flavor to later beats |
| Lipstick cap | Laughs softly. "Vanity in the woods." | Nothing yet |
| Hard candy | Accepts hungrily. "Sweet. He liked sweet too." | **Foreshadows** the husband — but obliquely |
| Wrestler card | Stares too long. "Keep this. It's not for me." | Adds to inventory unchanged |
| Matchbook (2 matches) | Brightens. "Yes. Yes. Keep these." | **Required** to light the candle later |

Player can also: **Trust** (offer truthfully), **Lie** (claim to have nothing),
**Remain Silent**. Sabia's behavior varies. No correct answer.

## 5. Radios — physical, escalating

Radios are objects in the world. The intro has three placed:
- `radio-boombox` (broken, on a picnic table)
- `radio-altar` (mounted near the candle)
- `radio-kitchen` (zip-tied to the prep station)

Each radio has a `clarity` 0–3:
- 0: pure static
- 1: occasional faint words ("…protein…", "…oil…")
- 2: recognizable cooking-host phrases ("…toss it twice…")
- 3: clear announcer ("…and tonight only…")

In the prelude:
- All radios start at clarity 0.
- Lighting the candle bumps `radio-altar` to clarity 2 (Abuela speaks).
- Entering the kitchen bumps `radio-kitchen` to clarity 1.
- The slice ends with all radios still at 0–2; clarity 3 is reserved.

Radios never reveal. They never sound like "the dad." That's later.

## 6. Kitchen "dish-mode"

GameTable accepts a new prop `dishMode={ recipe: 'cheat-day', spiritName: 'Abuela' }`.
When `dishMode` is set:
- Rival side hides entirely
- Wrestling ring hides
- Cutting board + cooking appliances stay
- Hand stays
- Win condition: a dish synthesizes from the pot
- On dish synth, instead of placing a wrestler in the ring, fire
  `onMatchEnd({ kind: 'dish', dish: syn })` and unmount

The dish IS El Dulce Campeón (special recipe ID, generates the listed stats).

## 7. El Dulce Campeón — the first food fighter

A hand-authored Recipe (added to `src/data/recipes.js`) with:
- id: `recipe-dulce-campeon`
- requires: rice, "junk-snack" (potato chips / chicken nuggets / marshmallow…),
  pickle, sweet
- baseAttack: derived from spec → ATK ≈ 6 (from Protein 12 / 2)
- baseHealth: 5 + floor((12 + 18) / 2) = 20
- Hand-written `special: cheat-day` with reused effect handlers
- The card is shown to the player AFTER synthesis with a flourish

The "junk-snack" ingredients are added to inventory at the slice start so the
player can actually cook this. Marshmallow / pickle / hard-candy / etc. become
new ingredient entries.

## 8. Choice + Arcana reward

After the altar scene:

```
KEEP FOOD FIGHTER          RELEASE SPIRIT
+ El Dulce Campeón joins   + Undying Light Arcana
  your deck for the first  + Abuela disappears with a sigh
  La Gira run              + +1 "spirits-released" counter

Both paths flip introCompleted=true and transition to LaGira.
The Arcana is granted in both cases (the reveal "Undying Light" is the
reward of completing the prelude, not the choice itself).
```

### Undying Light (the first Arcana)

```js
{
  id: 'arcana-undying-light',
  name: 'Undying Light',
  rarity: 'rare',
  description: 'She always lit one. Just in case someone wanted to come home.',
  effects: {
    runStartOfferings: 5,        // start runs with 5 offerings
    blessingMultiplier: 2,       // blessings earned while active are 2×
    enablesFamilyBlessings: true,// unlocks the family-blessing pool
  },
}
```

Vertical-slice scope: the Arcana is **shown** but only the `runStartOfferings`
modifier wires into the first run via run state. The blessing multiplier and
family-blessing pool are stubbed for later phases.

## 9. Persistence

Two flags get committed at slice end:
- `meta.introCompleted = true` (skip the slice on subsequent loads)
- `meta.arcana = ['arcana-undying-light']` (unlocked across runs)

The choice (keep vs release) also writes:
- `meta.husbandKept = true | false` (foreshadowing flag — affects later phases)

## 10. Out-of-scope (DO NOT BUILD)

- Father, restaurant, birthday, lake, explosion, player death, memories
- Full Arcana system (only Undying Light needs effects wired)
- Multiple spirits beyond Abuela
- NPC grandmother-lineage mechanic (mentioned in spec, deferred to Phase 11.1)
- The mid-act "almost dad energy" radio escalation (reserved for Phase 12)
- Animations beyond CSS transitions (no Lottie/Framer/etc.)
- Sound effects (audio system stays wired but files remain undelivered;
  the intro plays silently in the absence of files)

## 11. Build order (the layers)

1. Scene framework + 'awake' beat (rain, fade-in)
2. Food court + Sabia + inventory + offering interaction
3. Radio system + candle interaction + Abuela quest reveal
4. Kitchen dish-mode (GameTable adapter)
5. El Dulce Campeón card reveal + altar scene
6. Choice + Arcana reward + transition to LaGira
7. Narrator overlay + atmosphere SFX hooks
8. Persistence + replay-prevention

Each layer is its own commit/push → Netlify deploys it standalone.

End of doc.
