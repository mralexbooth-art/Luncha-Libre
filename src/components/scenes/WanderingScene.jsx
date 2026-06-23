// V4 — Wandering mode. The food court "slowly comes to life" as the player
// clicks hotspots. Each reveal animates the spot and shows a small narration
// line. Player can leave whenever; revealing more spots adds atmosphere only,
// no gameplay gate.

import { useState } from 'react'
import Narrator from '../Narrator.jsx'
import Radio from '../Radio.jsx'
import { WANDER_HOTSPOTS } from '../../game/prelude-state.js'
import { WANDER_INTRO, HOTSPOT_NARRATION } from '../../data/prelude-script.js'

export default function WanderingScene({ prelude, onReveal, onEnterKitchen }) {
  const [intro, setIntro] = useState(true)
  const [activeNarration, setActiveNarration] = useState(null) // hotspot id currently narrating
  const wandered = prelude.wandered ?? {}
  const revealedCount = Object.keys(wandered).filter(k => wandered[k]).length

  if (intro) {
    return (
      <div className="scene scene--wandering">
        <Backdrop wandered={wandered} radios={prelude.radios} />
        <Narrator lines={WANDER_INTRO} onComplete={() => setIntro(false)} />
      </div>
    )
  }

  if (activeNarration) {
    const lines = HOTSPOT_NARRATION[activeNarration] ?? []
    return (
      <div className="scene scene--wandering">
        <Backdrop wandered={wandered} radios={prelude.radios} highlight={activeNarration} />
        <Narrator lines={lines} onComplete={() => setActiveNarration(null)} />
      </div>
    )
  }

  const handleClick = (hotspotId) => {
    if (!wandered[hotspotId]) onReveal(hotspotId)
    setActiveNarration(hotspotId)
  }

  return (
    <div className="scene scene--wandering">
      <Backdrop
        wandered={wandered}
        radios={prelude.radios}
        onClick={handleClick}
      />
      <div className="wander-hud">
        <div className="wander-hud__progress">
          {revealedCount} / {WANDER_HOTSPOTS.length} discovered
        </div>
        <button
          type="button"
          className="scene__btn"
          onClick={onEnterKitchen}
          title="Walk over to the kitchen. She's still waiting."
        >
          Step into the kitchen →
        </button>
        {revealedCount === 0 && (
          <div className="wander-hud__hint">Click the things around you. Take your time.</div>
        )}
        {revealedCount === WANDER_HOTSPOTS.length && (
          <div className="wander-hud__hint">You've seen everything you wanted to.</div>
        )}
      </div>
    </div>
  )
}

// ─── The food court backdrop with five interactive hotspots ────

function Backdrop({ wandered, radios, onClick, highlight }) {
  const isOn = (id) => !!wandered[id]
  const ill = (id) => highlight === id ? ' is-highlighted' : ''
  return (
    <div className={`wander-court ${Object.keys(wandered).length > 0 ? 'is-alive' : ''}`}>
      <div className="wander-court__bg" aria-hidden="true" />

      {/* Old menu — top-left */}
      <button
        type="button"
        className={`wander-spot wander-spot--menu${isOn('old-menu') ? ' is-revealed' : ''}${ill('old-menu')}`}
        onClick={onClick ? () => onClick('old-menu') : undefined}
        disabled={!onClick}
        title="A faded menu, taped to a beam."
      >
        <span className="wander-spot__icon">📜</span>
        <span className="wander-spot__label">Old menu</span>
      </button>

      {/* Broken boombox — top-right on a picnic table */}
      <div className="wander-spot-cluster wander-spot-cluster--top-right">
        <button
          type="button"
          className={`wander-spot wander-spot--boombox${isOn('boombox') ? ' is-revealed' : ''}${ill('boombox')}`}
          onClick={onClick ? () => onClick('boombox') : undefined}
          disabled={!onClick}
          title="A boombox sits on a picnic table."
        >
          <span className="wander-spot__icon">📻</span>
          <span className="wander-spot__label">Broken boombox</span>
        </button>
        {isOn('boombox') && <Radio clarity={radios['radio-boombox'] ?? 0} placement="default" />}
      </div>

      {/* Stray cat — mid-left under a bench */}
      <button
        type="button"
        className={`wander-spot wander-spot--cat${isOn('stray-cat') ? ' is-revealed' : ''}${ill('stray-cat')}`}
        onClick={onClick ? () => onClick('stray-cat') : undefined}
        disabled={!onClick}
        title="Something moves under a bench."
      >
        <span className="wander-spot__icon">{isOn('stray-cat') ? '🐈' : '👁'}</span>
        <span className="wander-spot__label">{isOn('stray-cat') ? 'An old cat' : 'Something moves'}</span>
      </button>

      {/* Second candle — mid-right on a table */}
      <button
        type="button"
        className={`wander-spot wander-spot--candle${isOn('candle-jar') ? ' is-revealed' : ''}${ill('candle-jar')}`}
        onClick={onClick ? () => onClick('candle-jar') : undefined}
        disabled={!onClick}
        title="An unlit candle, in a glass jar."
      >
        <span className="wander-spot__icon">🕯</span>
        <span className="wander-spot__label">A second candle</span>
      </button>

      {/* Wrestler poster — bottom-center on a tree */}
      <button
        type="button"
        className={`wander-spot wander-spot--poster${isOn('wrestler-poster') ? ' is-revealed' : ''}${ill('wrestler-poster')}`}
        onClick={onClick ? () => onClick('wrestler-poster') : undefined}
        disabled={!onClick}
        title="A peeling poster on a tree trunk."
      >
        <span className="wander-spot__icon">🎭</span>
        <span className="wander-spot__label">Peeling poster</span>
      </button>

      {/* Always-on marigolds that bloom as more hotspots are revealed */}
      <div className="wander-court__marigolds" aria-hidden="true">
        {Array.from({ length: Math.max(3, Object.keys(wandered).length * 2 + 3) }, (_, i) => (
          <span key={i} className="wander-court__marigold" style={{ '--i': i }}>🌼</span>
        ))}
      </div>
    </div>
  )
}
