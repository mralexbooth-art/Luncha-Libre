// The opening beat. Black screen. Rain falls. Distant wrestling-announcer
// voice (sound-system reserved). Narration fades in line by line. Click
// through to advance to the food court.

import Narrator from '../Narrator.jsx'
import { AWAKE_NARRATION } from '../../data/prelude-script.js'

export default function AwakeScene({ onAdvance }) {
  return (
    <div className="scene scene--awake">
      <div className="scene-rain" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className="scene-rain__drop" style={{ '--i': i, '--d': `${(i * 137) % 100}%` }} />
        ))}
      </div>
      <div className="scene-static" aria-hidden="true" />
      <Narrator lines={AWAKE_NARRATION} onComplete={onAdvance} />
    </div>
  )
}
