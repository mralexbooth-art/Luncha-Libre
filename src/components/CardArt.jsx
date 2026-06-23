import { useState } from 'react'
import { fallbackFor } from '../game/art.js'

// Renders the first URL in the chain that loads. `src` may be a string OR
// an array of URLs to try in order. Falls back to the emoji glyph for `id`
// if every URL in the chain fails.
export default function CardArt({ src, id, variant = 'card', alt = '' }) {
  const urls = Array.isArray(src) ? src : (src ? [src] : [])
  const [failedUrls, setFailedUrls] = useState(() => new Set())
  const currentUrl = urls.find(u => !failedUrls.has(u))
  const showImage = !!currentUrl
  return (
    <div className={`art art--${variant} ${showImage ? 'has-image' : 'no-image'}`}>
      {showImage ? (
        <img
          className="art__img"
          src={currentUrl}
          alt={alt}
          onError={() => setFailedUrls(prev => {
            const next = new Set(prev)
            next.add(currentUrl)
            return next
          })}
          loading="lazy"
        />
      ) : (
        <span className="art__emoji" aria-hidden="true">{fallbackFor(id)}</span>
      )}
    </div>
  )
}
