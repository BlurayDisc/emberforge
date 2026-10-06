# Audio

- Sound is synthesized with the Web Audio API in `src/audio/`. Do not add sound files.
- Music patterns and sound recipes are data in `data/audio/`. Add a sound there, and map it in `sound-effects.json` if a class, monster or armour type needs it. `npm run validate` checks the mappings and that every music voice has the same length.
- Browsers block audio until the first click, tap or key press. The engine creates the audio context at that moment. Call `playSound` and `playMusic` freely before it: they do nothing, or wait, until audio is unlocked.
- Only the watched run makes combat sound. Runs in the background are silent.
- Volumes are saved apart from the game save (`emberforge.settings`).

