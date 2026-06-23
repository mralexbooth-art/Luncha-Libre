// Switch the background music whenever `sceneId` changes. Looks up the scene
// in SCENE_TRACKS and crossfades. Also installs a one-time retry on the
// first user gesture, so if the initial mount's playMusic() was blocked by
// browser autoplay rules, the very next click (e.g., the player advancing
// the narration) kicks it off.

import { useEffect } from 'react'
import { playMusic, SCENE_TRACKS } from '../game/audio.js'

export function useMusic(sceneId, { volume = 0.3, fadeMs = 1200 } = {}) {
  useEffect(() => {
    const track = SCENE_TRACKS[sceneId]
    if (!track) return

    playMusic(track, { volume, fadeMs })

    // Autoplay fallback: if the browser blocked the initial play, the first
    // user gesture should kick it off. playMusic with the same track name is
    // safe and idempotent — it'll retry .play() on the existing element.
    const retry = () => {
      playMusic(track, { volume, fadeMs: 400 })
    }
    window.addEventListener('click', retry, { once: true })
    window.addEventListener('keydown', retry, { once: true })

    return () => {
      window.removeEventListener('click', retry)
      window.removeEventListener('keydown', retry)
    }
  }, [sceneId, volume, fadeMs])
}
