// V4 — Slice end. Teaser for the next quest: a different radio crackles to
// life in the distance, a figure can be seen between the picnic tables, then
// the screen fades.

import { useState, useEffect } from 'react'
import Narrator from '../Narrator.jsx'

const NEW_RADIO_LINES = [
  'The candle in your hand stays lit.',
  'Somewhere across the food court, another radio coughs awake.',
  'A different voice. Younger. Faster.',
  '…"Lemon? Cilantro? Did anyone bring the cilantro?"',
  'A figure stands between the picnic tables. Mid-sentence.',
  'She hasn\'t noticed you yet.',
  'The night continues.',
]

export default function SliceEndScene({ onFinish }) {
  const [done, setDone] = useState(false)
  // After narration, auto-fade and complete after a beat.
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onFinish?.(), 1800)
    return () => clearTimeout(t)
  }, [done, onFinish])

  return (
    <div className={`scene scene--slice-end ${done ? 'is-fading' : ''}`}>
      <div className="slice-end-court" aria-hidden="true">
        <div className="slice-end__candle">🕯️</div>
        <div className="slice-end__figure">🚶</div>
        <div className="slice-end__radio">📻</div>
      </div>
      {!done && (
        <Narrator lines={NEW_RADIO_LINES} onComplete={() => setDone(true)} />
      )}
      {done && (
        <div className="slice-end__fadebody">
          <div className="slice-end__title">…to be continued.</div>
        </div>
      )}
    </div>
  )
}
