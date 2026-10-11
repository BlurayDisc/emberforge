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
| `src/render/` | Pixi.js town, battle and castle stages. Reads state. Never changes it. | kernel, model, content, heroArt |
| `src/audio/` | Browser sound (Tone.js): synthesized effects and music. No sound files. | kernel, model, content |
| `src/ui/` | DOM screens. Sends commands to `game/`. | kernel, model, content, game, audio, heroArt |
| `src/app/` | Composition root: joins `game`, `render`, `ui` and `audio` (for example battle playback, which runs every active run). | kernel, model, content, game, render, ui, audio, heroArt |
| `data/` | **Game data as JSON** (classes, materials, monsters, dungeons, towns, buildings, base items, affixes, balance numbers). No code. A wiki tool can scan it. | - |
| `tools/` | Node scripts: boundary check, data validator, balance simulator | everything |

Rules:

1. A system never imports another system. If two systems need to work together, `game/` does it.
2. Other layers import a system only through its `index.ts`.
3. Only `render/` imports `pixi.js`. The town, the battle and the castle are Pixi.js views. `render/pixelStage.ts` owns the one Pixi canvas, and each view is a container in `stage.pixi.views`.
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

## Web and platform

- The build is a static folder. `base` is `'./'`. Use relative asset paths so it works on GitHub Pages and Vercel.
- No server code. Saves live in the browser. File export and import is planned, not built yet.
- The app icon is drawn by `npm run icons` (`tools/make-app-icons.ts`) into `public/icons/`. Run it again when the picture changes.
- `public/manifest.webmanifest` is the English install manifest. `src/ui/appIdentity.ts` swaps in a manifest and a tab title in the game language. An installed app keeps its name until it is installed again.

## Languages (English and Chinese)

- Every text that a player can see goes through `t('key', params)` from `ui/i18n.ts`. Never write player text in code.
- Texts live in `data/i18n/en.json` and `data/i18n/zh.json` (flat keys). Content names use the content id: `monster.<id>`, `material.<id>`, `dungeon.<id>`, `base.<id>`, `affix.<id>`, `class.<id>.name`.
- `game/` and `systems/` never return English sentences. A rejected command carries a message key (`CommandRejected('reject.partyEmpty')`). An equip problem is `{ key, params }`.
- Saved data holds ids and parts, never display text. An item stores `baseId`, `materialId`, `affixes` and `rareNameParts`. `ui/displayNames.ts` builds the name in the current language.
- The language choice is saved apart from the game save (`emberforge.settings`), so a new game keeps it. The player changes it in the Settings screen. The UI redraws at once.
- Add a key to **both** files. `npm run validate` fails when a key is missing, empty or unknown, when a key used in code does not exist, or when a content name in `en.json` differs from the data file.
- To add a language: add `data/i18n/<id>.json`, add it to `data/i18n/languages.json` and to `LanguageId` in `content/translations.ts`.

## Runs, reports and crafters

- A run is one fight. A dungeon hosts one run. A hero is in one run. `state.dungeonRuns` holds the active runs.
- Every run command takes the run number: `completeRunCommand(runNumber)`, `stopDungeonRunCommand(runNumber)`. Completion re-plans the same seeded fight, so the result matches the screen. It heals the heroes, rolls loot, adds a report to `state.reports` and clears the dungeon on the first win.
- `app/runPlayback.ts` keeps one player for each run. Only the run in focus (`ui/runFocus.ts`) draws on the stage. Reports stay until the player reads them (`ui/notifications.ts`).
- Dungeons are locked until the one in `unlockAfter` is cleared. Recipes are locked by crafter level (`state.crafters`, level 1-100). Every craft gives crafting XP.
- Gold sinks: hero hiring, the crafter fee and spell training at the Academy. A hero spell loadout (`learnedSpellIds`, `equippedSpellIds`, `equippedUltimateId`) is part of the hero, so it cannot change while the hero is in a run. The merchant never sells loot materials. Numbers are in `data/balance/economy.json`.
- Item and recipe details open in modals (`ui/modal.ts`, `ui/itemModals.ts`). The hero equipment screen is `ui/panels/heroes/equipmentScreen.ts`.
- Time rules: commands that depend on the clock take `nowMs` as the last argument. Systems never read the clock. Selling and crafting are `state.jobs` (`collectFinishedJobsCommand`, run by `app/jobTicker.ts`). Hero health is stored with `healthAsOfMs` and worked out by `systems/recovery`. UI timers use `ui/liveUpdate.ts`.
- Layout is mobile first: the run bar is above the battlefield and the battle log is below it.
