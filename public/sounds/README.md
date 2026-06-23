# Sounds

Drop audio files in this folder. The game references the filenames below; the
audio system tries `.mp3` first, then `.ogg`, then `.wav`. Missing files
silently no-op (the audio manager fails gracefully — the game stays playable).

The audio manager handles crossfading between background tracks, so scene
transitions sound smooth automatically once tracks are present.

---

## Background music tracks (looping)

These play in the background based on which scene the player is in. The
audio manager crossfades between them — about 1.8 seconds — when the scene
changes. Aim for loops that don't have hard cuts at the start/end.

| Filename | When it plays | Vibe target |
|---|---|---|
| `music-prelude-rain.mp3` | Opening (awake + food court) | Eerie + cozy, light rain bed, distant radio static, low drone. Soft. |
| `music-altar.mp3` | Candle-lit + altar + choice scenes | Warm-but-uneasy. Slow strings or pads, distant marigold chimes, candle crackle very faint. |
| `music-kitchen-eerie.mp3` | Prelude kitchen (dish-mode) | Cozy clatter + low whisper, kitchen ambience with a ghost in it. NOT cheerful. |
| `music-arcana.mp3` | Arcana reveal | A held, blooming note. Soft awe. Almost a memory. |
| `music-kitchen.mp3` | La Gira (post-prelude run loop) | Active kitchen + crowd murmur. Cookable, energetic. (Phase 9 placeholder.) |

**Length / loudness suggestions:**
- 60–120 second loops. Loop point matters more than length.
- Mix at around -18 LUFS (peaceful tracks softer than action ones).
- Avoid sudden percussion at the start — the crossfade smooths fades but not stings.

## Per-appliance SFX (one-shots, Phase 9 game loop)

Played when an ingredient is placed in the appliance during La Gira.

| Filename | Appliance |
|---|---|
| `sfx-sizzle.mp3` | Cast Iron Pan |
| `sfx-microwave.mp3` | Microwave |
| `sfx-grill.mp3` | BBQ Grill |
| `sfx-airfryer.mp3` | Air Fryer |
| `sfx-bubble.mp3` | Stockpot |
| `sfx-stirfry.mp3` | Wok |
| `sfx-place.mp3` | Generic fallback drop |

**Length / loudness:** 200–600 ms one-shots, -12 LUFS.

---

## Where to find royalty-free eerie ambient music

All free, all legal for game use (check each license for attribution):

- **[Pixabay Audio](https://pixabay.com/music/)** — fully free, no attribution required. Search terms that hit the vibe: `eerie ambient`, `dark ambient`, `cinematic horror cozy`, `ghost lullaby`, `marigold`, `mexican folk dark`.
- **[Freesound.org](https://freesound.org)** — huge sample library, CC-licensed. Search `rain loop`, `candle flame`, `radio static`, `wrestling crowd distant`, `old kitchen ambience`. Combine layers in Audacity to make your own track.
- **[YouTube Audio Library](https://www.youtube.com/audiolibrary)** — free for any use, no attribution required. Filter by Mood → "Dark" / "Calm" → Genre "Cinematic" / "Ambient."
- **[OpenGameArt.org](https://opengameart.org)** — game-asset focused. Filter "Music → Atmospheric."
- **[Tabletop Audio](https://tabletopaudio.com)** — CC-BY licensed atmospheres designed for TTRPGs. "Day of the Dead," "Forgotten Inn," "Witches' Sabbath," "Old Mill" are all eerie+cozy fits.
- **[Kevin MacLeod](https://incompetech.com/music/royalty-free/)** — CC-BY with attribution. Massive library. Try "Long Note Two," "Dark Tales," "Hush."

**Specific search prompts that land well for this game:**
- "ambient horror cozy lullaby"
- "mexican folk dark ambient"
- "rain ambient loop"
- "marigold ghost"
- "distant wrestling commentary radio static loop"

---

## Quick workflow once you have files

1. Drop files into `public/sounds/` with the exact filenames above.
2. Run `git add public/sounds/*.mp3 && git commit -m "audio: prelude tracks" && git push`.
3. Netlify rebuilds in ~60s. Refresh and audio is live.

The mute toggle (🔊 / 🔇 in the top-right corner) state persists across
sessions via `localStorage`.

## Building your own track from layers (cheap and fast)

If you can't find a single track that fits:

1. Grab a 60-second `rain.wav` from Freesound (loopable).
2. Grab a `low-drone.wav` (e.g., Kevin MacLeod "Long Note Two" — slowed 25%).
3. Open Audacity (free) → import both as tracks → mix → export as `music-prelude-rain.mp3` at -18 LUFS.
4. Optionally add a third layer: faint radio static at -28 LUFS underneath.

That's a tonally-perfect track in ~15 minutes.
