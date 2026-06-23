// Audio manager.
// Plays looping background music with crossfade between tracks, and one-shot
// sound effects. Files live at `public/sounds/<name>.mp3` (`.ogg` and `.wav`
// are tried as fallbacks). Missing files silently no-op so the deploy can
// ship before audio assets exist.
//
// Browser autoplay policy: NO audio plays until the user has interacted with
// the page at least once. The first call to `playMusic` or `playSfx` that
// happens inside a click/key event handler unlocks the audio system; from
// then on programmatic switches (e.g. scene transitions) work freely.
//
// Mute state persists in localStorage ('luncha-libre.muted').

const SFX_BASE = '/sounds'
const MUTE_KEY = 'luncha-libre.muted'

const sfxCache = new Map()
let muted = false

if (typeof localStorage !== 'undefined') {
  try { muted = localStorage.getItem(MUTE_KEY) === '1' } catch { /* ignore */ }
}

const tryUrls = (name) => [
  `${SFX_BASE}/${name}.mp3`,
  `${SFX_BASE}/${name}.ogg`,
  `${SFX_BASE}/${name}.wav`,
]

const ensureAudioFor = (name) => {
  if (sfxCache.has(name)) return sfxCache.get(name)
  if (typeof Audio === 'undefined') return null
  const a = new Audio()
  a.src = tryUrls(name)[0]
  a.preload = 'auto'
  a.onerror = () => {
    const cur = a.src
    const urls = tryUrls(name)
    const idx = urls.findIndex(u => cur.endsWith(u))
    if (idx >= 0 && idx + 1 < urls.length) a.src = urls[idx + 1]
  }
  sfxCache.set(name, a)
  return a
}

// ─── One-shot SFX ──────────────────────────────────────────

export const playSfx = (name, volume = 0.6) => {
  if (muted) return
  const a = ensureAudioFor(name)
  if (!a) return
  try {
    const node = a.cloneNode(true)
    node.volume = volume
    node.play().catch(() => { /* autoplay block */ })
  } catch { /* ignore */ }
}

// ─── Crossfading music ────────────────────────────────────
//
// Two-buffer ping-pong: one element holds the currently-playing track, the
// other is preloaded with the next track and fades in while the previous
// fades out. After the fade completes, the roles swap.

let musicA = null
let musicB = null
let currentSlot = 'a'        // which buffer is currently audible
let currentTrack = null      // name of the track in `currentSlot`
let pendingTrack = null      // intended track while muted (resume on unmute)
let targetVolume = 0.3       // default music volume; per-track override possible
let fadeTimer = null

const slotEl = (slot) => (slot === 'a' ? musicA : musicB)
const setSlotEl = (slot, el) => { if (slot === 'a') musicA = el; else musicB = el }
const otherSlot = (slot) => (slot === 'a' ? 'b' : 'a')

const makeMusicEl = (name) => {
  if (typeof Audio === 'undefined') return null
  const a = new Audio(tryUrls(name)[0])
  a.loop = true
  a.volume = 0
  a.preload = 'auto'
  a.onerror = () => {
    const cur = a.src
    const urls = tryUrls(name)
    const idx = urls.findIndex(u => cur.endsWith(u))
    if (idx >= 0 && idx + 1 < urls.length) a.src = urls[idx + 1]
  }
  return a
}

const fadeElement = (el, from, to, durationMs, onDone) => {
  if (!el) { onDone?.(); return }
  const steps = Math.max(8, Math.floor(durationMs / 40))
  const delta = (to - from) / steps
  let i = 0
  el.volume = from
  const tick = () => {
    i++
    el.volume = Math.max(0, Math.min(1, from + delta * i))
    if (i >= steps) { el.volume = to; onDone?.(); return }
    fadeTimer = setTimeout(tick, durationMs / steps)
  }
  tick()
}

// Play a music track, crossfading from any currently-playing track. Handles
// autoplay-block retry: if the first call (before any user gesture) gets
// rejected, the audio element is left in a paused state; subsequent calls
// for the same track call .play() again instead of short-circuiting.
//
// Must initially be called from a user-gesture handler (click/key) for the
// audio to actually start; later calls (e.g., scene transitions) don't need
// to be gesture-bound.
export const playMusic = (name, { fadeMs = 1200, volume = 0.3 } = {}) => {
  if (!name) return
  if (typeof Audio === 'undefined') return
  targetVolume = volume

  if (muted) {
    // Remember intent so unmute can resume; do NOT touch currentTrack so the
    // unmute path knows a real start is still required.
    pendingTrack = name
    return
  }
  pendingTrack = null

  // Same track requested — retry play() if the element exists but is paused
  // (e.g., browser autoplay blocked the first attempt). Otherwise no-op.
  const cur = slotEl(currentSlot)
  if (currentTrack === name && cur) {
    if (cur.paused) cur.play().catch(() => { /* still blocked */ })
    return
  }

  if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null }

  const next = makeMusicEl(name)
  if (!next) return
  const nextSlot = otherSlot(currentSlot)
  setSlotEl(nextSlot, next)
  next.volume = 0
  next.play().catch(() => { /* autoplay block; retried on next user gesture */ })

  // Crossfade: fade in `next`, fade out previous (if any).
  fadeElement(next, 0, targetVolume, fadeMs)
  const prev = slotEl(currentSlot)
  if (prev) {
    fadeElement(prev, prev.volume, 0, fadeMs, () => {
      try { prev.pause() } catch { /* ignore */ }
    })
  }
  currentSlot = nextSlot
  currentTrack = name
}

export const stopMusic = (fadeMs = 600) => {
  const el = slotEl(currentSlot)
  if (!el) return
  fadeElement(el, el.volume, 0, fadeMs, () => {
    try { el.pause() } catch { /* ignore */ }
  })
  currentTrack = null
}

// Back-compat shim used by older callers (GameTable, etc.).
export const ensureMusicStarted = (name = 'music-kitchen', volume = 0.25) => {
  playMusic(name, { volume, fadeMs: 600 })
}

// ─── Mute ─────────────────────────────────────────────────

export const isMuted = () => muted
export const setMuted = (val) => {
  muted = !!val
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0') } catch { /* ignore */ }
  if (muted) {
    if (musicA) { try { musicA.pause() } catch { /* ignore */ } }
    if (musicB) { try { musicB.pause() } catch { /* ignore */ } }
    return
  }
  // Unmute — resume whatever track was intended. pendingTrack wins (we were
  // muted at request time), else the currentTrack we already had loaded.
  const resume = pendingTrack ?? currentTrack
  if (!resume) return
  if (pendingTrack && pendingTrack !== currentTrack) {
    playMusic(pendingTrack, { fadeMs: 400 })
  } else {
    const cur = slotEl(currentSlot)
    if (cur) cur.play().catch(() => {})
    else playMusic(resume, { fadeMs: 400 })
  }
}
export const toggleMuted = () => { setMuted(!muted); return muted }

// ─── Appliance SFX map (Phase 9) ──────────────────────────

export const APPLIANCE_SFX = {
  'cast-iron-pan': 'sfx-sizzle',
  'microwave':     'sfx-microwave',
  'bbq':           'sfx-grill',
  'air-fryer':     'sfx-airfryer',
  'stockpot':      'sfx-bubble',
  'wok':           'sfx-stirfry',
}

export const sfxForAppliance = (applianceId) => APPLIANCE_SFX[applianceId] ?? 'sfx-place'

// ─── Scene → track map (Phase 11) ─────────────────────────
// Used by the Prelude / La Gira orchestrators to switch music per scene.
// Add entries here when you add scenes; missing entries leave the music
// unchanged.

export const SCENE_TRACKS = {
  // Prelude
  'awake':           'music-prelude-rain',
  'food-court':      'music-prelude-rain',
  'candle-lit':      'music-altar',
  'kitchen-cooking': 'music-kitchen-eerie',
  'altar':           'music-altar',
  'choice':          'music-altar',
  'arcana-reward':   'music-arcana',
  // La Gira (post-prelude run loop)
  'la-gira-default': 'music-kitchen',
}
