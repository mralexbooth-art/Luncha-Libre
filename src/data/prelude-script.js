// Phase 11 — All dialogue, narration, and Sabia responses for the prelude.
// Single source of truth so tone stays consistent.

// ─── Narration (second-person, present-tense, dreamlike) ─────

export const AWAKE_NARRATION = [
  'You wake up.',
  'It is raining. Or it has just stopped.',
  'You cannot tell which.',
  'Somewhere, faintly, a wrestling announcer is finishing a sentence you missed.',
  'You decide not to think about it.',
]

export const FOOD_COURT_NARRATION = [
  'You wonder why this place feels familiar.',
  'Old menus flap in the wet wind. Picnic tables. Candles in jars.',
  'Someone has placed marigolds on every other table.',
]

export const SABIA_APPROACH_NARRATION = [
  'A small old woman is waiting for you.',
  'She has been waiting, you suspect, for a while.',
]

export const CANDLE_LIT_NARRATION = [
  'The wax catches.',
  'The radio on the altar coughs once, then begins to whisper.',
]

export const KITCHEN_NARRATION = [
  'You step into the kitchen.',
  'A radio is zip-tied to the prep station. It hums.',
  'You feel, very briefly, that someone is humming with it.',
  "You don't think about that either.",
]

export const ALTAR_NARRATION = [
  'You bring the plate to the altar.',
  'The marigolds tilt toward it.',
]

export const REWARD_NARRATION = [
  'A candle on the altar refuses to go out.',
  'You take it with you.',
]

// ─── Sabia dialogue ──────────────────────────────────────────

export const SABIA_INTRO = [
  { speaker: 'Sabia', text: 'Someone is trying to talk to you.' },
  { speaker: 'Sabia', text: "If you'd like to hear them…" },
  { speaker: 'Sabia', text: "You'll need to make an offering." },
  { speaker: 'Sabia', text: 'What do you have?' },
]

// One response per offer kind. Lines are arrays so the dialogue can pace
// them across multiple clicks like Empresario beats.
export const SABIA_RESPONSES = {
  'cape-fragment': [
    { speaker: 'Sabia', text: 'Hm. You\'ve worn this.', tone: 'warm' },
    { speaker: 'Sabia', text: '…or someone you loved did.', tone: 'whisper' },
    { speaker: 'Sabia', text: 'I\'ll keep this. It will help.', tone: 'warm' },
  ],
  'lipstick-cap': [
    { speaker: 'Sabia', text: 'Vanity in the woods.', tone: 'amused' },
    { speaker: 'Sabia', text: 'I accept it. The dead like to be pretty too.' },
  ],
  'hard-candy': [
    { speaker: 'Sabia', text: 'Sweet.', tone: 'warm' },
    { speaker: 'Sabia', text: '…he liked sweet too.', tone: 'whisper' },
    { speaker: 'Sabia', text: 'You don\'t know who I mean. That\'s alright.' },
  ],
  'wrestler-card': [
    { speaker: 'Sabia', text: 'Oh.' },
    { speaker: 'Sabia', text: 'Keep this. It isn\'t for me.', tone: 'firm' },
    { speaker: 'Sabia', text: 'Not yet.', tone: 'whisper' },
  ],
  'matchbook': [
    { speaker: 'Sabia', text: 'Yes. Yes — keep these.', tone: 'warm' },
    { speaker: 'Sabia', text: 'You\'ll need to light something soon.' },
  ],
  'lied': [
    { speaker: 'Sabia', text: 'Nothing?', tone: 'amused' },
    { speaker: 'Sabia', text: 'Mm. Of course not.' },
    { speaker: 'Sabia', text: 'Look in your pockets again. I\'ll wait.' },
  ],
  'silent': [
    { speaker: 'Sabia', text: '…' },
    { speaker: 'Sabia', text: 'Alright.' },
    { speaker: 'Sabia', text: 'Then I will wait until you are ready.' },
  ],
}

export const SABIA_FAREWELL = [
  { speaker: 'Sabia', text: 'Walk around. Look at things.' },
  { speaker: 'Sabia', text: 'When you find the candle — light it.' },
  { speaker: 'Sabia', text: 'They\'ve been waiting too.', tone: 'whisper' },
]

// ─── Abuela (heard through radio at the altar) ───────────────

export const ABUELA_QUEST = [
  { speaker: 'Abuela (radio)', text: '— ah. There you are.', tone: 'warm' },
  { speaker: 'Abuela (radio)', text: 'You smell like rain. Good. Good.' },
  { speaker: 'Abuela (radio)', text: 'I\'ve been trying to remember a dish.' },
  { speaker: 'Abuela (radio)', text: 'He always loved when I made it.' },
  { speaker: 'Abuela (radio)', text: 'It was crunchy.' },
  { speaker: 'Abuela (radio)', text: 'It was sweet.' },
  { speaker: 'Abuela (radio)', text: 'He hated vegetables. Hated them.', tone: 'amused' },
  { speaker: 'Abuela (radio)', text: 'There was rice. Because someone insisted.' },
  { speaker: 'Abuela (radio)', text: 'And something pickled. Just one.' },
  { speaker: 'Abuela (radio)', text: 'Can you make it for me, mijo?', tone: 'warm' },
]

// ─── Wandering hotspot narration (V4) ────────────────────────

export const HOTSPOT_NARRATION = {
  'old-menu': [
    'A laminated menu, edges curled.',
    'Spanish on one side. English on the other.',
    'You almost recognize the handwriting at the bottom.',
    'You decide not to think about it.',
  ],
  'boombox': [
    'The broken boombox.',
    'You tap it.',
    'It coughs. The static thins, just a little.',
  ],
  'stray-cat': [
    'Something moves under a bench.',
    'A cat. Old. Calm.',
    'It looks at you. It does not leave.',
  ],
  'candle-jar': [
    'A second candle, in a glass jar full of dust.',
    'You consider lighting it. You don\'t, yet.',
    'It feels like its own conversation.',
  ],
  'wrestler-poster': [
    'A peeling poster on a tree trunk.',
    'A luchador, mid-flight. The colors are still bright.',
    'The eyes of the crowd are erased.',
    'Yours, too.',
  ],
}

export const WANDER_INTRO = [
  'You decide to walk around first.',
  'The rain has thinned. Or you\'ve started not minding it.',
  'Click on things. Take your time.',
]

export const WANDER_TO_KITCHEN_PROMPT = [
  'The food court is quieter now. Or louder. You can\'t tell.',
  'There\'s a kitchen behind the altar. You feel her waiting.',
]

// ─── Kitchen — V4 cozy minigame narration ────────────────────

export const KITCHEN_INTRO = [
  'You step into the kitchen.',
  'A single cast iron pan waits on the prep station.',
  'A radio is zip-tied above it. It hums.',
  'You feel, very briefly, that someone is humming with it.',
]

export const KITCHEN_INSTRUCTIONS = [
  'Pick ingredients from the counter.',
  'Add the ones she described. Skip the ones she didn\'t.',
  'When you\'re ready — cook.',
]

// Per-ingredient placement quips (chosen by id when added to the pan).
export const PLACEMENT_QUIPS = {
  rice:              'Because someone insisted.',
  'potato-chips':    'Crunchy. She\'d laugh.',
  'chicken-nuggets': 'He always asked for these.',
  marshmallow:       'Sweet. Improbable.',
  pickle:            'Just one. She was insistent on the just-one.',
  'hard-candy':      'Sticky. Disrespectful.',
  cilantro:          'Wait — no. She said no vegetables.',
  spinach:           'Definitely not. Take it out.',
}

// ─── Altar — Abuela reacts to the cooked dish ────────────────

export const ABUELA_RECOGNIZES = [
  { speaker: 'Abuela (radio)', text: 'Oh.', tone: 'whisper' },
  { speaker: 'Abuela (radio)', text: 'Oh, no.' },
  { speaker: 'Abuela (radio)', text: 'My husband.', tone: 'warm' },
  { speaker: 'Abuela (radio)', text: 'Only he would eat this.' },
  { speaker: 'Abuela (radio)', text: 'He made me promise I\'d never cook it again.' },
  { speaker: 'Abuela (radio)', text: 'And here you are. Cooking it.' },
  { speaker: 'Abuela (radio)', text: '…he misses me.', tone: 'whisper' },
]

export const ABUELA_BEGS = [
  { speaker: 'Abuela (radio)', text: 'Please.', tone: 'whisper' },
  { speaker: 'Abuela (radio)', text: 'Eat him.' },
  { speaker: 'Abuela (radio)', text: 'Release him.' },
  { speaker: 'Abuela (radio)', text: 'He has suffered long enough.' },
]

// ─── Choice prompts ──────────────────────────────────────────

export const CHOICE_PROMPT = {
  keep: {
    title: 'KEEP HIM AS A FIGHTER',
    description: 'El Dulce Campeón joins your deck. You will see him in the ring.',
    afterLines: [
      { speaker: 'Abuela (radio)', text: '…I understand.', tone: 'whisper' },
      { speaker: 'Abuela (radio)', text: 'Take care of him.' },
    ],
  },
  release: {
    title: 'RELEASE HIM',
    description: 'You eat the dish. He is gone. You feel briefly full.',
    afterLines: [
      { speaker: 'Abuela (radio)', text: 'Thank you, mijo.', tone: 'warm' },
      { speaker: 'Abuela (radio)', text: '…I think I will go too. For a little while.' },
    ],
  },
}

// ─── Arcana reveal ───────────────────────────────────────────

export const ARCANA_REVEAL = [
  { speaker: null, text: 'A candle on the altar refuses to go out.' },
  { speaker: null, text: 'You take it with you.' },
]
