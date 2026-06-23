// The altar radio crackles to life. Abuela whispers a recipe she can almost
// remember. The player accepts the quest by clicking through, then enters the
// kitchen.

import { useState } from 'react'
import Narrator from '../Narrator.jsx'
import Dialogue from '../Dialogue.jsx'
import Radio from '../Radio.jsx'
import { CANDLE_LIT_NARRATION, ABUELA_QUEST } from '../../data/prelude-script.js'

const STEPS = { NARR: 'narr', RADIO_INTRO: 'radio-intro', ABUELA: 'abuela', DECISION: 'decision' }

export default function CandleLitScene({ onAccept }) {
  // V4: onAccept('wander' | 'kitchen')
  const [step, setStep] = useState(STEPS.NARR)
  return (
    <div className="scene scene--candle-lit">
      {/* The painted candle in the background is now lit. A small radio
          widget floats over the altar to ground the dialogue source. */}
      <div className="candle-lit__radio-anchor" aria-hidden="true">
        <Radio clarity={2} placement="altar" />
      </div>

      {step === STEPS.NARR && (
        <Narrator lines={CANDLE_LIT_NARRATION} onComplete={() => setStep(STEPS.ABUELA)} />
      )}
      {step === STEPS.ABUELA && (
        <Dialogue lines={ABUELA_QUEST} onComplete={() => setStep(STEPS.DECISION)} />
      )}
      {step === STEPS.DECISION && (
        <div className="candle-altar__cta">
          <div className="candle-altar__quest-summary">
            <h3>The dish she's asking for:</h3>
            <ul>
              <li>Crunchy</li>
              <li>Sweet</li>
              <li>No vegetables</li>
              <li>Has rice (because someone insisted)</li>
              <li>Something pickled</li>
            </ul>
          </div>
          <div className="candle-altar__choices">
            <button
              type="button"
              className="scene__btn scene__btn--soft"
              onClick={() => onAccept('wander')}
              title="The food court has more to see. Look around first."
            >
              Look around first
            </button>
            <button
              type="button"
              className="scene__btn"
              onClick={() => onAccept('kitchen')}
              title="Go straight to the kitchen and cook her dish."
            >
              Step into the kitchen →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
