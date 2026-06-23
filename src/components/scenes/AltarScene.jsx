// V4 — Bring the cooked dish back to the altar. Abuela reacts. She gasps.
// She tells you whose dish it really was. She begs you to release him.

import { useState } from 'react'
import Narrator from '../Narrator.jsx'
import Dialogue from '../Dialogue.jsx'
import Radio from '../Radio.jsx'
import {
  ALTAR_NARRATION, ABUELA_RECOGNIZES, ABUELA_BEGS,
} from '../../data/prelude-script.js'

const STEPS = { NARR: 'narr', RECOGNIZE: 'recognize', BEG: 'beg', PROMPT: 'prompt' }

export default function AltarScene({ dish, onReveal }) {
  const [step, setStep] = useState(STEPS.NARR)

  return (
    <div className="scene scene--altar">
      <div className="candle-altar" aria-hidden="true">
        <div className="candle-altar__flame">🔥</div>
        <div className="candle-altar__candle">🕯️</div>
        <div className="candle-altar__marigolds">🌼🌼🌼🌼🌼</div>
        <Radio clarity={2} placement="altar" />
      </div>

      <div className="altar-dish">
        <div className="altar-dish__plate">
          <div className="altar-dish__icon">🍽</div>
          <div className="altar-dish__name">{dish?.name ?? 'Your dish'}</div>
          <div className="altar-dish__flavor">"{dish?.flavor ?? ''}"</div>
        </div>
      </div>

      {step === STEPS.NARR && (
        <Narrator lines={ALTAR_NARRATION} onComplete={() => setStep(STEPS.RECOGNIZE)} />
      )}
      {step === STEPS.RECOGNIZE && (
        <Dialogue lines={ABUELA_RECOGNIZES} onComplete={() => setStep(STEPS.BEG)} />
      )}
      {step === STEPS.BEG && (
        <Dialogue lines={ABUELA_BEGS} onComplete={() => setStep(STEPS.PROMPT)} />
      )}
      {step === STEPS.PROMPT && (
        <div className="altar-cta">
          <button type="button" className="scene__btn" onClick={onReveal}>
            …make a choice
          </button>
        </div>
      )}
    </div>
  )
}
