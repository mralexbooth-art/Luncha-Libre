// Phase 4 — Action Market.
// One shared shuffled pile both players draw from. Action cards live in
// the same hand as ingredient cards but are distinguished by `type`.
//
// Shape:
//   {
//     id, name, type: 'action',
//     cost: number,                // energy
//     rarity: 'common' | 'rare',
//     effect: {
//       id: string,                // handler key (see src/game/effects.js -> ACTION_HANDLERS)
//       targeting: 'none' | 'appliance' | 'wrestler-enemy' | 'self' | 'hand',
//     },
//     flavor: string,
//     description: string,
//   }

export const ACTION_CARDS = [
  {
    id: 'action-mise-en-place',
    name: 'Mise en Place',
    type: 'action',
    cost: 1,
    rarity: 'common',
    effect: { id: 'mise-en-place', targeting: 'none' },
    description: 'Draw 1 extra ingredient now.',
    flavor: 'A place for every cilantro, and every cilantro in its place.',
  },
  {
    id: 'action-pressure-cooker',
    name: 'Pressure Cooker',
    type: 'action',
    cost: 2,
    rarity: 'common',
    effect: { id: 'pressure-cooker', targeting: 'appliance' },
    description: '–2 cook timer on a chosen cooking appliance.',
    flavor: 'Speeds things up. Sometimes too far.',
  },
  {
    id: 'action-open-flame',
    name: 'Open Flame',
    type: 'action',
    cost: 1,
    rarity: 'common',
    effect: { id: 'open-flame', targeting: 'appliance' },
    description: '+1 cook timer on a chosen pot, but the dish gains +2 ATK and is crash-immune.',
    flavor: 'Let it burn. Let it BURN.',
  },
  {
    id: 'action-guest-chef',
    name: 'Guest Chef: Abuela Inferno',
    type: 'action',
    cost: 0,
    rarity: 'rare',
    effect: { id: 'guest-chef', targeting: 'none' },
    description: 'Add a random unowned recipe to your readied list this match.',
    flavor: 'She brought her own knives.',
  },
  {
    id: 'action-salt-bae',
    name: 'Salt Bae',
    type: 'action',
    cost: 0,
    rarity: 'common',
    effect: { id: 'salt-bae', targeting: 'appliance' },
    description: 'Drop salt as the LAST ingredient into a chosen pot. Counts as cured.',
    flavor: 'Salt. Bae.',
  },
  {
    id: 'action-kitchen-fire',
    name: 'Kitchen Fire!',
    type: 'action',
    cost: 2,
    rarity: 'common',
    effect: { id: 'kitchen-fire', targeting: 'none' },
    description: '3 damage to all enemy ring wrestlers AND all your cooking pots.',
    flavor: 'Oh no. Oh no.',
  },
  {
    id: 'action-taste-test',
    name: 'Taste Test',
    type: 'action',
    cost: 1,
    rarity: 'common',
    effect: { id: 'taste-test', targeting: 'none' },
    description: 'Peek at the rival\'s hand this turn (logged).',
    flavor: 'A little spy. A little spice.',
  },
  {
    id: 'action-snack-break',
    name: 'Snack Break',
    type: 'action',
    cost: 0,
    rarity: 'common',
    effect: { id: 'snack-break', targeting: 'none' },
    description: 'Heal your chef 3 HP. Lose a random ingredient from hand.',
    flavor: 'Don\'t cook angry.',
  },
  {
    id: 'action-family-recipe',
    name: 'Family Recipe',
    type: 'action',
    cost: 0,
    rarity: 'rare',
    effect: { id: 'family-recipe', targeting: 'appliance' },
    description: 'A chosen pot is treated as if it has every tag — guaranteed best recipe match.',
    flavor: 'Three generations. One pot. No notes.',
  },
  {
    id: 'action-spice-rack',
    name: 'Spice Rack',
    type: 'action',
    cost: 1,
    rarity: 'common',
    effect: { id: 'spice-rack', targeting: 'none' },
    description: '+1 ATK to every dish currently cooking when it finishes.',
    flavor: 'A pinch of this. A pinch of that. A pinch of menace.',
  },
  {
    id: 'action-bonus-tip',
    name: 'Bonus Tip',
    type: 'action',
    cost: 0,
    rarity: 'common',
    effect: { id: 'bonus-tip', targeting: 'none' },
    description: 'Draw 2 ingredient cards.',
    flavor: 'The crowd is being generous tonight.',
  },
  {
    id: 'action-crowd-pleaser',
    name: 'Crowd Pleaser',
    type: 'action',
    cost: 1,
    rarity: 'common',
    effect: { id: 'crowd-pleaser', targeting: 'none' },
    description: 'If you have 3 wrestlers in the ring, deal 2 damage to the rival chef.',
    flavor: 'Give the people what they want. Carbs.',
  },
  {
    id: 'action-composter',
    name: 'Composter',
    type: 'action',
    cost: 0,
    rarity: 'common',
    effect: { id: 'composter', targeting: 'none' },
    description: 'Discard every cookable ingredient from your hand; each one removes 1 from your food-waste meter.',
    flavor: 'Worms eat what wrestlers won\'t.',
  },
  {
    id: 'action-sous-chef',
    name: 'Sous Chef',
    type: 'action',
    cost: 3,
    rarity: 'rare',
    effect: { id: 'sous-chef', targeting: 'none' },
    description: 'Refund 1 energy now and gain +2 max energy this turn only.',
    flavor: 'A second pair of hands. A first pair of opinions.',
  },
  {
    id: 'action-pantry-raid',
    name: 'Pantry Raid',
    type: 'action',
    cost: 2,
    rarity: 'common',
    effect: { id: 'pantry-raid', targeting: 'none' },
    description: 'Pull a random cookable ingredient from your deck to your hand.',
    flavor: 'You know it\'s in there somewhere.',
  },
  {
    id: 'action-knife-sharpener',
    name: 'Knife Sharpener',
    type: 'action',
    cost: 0,
    rarity: 'common',
    effect: { id: 'knife-sharpener', targeting: 'none' },
    description: '+1 knife sharpen counter (cap 3). Sharpen counters auto-apply +1⚔ +1❤ per chop.',
    flavor: 'Steel begs for steel.',
  },
  {
    id: 'action-auto-dicer',
    name: 'Automatic Dicer',
    type: 'action',
    cost: 2,
    rarity: 'rare',
    effect: { id: 'auto-dicer', targeting: 'board' },
    description: 'Install on a cutting board slot. Next 2 ingredients dropped on this slot chop as PERFECT automatically.',
    flavor: 'Whirr. Whirr. Don\'t lose a thumb.',
  },
  {
    id: 'action-med-kit',
    name: 'Med Kit',
    type: 'action',
    cost: 1,
    rarity: 'common',
    effect: { id: 'med-kit', targeting: 'none' },
    description: 'Heal chef +5 HP. Stops bleeding from a knife injury.',
    flavor: 'You can keep going. Probably.',
  },
  {
    id: 'action-force-feed',
    name: 'Force Feed',
    type: 'action',
    cost: 2,
    rarity: 'rare',
    effect: { id: 'force-feed', targeting: 'enemy-wrestler' },
    description: 'Pick an enemy ring dish. Their chef eats it: nutrition goes to their tracker, calories add to fullness, and matching allergies deal extra chip damage.',
    flavor: 'Open wide, manager.',
  },
  // Phase 9 energy gain
  {
    id: 'action-caffeine-pill',
    name: 'Caffeine Pill',
    type: 'action',
    cost: 0,
    rarity: 'common',
    effect: { id: 'caffeine-pill', targeting: 'none' },
    description: '+2⚡ this turn.',
    flavor: 'Tastes like a dishwasher in a hurry.',
  },
]

// Build the shared action market: ~2 of each common, 1 of each rare.
export const buildSharedActionDeck = () => {
  const deck = []
  for (const card of ACTION_CARDS) {
    const copies = card.rarity === 'rare' ? 1 : 2
    for (let i = 0; i < copies; i++) deck.push(card.id)
  }
  return deck
}

export const actionById = (id) => ACTION_CARDS.find(c => c.id === id)
