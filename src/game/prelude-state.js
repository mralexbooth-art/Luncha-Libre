// Phase 11 — Prelude state machine.
//
// The opening 15-30 minutes. Scenes are linear, gated by player action.
// Completing the slice flips meta.introCompleted=true so this never runs
// again on this save.

export const SCENES = {
  AWAKE:         'awake',
  FOOD_COURT:    'food-court',
  CANDLE_LIT:    'candle-lit',
  WANDERING:     'wandering',         // V4: optional explore the food court
  KITCHEN:       'kitchen-cooking',
  ALTAR:         'altar',
  CHOICE:        'choice',
  ARCANA_REWARD: 'arcana-reward',
  SLICE_END:     'slice-end',         // V4: replaces UNLOCK; teaser for next quest
  UNLOCK:        'unlock',            // back-compat; flips meta.introCompleted
}

// V4 hotspots in the wandering scene — clickable elements that animate the
// food court "coming to life." Each click reveals a small visual + narration
// line. Order doesn't matter; all are optional.
export const WANDER_HOTSPOTS = [
  { id: 'old-menu',     label: 'A faded menu',        icon: '📜', reveal: 'menu' },
  { id: 'boombox',      label: 'Broken boombox',      icon: '📻', reveal: 'boombox' },
  { id: 'stray-cat',    label: 'Something moves',     icon: '🐈', reveal: 'cat' },
  { id: 'candle-jar',   label: 'A second candle',     icon: '🕯', reveal: 'candle' },
  { id: 'wrestler-poster', label: 'A peeling poster', icon: '🎭', reveal: 'poster' },
]

export const STARTER_INVENTORY = [
  { id: 'cape-fragment',  name: 'Torn colorful cape fragment', icon: '🎽', offerable: true },
  { id: 'lipstick-cap',   name: 'Lipstick cap',                icon: '💄', offerable: true },
  { id: 'hard-candy',     name: 'Hard candy',                  icon: '🍬', offerable: true, edible: true },
  { id: 'wrestler-card',  name: 'A wrestler card',             icon: '🎴', offerable: true },
  { id: 'matchbook',      name: 'Matchbook (2 matches)',       icon: '🔥', offerable: true, charges: 2 },
]

export const newPrelude = () => ({
  scene: SCENES.AWAKE,
  inventory: STARTER_INVENTORY.map(i => ({ ...i })),
  // Sabia state — has she been spoken to? Did the player offer? Trust/lie/silent?
  sabia: {
    encountered: false,
    offerResolved: false,
    offered: null,     // item.id or 'lied' or 'silent'
    departed: false,
  },
  // Has the candle been lit? Required gate before Abuela quest opens.
  candleLit: false,
  // Abuela quest state.
  abuela: {
    introduced: false,    // has she spoken via the radio?
    questAccepted: false,
    questCompleted: false, // did the player synthesize El Dulce Campeón?
    revealed: false,       // did she reveal it was her husband at the altar?
  },
  // The dish object once cooked (carried from kitchen scene to altar scene).
  cookedDish: null,
  // Final choice: 'keep' or 'release'.
  finalChoice: null,
  // Per-radio clarity (0–3). Lighting candle bumps the altar radio.
  radios: {
    'radio-boombox': 0,
    'radio-altar':   0,
    'radio-kitchen': 0,
  },
  // V4: which wandering hotspots have been revealed.
  wandered: {},     // hotspotId → true
  // V4: ingredients in the kitchen pan during the cook minigame.
  panIngredients: [],
  // V4: the final dish object (after cooking).
  dish: null,
  // Narrator transient — the line currently being shown. UI clears on click.
  narration: null,
})

// ─── State transitions ──────────────────────────────────────

export const advanceToFoodCourt = (prelude) => ({
  ...prelude,
  scene: SCENES.FOOD_COURT,
})

export const meetSabia = (prelude) => ({
  ...prelude,
  sabia: { ...prelude.sabia, encountered: true },
})

export const resolveSabiaOffer = (prelude, offerKind) => {
  // offerKind: an inventory item id, or 'lied', or 'silent'
  const removeItem = offerKind && offerKind !== 'lied' && offerKind !== 'silent'
  const consumedSpecial = offerKind === 'matchbook' || offerKind === 'wrestler-card'
  // Matchbook + wrestler-card: Sabia gives them BACK (per spec).
  const newInventory = removeItem && !consumedSpecial
    ? prelude.inventory.filter(i => i.id !== offerKind)
    : prelude.inventory
  return {
    ...prelude,
    inventory: newInventory,
    sabia: {
      ...prelude.sabia,
      offerResolved: true,
      offered: offerKind,
    },
  }
}

export const sabiaWandersOff = (prelude) => ({
  ...prelude,
  sabia: { ...prelude.sabia, departed: true },
})

export const lightCandle = (prelude) => {
  // Requires a match. Burn one charge.
  const matchbook = prelude.inventory.find(i => i.id === 'matchbook')
  if (!matchbook || matchbook.charges <= 0) return prelude
  const newInventory = prelude.inventory.map(i =>
    i.id === 'matchbook' ? { ...i, charges: i.charges - 1 } : i
  )
  return {
    ...prelude,
    inventory: newInventory,
    candleLit: true,
    scene: SCENES.CANDLE_LIT,
    radios: { ...prelude.radios, 'radio-altar': 2 },
    abuela: { ...prelude.abuela, introduced: true },
  }
}

// V4: accepting the quest now branches into WANDERING (optional) or KITCHEN
// directly. The CandleLitScene shows two buttons.
export const acceptAbuelaQuest = (prelude, target = 'kitchen') => ({
  ...prelude,
  scene: target === 'wander' ? SCENES.WANDERING : SCENES.KITCHEN,
  abuela: { ...prelude.abuela, questAccepted: true },
  radios: { ...prelude.radios, 'radio-kitchen': 1 },
})

// V4: reveal a wandering hotspot. Pure UI-state change; some hotspots may
// also have side effects (boombox bumps a radio clarity).
export const revealHotspot = (prelude, hotspotId) => {
  const wandered = { ...prelude.wandered, [hotspotId]: true }
  let radios = prelude.radios
  if (hotspotId === 'boombox') {
    radios = { ...radios, 'radio-boombox': Math.min(2, (radios['radio-boombox'] ?? 0) + 1) }
  }
  return { ...prelude, wandered, radios }
}

// V4: leave wandering and enter the kitchen.
export const enterKitchen = (prelude) => ({
  ...prelude,
  scene: SCENES.KITCHEN,
  radios: { ...prelude.radios, 'radio-kitchen': 1 },
})

// V4: in-kitchen ingredient placement. Append or remove from the pan.
export const addToPan = (prelude, ingredientId) => ({
  ...prelude,
  panIngredients: [...prelude.panIngredients, ingredientId],
})
export const removeFromPan = (prelude, idx) => ({
  ...prelude,
  panIngredients: prelude.panIngredients.filter((_, i) => i !== idx),
})

// V4: synthesize the dish from pan contents and transition to altar.
// Uses a hand-authored result for the slice (El Dulce Campeón).
export const finishCooking = (prelude, dish) => ({
  ...prelude,
  scene: SCENES.ALTAR,
  dish,
  abuela: { ...prelude.abuela, questCompleted: true },
})

export const finishKitchen = (prelude, dish) => ({
  ...prelude,
  scene: SCENES.ALTAR,
  cookedDish: dish,
  abuela: { ...prelude.abuela, questCompleted: true },
})

export const revealHusband = (prelude) => ({
  ...prelude,
  scene: SCENES.CHOICE,
  abuela: { ...prelude.abuela, revealed: true },
})

export const makeFinalChoice = (prelude, choice) => ({
  ...prelude,
  scene: SCENES.ARCANA_REWARD,
  finalChoice: choice,   // 'keep' | 'release'
})

export const completeIntro = (prelude) => ({
  ...prelude,
  scene: SCENES.UNLOCK,
})

// V4: advance to the slice-end teaser screen after the Arcana is shown.
export const advanceToSliceEnd = (prelude) => ({
  ...prelude,
  scene: SCENES.SLICE_END,
})

// Narration helpers — the second-person voiceover that hovers over scenes.

export const speak = (prelude, text) => ({
  ...prelude,
  narration: { text, key: Date.now() },
})

export const clearNarration = (prelude) => ({
  ...prelude,
  narration: null,
})
