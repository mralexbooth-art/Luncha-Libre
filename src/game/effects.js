// Phase 4 — effect dispatcher.
//
// Wrestlers carry `specials: [ { id, name, trigger, description, ... }, ... ]`.
// At each trigger point in state.js (onCook, onAttack, onTakeDamage,
// onTurnInRing, onCrash) we call applyTrigger() which finds all matching
// specials and runs their handlers.
//
// Static specials are not invoked here — combat code calls hasStatic()
// directly to query them.

import { ingredientById } from '../data/ingredients.js'
import { chefById } from '../data/chefs.js'

// ─── Helpers ─────────────────────────────────────────────────

export const hasStatic = (wrestler, specialId) =>
  !!wrestler?.specials?.some(s => s.id === specialId && s.trigger === 'static')

export const hasSpecial = (wrestler, specialId) =>
  !!wrestler?.specials?.some(s => s.id === specialId)

const otherSide = (side) => side === 'player' ? 'rival' : 'player'

const updateWrestler = (state, side, slotIndex, mutator) => {
  const ring = [...state[side].ring]
  if (!ring[slotIndex] || ring[slotIndex].roughTerrain) return state
  ring[slotIndex] = mutator(ring[slotIndex])
  return { ...state, [side]: { ...state[side], ring } }
}

const damageChef = (state, side, amount, log, who) => {
  if (amount <= 0) return state
  const target = state[side]
  const hp = Math.max(0, target.hp - amount)
  log.push(`${who} → ${target.name} takes ${amount} chip damage.`)
  return { ...state, [side]: { ...target, hp } }
}

const damageAtRingSlot = (state, side, slotIndex, amount, log, who) => {
  if (amount <= 0) return state
  const w = state[side].ring[slotIndex]
  if (!w || w.roughTerrain) return state
  return updateWrestler(state, side, slotIndex, ww => {
    const hp = Math.max(0, ww.hp - amount)
    log.push(`${who} → ${ww.displayName} (${side === 'player' ? 'you' : state.rival.name} slot ${slotIndex + 1}) takes ${amount}.`)
    return { ...ww, hp }
  })
}

// ─── Synthesis-time static helpers (read by recipe.js) ─────

// Did this ingredient's special qualify based on its position in the pot?
export const positionQualifies = (ingredient, ingredients, indexInPot) => {
  const sp = ingredient.special
  if (!sp) return false
  if (sp.position === 'always') return true

  if (sp.position === 'firstIn') {
    // Qualifies only if no protein was added BEFORE this ingredient.
    for (let i = 0; i < indexInPot; i++) {
      const earlier = ingredientById(ingredients[i])
      if (earlier?.tags.includes('protein')) return false
    }
    return true
  }

  if (sp.position === 'lastIn') {
    return indexInPot === ingredients.length - 1
  }

  return false
}

// Static stat modifications computed at synthesis. Returns { addAttack, addHealth }.
// These come from ingredient specials whose effect is purely a stat bump
// (Garlic, Cheese, Rice). Other static specials (acid-pierce, heavy-wrap,
// browning-catalyst) just get attached as flags / behaviors.
export const synthesisStaticBumps = (ingredients, qualifyingFn) => {
  let addAttack = 0
  let addHealth = 0
  let browning = false

  // First pass: detect browning so it can double firstIn bonuses in pass 2.
  ingredients.forEach((id, idx) => {
    const ing = ingredientById(id)
    const sp = ing?.special
    if (sp?.id === 'browning-catalyst' && qualifyingFn(ing, ingredients, idx)) {
      browning = true
    }
  })

  ingredients.forEach((id, idx) => {
    const ing = ingredientById(id)
    const sp = ing?.special
    if (!sp || sp.trigger !== 'static') return
    if (!qualifyingFn(ing, ingredients, idx)) return

    const mult = (sp.position === 'firstIn' && browning && sp.id !== 'browning-catalyst') ? 2 : 1

    if (sp.id === 'aromatic-infusion') addAttack += 1 * mult
    if (sp.id === 'sticky-melt')       addHealth += 2 * mult
    if (sp.id === 'filler')            addHealth += (ingredients.length - 1) * mult
  })

  return { addAttack, addHealth }
}

// ─── onCook handlers ────────────────────────────────────────

const onCookHandlers = {
  'tear-gas': (state, side, _slot, _ctx, log) => {
    log.push(`Tear Gas → ${state[otherSide(side)].name} chef stings.`)
    return damageChef(state, otherSide(side), 1, log, 'Tear Gas')
  },

  'polarizing': (state, side, slot, _ctx, log) => {
    const win = Math.random() < 0.5
    return updateWrestler(state, side, slot, w => {
      if (win) {
        log.push(`Polarizing → ${w.displayName} +3 ATK (the crowd is into it).`)
        return { ...w, attack: w.attack + 3 }
      }
      log.push(`Polarizing → ${w.displayName} -1 ATK (someone tastes soap).`)
      return { ...w, attack: Math.max(1, w.attack - 1) }
    })
  },

  'spicy-spit': (state, side, _slot, _ctx, log) => {
    const enemy = otherSide(side)
    let s = state
    s[enemy].ring.forEach((w, i) => {
      if (w && !w.roughTerrain && w.hp > 0) {
        s = damageAtRingSlot(s, enemy, i, 1, log, 'Spicy Spit')
      }
    })
    return s
  },
}

// ─── onAttack handlers ──────────────────────────────────────

const onAttackHandlers = {
  'lingering-burn': (state, side, slot, ctx, log) => {
    if (ctx.targetSide == null || ctx.targetSlot == null) return state
    return updateWrestler(state, ctx.targetSide, ctx.targetSlot, w => {
      log.push(`Lingering Burn → ${w.displayName} smolders (+1 damage next turn).`)
      return { ...w, burnPending: (w.burnPending ?? 0) + 1 }
    })
  },

  'whirlwind': (state, side, slot, ctx, log) => {
    if (ctx.targetSide == null) return state
    const adjacent = slot + 1 < state[ctx.targetSide].ring.length ? slot + 1 : slot - 1
    if (adjacent < 0) return state
    return damageAtRingSlot(state, ctx.targetSide, adjacent, 1, log, 'Whirlwind')
  },
}

// ─── onTakeDamage handlers — MUTATE ctx.damage in place ─────

const onTakeDamageHandlers = {
  'shell': (state, _side, _slot, ctx) => {
    if (ctx.attackerArchetype !== 'protein') {
      ctx.damage = Math.max(0, Math.floor(ctx.damage / 2))
    }
    return state
  },

  'slippery': (state, side, slot, ctx, log) => {
    return updateWrestler(state, side, slot, w => {
      if (w.slipperyAvailable === false) return w
      ctx.damage = Math.max(0, ctx.damage - 2)
      log.push(`Slippery → ${w.displayName} dodges 2 damage.`)
      return { ...w, slipperyAvailable: false }
    })
  },

  'cured': (state, side, slot, ctx, log) => {
    const w = state[side].ring[slot]
    if (!w || w.curedAvailable === false) return state
    if (ctx.damage < w.hp) return state
    ctx.damage = Math.max(0, w.hp - 1)
    log.push(`Cured → ${w.displayName} survives at 1 HP.`)
    return updateWrestler(state, side, slot, ww => ({ ...ww, curedAvailable: false }))
  },
}

// ─── onTurnInRing handlers ──────────────────────────────────

const onTurnInRingHandlers = {
  'caramelize': (state, side, slot, _ctx, log) => {
    return updateWrestler(state, side, slot, w => {
      const stacks = (w.caramelizeStacks ?? 0)
      if (stacks >= 3) return w
      log.push(`Caramelize → ${w.displayName} +1 ATK (stack ${stacks + 1}/3).`)
      return { ...w, attack: w.attack + 1, caramelizeStacks: stacks + 1 }
    })
  },

  'stew-base': (state, side, slot, _ctx, log) => {
    const ring = state[side].ring
    const candidates = ring
      .map((w, i) => ({ w, i }))
      .filter(({ w, i }) => i !== slot && w && !w.roughTerrain && w.hp < w.maxHp)
    if (candidates.length === 0) return state
    const target = candidates[0]
    return updateWrestler(state, side, target.i, w => {
      log.push(`Stew Base → ${w.displayName} regens 1 HP.`)
      return { ...w, hp: Math.min(w.maxHp, w.hp + 1) }
    })
  },

  'berserk': (state, side, slot, _ctx, log) => {
    return updateWrestler(state, side, slot, w => {
      const below = w.hp <= Math.floor(w.maxHp / 2)
      const already = !!w.berserkActive
      if (below && !already) {
        log.push(`Berserk → ${w.displayName} +1 ATK (under half HP).`)
        return { ...w, attack: w.attack + 1, berserkActive: true }
      }
      if (!below && already) {
        log.push(`Berserk subsides on ${w.displayName} (back above half HP).`)
        return { ...w, attack: Math.max(1, w.attack - 1), berserkActive: false }
      }
      return w
    })
  },

  'heavy-wrap': (state, side, slot, _ctx, log) => {
    let s = state
    for (const i of [slot - 1, slot + 1]) {
      if (i < 0 || i >= s[side].ring.length) continue
      const w = s[side].ring[i]
      if (!w || w.roughTerrain) continue
      if (w.hp >= w.maxHp) continue
      s = updateWrestler(s, side, i, ww => {
        log.push(`Heavy Wrap → ${ww.displayName} (adjacent) regens 1.`)
        return { ...ww, hp: Math.min(ww.maxHp, ww.hp + 1) }
      })
    }
    return s
  },

  // Garlic aura — heals OTHER ring wrestlers on the same side by 1 HP / turn.
  'aromatic-infusion': (state, side, slot, _ctx, log) => {
    let s = state
    s[side].ring.forEach((w, i) => {
      if (i === slot) return
      if (!w || w.roughTerrain) return
      if (w.hp >= w.maxHp) return
      s = updateWrestler(s, side, i, ww => {
        log.push(`Aromatic Infusion → ${ww.displayName} regens 1.`)
        return { ...ww, hp: Math.min(ww.maxHp, ww.hp + 1) }
      })
    })
    return s
  },
}

// ─── onCrash handlers ──────────────────────────────────────

const onCrashHandlers = {
  'sugar-rush': (state, side, slot, _ctx, log) => {
    return updateWrestler(state, side, slot, w => {
      log.push(`Sugar Rush → ${w.displayName} +2 ATK on crash turn.`)
      return { ...w, attack: w.attack + 2 }
    })
  },
}

// ─── Dispatcher ─────────────────────────────────────────────

const TRIGGER_TABLES = {
  onCook:        onCookHandlers,
  onAttack:      onAttackHandlers,
  onTakeDamage:  onTakeDamageHandlers,
  onTurnInRing:  onTurnInRingHandlers,
  onCrash:       onCrashHandlers,
}

export const applyTrigger = (state, side, slotIndex, trigger, context, log) => {
  const wrestler = state[side]?.ring?.[slotIndex]
  if (!wrestler || wrestler.roughTerrain) return state
  const handlers = TRIGGER_TABLES[trigger] ?? {}
  let s = state
  for (const sp of wrestler.specials ?? []) {
    if (sp.trigger !== trigger) continue
    const handler = handlers[sp.id]
    if (!handler) continue
    s = handler(s, side, slotIndex, context ?? {}, log) ?? s
  }
  return s
}

// ─── Action card effects ────────────────────────────────────

import { recipeById as _recipeById } from '../data/recipes.js'

export const ACTION_HANDLERS = {
  // Phase 9 energy gain — Caffeine Pill: 0⚡ cost, refunds +2⚡ to side.
  'caffeine-pill': (state, side, _target, log) => {
    const refund = 2
    log.push(`Caffeine Pill → ${state[side].name} gains +${refund}⚡.`)
    return { ...state, [side]: { ...state[side], energy: state[side].energy + refund } }
  },

  'mise-en-place': (state, side, _target, log) => {
    const playerLike = state[side]
    if (playerLike.deck.length === 0) {
      log.push(`Mise en Place → ${playerLike.name} draws nothing (deck empty).`)
      return state
    }
    const deck = [...playerLike.deck]
    const drawn = deck.shift()
    log.push(`Mise en Place → ${playerLike.name} draws an extra ingredient.`)
    return { ...state, [side]: { ...playerLike, deck, hand: [...playerLike.hand, drawn] } }
  },

  'pressure-cooker': (state, side, target, log) => {
    const slotIndex = target?.applianceSlot
    if (slotIndex == null) return state
    const sideObj = state[side]
    const appliances = sideObj.appliances.map((a, i) => {
      if (i !== slotIndex || !a.cooking) return a
      const newTimer = Math.max(0, a.cooking.cookTurnsLeft - 2)
      return { ...a, cooking: { ...a.cooking, cookTurnsLeft: newTimer } }
    })
    log.push(`Pressure Cooker → ${sideObj.name} fast-forwards appliance ${slotIndex + 1}.`)
    return { ...state, [side]: { ...sideObj, appliances } }
  },

  'open-flame': (state, side, target, log) => {
    const slotIndex = target?.applianceSlot
    if (slotIndex == null) return state
    const sideObj = state[side]
    const appliances = sideObj.appliances.map((a, i) => {
      if (i !== slotIndex || !a.cooking) return a
      return {
        ...a,
        cooking: {
          ...a.cooking,
          cookTurnsLeft: a.cooking.cookTurnsLeft + 1,
          openFlame: true,
        },
      }
    })
    log.push(`Open Flame → ${sideObj.name} stokes the fire.`)
    return { ...state, [side]: { ...sideObj, appliances } }
  },

  'guest-chef': (state, side, _target, log) => {
    const sideObj = state[side]
    const unowned = ['recipe-pan-dulce-punch', 'recipe-burrito-bouncer', 'recipe-churro-chainsaw',
                     'recipe-tamale-tornado', 'recipe-empanada-enforcer', 'recipe-habanero-haymaker']
      .filter(id => !sideObj.cookbook.readiedRecipes.includes(id))
    if (unowned.length === 0) {
      log.push(`Guest Chef → ${sideObj.name} already has every recipe readied.`)
      return state
    }
    const pick = unowned[Math.floor(Math.random() * unowned.length)]
    log.push(`Guest Chef → ${sideObj.name} readies ${_recipeById(pick).name}.`)
    return {
      ...state,
      [side]: {
        ...sideObj,
        cookbook: {
          ...sideObj.cookbook,
          readiedRecipes: [...sideObj.cookbook.readiedRecipes, pick],
        },
      },
    }
  },

  'salt-bae': (state, side, target, log) => {
    const slotIndex = target?.applianceSlot
    if (slotIndex == null) return state
    const sideObj = state[side]
    const appliances = sideObj.appliances.map((a, i) => {
      if (i !== slotIndex || !a.cooking) return a
      return {
        ...a,
        cooking: {
          ...a.cooking,
          ingredients: [...a.cooking.ingredients, 'salt'],
          saltBae: true,
        },
      }
    })
    log.push(`Salt Bae → ${sideObj.name} drops salt last into pot ${slotIndex + 1}.`)
    return { ...state, [side]: { ...sideObj, appliances } }
  },

  'kitchen-fire': (state, side, _target, log) => {
    let s = state
    const enemy = otherSide(side)
    s[enemy].ring.forEach((w, i) => {
      if (w && !w.roughTerrain && w.hp > 0) {
        s = damageAtRingSlot(s, enemy, i, 3, log, 'Kitchen Fire!')
      }
    })
    // Also lights player's own appliances on fire — they stall until maintained.
    const sideObj = s[side]
    const appliances = sideObj.appliances.map(a => {
      if (!a.cooking) return { ...a, onFire: true }   // empty appliance still catches
      return { ...a, onFire: true, cooking: { ...a.cooking, cookTurnsLeft: a.cooking.cookTurnsLeft + 1 } }
    })
    log.push(`Kitchen Fire! → ${sideObj.name}'s appliances catch fire (maintain to clear).`)
    return { ...s, [side]: { ...sideObj, appliances } }
  },

  'knife-sharpener': (state, side, _target, log) => {
    if (side !== 'player') return state    // only player has a knife widget
    const knife = state.knife ?? { sharpenCounter: 0, bleeding: false }
    if (knife.sharpenCounter >= 3) {
      log.push(`Knife Sharpener → knife already at max (3).`)
      return state
    }
    const newCount = knife.sharpenCounter + 1
    log.push(`Knife Sharpener → knife sharpened (${newCount}/3).`)
    return { ...state, knife: { ...knife, sharpenCounter: newCount } }
  },

  'med-kit': (state, side, _target, log) => {
    const sideObj = state[side]
    const healed = Math.min(5, sideObj.maxHp - sideObj.hp)
    let next = { ...state, [side]: { ...sideObj, hp: sideObj.hp + healed } }
    if (side === 'player' && state.knife?.bleeding) {
      next = { ...next, knife: { ...next.knife, bleeding: false } }
      log.push(`Med Kit → ${sideObj.name} heals +${healed} and stops bleeding.`)
    } else {
      log.push(`Med Kit → ${sideObj.name} heals +${healed}.`)
    }
    return next
  },

  'auto-dicer': (state, side, target, log) => {
    if (side !== 'player') return state
    const boardSlot = target?.boardSlot
    if (boardSlot == null) return state
    const board = [...state.player.cuttingBoard]
    if (board[boardSlot] != null) {
      log.push(`Auto Dicer → board slot ${boardSlot + 1} is occupied.`)
      return state
    }
    board[boardSlot] = { isDicer: true, life: 2 }
    log.push(`Auto Dicer → installed on board slot ${boardSlot + 1} (life 2).`)
    return { ...state, player: { ...state.player, cuttingBoard: board } }
  },

  'taste-test': (state, side, _target, log) => {
    const enemy = state[otherSide(side)]
    log.push(`Taste Test → ${enemy.name}'s hand: ${enemy.hand.length ? enemy.hand.join(', ') : '(empty)'}`)
    return state
  },

  'snack-break': (state, side, _target, log) => {
    const sideObj = state[side]
    const hand = [...sideObj.hand]
    if (hand.length > 0) {
      const idx = Math.floor(Math.random() * hand.length)
      const lost = hand.splice(idx, 1)[0]
      log.push(`Snack Break → ${sideObj.name} heals 3, loses ${lost} from hand.`)
    } else {
      log.push(`Snack Break → ${sideObj.name} heals 3.`)
    }
    return { ...state, [side]: { ...sideObj, hp: Math.min(sideObj.maxHp, sideObj.hp + 3), hand } }
  },

  'family-recipe': (state, side, target, log) => {
    const slotIndex = target?.applianceSlot
    if (slotIndex == null) return state
    const sideObj = state[side]
    const appliances = sideObj.appliances.map((a, i) => {
      if (i !== slotIndex || !a.cooking) return a
      return { ...a, cooking: { ...a.cooking, familyRecipe: true } }
    })
    log.push(`Family Recipe → ${sideObj.name} blesses pot ${slotIndex + 1}.`)
    return { ...state, [side]: { ...sideObj, appliances } }
  },

  'spice-rack': (state, side, _target, log) => {
    const sideObj = state[side]
    const appliances = sideObj.appliances.map(a => {
      if (!a.cooking) return a
      return { ...a, cooking: { ...a.cooking, spiceRack: (a.cooking.spiceRack ?? 0) + 1 } }
    })
    log.push(`Spice Rack → all of ${sideObj.name}'s cooking pots gain +1 ATK on finish.`)
    return { ...state, [side]: { ...sideObj, appliances } }
  },

  'bonus-tip': (state, side, _target, log) => {
    const sideObj = state[side]
    const deck = [...sideObj.deck]
    const hand = [...sideObj.hand]
    let drew = 0
    for (let i = 0; i < 2 && deck.length > 0; i++) {
      hand.push(deck.shift())
      drew++
    }
    log.push(`Bonus Tip → ${sideObj.name} draws ${drew} ingredient(s).`)
    return { ...state, [side]: { ...sideObj, deck, hand } }
  },

  'crowd-pleaser': (state, side, _target, log) => {
    const sideObj = state[side]
    const wrestlerCount = sideObj.ring.filter(w => w && !w.roughTerrain && w.hp > 0).length
    if (wrestlerCount >= 3) {
      log.push(`Crowd Pleaser → ${state[otherSide(side)].name} chef takes 2!`)
      return damageChef(state, otherSide(side), 2, log, 'Crowd Pleaser')
    }
    log.push(`Crowd Pleaser → ${sideObj.name} doesn't have a full ring (${wrestlerCount}/3). Crowd boos.`)
    return state
  },

  'composter': (state, side, _target, log) => {
    const sideObj = state[side]
    const hand = []
    let removed = 0
    for (const id of sideObj.hand) {
      const ing = ingredientById(id)
      if (ing && !ing.quickEat) { removed++; continue }
      hand.push(id)
    }
    const foodWaste = Math.max(0, sideObj.foodWaste - removed)
    log.push(`Composter → ${sideObj.name} feeds ${removed} card(s) to the worms (–${removed} waste).`)
    return { ...state, [side]: { ...sideObj, hand, foodWaste } }
  },

  'sous-chef': (state, side, _target, log) => {
    const sideObj = state[side]
    log.push(`Sous Chef → ${sideObj.name} refunds 1 energy, +2 max this turn.`)
    return {
      ...state,
      [side]: {
        ...sideObj,
        energy: sideObj.energy + 1 + 2,
        maxEnergy: sideObj.maxEnergy + 2,
        sousChefActive: true,
      },
    }
  },

  'pantry-raid': (state, side, _target, log) => {
    const sideObj = state[side]
    const deck = [...sideObj.deck]
    const candidateIdxs = deck
      .map((id, i) => ({ id, i, ing: ingredientById(id) }))
      .filter(({ ing }) => ing && !ing.quickEat)
      .map(({ i }) => i)
    if (candidateIdxs.length === 0) {
      log.push(`Pantry Raid → ${sideObj.name}'s pantry is empty of cookables.`)
      return state
    }
    const pick = candidateIdxs[Math.floor(Math.random() * candidateIdxs.length)]
    const pulled = deck[pick]
    deck.splice(pick, 1)
    log.push(`Pantry Raid → ${sideObj.name} pulls ${pulled}.`)
    return { ...state, [side]: { ...sideObj, deck, hand: [...sideObj.hand, pulled] } }
  },

  // ─── Phase 8: Force-Feed (sabotage) ─────────────────────
  // Player picks an enemy ring wrestler — that dish is fed to the enemy chef.
  // Their tracker fills with its nutrition, fullness rises by its calories,
  // and any allergy tag match causes extra chip damage to the enemy chef.
  'force-feed': (state, side, target, log) => {
    const enemySide = side === 'player' ? 'rival' : 'player'
    const slot = target?.slot
    if (slot == null) return state
    const enemy = state[enemySide]
    const w = enemy.ring[slot]
    if (!w || w.roughTerrain || w.hp <= 0) return state

    const nutrition = w.nutrition ?? {}
    const cal = nutrition.calories ?? 0

    // Remove dish from enemy ring
    const ring = [...enemy.ring]
    ring[slot] = null

    // Update enemy tracker + fullness
    const newTracker = {
      protein: enemy.tracker.protein + (nutrition.protein ?? 0),
      carbs:   enemy.tracker.carbs   + (nutrition.carbs   ?? 0),
      fat:     enemy.tracker.fat     + (nutrition.fat     ?? 0),
      fiber:   enemy.tracker.fiber   + (nutrition.fiber   ?? 0),
      sugar:   enemy.tracker.sugar   + (nutrition.sugar   ?? 0),
      sodium:  enemy.tracker.sodium  + (nutrition.sodium  ?? 0),
      totalNutrition: enemy.tracker.totalNutrition
        + (nutrition.protein ?? 0) + (nutrition.carbs ?? 0)
        + (nutrition.fat ?? 0) + (nutrition.fiber ?? 0)
        + (nutrition.sugar ?? 0) + (nutrition.sodium ?? 0),
    }

    const newFullness = enemy.fullness + cal
    const newSide = {
      ...enemy,
      ring,
      tracker: newTracker,
      fullness: newFullness,
    }

    let chipDmg = 0
    const enemyChef = chefById(enemy.chefId)
    if (enemyChef) {
      // Allergy by Sugar/Sodium threshold (e.g. Top Chef sensitive to >10 either)
      if (enemyChef.allergySugarThreshold && nutrition.sugar >= enemyChef.allergySugarThreshold) chipDmg += 3
      if (enemyChef.allergySodiumThreshold && nutrition.sodium >= enemyChef.allergySodiumThreshold) chipDmg += 3
    }
    let resultState = { ...state, [enemySide]: newSide }

    if (chipDmg > 0) {
      const mult = enemyChef.allergyDamageMult ?? 1
      const finalDmg = chipDmg * mult
      resultState = { ...resultState, [enemySide]: { ...newSide, hp: Math.max(0, newSide.hp - finalDmg) } }
      log.push(`Force Feed → ${newSide.name} takes ${finalDmg} allergy chip damage from ${w.displayName}.`)
    }
    log.push(`Force Feed → ${newSide.name} is force-fed ${w.displayName} (${cal} cal, +tracker).`)

    // Bloated check
    if (newFullness > (enemyChef?.appetite ?? 80)) {
      resultState = { ...resultState, [enemySide]: { ...resultState[enemySide], bloated: true } }
      log.push(`Force Feed → ${newSide.name} is BLOATED (Fullness ${newFullness} > Appetite ${enemyChef.appetite}).`)
    }

    return resultState
  },
}
