// Phase 8 — chef roster. Each chef carries a manager system block:
//   hp / maxHp        — chef knockout threshold
//   appetite          — calorie limit; bloated when fullness > appetite
//   allergies         — tag list; force-fed dishes matching these tags amplify sabotage
//   trackerGoal       — nutritional targets to unlock the reward
//   rewardUnlockId    — string id matched by effect handlers when goal hit
//   signatureVP       — chef-exclusive VP-spend effect (id, name, cost, description)

export const CHEFS = [
  {
    id: 'chef-rivera',
    name: 'Chef Rivera',
    title: 'El Cocinero',
    flavor: '"En mi cocina, todo lucha."',
    portrait: '👨‍🍳',
    hp: 30,
    appetite: 80,
    allergies: [],
    trackerGoal: { protein: 20, carbs: 15 },
    rewardUnlockId: 'free-agitate',
    rewardName: 'Free Stir/Flip',
    rewardDescription: 'Agitating any appliance costs 0 energy for the rest of the match.',
    signatureVP: null,   // universal pool only
  },
  {
    id: 'gobbler',
    name: 'The Gobbler',
    title: 'El Tragón',
    flavor: '"If it fits in my mouth, it goes in my mouth."',
    portrait: '😋',
    hp: 35,
    appetite: 120,
    allergies: ['instant'],   // raw quick-eats: poptart, raw-celery
    allergyDamageMult: 2,     // 2× sabotage damage when allergy match
    trackerGoal: { totalNutrition: 50 },   // any-stat sum
    rewardUnlockId: 'gobble',
    rewardName: 'Gobble',
    rewardDescription: 'Feed Manager also heals chef by the dish\'s current HP.',
    signatureVP: {
      id: 'devour',
      name: 'Devour',
      cost: 5,
      targeting: 'enemy-wrestler',
      description: 'Destroy an enemy ring dish (consume without springing).',
    },
  },
  {
    id: 'vegan-fury',
    name: 'Vegan Fury',
    title: 'La Furia Verde',
    flavor: '"Plants. Only plants. Always plants."',
    portrait: '🥦',
    hp: 25,
    appetite: 60,
    allergies: ['red-meat', 'white-meat', 'dairy', 'animal'],
    allergyDamageMult: 2,
    trackerGoal: { fiber: 30, carbs: 20 },
    rewardUnlockId: 'poison-meat',
    rewardName: 'Poison Meat',
    rewardDescription: 'Any enemy ring dish with a meat tag (red-meat / white-meat) loses 1 HP/turn.',
    signatureVP: {
      id: 'herbal-surge',
      name: 'Herbal Surge',
      cost: 4,
      targeting: 'none',
      description: 'All your vegetable/fresh ingredient dishes gain +2 Fiber until end of round.',
    },
  },
  {
    id: 'top-chef',
    name: 'Top Chef',
    title: 'El Chef Maestro',
    flavor: '"Technique above all. Especially you."',
    portrait: '🎩',
    hp: 28,
    appetite: 70,
    allergies: [],
    allergySugarThreshold: 10,    // sabotage if force-fed dish.sugar >= 10
    allergySodiumThreshold: 10,
    allergyDamageMult: 2,
    trackerGoal: { protein: 25, carbs: 20 },
    rewardUnlockId: 'recipe-fusion',
    rewardName: 'Recipe Fusion',
    rewardDescription: 'Once per match, combine two ready recipes into one fusion wrestler with summed stats (caps still apply).',
    signatureVP: {
      id: 'improvise',
      name: 'Improvise',
      cost: 3,
      targeting: 'appliance',
      description: 'Chosen pot is treated as having every tag this turn (Family Recipe equivalent).',
    },
  },
]

export const chefById = (id) => CHEFS.find(c => c.id === id)

export const DEFAULT_CHEF_ID = 'chef-rivera'
export const DEFAULT_RIVAL_CHEF_ID = 'gobbler'   // El Bistec maps to Gobbler thematically

// Universal VP-spend catalog (any chef can use these).
export const UNIVERSAL_VP_EFFECTS = [
  { id: 'sharpen-on-fly',   name: 'Sharpen on the Fly', cost: 1, targeting: 'none',      description: '+1 knife sharpen counter.' },
  { id: 'catering-call',    name: 'Catering Call',      cost: 2, targeting: 'none',      description: 'Draw 2 ingredient cards.' },
  { id: 'managers-moxie',   name: 'Manager\'s Moxie',   cost: 3, targeting: 'none',      description: 'Refund 2 energy this turn.' },
  { id: 'first-aid',        name: 'First Aid',          cost: 3, targeting: 'own-wrestler', description: 'Heal one of your ring dishes by 3 HP.' },
  { id: 'recipe-sabotage',  name: 'Recipe Sabotage',    cost: 3, targeting: 'enemy-appliance', description: 'Add a salt-bomb to enemy pot — +5 Sodium and scramble procedure.' },
  { id: 'crowd-surge',      name: 'Crowd Surge',        cost: 4, targeting: 'none',      description: 'All your ring dishes gain +2 Sodium until end of round.' },
  { id: 'health-inspector', name: 'Health Inspector',   cost: 5, targeting: 'none',      description: 'Restore chef +5 HP.' },
  { id: 'boos-to-cheers',   name: 'Boos to Cheers',     cost: 6, targeting: 'none',      description: 'All enemy Flex actions auto-fail this round.' },
]

export const vpEffectById = (id) => {
  for (const chef of CHEFS) {
    if (chef.signatureVP?.id === id) return chef.signatureVP
  }
  return UNIVERSAL_VP_EFFECTS.find(e => e.id === id)
}

// Get available VP-spend effects for a given chef (universal + signature).
export const vpEffectsForChef = (chefId) => {
  const chef = chefById(chefId)
  const sig = chef?.signatureVP ? [chef.signatureVP] : []
  return [...UNIVERSAL_VP_EFFECTS, ...sig]
}
