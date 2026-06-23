// Pure functions for recipe matching and wrestler synthesis.
// Phase 8 integrates the nutritional stat system:
//   - synthesis now aggregates 6-stat nutrition across ingredients
//   - quality additive applies to all 6 stats (perfect +2, plain -1, burnt -3)
//   - attack derives from Protein, maxHP derives from Protein + Fat
//   - chop bonuses still apply post-derivation on attack/HP
//   - Phase 4 ingredient specials kept and layered with threshold-driven abilities
//   - recipe-intrinsic specials still gated by quality (perfect/good keep, plain/burnt drop)

import { ingredientById } from '../data/ingredients.js'
import { applianceById, BASE_COOK_TIME } from '../data/appliances.js'
import { recipeById } from '../data/recipes.js'
import { positionQualifies, synthesisStaticBumps } from './effects.js'
import {
  attackFromProtein,
  hpFromStats,
  applyQualityToNutrition,
  sumNutrition,
  capNutrition,
} from './thresholds.js'
import { wildDishName, wildDishFlavor, wildDishKey } from './wild-dish-names.js'

export const tagCounts = (ingredientIds) => {
  const counts = {}
  for (const id of ingredientIds) {
    const ing = ingredientById(id)
    if (!ing) continue
    for (const tag of ing.tags) {
      counts[tag] = (counts[tag] || 0) + 1
    }
  }
  return counts
}

const recipeSatisfied = (recipe, counts) =>
  recipe.requires.every(req => (counts[req.tag] || 0) >= req.count)

export const matchRecipe = (ingredientIds, readiedRecipeIds) => {
  const counts = tagCounts(ingredientIds)
  for (const rid of readiedRecipeIds) {
    const recipe = recipeById(rid)
    if (recipe && recipeSatisfied(recipe, counts)) return recipe
  }
  return null
}

const matchRecipeFamilyOverride = (readiedRecipeIds) => {
  for (const rid of readiedRecipeIds) {
    const recipe = recipeById(rid)
    if (recipe) return recipe
  }
  return null
}

export const initialCookTime = (applianceId, ingredientId) => {
  const appliance = applianceById(applianceId)
  const ing = ingredientById(ingredientId)
  const addsTime = !!ing?.cookTimeAdds
  const t = BASE_COOK_TIME
        + (appliance?.modifier?.cookTime ?? 0)
        + (addsTime ? (ing?.prepBonus?.cookTime ?? 0) : 0)
  return Math.max(1, t)
}

export const extendCookTime = (currentTimer, ingredientId) => {
  const ing = ingredientById(ingredientId)
  if (!ing?.cookTimeAdds) return currentTimer
  return currentTimer + (ing.prepBonus?.cookTime ?? 0)
}

export const previewMatch = (ingredientIds, readiedRecipeIds) =>
  matchRecipe(ingredientIds, readiedRecipeIds)

// ─── Quality computation (Phase 7) ─────────────────────────

export const computeQuality = (steps, burnt, recipe) => {
  if (burnt) return 'burnt'
  if (!recipe?.procedure || recipe.procedure.length === 0) return 'good'
  const adds = (steps ?? []).filter(s => s.type === 'add')
  if (adds.length === 0) return 'plain'

  let tagsMatch = true
  let exactMatch = true

  for (let i = 0; i < recipe.procedure.length; i++) {
    const procStep = recipe.procedure[i]
    const actual = adds[i]
    if (!actual) { tagsMatch = false; exactMatch = false; continue }
    const ing = ingredientById(actual.ingredientId)
    if (!ing || !ing.tags.includes(procStep.tag)) {
      tagsMatch = false
      exactMatch = false
      continue
    }
    if (actual.heat !== procStep.heat) {
      exactMatch = false
    }
  }

  if (exactMatch && tagsMatch) return 'perfect'
  if (tagsMatch) return 'good'
  return 'plain'
}

// Phase 8: quality affects nutrition (additive) AND gates the recipe-intrinsic
// special (plain/burnt drop it). It does NOT additionally halve derived stats —
// the nutrition additive is the only stat consequence of quality.
const applyQualitySpecialsGate = (syn, quality) => {
  if (quality === 'plain' || quality === 'burnt') {
    return { ...syn, specials: (syn.specials ?? []).filter(s => s.recipeIntrinsic !== true) }
  }
  return syn
}

// ─── Synthesis ─────────────────────────────────────────────

export const synthesizeWrestler = ({
  applianceId,
  ingredientIds,
  chops = [],
  readiedRecipeIds,
  pot = {},
  steps = [],
  burnt = false,
  forceQuality = null,
}) => {
  const appliance = applianceById(applianceId)
  const mod = appliance?.modifier ?? { statMultiplier: 1, attackMultiplier: 1 }

  const recipe = pot.familyRecipe
    ? matchRecipeFamilyOverride(readiedRecipeIds)
    : matchRecipe(ingredientIds, readiedRecipeIds)

  const quality = forceQuality ?? computeQuality(steps, burnt, recipe)

  // ─── Aggregate nutrition (Phase 8 core) ─────────────────
  let nutrition = sumNutrition(
    ingredientIds.map(id => ingredientById(id)?.nutrition),
  )

  // Per-ingredient nutrition modifiers from specials
  ingredientIds.forEach((id, idx) => {
    const ing = ingredientById(id)
    const sp = ing?.special
    if (!sp) return
    if (!positionQualifies(ing, ingredientIds, idx)) return
    if (sp.id === 'umami-substitute') nutrition.protein += 2  // Mushroom
    if (sp.id === 'egg-binder')       nutrition.sodium  += 1  // Egg firstIn
  })

  // Apply quality additive across all 6 stats
  nutrition = applyQualityToNutrition(nutrition, quality)

  // Cap at 20
  nutrition = capNutrition(nutrition)

  // Recompute calories from final stats (post-additive, post-cap)
  nutrition.calories = nutrition.protein + nutrition.carbs + (nutrition.fat * 2) + nutrition.fiber + nutrition.sugar

  // ─── Derive base attack + HP ─────────────────────────────
  let attack = attackFromProtein(nutrition.protein)
  let health = hpFromStats(nutrition.protein, nutrition.fat)

  // Chop bonuses are direct additive on derived stats
  for (const chop of chops) {
    if (!chop) continue
    attack += chop.attack ?? 0
    health += chop.health ?? 0
  }

  // Phase 4 static bumps (Garlic firstIn +1 ATK, Cheese +2 HP, Rice scaling HP)
  const staticBumps = synthesisStaticBumps(ingredientIds, positionQualifies)
  attack += staticBumps.addAttack
  health += staticBumps.addHealth

  // Pot flags
  if (pot.openFlame) attack += 2
  if (pot.spiceRack) attack += pot.spiceRack

  // Appliance modifier
  attack = Math.max(1, Math.round(attack * (mod.statMultiplier ?? 1) * (mod.attackMultiplier ?? 1)))
  health = Math.max(1, Math.round(health * (mod.statMultiplier ?? 1)))

  // ─── Compile specials list ─────────────────────────────
  const specials = []
  ingredientIds.forEach((id, idx) => {
    const ing = ingredientById(id)
    const sp = ing?.special
    if (!sp) return
    if (!positionQualifies(ing, ingredientIds, idx)) return
    const PURE_STAT_STATIC = new Set(['sticky-melt', 'filler', 'umami-substitute', 'egg-binder'])
    if (sp.trigger === 'static' && PURE_STAT_STATIC.has(sp.id)) return
    specials.push({ ...sp })
  })

  // ─── Build the wrestler ─────────────────────────────────
  if (recipe) {
    const p = recipe.produces
    if (p.special) specials.push({ ...p.special, recipeIntrinsic: true })
    const syn = {
      recipeId: recipe.id,
      displayName: recipe.name,
      archetype: p.archetype,
      attack,
      health,
      nutrition,
      crashAfter: pot.openFlame ? null : (p.crashAfter ?? null),
      crashAmount: p.crashAmount ?? null,
      regenEachTurn: p.regenEachTurn ?? null,
      hotEachTurn: p.hotEachTurn ?? null,
      wrestlersOnly: !!p.wrestlersOnly,
      flavor: p.flavor ?? '',
      wildDish: false,
      specials,
      crashImmune: !!pot.openFlame,
      springBuff: !!p.springBuff,
      quality,
    }
    return applyQualitySpecialsGate(syn, quality)
  }

  // Wild Dish fallback — deterministic creative name + flavor per combo.
  const syn = {
    recipeId: null,
    displayName: wildDishName(ingredientIds),
    wildKey: wildDishKey(ingredientIds),
    archetype: 'carb',
    attack,
    health,
    nutrition,
    crashAfter: null,
    crashAmount: null,
    regenEachTurn: null,
    hotEachTurn: null,
    wrestlersOnly: false,
    flavor: wildDishFlavor(ingredientIds),
    wildDish: true,
    specials,
    crashImmune: !!pot.openFlame,
    springBuff: false,
    quality: burnt ? 'burnt' : 'plain',
  }
  return applyQualitySpecialsGate(syn, syn.quality)
}
