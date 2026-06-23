// The food court. Light rain. Picnic tables. Sabia waits.
//
// Flow:
//   1. Brief narration (FOOD_COURT_NARRATION + SABIA_APPROACH_NARRATION)
//   2. Sabia speaks — SABIA_INTRO + "What do you have?"
//   3. Inventory opens in OFFERING mode
//   4. Sabia reacts (per offer kind)
//   5. SABIA_FAREWELL — she wanders off
//   6. Player can free-roam: click hotspots. Lighting the candle advances.

import { useState } from 'react'
import Narrator from '../Narrator.jsx'
import Dialogue from '../Dialogue.jsx'
import Inventory from '../Inventory.jsx'
import {
  FOOD_COURT_NARRATION, SABIA_APPROACH_NARRATION,
  SABIA_INTRO, SABIA_RESPONSES, SABIA_FAREWELL,
} from '../../data/prelude-script.js'

// Sub-phases of the food-court scene.
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

  return (
    <div className="scene scene--food-court">
      <div className="scene-rain" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <span key={i} className="scene-rain__drop" style={{ '--i': i, '--d': `${(i * 137) % 100}%` }} />
        ))}
      </div>
      <FoodCourtBackdrop step={step} onLightCandle={onLightCandle} candleLit={prelude.candleLit} />

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
              : 'Walk around. Look at things. Find the candle.'}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── The visible backdrop — picnic tables, marigolds, the altar ────

function FoodCourtBackdrop({ step, onLightCandle, candleLit }) {
  // Hotspots are only clickable in the EXPLORE step.
  const interactive = step === STEPS.EXPLORE
  return (
    <div className="food-court">
      <div className="food-court__bg" aria-hidden="true" />
      <div className="food-court__props">

        {/* Three decorative picnic tables across the back */}
        <div className="food-court__table food-court__table--1" aria-hidden="true">
          <span className="food-court__menu">📜</span>
          <span className="food-court__radio" title="A broken boombox.">📻</span>
        </div>
        <div className="food-court__table food-court__table--2" aria-hidden="true">
          <span className="food-court__marigold">🌼</span>
          <span className="food-court__marigold">🌼</span>
        </div>
        <div className="food-court__table food-court__table--3" aria-hidden="true">
          <span className="food-court__candle-jar">🕯</span>
        </div>

        {/* The altar — interactive in EXPLORE step. Lights the candle. */}
        <button
          type="button"
          className={`food-court__altar ${candleLit ? 'is-lit' : ''}`}
          disabled={!interactive}
          onClick={interactive ? onLightCandle : undefined}
          title={interactive ? (candleLit ? 'The candle is lit. Listen for the radio.' : 'Light the candle (uses a match).') : ''}
        >
          <div className="food-court__altar-marigolds" aria-hidden="true">🌼🌼🌼</div>
          <div className="food-court__altar-candle">{candleLit ? '🔥' : '🕯️'}</div>
          <div className="food-court__altar-radio" aria-hidden="true">📻</div>
          <div className="food-court__altar-label">The altar</div>
        </button>
      </div>
    </div>
  )
}
