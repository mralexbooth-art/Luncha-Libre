// Phase 11 V4 — Prelude orchestrator. Routes through every scene of the
// opening slice. No La Gira fallback; the slice ENDS the experience for now.

import { useReducer } from 'react'
import {
  newPrelude, SCENES,
  advanceToFoodCourt, resolveSabiaOffer, lightCandle, acceptAbuelaQuest,
  revealHotspot, enterKitchen, finishCooking,
  revealHusband, makeFinalChoice, advanceToSliceEnd,
} from '../game/prelude-state.js'
import { useMusic } from './useMusic.js'
import AwakeScene from './scenes/AwakeScene.jsx'
import FoodCourtScene from './scenes/FoodCourtScene.jsx'
import CandleLitScene from './scenes/CandleLitScene.jsx'
import WanderingScene from './scenes/WanderingScene.jsx'
import KitchenScene from './scenes/KitchenScene.jsx'
import AltarScene from './scenes/AltarScene.jsx'
import ChoiceScene from './scenes/ChoiceScene.jsx'
import ArcanaRewardScene from './scenes/ArcanaRewardScene.jsx'
import SliceEndScene from './scenes/SliceEndScene.jsx'

function preludeReducer(prelude, action) {
  switch (action.type) {
    case 'ADVANCE_AWAKE':    return advanceToFoodCourt(prelude)
    case 'OFFER':            return resolveSabiaOffer(prelude, action.id)
    case 'LIGHT_CANDLE':     return lightCandle(prelude)
    case 'ACCEPT_QUEST':     return acceptAbuelaQuest(prelude, action.target)
    case 'REVEAL_HOTSPOT':   return revealHotspot(prelude, action.id)
    case 'ENTER_KITCHEN':    return enterKitchen(prelude)
    case 'FINISH_COOKING':   return finishCooking(prelude, action.dish)
    case 'REVEAL_HUSBAND':   return revealHusband(prelude)
    case 'MAKE_CHOICE':      return makeFinalChoice(prelude, action.choice)
    case 'ADVANCE_TO_END':   return advanceToSliceEnd(prelude)
    default: return prelude
  }
}

export default function Prelude({ onComplete }) {
  const [prelude, dispatch] = useReducer(preludeReducer, undefined, newPrelude)

  // Crossfade background music per scene.
  useMusic(prelude.scene, { volume: 0.28, fadeMs: 1800 })

  switch (prelude.scene) {
    case SCENES.AWAKE:
      return <AwakeScene onAdvance={() => dispatch({ type: 'ADVANCE_AWAKE' })} />

    case SCENES.FOOD_COURT:
      return (
        <FoodCourtScene
          prelude={prelude}
          onOffer={(id) => dispatch({ type: 'OFFER', id })}
          onLightCandle={() => dispatch({ type: 'LIGHT_CANDLE' })}
        />
      )

    case SCENES.CANDLE_LIT:
      return (
        <CandleLitScene
          onAccept={(target) => dispatch({ type: 'ACCEPT_QUEST', target })}
        />
      )

    case SCENES.WANDERING:
      return (
        <WanderingScene
          prelude={prelude}
          onReveal={(id) => dispatch({ type: 'REVEAL_HOTSPOT', id })}
          onEnterKitchen={() => dispatch({ type: 'ENTER_KITCHEN' })}
        />
      )

    case SCENES.KITCHEN:
      return (
        <KitchenScene
          prelude={prelude}
          onFinishCooking={(dish) => dispatch({ type: 'FINISH_COOKING', dish })}
        />
      )

    case SCENES.ALTAR:
      return (
        <AltarScene
          dish={prelude.dish}
          onReveal={() => dispatch({ type: 'REVEAL_HUSBAND' })}
        />
      )

    case SCENES.CHOICE:
      return (
        <ChoiceScene
          dish={prelude.dish}
          onChoose={(choice) => dispatch({ type: 'MAKE_CHOICE', choice })}
        />
      )

    case SCENES.ARCANA_REWARD:
      return (
        <ArcanaRewardScene
          onContinue={() => dispatch({ type: 'ADVANCE_TO_END' })}
        />
      )

    case SCENES.SLICE_END:
      return (
        <SliceEndScene
          onFinish={() => onComplete?.({
            arcana: ['arcana-undying-light'],
            husbandKept: prelude.finalChoice === 'keep',
          })}
        />
      )

    default:
      return null
  }
}
