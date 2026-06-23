// Physical radio. Renders a small device + a faint scrolling-text strip.
// Clarity 0..3 controls what static / words come through.
//
// Clarity:
//   0: pure static lines
//   1: occasional cooking words ("…protein…", "…oil…")
//   2: recognizable cooking-host phrases
//   3: clear announcer voice  (reserved for later phases — slice maxes at 2)

const CLARITY_TEXT = {
  0: ['...zzhhh...', '...kkkrrrr...', '...sshhsshh...'],
  1: ['...protein...', '...oil...', '...watch out...', '...heat...', '...salt...'],
  2: ['…toss it twice…', '…that\'s the trick mijo…', '…on a low flame…', '…remember the rice…'],
  3: ['…and tonight only…', '…welcome back to the show…'],
}

export default function Radio({ clarity = 0, placement = 'default', label = null }) {
  const lines = CLARITY_TEXT[clarity] ?? CLARITY_TEXT[0]
  return (
    <div className={`radio radio--${placement} radio--c${clarity}`} aria-hidden="true">
      <div className="radio__body">
        <span className="radio__icon">📻</span>
        <div className="radio__ticker">
          <div className="radio__ticker-track">
            {[...lines, ...lines, ...lines].map((line, i) => (
              <span key={i} className="radio__line">{line}</span>
            ))}
          </div>
        </div>
      </div>
      {label && <div className="radio__label">{label}</div>}
    </div>
  )
}
