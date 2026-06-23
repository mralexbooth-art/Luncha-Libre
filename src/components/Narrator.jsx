// Second-person narration overlay. Lines feel like soft text-on-rain.
// Click anywhere on the overlay to advance. Typewriter same as Empresario.

import { useEffect, useState } from 'react'

const CHAR_DELAY_MS = 32
const HOLD_AFTER_TEXT_MS = 300

export default function Narrator({ lines = [], onComplete }) {
  const [idx, setIdx] = useState(0)
  if (idx >= lines.length) return null
  return (
    <NarratorLine
      key={idx}
      text={lines[idx]}
      isLast={idx === lines.length - 1}
      onAdvance={() => {
        if (idx + 1 < lines.length) setIdx(idx + 1)
        else onComplete?.()
      }}
    />
  )
}

function NarratorLine({ text, isLast, onAdvance }) {
  const [revealed, setRevealed] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!text) { const t = setTimeout(() => setDone(true), 0); return () => clearTimeout(t) }
    if (revealed >= text.length) {
      const t = setTimeout(() => setDone(true), HOLD_AFTER_TEXT_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setRevealed(r => r + 1), CHAR_DELAY_MS)
    return () => clearTimeout(t)
  }, [revealed, text])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        if (revealed < text.length) setRevealed(text.length)
        else onAdvance?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, text, onAdvance])

  const handleClick = () => {
    if (revealed < text.length) { setRevealed(text.length); return }
    onAdvance?.()
  }

  const shown = text.slice(0, revealed)
  return (
    <div className="narrator" onClick={handleClick} role="dialog" aria-live="polite">
      <div className="narrator__text">{shown}<span className="narrator__caret">▍</span></div>
      <div className="narrator__hint">{done ? (isLast ? 'click to continue' : 'click') : ' '}</div>
    </div>
  )
}
