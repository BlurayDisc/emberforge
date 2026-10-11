---
name: audio-change
description: Use when you add or change an Emberforge sound effect, a music track, a music pattern or the sound mappings (src/audio/, data/audio/). Loads the audio rules and checks the result with the audio report.
---

# Audio change

Follow the rules in `audio-rules.md` (this folder): Tone.js synthesis, no sound files, music and sound data in `data/audio/`, scene music, and the browser audio unlock.

## Verify

1. Run `npm run validate`. It checks the sound mappings and that every music voice has the same length.
2. Start `npm run dev`, then run `npm run audio-report -- <dev url>`. It renders every track and effect offline and prints peak, level, lead silence, length and rough pitch. It fails on clipping, silence or a late start.
3. Read the numbers of the sounds you changed. Fix the problems and run it again.
4. Stop the dev server. Run `npm run check`.
5. You cannot hear the sound. Say in your report that the user must listen.

Follow the browser safety rules in `CLAUDE.md`.
