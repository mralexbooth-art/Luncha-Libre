// V4 — Speaker dialogue on paper cards, one variant per character.
//   - Sabia              → warm parchment card
//   - Abuela (radio)     → "transmission" card with subtle scan-line jitter
//   - default            → neutral parchment
//
// Same per-character ink-bleed treatment as the Narrator.

import { useEffect, useState } from 'react'

const CHAR_DELAY_MS = 32
const HOLD_AFTER_TEXT_MS = 220

const SPEAKER_VARIANTS = {
  'Sabia':           'sabia',
  'Abuela (radio)':  'radio',
}

const SPEAKER_ICON = {
  'Sabia':           '🌼',
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
  const variant = SPEAKER_VARIANTS[speaker] ?? 'default'
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

  const chars = text.slice(0, revealed).split('')

  return (
    <div
      className={`ink-card ink-card--dialogue ink-card--${variant} ink-card--tone-${tone}`}
      onClick={handleClick}
      role="dialog"
      aria-live="polite"
    >
      <div className="ink-card__paper">
        {speaker && (
          <div className="ink-card__speaker">
            <span className="ink-card__speaker-icon" aria-hidden="true">{icon}</span>
            <span className="ink-card__speaker-name">{speaker}</span>
          </div>
        )}
        <div className="ink-card__text">
          {chars.map((ch, i) => (
            <span key={i} className="ink-char">{ch}</span>
          ))}
          <span className="ink-card__caret">▍</span>
        </div>
        <div className="ink-card__hint">
          {done ? (isLast ? 'click to continue' : 'click') : ' '}
        </div>
      </div>
    </div>
  )
}
