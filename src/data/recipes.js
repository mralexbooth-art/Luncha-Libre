// Phase 8 — recipe roster expanded from 6 to 14. Existing recipes keep their
// Phase 4 specials AND Phase 7 procedure tracking. New Phase 8 recipes lean
// into Mexican thematic depth and explore new tag combos (mole, vegan, etc).

export const RECIPES = [
  {
    id: 'recipe-tamale-tornado',
    name: 'Tamale Tornado',
    type: 'recipe',
    requires: [
      { tag: 'masa',    count: 1 },
      { tag: 'protein', count: 1 },
      { tag: 'spice',   count: 1 },
    ],
    procedure: [
      { tag: 'spice',   heat: 'medium' },
      { tag: 'protein', heat: 'high'   },
      { tag: 'masa',    heat: 'medium' },
    ],
    produces: {
      archetype: 'carb',
      baseAttack: 4,
      baseHealth: 5,
      crashAfter: 2,
      crashAmount: 3,
      flavor: 'Hits like a freight train. Crashes like one too.',
      special: {
        id: 'whirlwind',
        name: 'Whirlwind',
        trigger: 'onAttack',
        description: 'On attack, also deals 1 damage to the wrestler in the next ring slot.',
      },
    },
  },
  {
    id: 'recipe-pan-dulce-punch',
    name: 'Pan Dulce Punch',
    type: 'recipe',
    requires: [
      { tag: 'flour', count: 1 },
      { tag: 'sugar', count: 1 },
    ],
    procedure: [
      { tag: 'flour', heat: 'low'    },
      { tag: 'sugar', heat: 'medium' },
    ],
    produces: {
      archetype: 'carb',
      baseAttack: 2,
      baseHealth: 3,
      crashAfter: 2,
      crashAmount: 2,
      flavor: 'Sweet now. Sour later.',
      special: {
        id: 'sugar-rush',
        name: 'Sugar Rush',
        trigger: 'onCrash',
        description: '+2 ATK on the turn it crashes. One last sweet hurrah.',
      },
    },
  },
  {
    id: 'recipe-empanada-enforcer',
    name: 'Empanada Enforcer',
    type: 'recipe',
    requires: [
      { tag: 'flour',    count: 1 },
      { tag: 'protein',  count: 1 },
      { tag: 'aromatic', count: 1 },
    ],
    procedure: [
      { tag: 'aromatic', heat: 'medium' },
      { tag: 'protein',  heat: 'high'   },
      { tag: 'flour',    heat: 'low'    },
    ],
    produces: {
      archetype: 'protein',
      baseAttack: 3,
      baseHealth: 6,
      regenEachTurn: 1,
      flavor: 'Wraps you in a wall of meat.',
      special: {
        id: 'shell',
        name: 'Shell',
        trigger: 'onTakeDamage',
        description: 'Halves damage taken from non-protein attackers.',
      },
    },
  },
  {
    id: 'recipe-burrito-bouncer',
    name: 'Burrito Bouncer',
    type: 'recipe',
    requires: [
      { tag: 'tortilla', count: 1 },
      { tag: 'protein',  count: 1 },
      { tag: 'starch',   count: 1 },
    ],
    procedure: [
      { tag: 'protein',  heat: 'high'   },
      { tag: 'starch',   heat: 'medium' },
      { tag: 'tortilla', heat: 'low'    },
    ],
    produces: {
      archetype: 'greasy',
      baseAttack: 2,
      baseHealth: 10,
      wrestlersOnly: true,
      flavor: 'Slow. Massive. Indigestible.',
      special: {
        id: 'heavy-wrap',
        name: 'Heavy Wrap',
        trigger: 'onTurnInRing',
        description: 'Each turn, adjacent ring allies regen 1 HP.',
      },
    },
  },
  {
    id: 'recipe-habanero-haymaker',
    name: 'Habanero Haymaker',
    type: 'recipe',
    requires: [
      { tag: 'spice-premium', count: 1 },
      { tag: 'acid',          count: 1 },
    ],
    procedure: [
      { tag: 'spice-premium', heat: 'high' },
    ],
    produces: {
      archetype: 'spicy',
      baseAttack: 6,
      baseHealth: 3,
      hotEachTurn: 1,
      springBuff: true,
      flavor: 'You feel it before they do.',
      special: {
        id: 'spicy-spit',
        name: 'Spicy Spit',
        trigger: 'onCook',
        description: 'On entering the ring, deals 1 damage to ALL enemy ring wrestlers.',
      },
    },
  },
  {
    id: 'recipe-churro-chainsaw',
    name: 'Churro Chainsaw',
    type: 'recipe',
    requires: [
      { tag: 'flour', count: 1 },
      { tag: 'sugar', count: 1 },
      { tag: 'spice', count: 1 },
    ],
    procedure: [
      { tag: 'flour', heat: 'medium' },
      { tag: 'sugar', heat: 'high'   },
      { tag: 'spice', heat: 'high'   },
    ],
    produces: {
      archetype: 'sugar',
      baseAttack: 4,
      baseHealth: 2,
      crashAfter: 1,
      crashAmount: 2,
      flavor: 'Fast hands. Failing pancreas.',
      special: {
        id: 'berserk',
        name: 'Berserk',
        trigger: 'onTurnInRing',
        description: '+1 ATK while HP is below half.',
      },
    },
  },
  // ─── Phase 8 new recipes ─────────────────────────────────
  {
    id: 'recipe-mole-marauder',
    name: 'Mole Marauder',
    type: 'recipe',
    requires: [
      { tag: 'chocolate', count: 1 },
      { tag: 'chili',     count: 1 },
      { tag: 'protein',   count: 1 },
    ],
    procedure: [
      { tag: 'chocolate', heat: 'low'    },
      { tag: 'chili',     heat: 'medium' },
      { tag: 'protein',   heat: 'high'   },
    ],
    produces: {
      archetype: 'spicy',
      baseAttack: 5,
      baseHealth: 6,
      flavor: 'Twenty-eight ingredients, one bad mood.',
      special: {
        id: 'mole-stain',
        name: 'Mole Stain',
        trigger: 'onAttack',
        description: 'On attack, all enemy ring wrestlers lose 1 ATK next turn.',
      },
    },
  },
  {
    id: 'recipe-carnitas-crusher',
    name: 'Carnitas Crusher',
    type: 'recipe',
    requires: [
      { tag: 'pork',  count: 1 },
      { tag: 'lard',  count: 1 },
      { tag: 'spice', count: 1 },
    ],
    procedure: [
      { tag: 'pork',  heat: 'high'   },
      { tag: 'lard',  heat: 'medium' },
      { tag: 'spice', heat: 'high'   },
    ],
    produces: {
      archetype: 'greasy',
      baseAttack: 5,
      baseHealth: 7,
      flavor: 'Slow-cooked. Fast-fisted.',
      special: {
        id: 'cleave',
        name: 'Cleave',
        trigger: 'onCook',
        description: 'On entry, 1 damage to each adjacent enemy wrestler.',
      },
    },
  },
  {
    id: 'recipe-guacamole-guerrero',
    name: 'Guacamole Guerrero',
    type: 'recipe',
    requires: [
      { tag: 'avocado',  count: 1 },
      { tag: 'lime',     count: 1 },
      { tag: 'cilantro', count: 1 },
    ],
    procedure: [
      { tag: 'avocado',  heat: 'low' },
      { tag: 'lime',     heat: 'low' },
      { tag: 'cilantro', heat: 'low' },
    ],
    produces: {
      archetype: 'healthy',
      baseAttack: 2,
      baseHealth: 8,
      flavor: 'Calm green vengeance.',
      special: {
        id: 'green-guard',
        name: 'Green Guard',
        trigger: 'static',
        description: 'When blocking, reduces damage by 75% (instead of 50%) AND protects the whole ring side.',
      },
    },
  },
  {
    id: 'recipe-pozole-powerhouse',
    name: 'Pozole Powerhouse',
    type: 'recipe',
    requires: [
      { tag: 'masa',     count: 1 },
      { tag: 'protein',  count: 1 },
      { tag: 'cilantro', count: 1 },
    ],
    procedure: [
      { tag: 'masa',     heat: 'low'    },
      { tag: 'protein',  heat: 'medium' },
      { tag: 'cilantro', heat: 'low'    },
    ],
    produces: {
      archetype: 'protein',
      baseAttack: 3,
      baseHealth: 7,
      regenEachTurn: 1,
      flavor: 'Broth that brings the noise.',
      special: {
        id: 'soup-slosh',
        name: 'Soup Slosh',
        trigger: 'onTurnInRing',
        description: 'All friendly ring wrestlers heal 1 HP each turn.',
      },
    },
  },
  {
    id: 'recipe-queso-fundido-fury',
    name: 'Queso Fundido Fury',
    type: 'recipe',
    requires: [
      { tag: 'cheese',  count: 2 },
      { tag: 'protein', count: 1 },
    ],
    procedure: [
      { tag: 'cheese',  heat: 'low'    },
      { tag: 'cheese',  heat: 'medium' },
      { tag: 'protein', heat: 'high'   },
    ],
    produces: {
      archetype: 'greasy',
      baseAttack: 3,
      baseHealth: 8,
      flavor: 'Drippy. Lethal.',
      special: {
        id: 'sticky-grip',
        name: 'Sticky Grip',
        trigger: 'onTakeDamage',
        description: 'Attackers lose 1 ATK for 2 turns (cheese-coated).',
      },
    },
  },
  {
    id: 'recipe-sopes-strongman',
    name: 'Sopes Strongman',
    type: 'recipe',
    requires: [
      { tag: 'masa',    count: 1 },
      { tag: 'cheese',  count: 1 },
      { tag: 'protein', count: 1 },
    ],
    procedure: [
      { tag: 'masa',    heat: 'medium' },
      { tag: 'protein', heat: 'high'   },
      { tag: 'cheese',  heat: 'low'    },
    ],
    produces: {
      archetype: 'protein',
      baseAttack: 4,
      baseHealth: 7,
      flavor: 'Stocky little muscle disc.',
      special: {
        id: 'layered-defense',
        name: 'Layered Defense',
        trigger: 'static',
        description: 'Fat-mitigation threshold is one tier higher than normal.',
      },
    },
  },
  {
    id: 'recipe-flan-flexer',
    name: 'Flan Flexer',
    type: 'recipe',
    requires: [
      { tag: 'egg',   count: 1 },
      { tag: 'sugar', count: 1 },
      { tag: 'dairy', count: 1 },
    ],
    procedure: [
      { tag: 'egg',   heat: 'low'    },
      { tag: 'sugar', heat: 'medium' },
      { tag: 'dairy', heat: 'low'    },
    ],
    produces: {
      archetype: 'sugar',
      baseAttack: 2,
      baseHealth: 4,
      flavor: 'Jiggles. Then jabs.',
      special: {
        id: 'show-off',
        name: 'Show-Off',
        trigger: 'onCook',
        description: 'On entry, immediately attempts a Flex regardless of Sugar tier (uses dish\'s Sodium).',
      },
    },
  },
  {
    id: 'recipe-tostada-throwdown',
    name: 'Tostada Throwdown',
    type: 'recipe',
    requires: [
      { tag: 'tortilla', count: 1 },
      { tag: 'protein',  count: 1 },
      { tag: 'acid',     count: 1 },
    ],
    procedure: [
      { tag: 'tortilla', heat: 'high' },
      { tag: 'protein',  heat: 'high' },
      { tag: 'acid',     heat: 'low'  },
    ],
    produces: {
      archetype: 'carb',
      baseAttack: 4,
      baseHealth: 5,
      flavor: 'Crisp. Crunchy. Combative.',
      special: {
        id: 'crunchy-counter',
        name: 'Crunchy Counter',
        trigger: 'onTakeDamage',
        description: 'When attacked, deals 1 damage back to the attacker.',
      },
    },
  },
]

export const recipeById = (id) => RECIPES.find(r => r.id === id)

export const STARTER_COOKBOOK = {
  ownedRecipes: RECIPES.map(r => r.id),
  readiedRecipes: [
    'recipe-tamale-tornado',
    'recipe-empanada-enforcer',
    'recipe-habanero-haymaker',
  ],
}

export const RIVAL_BISTEC_COOKBOOK = {
  ownedRecipes: [
    'recipe-burrito-bouncer',
    'recipe-empanada-enforcer',
    'recipe-tamale-tornado',
    'recipe-habanero-haymaker',
    'recipe-carnitas-crusher',
    'recipe-mole-marauder',
  ],
  readiedRecipes: [
    'recipe-burrito-bouncer',
    'recipe-carnitas-crusher',
    'recipe-mole-marauder',
  ],
}
