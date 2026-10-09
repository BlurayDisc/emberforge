# CLAUDE.md - Emberforge

Pixel-art, turn-based crafting RPG. TypeScript strict + Vite. Static web build.
Render: Pixi.js draws the town, the battle and the castle. Audio: Tone.js.

## Docs

Read only the file for the area you work in. Do not load them all.

- `docs/design.md` is the index of the game rules and the source of truth, with the glossary. The topic files are in `docs/design/` (heroes and spells, items and crafting, battle and monsters, world and dungeons, screens and art). Read the index, then only the topic file for your area. Change the matching file in the same step as any rule change.
- `docs/story-and-lore.md` is the source of truth for story, cast, names and tone (10 chapters, one per town). Read it before you write or change any story, lore, castle or letter text. Keep character voices as written there. `docs/story-and-lore.zh-CN.md` is the Chinese version.
- Use the words from the docs/design.md glossary in names: `Company`, `Party`, `Bracket`, `Tier`, `Affix`, `Quality`.
- `docs/balance/` holds the balance tables of each bracket (`bracket-NN.md`: targets and simulator results), the combat and growth spec, and the real-time battle spec.
- Read the matching file in `docs/agent/` before you work in that area:
  - `architecture.md` - layers, import rules, determinism, static build, saves.
  - `balance-and-validation.md` - balance simulator and data validator.
  - `ui-rules.md` - layout, buttons, mobile. Read before you touch `src/ui/` or CSS.
  - `pixel-art.md` - stage resolution, palette, sprites, fonts, spell visuals and the gallery.
  - `audio.md` - sound and music.
  - `languages.md` - English and Chinese texts.
  - `runs-and-economy.md` - dungeon runs, reports, crafters, gold.
  - `battle-sim.md` - the battle sim dev page.
- The `/new-bracket` skill builds the next bracket of 10 levels (level 20, 30, up to 100). Use it only for that job. Its files in `.claude/skills/new-bracket/` are not part of normal work: do not read them for other changes.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run check` | Type check + boundary check + data and translation validation + headless smoke play. Run it before you finish any task. |
| `npm run build` | `check` + production build into `dist/` |
| `npm run balance` | Balance simulator. Win rate, duration and HP lost per dungeon and party. |
| `npm run scenarios` | Five balance scenarios from `tools/balance-sim/presets/`. Change a preset file, not the code. |
| `npm run battlesim` | Battle sim page in the browser: a dummy hero fights any creep. See `docs/agent/battle-sim.md`. |
| `npm run smoke` | Headless smoke play (`tools/smoke-play.ts`). Fails on a broken rule. |
| `npm run gallery` | Spell gallery in the browser. |
| `npm run story-gallery` | Story gallery in the browser: the prologue, every story beat and every castle tale, in English and Chinese, with a button that opens each one as in the game. Dev tool, not in `vite build`. |
| `npm run sprites` | Headless contact sheet PNG of heroes, creatures or backdrops. No browser. |
| `npm run shot` | Real headless Chrome: opens a URL, runs steps (click, wait, screenshot), saves PNGs to `out/shots/`. Use it to run the game or the gallery. See Visual validation. |
| `npm run audio-report` | Renders every music track and sound effect offline in headless Chrome. Prints peak, level, lead silence, length and rough pitch. Start `npm run dev` first and pass its URL. |
| `npm run animation` | Headless frame strip PNG of a spell (`warrior.cleave`) or one effect (`impact:steel-cleave:steel`). |
| `npm run validate` | Data validator. `check` and `build` run it too. |

## Core rules

- Keep systems modular. Systems are pure: state in, new state out. No DOM, no `Math.random()`, no `Date.now()`.
- Keep rendering separate from game state. `render/` reads state and never changes it.
- Prefer data-driven design. Game data and numbers live in `data/*.json`, not in code.
- Prefer simple solutions over abstractions.
- Never modify unrelated systems.
- Do not weaken `tools/check-boundaries.ts` to make code pass. Move the code.
- Do not add a dependency without asking the user first. Pixi.js and Tone.js are already approved.
- Mobile must stay fast. Cache every drawn sprite and texture. Create no objects in the per-frame loop.
- Every text a player sees goes through `t()` in both languages.

## Tests

- Use sim and functional checks that run without the game and finish fast: the smoke play, the balance simulator and the data validator.
- Do not write unit tests. Do not test edge cases. Do not add a test framework.
- When you add a command or a rule, add a step to `tools/smoke-play.ts`.
- Run `npm run balance` and `npm run scenarios` only for medium or large balance changes, or when the user asks. They are expensive.

## Visual validation

After you change sprites, animation, UI, layout or game presentation:

1. Render it. Sprites and animation: use the headless tools and read the PNG in `out/art/` with the image reader (`npm run sprites -- heroes|creatures|backdrops`, `npm run animation -- <spellId>`). They print size, pixel box, color count and soft-alpha count for each sprite. Stage and UI: run the game or the gallery with `npm run shot` (start `npm run dev` first), for example `npm run shot -- http://127.0.0.1:5173/spell-gallery.html '[{"wait":2500},{"click":"fireball"},{"wait":400},{"shot":"fireball"}]'`. A background browser tab gets no animation frames, so a fight never advances there. Use `shot` for anything that moves.
2. Inspect the image yourself.
3. Check against the intended design: frame order, timing, position, scale, transparency, looping, pixel-art consistency.
4. Fix the problems and render again. Repeat until it is right.
5. Do not say visual work is done until you have looked at the new image. If you could not look, say so.
6. Do not leave a dev server running when you finish.

## UI verification

After every UI change, verify it in real headless Chrome with `npm run shot` (start `npm run dev` first). This is a required step of the change:

1. Open the changed screen at a modern phone size (2025 or newer, for example a Pixel 10 at about 412x915, touch) and at web size (1280x720). The phone size is not strict. Do not support small or old phones.
2. Click through the changed flow. Take screenshots and read them with the image reader.
3. Check that the UI works on both sizes: layout, no overflow or clipping, buttons reachable, text readable.
4. Fix each problem, then run the steps again. Repeat until both sizes are right.
5. Stop the dev server when you finish.

## Sound validation

- After you change a sound or music pattern, run `npm run audio-report -- <dev url>` and check peak level, length, silence and pitch in the numbers. You cannot hear it, so say that the user must listen.
- `npm run validate` checks the sound mappings.

## Code style

- Write self-documenting code. Use game-domain names with the technical detail in the name (`rollAffixValue`, `slotsOccupiedByItem`).
- Add a short comment only where the code hides important technical behaviour or a non-obvious reason. Never repeat the code in a comment. (This project is TypeScript. The Java rules in the global file do not apply.)
- Never use em dashes in code, UI text, data files or docs. Use a normal hyphen - instead.
- TypeScript `strict`. No `any`.
- One concept per file. Keep files under about 200 lines. No `utils.ts` or `helpers.ts`.
- Prefer data tables in `content/` over `if`/`switch` chains in systems.

## Working rules

- Work in small steps. Make one system work end to end before you start the next.
- Run `npm run check` before you say a task is done. Say clearly what you did not verify.
- Do not commit unless the user asks.
