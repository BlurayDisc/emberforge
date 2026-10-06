# Architecture

Many small directories. Each game system is independent. `tools/check-boundaries.ts` enforces these rules. Do not weaken the checker to make code pass. Move the code.

| Layer | Holds | May import |
|---|---|---|
| `src/kernel/` | Seeded random, ids, math. No game knowledge. | nothing |
| `src/model/` | Plain data types (Hero, Item, Save …). No logic. | kernel |
| `src/content/` | Typed loaders for the JSON files in `data/`. The only code that reads `data/`. | kernel, model |
| `src/systems/<name>/` | Pure game logic. One system per directory. | kernel, model, content |
| `src/game/` | Player commands, state store, autosave, storage. The only layer that joins systems. | all except render, ui |
| `src/heroArt/` | Pixel art of the 7 hero classes, drawn in code: battle sprites (`battle/`) and full-body portraits (`portrait/`). Shared painter, palette and heads. No game state. | kernel, model, content |
| `src/render/` | three.js stage. Reads state. Never changes it. | kernel, model, content, heroArt |
| `src/audio/` | Browser sound: synthesized effects and music. No sound files. | kernel, model, content |
| `src/ui/` | DOM screens. Sends commands to `game/`. | kernel, model, content, game, audio, heroArt |
| `src/app/` | Composition root: joins `game`, `render`, `ui` and `audio` (for example battle playback, which runs every active run). | kernel, model, content, game, render, ui, audio, heroArt |
| `data/` | **Game data as JSON** (classes, materials, monsters, dungeons, towns, buildings, base items, affixes, balance numbers). No code. A wiki tool can scan it. | - |
| `tools/` | Node scripts: boundary check, data validator, balance simulator | everything |

Rules:

1. A system never imports another system. If two systems need to work together, `game/` does it.
2. Other layers import a system only through its `index.ts`.
3. Only `render/` imports `three`.
4. Systems are pure: state in, new state out. No DOM. No `Math.random()`. No `Date.now()`. Time and random come in as arguments.
5. Game state is plain JSON (no classes, Map, Set or functions). A save is `JSON.stringify(state)`.
6. Never mutate state in place. Return a new object.
7. Content has stable string ids (`base.sword`). Never use array positions as ids.
8. No magic numbers in systems. Game data and numbers live in `data/*.json` (balance numbers in `data/balance/`). `content/` only loads them with types.
9. Every player move is a command in `game/commands/`. The command runner saves after each one. The UI never changes state by itself.
10. Never drop the player's save. Change the shape of saved data → raise `CURRENT_SAVE_VERSION` and add one migration in `systems/save/migrations.ts`. The smoke tool checks that old saves load. A save that cannot load is kept under `emberforge.save.unreadable`.

Add a new system: make `src/systems/<name>/` with an `index.ts` that exports the public functions and types. Keep the rest private.

## Determinism

- All randomness uses `Random` from `kernel/random.ts`. Give each activity its own stream with `fork('name')` (for example `fork('loot')`, `fork('battle')`).
- The same seed and the same input must give the same result. The balance simulator and the battle replay depend on this.

