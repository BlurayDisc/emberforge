# CLAUDE.md — Emberforge

Pixel-art, turn-based crafting RPG. Stack: three.js + TypeScript + Vite. Static web build.

## Read first

- `design.md` is the source of truth for game rules. Change it in the same step as any rule change.
- Use the words from the design.md glossary in names: `Company`, `Party`, `Bracket`, `Tier`, `Affix`, `Quality`.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run check` | Type check + architecture boundary check. Run it before you finish any task. |
| `npm run build` | `check` + production build into `dist/` |
| `npm run balance` | Balance simulator (`tools/balance-sim/run.ts`). Prints win rate, duration and HP lost per dungeon and party. |
| `npm run validate` | Content validator (created with the content in the MVP) |

## Architecture

Many small directories. Each game system is independent. `tools/check-boundaries.ts` enforces these rules. Do not weaken the checker to make code pass. Move the code.

| Layer | Holds | May import |
|---|---|---|
| `src/kernel/` | Seeded random, ids, math. No game knowledge. | nothing |
| `src/model/` | Plain data types (Hero, Item, Save …). No logic. | kernel |
| `src/content/` | Static data: classes, bases, affixes, materials, monsters, dungeons, towns, balance numbers | kernel, model |
| `src/systems/<name>/` | Pure game logic. One system per directory. | kernel, model, content |
| `src/game/` | Player commands, state store, autosave, storage. The only layer that joins systems. | all except render, ui |
| `src/render/` | three.js stage. Reads state. Never changes it. | kernel, model, content |
| `src/ui/` | DOM screens. Sends commands to `game/`. | kernel, model, content, game |
| `src/app/` | Composition root: joins `game`, `render` and `ui` (for example battle playback). | kernel, model, content, game, render, ui |
| `tools/` | Node scripts: boundary check, balance simulator, content validator | everything |

Rules:

1. A system never imports another system. If two systems need to work together, `game/` does it.
2. Other layers import a system only through its `index.ts`.
3. Only `render/` imports `three`.
4. Systems are pure: state in, new state out. No DOM. No `Math.random()`. No `Date.now()`. Time and random come in as arguments.
5. Game state is plain JSON (no classes, Map, Set or functions). A save is `JSON.stringify(state)`.
6. Never mutate state in place. Return a new object.
7. Content has stable string ids (`base.sword`). Never use array positions as ids.
8. No magic numbers in systems. Numbers live in `content/` (balance numbers in `content/balance/`).
9. Every player move is a command in `game/commands/`. The command runner saves after each one. The UI never changes state by itself.
10. Change the shape of saved data → raise `SAVE_VERSION` and add a migration.

Add a new system: make `src/systems/<name>/` with an `index.ts` that exports the public functions and types. Keep the rest private.

## Determinism

- All randomness uses `Random` from `kernel/random.ts`. Give each activity its own stream with `fork('name')` (for example `fork('loot')`, `fork('battle')`).
- The same seed and the same input must give the same result. The balance simulator and the battle replay depend on this.

## Balance (no unit tests)

- **Do not write unit tests.** Do not add a test framework or coverage tools. This is a personal game.
- Balance is checked by `tools/balance-sim/`. It runs many seeded battles across a grid of hero level × gear ilvl × quality × monster level. It prints a table and compares it with the targets in design.md section 8 (targets live in `content/balance/targets.ts`).
- Run `npm run balance` after you change stats, formulas, items, affixes, monsters or XP numbers. Fix the numbers in `content/balance/`, then run it again.
- `tools/validate-content/` checks the content. It must fail on:
  - a recipe that mixes tiers (the bracket rule),
  - a monster drop whose tier differs from its bracket,
  - a dungeon level outside its bracket,
  - an unknown id.
  Run `npm run validate` after you edit content.

## Pixel-art rules

- Logical resolution 480×270. Scale by whole numbers only. `image-rendering: pixelated`.
- Textures use `NearestFilter`, no mipmaps. The renderer has antialiasing off.
- Put sprites and the camera on whole-pixel positions. No sub-pixel movement.
- Use colors from `render/palette.ts` only. Add a color there first.
- Draw all sprites at one pixel scale. Do not mix scales.
- Load sprites into one atlas once. Do not create objects in the per-frame loop. Reuse them.
- Fonts and assets are bundled in the repo. No CDN.

## Web and platform rules

- The build is a static folder. `base` is `'./'`. Use relative asset paths so it works on GitHub Pages and Vercel.
- No server code. Saves live in the browser, with file export and import.
- Every action must work with touch. Do not hide information behind hover.
- Add a dependency only when it removes real work. Prefer small code over a library.

## Code style

- Write self-documenting code. Use game-domain names and put the technical detail in the name (`rollAffixValue`, `slotsOccupiedByItem`).
- Do not add comments. If code needs a comment, rename it or split it.
- TypeScript `strict`. No `any`.
- One concept per file. Keep files under about 200 lines. No `utils.ts` or `helpers.ts`.
- Prefer data tables in `content/` over `if`/`switch` chains in systems.

## Working rules

- Work in small steps. Make one system work end to end before you start the next.
- Run `npm run check` before you say a task is done. Say clearly what you did not verify.
- Do not commit unless the user asks.
