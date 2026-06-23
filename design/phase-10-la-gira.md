# Phase 10 — La Gira (Inscryption-style Roguelike Layer)

**Status:** Vertical-slice prototype in active build (V3 fork from V2, 2026-06-19).

This phase wraps the existing match engine (Phases 1–9) in an Inscryption-style
roguelike meta-layer. The match engine is unchanged — it becomes "what happens
at a match node" inside a larger run. Between matches the player travels a
branching node-graph at the direction of **El Empresario**, a masked promoter
who books underground cooking-luchador matches and seems to know more than he
should about your dead abuela.

This is a vertical-slice build: scope is one mini-circuit (5–6 nodes), 2–3 event
types, El Empresario narrator, soft-permadeath save. Future passes (Phase 10.1+)
will add the second/third circuits, more events, amuletos, maldiciones, and
the full meta-twist arc.

---

## 1. Tone & framing

- **Setting:** El Salón Olvidado — an underground luchador-chef circuit.
- **You:** A young luchador-chef who inherited their dead abuela's cookbook
  with one page torn out.
- **The Promoter (El Empresario):** masked, whispery, runs the circuit. Knew
  your abuela. Won't take off his mask. Knows your missing page.
- **The arc:** beat three circuits to reclaim the missing page; each circuit
  pushes deeper into folklore territory until the boss is fought in the
  underworld arena on Día de los Muertos.

Visual / vibe references:
- Mexican folk-horror palette (sepia, dried-blood red, dusty gold)
- Hand-drawn cookbook pages
- Sugar-skull aesthetics on the meta-twist beats
- Whispered Spanish/English dialogue

---

## 2. Run state machine

New top-level state (lives ABOVE the current match state):

```
phase ∈ {
  'run-start',   // chef pick + amulet pick + Empresario intro
  'map',         // viewing the node graph
  'event',       // resolving an event node (Cantina, Ofrenda, etc.)
  'match',       // playing a match (existing GameTable engine)
  'run-end',     // win/loss summary + meta-unlocks granted
}
```

Run state shape:

```js
{
  phase: 'run-start',
  chefId: 'chef-rivera',           // player chef (picked at run start)
  circuit: 1,                       // 1, 2, 3 — for vertical slice only circuit 1
  currentNodeId: 'node-start',
  visitedNodes: ['node-start', ...],
  amuletos: ['chili-amulet'],       // limited-use items, max 3 carried
  maldiciones: [],                  // permanent run debuffs
  unlocks: { ingredients: Set, recipes: Set, chefs: Set },  // mirrors discovered
  deck: { ingredientDeck: [...], cookbook: { owned, readied } },  // current run deck
  pesos: 0,                         // soft currency (not VP) for events
  empresarioState: { intro: 'seen', twist: false },  // dialogue progression
}
```

---

## 3. Node graph (vertical slice — Circuit 1)

5–6 nodes in a small branching tree:

```
       [start]
          ↓
       [empresario-intro]
        /          \
   [cantina]    [ofrenda]
        \          /
       [llorona]
          ↓
       [boss-match]
          ↓
       [run-end]
```

Each node:

```js
{
  id: 'node-cantina',
  kind: 'event' | 'match' | 'narrative' | 'boss',
  label: 'La Cantina del Brujo',
  description: '...',
  next: ['node-llorona'],         // child node ids
  data: { ... },                  // per-kind payload (event params, opponent chef id, etc.)
}
```

Vertical-slice nodes:

| Node | Kind | Effect |
|---|---|---|
| `node-start` | narrative | Empresario intro dialogue (sets the run). Player picks chef + 1 amulet. |
| `node-cantina` | event | La Cantina del Brujo — pick an owned ingredient to power up. |
| `node-ofrenda` | event | La Ofrenda — sacrifice a recipe from cookbook for permanent +VP gain at next match. |
| `node-llorona` | event | La Llorona's Tear — coin flip with pesos. |
| `node-boss` | boss | Match against the circuit's themed chef. Pre-match Empresario twist beat. |
| `node-end` | narrative | Win/loss debrief. Meta-unlocks granted. Return to title. |

---

## 4. El Empresario narrator

A persistent overlay that pops in for dialogue beats. Lives at the top center
when speaking, hides otherwise. Style: typewriter text, masked silhouette
portrait, whispered tone.

Dialogue triggers:
- **Run start:** Welcome, recognizes the cookbook, references abuela.
- **Each node arrival:** brief setup line.
- **Mid-circuit twist:** at node 4 — crowd hush, ingredients whisper, his
  voice changes register.
- **Before boss:** challenge + tease about the missing page.
- **On player victory:** congrats with menace.
- **On player loss:** sympathy that's not quite sympathy. "You'll be back."

Dialogue script lives in `src/data/empresario-script.js` keyed by node id +
event id, so adding nodes adds dialogue without code changes.

---

## 5. Event nodes (vertical slice)

### 5.1 La Cantina del Brujo (campfire equivalent)

UI: a sepia cantina backdrop. The Brujo offers to "improve" an ingredient.

- Pick an ingredient from your current deck.
- Three options offered (deterministic from ingredient + run seed):
  - **Toughen**: +2 burnLimit on that ingredient (run-permanent)
  - **Spice**: +1 to its strongest non-zero nutritional stat (run-permanent)
  - **Ferment**: gain a special ability (themed to ingredient)
- Cost: lose one OTHER ingredient from the deck (sacrifice). Inscryption
  cabin tradeoff.
- Single use per run.

### 5.2 La Ofrenda (sacrifice altar)

UI: a Day-of-the-Dead altar with marigolds and candles, dish photos.

- Pick a recipe from your cookbook (must be owned, not readied).
- Recipe is consumed permanently for this run.
- In exchange: next match begins with +5 VP and a "Spirit Buff" on your chef
  (whatever the sacrificed recipe's special was).
- Single use per run.

### 5.3 La Llorona's Tear (pesos gamble)

UI: a foggy riverbank scene with a weeping silhouette.

- Bet 5 pesos (you start with 5).
- Coin flip: win → gain 12 pesos. Lose → -1 max HP for the run.
- May be played multiple times in a session if you survive.

---

## 6. Persistence — soft permadeath + meta-unlocks

`src/game/run-persistence.js` manages two localStorage keys:

| Key | Lives | Resets when |
|---|---|---|
| `luncha-libre.run` | a single run | Run ends (win or lose) |
| `luncha-libre.meta` | forever | Player manually clears |

**`luncha-libre.run`** holds the full run state (current node, deck mods,
amuletos, maldiciones, pesos). Restored on page reload mid-run.

**`luncha-libre.meta`** holds permanent unlocks:
- Chefs encountered (so they show in cookbook even before next match)
- Recipes seen (cookbook permanently fills in)
- Ingredients seen
- Wild dish gallery (mastered combos persist across runs)
- Total runs played, wins, longest streak

On run end the run blob is cleared, the meta blob gets merged with the run's
new discoveries.

---

## 7. Wiring with existing GameTable

GameTable currently owns full match lifecycle (chef pick + match + restart).
For V3, LaGira wraps it:

- **New props on GameTable:**
  - `matchConfig`: `{ playerChefId, rivalChefId, runBuffs }` — when provided,
    skips chef-pick screen and uses given config.
  - `onMatchEnd(result)` — called when match ends instead of showing the
    restart overlay. `result = { winner, finalState, vpEarned, ... }`.
- **GameTable internal change:** if `matchConfig` is set, initialize the
  reducer with `pickChef(matchConfig.playerChefId)` already applied, set
  rival chef to `matchConfig.rivalChefId`. On phase change to 'won'/'lost',
  call `onMatchEnd`.

This keeps the match engine intact and lets LaGira hand off seamlessly.

---

## 8. Meta-twist beats (vertical slice)

Just one twist beat in this slice — node 4 (before boss):
- Background dim, sugar-skull confetti drifts down
- El Empresario's portrait gains a subtle skull overlay
- His dialogue: "This next match. It's not on the books. You won't find it
  in any record. Cook anyway."

Future twists (Phase 10.1+):
- Ingredients whisper (random text appearing on hovered ingredients mid-game)
- The cookbook "writes itself" — a page appears with a recipe the player
  never owned
- The Promoter shows up as a wrestler in the boss match (revealed at start)
- A node disappears from the map mid-run

---

## 9. Implementation order

1. Run state machine + LaGira top-level component.
2. Empresario narrator overlay + dialogue data.
3. Map screen with the 6-node graph.
4. Event node UIs (Cantina, Ofrenda, Llorona).
5. GameTable refactor for matchConfig + onMatchEnd.
6. Soft-permadeath persistence (run blob + meta unlocks).
7. Twist beat hook at node 4.
8. CSS for map, narrator, events.
9. Lint + smoke + build.

Each can ship and play in isolation; the run becomes "complete" when GameTable
is wired in step 5.

---

## 10. Open questions (deferred)

- **Amuletos:** vertical slice doesn't implement use mid-match yet. Player
  picks one at run start; effect is informational only. Wire up usage in
  Phase 10.1.
- **Maldiciones:** same — no maldición effects in vertical slice. Visual
  presence only.
- **Multi-circuit progression:** vertical slice is one circuit. Circuits 2/3
  with deeper folklore beats come later.

---

End of doc.
