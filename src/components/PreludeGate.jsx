// Top-level gate. V4 is intro-only for now — the Inscryption-style La Gira
// run loop is dropped. When the player finishes the slice, we show a quiet
// "to be continued" card. The corner replay button wipes the flag for
// testing.

import { useState } from 'react'
import { isIntroCompleted, completeIntro, resetIntro } from '../game/run-persistence.js'
import Prelude from './Prelude.jsx'
import MuteToggle from './MuteToggle.jsx'

export default function PreludeGate() {
  const [done, setDone] = useState(() => isIntroCompleted())

  const handleComplete = (extras = {}) => {
    completeIntro(extras)
    setDone(true)
  }

  const handleReplay = () => {
    resetIntro()
    setDone(false)
  }

  return (
    <>
      {done
        ? <SliceEndCard onReplay={handleReplay} />
        : <Prelude onComplete={handleComplete} />}
      <MuteToggle position="top-right" />
      <button
        type="button"
        className="dev-replay"
        onClick={handleReplay}
        title="Dev: wipe intro flag and replay the prelude."
      >
        ↺ replay intro
      </button>
    </>
  )
}

// Minimal "to be continued" placeholder. The full SliceEndScene (with the
// next-quest teaser — new radio, distant figure) builds in a later layer.
function SliceEndCard({ onReplay }) {
  return (
    <div className="scene scene--end">
      <div className="scene__placeholder">
        <h2>The night continues, somewhere.</h2>
        <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
          The candle keeps burning. You drift off.
        </p>
        <button type="button" className="scene__btn" onClick={onReplay}>
          Wake up again
        </button>
      </div>
    </div>
  )
}
