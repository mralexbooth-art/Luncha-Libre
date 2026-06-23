// V4 — Undying Light. A candle on the altar refuses to go out. You take it.

import { useState } from 'react'
import Narrator from '../Narrator.jsx'
import { ARCANA_REVEAL } from '../../data/prelude-script.js'

export default function ArcanaRewardScene({ onContinue }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="scene scene--arcana">
      <div className="arcana-card">
        <div className="arcana-card__corner arcana-card__corner--tl" />
        <div className="arcana-card__corner arcana-card__corner--tr" />
        <div className="arcana-card__corner arcana-card__corner--bl" />
        <div className="arcana-card__corner arcana-card__corner--br" />
        <div className="arcana-card__icon" aria-hidden="true">🕯️</div>
        <div className="arcana-card__rarity">RARE ARCANA</div>
        <div className="arcana-card__name">Undying Light</div>
        <div className="arcana-card__desc">
          Start with 5 offerings. Blessings earned while active are doubled.
          Family blessings become available.
        </div>
        <div className="arcana-card__flavor">
          "She always lit one. Just in case someone wanted to come home."
        </div>
      </div>
      {!shown && (
        <Narrator
          lines={ARCANA_REVEAL.map(b => b.text)}
          onComplete={() => setShown(true)}
        />
      )}
      {shown && (
        <button type="button" className="scene__btn" onClick={onContinue}>
          Take the candle with you →
        </button>
      )}
    </div>
  )
}
