// Speaker dialogue overlay (Sabia, Abuela, NPCs). Different from Narrator —
// has a named speaker, a portrait slot, tone-coloring, and click-to-advance.
// Reuses the typewriter pattern.

import { useEffect, useState } from 'react'

const CHAR_DELAY_MS = 28
const HOLD_AFTER_TEXT_MS = 200

const SPEAKER_ICON = {
  'Sabia':           '🧓',
  'Abuela (radio)':  '📻',
  'NPC':             '🧑',
}

export default function Dialogue({ lines = [], onComplete }) {
  const [idx, setIdx] = useState(0)
  if (idx >= lines.length) return null
  const beat = lines[idx]
  return (
    <DialogueLine
      key={idx}
      beat={beat}
      isLast={idx === lines.length - 1}
      onAdvance={() => {
        if (idx + 1 < lines.length) setIdx(idx + 1)
        else onComplete?.()
      }}
    />
  )
}

function DialogueLine({ beat, isLast, onAdvance }) {
  const [revealed, setRevealed] = useState(0)
  const [done, setDone] = useState(false)
  const text = beat.text ?? ''
  const speaker = beat.speaker
  const tone = beat.tone ?? 'neutral'
  const icon = SPEAKER_ICON[speaker] ?? '✦'

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

  return (
    <div className={`dialogue dialogue--${tone}`} onClick={handleClick} role="dialog" aria-live="polite">
      <div className="dialogue__portrait" aria-hidden="true">
        <div className="dialogue__mask">{icon}</div>
        {speaker && <div className="dialogue__speaker">{speaker}</div>}
      </div>
      <div className="dialogue__bubble">
        <div className="dialogue__text">
          {text.slice(0, revealed)}
          <span className="dialogue__caret">▍</span>
        </div>
        <div className="dialogue__hint">
          {done ? (isLast ? 'click to continue' : 'click') : ' '}
        </div>
      </div>
    </div>
  )
}
