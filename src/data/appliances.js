// Appliances hold ingredients while they cook. Each has an ingredient
// capacity and stat modifiers applied to the resulting wrestler.

export const APPLIANCES = [
  {
    id: 'cast-iron-pan',
    name: 'Cast Iron Pan',
    type: 'appliance',
    capacity: 3,
    compresses: true,    // Phase 9.x: aromatics meld together after 1 turn
    modifier: { cookTime: 0, statMultiplier: 1.0, attackMultiplier: 1.0 },
    tier: 1,
    icon: '🍳',
    ability: { id: 'heat-retention', name: 'Heat Retention', description: 'Burn limit +1 on every ingredient inside.' },
    flavor: 'Reliable. Heavy. Old as time.',
  },
  {
    id: 'microwave',
    name: 'Microwave',
    type: 'appliance',
    capacity: 2,
    modifier: { cookTime: -1, statMultiplier: 0.5, attackMultiplier: 1.0 },
    tier: 1,
    icon: '📻',
    ability: { id: 'quick-zap', name: 'Quick Zap', description: 'First ingredient cooks 1 turn faster.' },
    flavor: 'Fast food, fast loss.',
  },
  {
    id: 'bbq',
    name: 'BBQ Grill',
    type: 'appliance',
    capacity: 3,
    modifier: { cookTime: 1, statMultiplier: 1.0, attackMultiplier: 1.5 },
    tier: 1,
    icon: '🔥',
    ability: { id: 'char-mark', name: 'Char Mark', description: '+2 ATK at synthesis if heat hit HIGH at least once.' },
    flavor: 'Smoke in the eyes. Char on the gloves.',
  },
  // Phase 9 market appliances
  {
    id: 'air-fryer',
    name: 'Air Fryer',
    type: 'appliance',
    capacity: 2,
    compresses: true,
    modifier: { cookTime: 0, statMultiplier: 1.0, attackMultiplier: 1.0 },
    tier: 2,
    icon: '🌀',
    ability: { id: 'crisp-edge', name: 'Crisp Edge', description: 'Dishes cooked here get +1 Fiber.' },
    flavor: 'Convection without conviction.',
  },
  {
    id: 'stockpot',
    name: 'Stockpot',
    type: 'appliance',
    capacity: 3,
    compresses: true,    // Phase 9.x: long simmer reduces and compresses
    modifier: { cookTime: 1, statMultiplier: 1.0, attackMultiplier: 1.0 },
    tier: 2,
    icon: '🍲',
    ability: { id: 'slow-cook', name: 'Slow Cook', description: 'Burn limit +2. Cook time +1 (already in modifier).' },
    flavor: 'Time is the secret ingredient.',
  },
  {
    id: 'wok',
    name: 'Wok',
    type: 'appliance',
    capacity: 3,
    compresses: true,    // Phase 9.x: stir-fry compacts after 1 turn
    modifier: { cookTime: 0, statMultiplier: 1.0, attackMultiplier: 1.0 },
    tier: 2,
    icon: '🥘',
    ability: { id: 'sear', name: 'Sear', description: 'First ingredient placed each round gets free "Clean" chop.' },
    flavor: 'Hot, fast, and forgiving of nothing.',
  },
]

export const applianceById = (id) => APPLIANCES.find(a => a.id === id)

// Phase 3 hardcodes the player's starting kitchen.
export const STARTING_APPLIANCE_IDS = ['cast-iron-pan', 'microwave', 'bbq']

// Base cook time everything starts from before ingredient/appliance modifiers.
export const BASE_COOK_TIME = 2
