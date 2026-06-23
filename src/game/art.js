// Card art lookup. Files live under public/cards/<type>/<id>[-<variant>].png
// and are served by Vite at /cards/<type>/<id>[-<variant>].png. When a file
// doesn't exist yet, CardArt falls back through a chain of URLs (variant →
// base → emoji) so the game stays playable as art assets are added gradually.
//
// Phase 7: recipes get quality variants (perfect/good/plain/burnt) and
// ingredients get stage variants (raw/chopped/cooking/cooked/burnt).

const ART_BASE = '/cards'

const stripPrefix = (id, pfx) => id.startsWith(pfx) ? id.slice(pfx.length) : id

// Each function returns an ARRAY of URLs to try in order. CardArt tries each
// until one loads, falling back to the emoji glyph if all 404.

export const ingredientArtUrls = (id, stage) => {
  const bare = stripPrefix(id, '')
  const base = `${ART_BASE}/ingredients/${bare}.png`
  if (!stage || stage === 'raw') return [base]
  return [`${ART_BASE}/ingredients/${bare}-${stage}.png`, base]
}

export const actionArtUrls = (id) => {
  const bare = stripPrefix(id, 'action-')
  return [`${ART_BASE}/actions/${bare}.png`]
}

export const recipeArtUrls = (id, quality) => {
  const bare = stripPrefix(id, 'recipe-')
  const base = `${ART_BASE}/recipes/${bare}.png`
  if (!quality || quality === 'good') return [base]
  return [`${ART_BASE}/recipes/${bare}-${quality}.png`, base]
}

export const wildDishArtUrls = () => [`${ART_BASE}/recipes/wild-dish.png`]

// Legacy single-URL helpers used by older call sites. They return the
// "best guess" URL — CardArt with the multi-URL prop is preferred.
export const ingredientArtUrl = (id) => `${ART_BASE}/ingredients/${id}.png`
export const actionArtUrl     = (id) => `${ART_BASE}/actions/${stripPrefix(id, 'action-')}.png`
export const recipeArtUrl     = (id) => `${ART_BASE}/recipes/${stripPrefix(id, 'recipe-')}.png`
export const wildDishArtUrl   = () => `${ART_BASE}/recipes/wild-dish.png`

// Emoji fallback per card. Keys are the bare ids (no prefix).
export const ART_FALLBACK = {
  // ingredients
  'corn-masa':       '🌽',
  'flour':           '🌾',
  'tortilla':        '🫓',
  'rice':            '🍚',
  'beef-chuck':      '🥩',
  'pork':            '🥓',
  'chicken':         '🍗',
  'onion':           '🧅',
  'garlic':          '🧄',
  'cilantro':        '🌿',
  'sugar':           '🍬',
  'cinnamon':        '🥖',
  'chili':           '🌶️',
  'habanero':        '🌶️',
  'lime':            '🍋',
  'salt':            '🧂',
  'butter':          '🧈',
  'lard':            '🥄',
  'tomato':          '🍅',
  'cheese':          '🧀',
  'poptart-of-pain': '🥐',
  'raw-celery':      '🥬',
  // Phase 8 additions
  'egg':             '🥚',
  'black-beans':     '🫘',
  'avocado':         '🥑',
  'jalapeño':        '🌶️',
  'jalapeno':        '🌶️',
  'mushroom':        '🍄',
  'potato':          '🥔',
  'bell-pepper':     '🫑',
  'chorizo':         '🌭',
  'tomatillo':       '🍏',
  'chocolate':       '🍫',
  'crema':           '🥛',
  'plantain':        '🍌',

  // actions
  'mise-en-place':   '🍽️',
  'pressure-cooker': '⏲️',
  'open-flame':      '🔥',
  'guest-chef':      '👵',
  'salt-bae':        '🧂',
  'kitchen-fire':    '🔥',
  'taste-test':      '👅',
  'snack-break':     '🍿',
  'family-recipe':   '📖',
  'spice-rack':      '🌶️',
  'bonus-tip':       '💸',
  'crowd-pleaser':   '🎉',
  'composter':       '♻️',
  'sous-chef':       '👨‍🍳',
  'pantry-raid':     '🛒',
  'knife-sharpener': '🔪',
  'auto-dicer':      '🤖',
  'med-kit':         '🩹',

  // recipes
  'tamale-tornado':    '🌯',
  'pan-dulce-punch':   '🥐',
  'empanada-enforcer': '🥟',
  'burrito-bouncer':   '🌯',
  'habanero-haymaker': '🌶️',
  'churro-chainsaw':   '🍩',

  // special
  'wild-dish': '🍲',
}

export const fallbackFor = (id) => {
  if (!id) return '❔'
  const bare = id.replace(/^action-|^recipe-/, '')
  return ART_FALLBACK[bare] ?? '❔'
}
