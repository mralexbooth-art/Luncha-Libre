// The food court. Background art is the real painting (public/scenes/food-
// court.png). The candle in the painting is the click target — a hotspot
// positioned at the painted candle's location, invisible until hovered.

import { useState } from 'react'
import Narrator from '../Narrator.jsx'
import Dialogue from '../Dialogue.jsx'
import Inventory from '../Inventory.jsx'
import {
  FOOD_COURT_NARRATION, SABIA_APPROACH_NARRATION,
  SABIA_INTRO, SABIA_RESPONSES, SABIA_FAREWELL,
} from '../../data/prelude-script.js'

const STEPS = {
  NARR_INTRO:   'narr-intro',
  SABIA_INTRO:  'sabia-intro',
  PICK_OFFER:   'pick-offer',
  SABIA_REACT:  'sabia-react',
  SABIA_LEAVE:  'sabia-leave',
  EXPLORE:      'explore',
}

export default function FoodCourtScene({ prelude, onOffer, onLightCandle }) {
  const [step, setStep] = useState(STEPS.NARR_INTRO)
  const [pendingOffer, setPendingOffer] = useState(null)

  const sabiaResponseLines = pendingOffer ? SABIA_RESPONSES[pendingOffer] ?? [] : []
  const interactive = step === STEPS.EXPLORE && !prelude.candleLit

  return (
    <div className={`scene scene--food-court ${prelude.candleLit ? 'is-lit' : ''}`}>
      <div className="scene-rain" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <span key={i} className="scene-rain__drop" style={{ '--i': i, '--d': `${(i * 137) % 100}%` }} />
        ))}
      </div>

      {/* The candle in the painting is a clickable hotspot. Position is tuned
          to land on the painted candle. Becomes a soft pulsing aura on hover. */}
      <button
        type="button"
        className={`food-court__candle-btn ${interactive ? 'is-interactive' : ''} ${prelude.candleLit ? 'is-lit' : ''}`}
        onClick={interactive ? onLightCandle : undefined}
        disabled={!interactive}
        title={interactive ? 'Light the candle' : ''}
        aria-label="Light the candle"
      />

      {step === STEPS.NARR_INTRO && (
        <Narrator
          lines={[...FOOD_COURT_NARRATION, ...SABIA_APPROACH_NARRATION]}
          onComplete={() => setStep(STEPS.SABIA_INTRO)}
        />
      )}
      {step === STEPS.SABIA_INTRO && (
        <Dialogue lines={SABIA_INTRO} onComplete={() => setStep(STEPS.PICK_OFFER)} />
      )}
      {step === STEPS.PICK_OFFER && (
        <Inventory
          items={prelude.inventory}
          offering={true}
          onOffer={(id) => { setPendingOffer(id); onOffer(id); setStep(STEPS.SABIA_REACT) }}
          onLie={() => { setPendingOffer('lied'); onOffer('lied'); setStep(STEPS.SABIA_REACT) }}
          onSilent={() => { setPendingOffer('silent'); onOffer('silent'); setStep(STEPS.SABIA_REACT) }}
        />
      )}
      {step === STEPS.SABIA_REACT && (
        <Dialogue
          lines={sabiaResponseLines.length > 0 ? sabiaResponseLines : [{ speaker: 'Sabia', text: 'Hm.' }]}
          onComplete={() => setStep(STEPS.SABIA_LEAVE)}
        />
      )}
      {step === STEPS.SABIA_LEAVE && (
        <Dialogue
          lines={SABIA_FAREWELL}
          onComplete={() => setStep(STEPS.EXPLORE)}
        />
      )}

      {step === STEPS.EXPLORE && (
        <div className="food-court__hud">
          <Inventory items={prelude.inventory} offering={false} />
          <div className="food-court__hint">
            {prelude.candleLit
              ? 'The candle burns. Listen.'
              : 'Look around. Find the candle.'}
          </div>
        </div>
      )}
    </div>
  )
}
