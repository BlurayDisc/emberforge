# Web and platform rules

- The build is a static folder. `base` is `'./'`. Use relative asset paths so it works on GitHub Pages and Vercel.
- No server code. Saves live in the browser. File export and import is planned, not built yet.
- Every action must work with touch. Do not hide information behind hover.
- Add a dependency only after the user agrees. Pixi.js and Tone.js are already approved. Prefer small code over a library.
