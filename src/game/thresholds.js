// Phase 8 — threshold engine. Pure functions that map a wrestler's nutritional
// stat to its effect tier. Used by combat, support, and crowd-appeal systems.

export const fatTier = (fat) => {
  if (fat >= 15) return { tier: 'intercept', reduce: 3 }
  if (fat >= 10) return { tier: 'big',       reduce: 2 }
  if (fat >= 5)  return { tier: 'small',     reduce: 1 }
  return { tier: 'none', reduce: 0 }
}

export const fiberTier = (fiber) => {
  if (fiber >= 15) return 'enemy'
  if (fiber >= 10) return 'all-friendly'
  if (fiber >= 6)  return 'row'
  if (fiber >= 3)  return 'adjacent'
  if (fiber >= 1)  return 'self'
  return 'none'
}

export const carbsTier = (carbs) => {
  if (carbs >= 15) return 'all-friendly'
  if (carbs >= 10) return 'row'
  if (carbs >= 5)  return 'adjacent'
  if (carbs >= 1)  return 'self'
  return 'none'
}

// Sugar tier — burst on entry + crash 2 turns later
export const sugarTier = (sugar) => {
  if (sugar >= 15) return { burst: 'immediate-flex',  crashAtk: 2, crashHp: 2 }
  if (sugar >= 10) return { burst: 'double-action',  crashAtk: 2, crashHp: 0 }
  if (sugar >= 5)  return { burst: 'haste',          crashAtk: 0, crashHp: 0 }
  return { burst: 'none', crashAtk: 0, crashHp: 0 }
}

// Sodium tier — Flex action via D6 vs DC
export const sodiumTier = (sodium) => {
  if (sodium >= 15) return { dc: 0,          vp: 4, autoFlex: true,  chant: true  }
  if (sodium >= 10) return { dc: 3,          vp: 3, autoFlex: false, chant: false }
  if (sodium >= 6)  return { dc: 4,          vp: 2, autoFlex: false, chant: false }
  if (sodium >= 3)  return { dc: 5,          vp: 1, autoFlex: false, chant: false }
  return { dc: 99, vp: 0, autoFlex: false, chant: false }   // can't flex
}

// Apply attack scaling: attack = floor(Protein / 2)
export const attackFromProtein = (protein) => Math.floor(protein / 2)

// HP formula: 5 + floor((Protein + Fat) / 2)
export const hpFromStats = (protein, fat) => 5 + Math.floor((protein + fat) / 2)

// Cap any stat at 20
export const STAT_CAP = 20
export const capStat = (v) => Math.min(STAT_CAP, Math.max(0, v))
export const capNutrition = (n) => ({
  protein:  capStat(n.protein),
  carbs:    capStat(n.carbs),
  fat:      capStat(n.fat),
  fiber:    capStat(n.fiber),
  sugar:    capStat(n.sugar),
  sodium:   capStat(n.sodium),
  calories: n.calories,    // calories don't cap
})

// Apply quality additive across all 6 stats (Phase 7 interaction)
export const QUALITY_ADD = { perfect: 2, good: 0, plain: -1, burnt: -3 }
export const applyQualityToNutrition = (n, quality) => {
  const add = QUALITY_ADD[quality] ?? 0
  return {
    protein: Math.max(0, n.protein + add),
    carbs:   Math.max(0, n.carbs   + add),
    fat:     Math.max(0, n.fat     + add),
    fiber:   Math.max(0, n.fiber   + add),
    sugar:   Math.max(0, n.sugar   + add),
    sodium:  Math.max(0, n.sodium  + add),
    calories: n.calories,
  }
}

// Sum nutrition across an array of ingredient nutrition objects
export const sumNutrition = (nutritionList) => {
  const out = { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, calories: 0 }
  for (const n of nutritionList) {
    if (!n) continue
    out.protein  += n.protein  ?? 0
    out.carbs    += n.carbs    ?? 0
    out.fat      += n.fat      ?? 0
    out.fiber    += n.fiber    ?? 0
    out.sugar    += n.sugar    ?? 0
    out.sodium   += n.sodium   ?? 0
    out.calories += n.calories ?? 0
  }
  return out
}

// Roll d6
export const rollD6 = () => 1 + Math.floor(Math.random() * 6)

// Compute Flex outcome from a wrestler's Sodium
export const tryFlex = (sodium) => {
  const tier = sodiumTier(sodium)
  if (tier.dc > 6) return { success: false, vp: 0, roll: 0, dc: tier.dc, chant: false }
  if (tier.autoFlex) return { success: true, vp: tier.vp, roll: 6, dc: 0, chant: tier.chant }
  const roll = rollD6()
  return {
    success: roll >= tier.dc,
    vp: roll >= tier.dc ? tier.vp : 0,
    roll,
    dc: tier.dc,
    chant: false,
  }
}
