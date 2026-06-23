// Floating mute toggle. Lives in a fixed corner so it's visible across every
// scene + La Gira. Persists across reloads via the audio manager's
// localStorage flag.

import { useState } from 'react'
import { isMuted, toggleMuted } from '../game/audio.js'

export default function MuteToggle({ position = 'top-right' }) {
  const [muted, setMuted] = useState(isMuted())
  return (
    <button
      type="button"
      className={`mute-toggle mute-toggle--${position}`}
      onClick={() => setMuted(toggleMuted())}
      title={muted ? 'Unmute ambience + music' : 'Mute ambience + music'}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
