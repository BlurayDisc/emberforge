# Audio

- Sound is synthesized with Tone.js in `src/audio/`. Do not add sound files. Only `src/audio/` imports `tone`.
- `synth.ts` plays one layer (oscillator or noise, envelope, filter) and disposes its Tone nodes when it stops. Sound effects and music notes both use it. Music runs on `Tone.getTransport()` with one `Tone.Part` per voice.
- A music voice may have `sustain` (0 to 1). Without it, every note is a short pluck. With it, the note is held at that level. The castle track uses it for the lead, the pad and the bass.
- Scenes pick the music: `townScenes.ts` plays `town` or `castle` (the Throne Hall and the Ramparts share one track), and `runPlayback.ts` plays `battle` or `boss`.
- `npm run audio-report -- <dev url>` renders every track and effect offline with `Tone.Offline` (`src/audio/offlineRender.ts`). It prints numbers and fails on clipping, silence or a late start. It cannot judge how a sound feels, so the player must listen.
- Music patterns and sound recipes are data in `data/audio/`. Add a sound there, and map it in `sound-effects.json` if a class, monster or armour type needs it. `npm run validate` checks the mappings and that every music voice has the same length.
- Browsers block audio until the first click, tap or key press. The engine creates the audio context at that moment. Call `playSound` and `playMusic` freely before it: they do nothing, or wait, until audio is unlocked.
- Only the watched run makes combat sound. Runs in the background are silent.
- `src/app/sceneMusic.ts` picks the track. A watched fight plays `battle` or `boss`. In the town, the music follows the oldest active run, so the player hears that the heroes fight. The castle keeps the `castle` track. With no run, the town plays `town`.
- Volumes are saved apart from the game save (`emberforge.settings`).

