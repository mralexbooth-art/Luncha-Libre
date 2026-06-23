// V4 — Cozy DishMaker. A small home kitchen: a single cast iron pan, a hand
// of ingredients on the counter, a "Cook" button when enough's been added.
//
// Minigame logic: the player ADDS ingredients to the pan. Some match Abuela's
// clues (sweet, crunchy, rice, pickled, no vegetables); some don't. Adding
// vegetables shows a corrective quip. When the pan has at least 4 ingredients
// AND none of them are vegetables, "Cook" enables.
//
// Cooking synthesizes the hand-authored "El Dulce Campeón" dish and hands it
// off to the altar scene via onFinishCooking(dish).

import { useState, useRef } from 'react'
import Narrator from '../Narrator.jsx'
import Radio from '../Radio.jsx'
import {
  KITCHEN_INTRO, KITCHEN_INSTRUCTIONS, PLACEMENT_QUIPS,
} from '../../data/prelude-script.js'
import { EL_DULCE_CAMPEON } from '../../data/dishes.js'

// Hand-authored ingredient roster for the slice. Vegetables marked so we
// can scold the player for adding them.
const COUNTER_INGREDIENTS = [
  { id: 'rice',              name: 'Rice',              icon: '🍚', kind: 'starch'    },
  { id: 'potato-chips',      name: 'Potato chips',      icon: '🥔', kind: 'crunchy'   },
  { id: 'chicken-nuggets',   name: 'Chicken nuggets',   icon: '🍗', kind: 'crunchy'   },
  { id: 'marshmallow',       name: 'Marshmallow',       icon: '🍡', kind: 'sweet'     },
  { id: 'pickle',            name: 'Pickle',            icon: '🥒', kind: 'pickled'   },
  { id: 'hard-candy',        name: 'Hard candy',        icon: '🍬', kind: 'sweet'     },
  { id: 'cilantro',          name: 'Cilantro',          icon: '🌿', kind: 'vegetable' },
  { id: 'spinach',           name: 'Spinach',           icon: '🥬', kind: 'vegetable' },
]

const STEPS = { NARR_INTRO: 'narr-intro', PLAY: 'play', COOKING: 'cooking' }

export default function KitchenScene({ onFinishCooking }) {
  const [step, setStep] = useState(STEPS.NARR_INTRO)
  const [pan, setPan] = useState([])         // [{ id, name, icon, kind, instanceKey }]
  const [quip, setQuip] = useState(null)
  const [showInstr, setShowInstr] = useState(true)
  const keyCounter = useRef(0)

  const addToPan = (ing) => {
    keyCounter.current += 1
    const instanceKey = `${ing.id}-${keyCounter.current}`
    setPan(prev => [...prev, { ...ing, instanceKey }])
    if (PLACEMENT_QUIPS[ing.id]) setQuip({ text: PLACEMENT_QUIPS[ing.id], key: instanceKey })
  }
  const removeFromPan = (idx) => setPan(pan.filter((_, i) => i !== idx))

  const hasVegetable = pan.some(i => i.kind === 'vegetable')
  const ready = pan.length >= 4 && !hasVegetable

  const cook = () => {
    setStep(STEPS.COOKING)
    // Brief "cooking" beat then hand off to the altar.
    setTimeout(() => onFinishCooking(EL_DULCE_CAMPEON), 1800)
  }

  if (step === STEPS.NARR_INTRO) {
    return (
      <div className="scene scene--kitchen">
        <KitchenBackdrop pan={[]} radioClarity={1} />
        <Narrator lines={KITCHEN_INTRO} onComplete={() => setStep(STEPS.PLAY)} />
      </div>
    )
  }

  if (step === STEPS.COOKING) {
    return (
      <div className="scene scene--kitchen">
        <KitchenBackdrop pan={pan} cooking={true} radioClarity={2} />
        <div className="kitchen__cooking-msg">Cooking…</div>
      </div>
    )
  }

  // PLAY
  return (
    <div className="scene scene--kitchen">
      <KitchenBackdrop
        pan={pan}
        radioClarity={1}
        onPanItemClick={removeFromPan}
        quip={quip}
      />

      {showInstr && (
        <Narrator
          lines={KITCHEN_INSTRUCTIONS}
          onComplete={() => setShowInstr(false)}
        />
      )}

      {!showInstr && (
        <div className="kitchen__counter">
          <div className="kitchen__counter-title">On the counter:</div>
          <div className="kitchen__counter-items">
            {COUNTER_INGREDIENTS.map(ing => (
              <button
                key={ing.id}
                type="button"
                className={`kitchen__ing kitchen__ing--${ing.kind}`}
                onClick={() => addToPan(ing)}
                title={`Add ${ing.name} to the pan`}
              >
                <span className="kitchen__ing-icon">{ing.icon}</span>
                <span className="kitchen__ing-name">{ing.name}</span>
              </button>
            ))}
          </div>
          <div className="kitchen__cta">
            {hasVegetable && (
              <div className="kitchen__warn">She said NO vegetables. Take them out.</div>
            )}
            <button
              type="button"
              className="scene__btn"
              onClick={cook}
              disabled={!ready}
              title={ready ? 'Synthesize the dish.' : 'Add at least 4 ingredients (no vegetables).'}
            >
              {ready ? 'Cook 🔥' : `Add ingredients (${pan.length}/4 minimum)`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function KitchenBackdrop({ pan, cooking, radioClarity, onPanItemClick, quip }) {
  return (
    <div className={`kitchen ${cooking ? 'is-cooking' : ''}`}>
      <div className="kitchen__bg" aria-hidden="true" />
      <div className="kitchen__radio-shelf">
        <Radio clarity={radioClarity} placement="default" label="Kitchen radio" />
      </div>
      <div className="kitchen__pan">
        <div className="kitchen__pan-rim" aria-hidden="true" />
        <div className="kitchen__pan-contents">
          {pan.length === 0 && <span className="kitchen__pan-empty">(empty)</span>}
          {pan.map((it, i) => (
            <button
              key={it.instanceKey}
              type="button"
              className={`kitchen__pan-ing kitchen__pan-ing--${it.kind}`}
              onClick={onPanItemClick ? () => onPanItemClick(i) : undefined}
              disabled={!onPanItemClick}
              title={onPanItemClick ? `Take ${it.name} back out` : ''}
            >
              {it.icon}
            </button>
          ))}
        </div>
        {quip && (
          <div key={quip.key} className="kitchen__quip">{quip.text}</div>
        )}
      </div>
    </div>
  )
}
