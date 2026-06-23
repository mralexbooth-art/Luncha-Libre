// Phase 2 (revised): cards are wrestlers with Attack/Health + cookTime.
// Played cards enter the PREP zone for `cookTime` rounds before promoting to the RING.

export const ARCHETYPES = {
  carb:    { label: 'Carb',    color: '#d4a574', tagline: 'Explosive now. Crash later.' },
  protein: { label: 'Protein', color: '#a14545', tagline: 'Sustained pressure.' },
  spicy:   { label: 'Spicy',   color: '#d94a1f', tagline: 'Pain is the price of power.' },
  greasy:  { label: 'Greasy',  color: '#9c6b1f', tagline: 'Slow. Immovable.' },
  sugar:   { label: 'Sugar',   color: '#e89bb6', tagline: 'Glass cannon gremlin.' },
  healthy: { label: 'Fresh',   color: '#5a8a4c', tagline: 'Adapt. Endure. Cleanse.' },
}

// Archetype hooks:
//   cookTime                  — rounds the ingredient sits in prep before promotion to ring.
//   crashAfter / crashAmount  — after N turns in the ring, the wrestler takes self damage.
//   hotEachTurn               — self damage each turn in ring (spicy burn).
//   regenEachTurn             — heal each turn in ring (protein recovery).
//   wrestlersOnly             — true if this wrestler cannot punch through to the chef.

export const CARDS = [
  {
    id: 'tamale-tornado',
    name: 'Tamale Tornado',
    archetype: 'carb',
    ingredients: ['masa', 'pork', 'chili'],
    cost: 1,
    attack: 4,
    health: 5,
    cookTime: 2,
    crashAfter: 2,
    crashAmount: 3,
    flavor: 'Hits like a freight train. Crashes like one too.',
  },
  {
    id: 'pan-dulce-punch',
    name: 'Pan Dulce Punch',
    archetype: 'carb',
    ingredients: ['flour', 'sugar', 'butter'],
    cost: 0,
    attack: 2,
    health: 3,
    cookTime: 1,
    crashAfter: 2,
    crashAmount: 2,
    flavor: 'Sweet now. Sour later.',
  },
  {
    id: 'empanada-enforcer',
    name: 'Empanada Enforcer',
    archetype: 'protein',
    ingredients: ['beef', 'dough', 'onion'],
    cost: 2,
    attack: 3,
    health: 6,
    cookTime: 2,
    regenEachTurn: 1,
    flavor: 'Wraps you in a wall of meat.',
  },
  {
    id: 'burrito-bouncer',
    name: 'Burrito Bouncer',
    archetype: 'greasy',
    ingredients: ['tortilla', 'rice', 'lard', 'cheese'],
    cost: 3,
    attack: 2,
    health: 10,
    cookTime: 3,
    wrestlersOnly: true,
    flavor: 'Slow. Massive. Indigestible.',
  },
  {
    id: 'habanero-haymaker',
    name: 'Habanero Haymaker',
    archetype: 'spicy',
    ingredients: ['habanero', 'lime', 'rage'],
    cost: 1,
    attack: 6,
    health: 3,
    cookTime: 1,
    hotEachTurn: 1,
    flavor: 'You feel it before they do.',
  },
  {
    id: 'churro-chainsaw',
    name: 'Churro Chainsaw',
    archetype: 'sugar',
    ingredients: ['sugar', 'cinnamon', 'chaos'],
    cost: 0,
    attack: 4,
    health: 2,
    cookTime: 1,
    crashAfter: 1,
    crashAmount: 2,
    flavor: 'Fast hands. Failing pancreas.',
  },
]

export const STARTING_DECK_IDS = CARDS.flatMap(c => [c.id, c.id])

export const CHEF = {
  name: 'Chef Rivera',
  title: 'El Cocinero',
  flavor: '"En mi cocina, todo lucha."',
  hp: 30,
  portrait: '👨‍🍳',
}

export const RIVALS = [
  {
    id: 'el-bistec',
    name: 'El Bistec',
    title: 'The Rival Cut',
    flavor: '"You call that a wrestler? I call it a side dish."',
    hp: 30,
    portrait: '🥩',
    deck: STARTING_DECK_IDS,
  },
]
