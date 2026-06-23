// Phase 10 — Soft permadeath + meta-unlocks persistence.
//
// Two localStorage blobs:
//   - 'luncha-libre.run'  : full current-run state. Cleared on run end.
//   - 'luncha-libre.meta' : permanent unlocks. Never wiped automatically.
//
// All ops are safe — they silently no-op when localStorage isn't available.

const RUN_KEY  = 'luncha-libre.run'
const META_KEY = 'luncha-libre.meta'

const safeGet = (key) => {
  try { return localStorage.getItem(key) } catch { return null }
}
const safeSet = (key, val) => {
  try { localStorage.setItem(key, val) } catch { /* ignore */ }
}
const safeRm = (key) => {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

// Sets aren't JSON-serializable. Convert recursively.
const serialize = (val) => {
  if (val instanceof Set) return { __set: [...val] }
  if (Array.isArray(val)) return val.map(serialize)
  if (val && typeof val === 'object') {
    const out = {}
    for (const k of Object.keys(val)) out[k] = serialize(val[k])
    return out
  }
  return val
}
const deserialize = (val) => {
  if (val && typeof val === 'object' && Array.isArray(val.__set)) return new Set(val.__set)
  if (Array.isArray(val)) return val.map(deserialize)
  if (val && typeof val === 'object') {
    const out = {}
    for (const k of Object.keys(val)) out[k] = deserialize(val[k])
    return out
  }
  return val
}

export const saveRun = (run) => safeSet(RUN_KEY, JSON.stringify(serialize(run)))
export const loadRun = () => {
  const raw = safeGet(RUN_KEY)
  if (!raw) return null
  try { return deserialize(JSON.parse(raw)) } catch { return null }
}
export const clearRun = () => safeRm(RUN_KEY)

const EMPTY_META = () => ({
  unlocks: {
    ingredients: new Set(),
    recipes: new Set(),
    actions: new Set(),
    chefs: new Set(),
  },
  wildDishGallery: {},   // key → { name, flavor, count, mastered, firstSeenTurn }
  runsPlayed: 0,
  runsWon: 0,
  longestStreak: 0,
  currentStreak: 0,
  // Phase 11 prelude — flips true once the opening vertical slice is finished.
  // When false, the player sees the Prelude on load. When true, they go to LaGira.
  introCompleted: false,
  // Arcana unlocked across runs. Empty until prelude grants Undying Light.
  arcana: [],
  // Recorded for foreshadowing — affects later phases' behavior.
  husbandKept: null,    // null | true | false
})

export const loadMeta = () => {
  const raw = safeGet(META_KEY)
  if (!raw) return EMPTY_META()
  try {
    const parsed = deserialize(JSON.parse(raw))
    // Merge with empty defaults to migrate older saves.
    return { ...EMPTY_META(), ...parsed, unlocks: { ...EMPTY_META().unlocks, ...(parsed.unlocks ?? {}) } }
  } catch {
    return EMPTY_META()
  }
}

export const saveMeta = (meta) => safeSet(META_KEY, JSON.stringify(serialize(meta)))

// Merge a finished run's discoveries into the persistent meta blob.
// Called at run-end (win OR loss).
export const commitRunToMeta = (meta, runResult) => {
  const next = {
    ...meta,
    unlocks: {
      ingredients: new Set([...(meta.unlocks?.ingredients ?? []), ...(runResult.unlocks?.ingredients ?? [])]),
      recipes:     new Set([...(meta.unlocks?.recipes     ?? []), ...(runResult.unlocks?.recipes     ?? [])]),
      actions:     new Set([...(meta.unlocks?.actions     ?? []), ...(runResult.unlocks?.actions     ?? [])]),
      chefs:       new Set([...(meta.unlocks?.chefs       ?? []), ...(runResult.unlocks?.chefs       ?? [])]),
    },
    wildDishGallery: { ...meta.wildDishGallery, ...(runResult.wildDishGallery ?? {}) },
    runsPlayed: (meta.runsPlayed ?? 0) + 1,
  }
  if (runResult.won) {
    next.runsWon = (meta.runsWon ?? 0) + 1
    next.currentStreak = (meta.currentStreak ?? 0) + 1
    next.longestStreak = Math.max(meta.longestStreak ?? 0, next.currentStreak)
  } else {
    next.currentStreak = 0
  }
  saveMeta(next)
  return next
}

// Hard wipe (player-triggered button). Vertical slice doesn't expose this yet.
export const wipeAll = () => { safeRm(RUN_KEY); safeRm(META_KEY) }

// Phase 11 prelude helpers — read/write the intro-completed flag and the
// arcana unlock list without forcing callers to load the whole meta blob.
export const isIntroCompleted = () => loadMeta().introCompleted === true
export const completeIntro = (extras = {}) => {
  const meta = loadMeta()
  const next = {
    ...meta,
    introCompleted: true,
    arcana: Array.from(new Set([...(meta.arcana ?? []), ...(extras.arcana ?? [])])),
    ...(extras.husbandKept != null ? { husbandKept: extras.husbandKept } : {}),
  }
  saveMeta(next)
  return next
}
// Dev-only: reset the prelude so we can replay it during testing.
export const resetIntro = () => {
  const meta = loadMeta()
  saveMeta({ ...meta, introCompleted: false, arcana: [], husbandKept: null })
}
