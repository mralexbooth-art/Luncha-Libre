// V4 — The keep-vs-release choice. Two cards. Each shows what you get.
// Selecting commits to the choice and advances to the Arcana reveal.

import { useState } from 'react'
import Dialogue from '../Dialogue.jsx'
import { CHOICE_PROMPT } from '../../data/prelude-script.js'

export default function ChoiceScene({ dish, onChoose }) {
  // Show the two options. After the player picks, play the appropriate
  // Abuela response, then call onChoose(choice).
  const [picked, setPicked] = useState(null)
  if (picked) {
    const after = CHOICE_PROMPT[picked]?.afterLines ?? []
    return (
      <div className="scene scene--choice">
        <div className="choice__committed">
          <div className="choice__committed-title">{CHOICE_PROMPT[picked]?.title}</div>
        </div>
        <Dialogue lines={after} onComplete={() => onChoose(picked)} />
      </div>
    )
  }
  return (
    <div className="scene scene--choice">
      <div className="choice__title">…the candle keeps burning.</div>
      <div className="choice__cards">
        <button
          type="button"
          className="choice__card choice__card--keep"
          onClick={() => setPicked('keep')}
        >
          <div className="choice__card-title">{CHOICE_PROMPT.keep.title}</div>
          <div className="choice__card-desc">{CHOICE_PROMPT.keep.description}</div>
          <div className="choice__card-payload">
            <span className="choice__card-icon">🎴</span>
            <span>{dish?.name ?? 'The dish'} joins you</span>
          </div>
        </button>
        <button
          type="button"
          className="choice__card choice__card--release"
          onClick={() => setPicked('release')}
        >
          <div className="choice__card-title">{CHOICE_PROMPT.release.title}</div>
          <div className="choice__card-desc">{CHOICE_PROMPT.release.description}</div>
          <div className="choice__card-payload">
            <span className="choice__card-icon">🕊</span>
            <span>He is gone. You feel briefly full.</span>
          </div>
        </button>
      </div>
    </div>
  )
}
