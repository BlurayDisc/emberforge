# CLAUDE.md - Emberforge

Pixel-art, turn-based crafting RPG. TypeScript strict + Vite. Static web build.
Render: Pixi.js draws the town, the battle and the castle. Audio: Tone.js.

## Docs

Read only the file for the area you work in. Do not load them all.

- `docs/design.md` is the index of the game rules and the source of truth, with the glossary. The topic files are in `docs/design/` (heroes and spells, items and crafting, battle and monsters, world and dungeons, screens and art). Read the index, then only the topic file for your area. Change the matching file in the same step as any rule change.
- `docs/story-and-lore.md` is the source of truth for story, cast, names and tone (10 chapters, one per town). Read it before you write or change any story, lore, castle or letter text. Keep character voices as written there. `docs/story-and-lore.zh-CN.md` is the Chinese version.
- Use the words from the docs/design.md glossary in names: `Company`, `Party`, `Bracket`, `Tier`, `Affix`, `Quality`.
- `docs/balance/` holds the balance tables of each bracket (`bracket-NN.md`: targets and simulator results), the combat and growth spec, and the real-time battle spec.
- `docs/architecture.md` - layers, import rules, determinism, static build, saves, languages, runs and economy. Read it before you add or move code.
- `docs/balance/validation.md` - balance simulator and data validator. `docs/balance/battle-sim.md` - the battle sim dev page.
- Skills in `.claude/skills/` hold the rules and the check loop for one kind of work. Use the matching skill before you start, and do not read its files for other work:
  - `ui-change` - any menu, panel, modal, screen, button, layout or CSS change (`src/ui/`). It also checks the UI in headless Chrome at phone and web size.
  - `art-change` - sprites, hero and creature art, backdrops, town art, spell effects, animation, the spell gallery. It runs the render, inspect, fix loop.
  - `audio-change` - sound effects, music tracks and sound mappings. It runs the audio report.
  - `new-bracket` - builds the next bracket of 10 levels (level 20, 30, up to 100). Use it only for that job.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run check` | Type check + boundary check + data and translation validation + headless smoke play. Run it before you finish any task. |
| `npm run build` | `check` + production build into `dist/` |
| `npm run balance` | Balance simulator. Win rate, duration and HP lost per dungeon and party. |
| `npm run scenarios` | Five balance scenarios from `tools/balance-sim/presets/`. Change a preset file, not the code. |
| `npm run battlesim` | Battle sim page in the browser: a dummy hero fights any creep. See `docs/balance/battle-sim.md`. |
| `npm run smoke` | Headless smoke play (`tools/smoke-play.ts`). Fails on a broken rule. |
| `npm run gallery` | Spell gallery in the browser. |
| `npm run story-gallery` | Story gallery in the browser: the prologue, every story beat and every castle tale, in English and Chinese, with a button that opens each one as in the game. Dev tool, not in `vite build`. |
| `npm run sprites` | Headless contact sheet PNG of heroes, creatures or backdrops. No browser. |
| `npm run shot` | Real headless Chrome: opens a URL, runs steps (click, wait, screenshot), saves PNGs to `out/shots/`. Use it to run the game or the gallery. It stops its own Chrome on exit. If a Chrome is left, run `pkill -f emberforge-chrome-`. |
| `npm run audio-report` | Renders every music track and sound effect offline in headless Chrome. Prints peak, level, lead silence, length and rough pitch. Start `npm run dev` first and pass its URL. It stops its own Chrome on exit, like `shot`. |
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

## Browser safety

Rules for every use of headless Chrome (`shot`, `audio-report`, or your own script):

- One browser for each run. Put all steps of a scenario in one `shot` call. Do not start a new browser for each screenshot.
- Always close the browser in a `finally` block, also on failure or timeout. Set explicit timeouts. Never retry without a limit, and never run unlimited browsers at the same time.
- Before you rerun a failed run, check for a Chrome of the earlier run: `pgrep -f emberforge-chrome-`. After a run, check that none is left. Stop only these with `pkill -f emberforge-chrome-`. Never kill the user's own Chrome.
- When you change the browser launcher (`tools/headless-browser/chromeSession.ts`), test a good run and a failing run, and check that repeated runs leave no process behind.
- Do not leave a dev server running when you finish.

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
