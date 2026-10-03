# CLAUDE.md - Emberforge

Pixel-art, turn-based crafting RPG. Stack: three.js + TypeScript + Vite. Static web build.

## Read first

- `design.md` is the source of truth for game rules. Change it in the same step as any rule change.
- Use the words from the design.md glossary in names: `Company`, `Party`, `Bracket`, `Tier`, `Affix`, `Quality`.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run check` | Type check + architecture boundary check + data and translation validation + headless smoke play. Run it before you finish any task. |
| `npm run build` | `check` + production build into `dist/` |
| `npm run balance` | Balance simulator (`tools/balance-sim/run.ts`). Prints win rate, duration and HP lost per dungeon and party. |
| `npm run smoke` | Headless smoke play (`tools/smoke-play.ts`): hire, craft, equip, sell, and several dungeon runs at once, and a same-seed check. Fails on a broken rule. |
| `npm run validate` | Data validator (`tools/validate-data.ts`). `check` and `build` run it too. |

## Architecture

Many small directories. Each game system is independent. `tools/check-boundaries.ts` enforces these rules. Do not weaken the checker to make code pass. Move the code.

| Layer | Holds | May import |
|---|---|---|
| `src/kernel/` | Seeded random, ids, math. No game knowledge. | nothing |
| `src/model/` | Plain data types (Hero, Item, Save …). No logic. | kernel |
| `src/content/` | Typed loaders for the JSON files in `data/`. The only code that reads `data/`. | kernel, model |
| `src/systems/<name>/` | Pure game logic. One system per directory. | kernel, model, content |
| `src/game/` | Player commands, state store, autosave, storage. The only layer that joins systems. | all except render, ui |
| `src/render/` | three.js stage. Reads state. Never changes it. | kernel, model, content |
| `src/audio/` | Browser sound: synthesized effects and music. No sound files. | kernel, model, content |
| `src/ui/` | DOM screens. Sends commands to `game/`. | kernel, model, content, game, audio |
| `src/app/` | Composition root: joins `game`, `render`, `ui` and `audio` (for example battle playback, which runs every active run). | kernel, model, content, game, render, ui, audio |
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

## Balance (no unit tests)

- **Do not write unit tests.** Do not add a test framework or coverage tools. This is a personal game. Use tools instead: the balance simulator, the data validator and the smoke play script. When you add a command or a rule, add a step to `tools/smoke-play.ts`.
- Balance is checked by `tools/balance-sim/`. It runs many seeded battles for each dungeon, with and without crafted gear. It prints win rate, duration (against the target curve in design.md section 8) and HP lost.
- Run `npm run balance` after you change stats, formulas, items, affixes, monsters or XP numbers. Fix the numbers in `data/balance/`, then run it again.
- `tools/validate-data.ts` checks the JSON in `data/`. It fails on:
  - a monster drop whose material tier differs from the tier of the dungeon bracket (the bracket rule),
  - a base item that needs a material category that a tier does not have (so a recipe would mix tiers or fail),
  - a dungeon level outside its town bracket,
  - an unknown id or sprite key.
  Run `npm run validate` after you edit `data/`.
- Never put an em dash in `data/` files. Use a normal hyphen - instead.

## Audio

- Sound is synthesized with the Web Audio API in `src/audio/`. Do not add sound files.
- Music patterns and sound recipes are data in `data/audio/`. Add a sound there, and map it in `sound-effects.json` if a class, monster or armour type needs it. `npm run validate` checks the mappings and that every music voice has the same length.
- Browsers block audio until the first click, tap or key press. The engine creates the audio context at that moment. Call `playSound` and `playMusic` freely before it: they do nothing, or wait, until audio is unlocked.
- Only the watched run makes combat sound. Runs in the background are silent.
- Volumes are saved apart from the game save (`emberforge.settings`).

## Runs, reports and crafters

- A run is one fight. A dungeon hosts one run. A hero is in one run. `state.dungeonRuns` holds the active runs.
- Every run command takes the run number: `completeRunCommand(runNumber)`, `stopDungeonRunCommand(runNumber)`. Completion re-plans the same seeded fight, so the result matches the screen. It heals the heroes, rolls loot, adds a report to `state.reports` and clears the dungeon on the first win.
- `app/runPlayback.ts` keeps one player for each run. Only the run in focus (`ui/runFocus.ts`) draws on the stage. Reports stay until the player reads them (`ui/notifications.ts`).
- Dungeons are locked until the one in `unlockAfter` is cleared. Recipes are locked by crafter level (`state.crafters`, level 1-100). Every craft gives crafting XP.
- Gold sinks: hero hiring, the crafter fee and spell training at the Academy. A hero spell loadout (`learnedSpellIds`, `equippedSpellIds`, `equippedUltimateId`) is part of the hero, so it cannot change while the hero is in a run. The merchant never sells loot materials. Numbers are in `data/balance/economy.json`.
- Item and recipe details open in modals (`ui/modal.ts`, `ui/itemModals.ts`). The hero equipment screen is `ui/panels/heroes/equipmentScreen.ts`.
- Time rules: commands that depend on the clock take `nowMs` as the last argument. Systems never read the clock. Selling and crafting are `state.jobs` (`collectFinishedJobsCommand`, run by `app/jobTicker.ts`). Hero health is stored with `healthAsOfMs` and worked out by `systems/recovery`. UI timers use `ui/liveUpdate.ts`.
- Layout is mobile first: the run bar is above the battlefield and the battle log is below it.

## Languages (English and Chinese)

- Every text that a player can see goes through `t('key', params)` from `ui/i18n.ts`. Never write player text in code.
- Texts live in `data/i18n/en.json` and `data/i18n/zh.json` (flat keys). Content names use the content id: `monster.<id>`, `material.<id>`, `dungeon.<id>`, `base.<id>`, `affix.<id>`, `class.<id>.name`.
- `game/` and `systems/` never return English sentences. A rejected command carries a message key (`CommandRejected('reject.partyEmpty')`). An equip problem is `{ key, params }`.
- Saved data holds ids and parts, never display text. An item stores `baseId`, `materialId`, `affixes` and `rareNameParts`. `ui/displayNames.ts` builds the name in the current language.
- The language choice is saved apart from the game save (`emberforge.settings`), so a new game keeps it. The player changes it in the Settings screen. The UI redraws at once.
- Add a key to **both** files. `npm run validate` fails when a key is missing, empty or unknown, when a key used in code does not exist, or when a content name in `en.json` differs from the data file.
- To add a language: add `data/i18n/<id>.json`, add it to `data/i18n/languages.json` and to `LanguageId` in `content/translations.ts`.

## Pixel-art rules

- Logical resolution 480×270. The stage scales to fill the window, so the scale can be a fraction. `image-rendering: pixelated` keeps the pixels hard-edged.
- Textures use `NearestFilter`, no mipmaps. The renderer has antialiasing off.
- Put sprites and the camera on whole-pixel positions. No sub-pixel movement.
- Use colors from `render/palette.ts` (stage) and `ui/styles/theme.css` (menus) only. Add a color there first.
- Keep one pixel scale on the stage. Heroes and monsters are drawn in code (`render/heroSpriteArt.ts`, `render/creatureArt.ts`), backdrops in `render/battleBackdrops.ts`, the town in `render/townGroundArt.ts` and `render/buildingArt.ts`. Menu pictures are in `ui/iconArt.ts` and `ui/portraitArt.ts`. Full-body hero figures (one gear file per class) are in `ui/fullBody/`.
- Cache every drawn sprite and texture. Do not create objects in the per-frame loop. Reuse them. A hero looks the same in the portrait and in battle, because both use `pickHeroAppearance`.
- Fonts and assets are bundled in the repo. No CDN. Fonts from `@fontsource`: Jacquard 12 (titles, signs), Pixelify Sans (text), Fusion Pixel 12px SC (English and Chinese text). Atkinson Hyperlegible supplies only the digits of the Chinese version. Chinese text uses full-width punctuation.
- Menu frames use notched box-shadow outlines (no border radius). Buttons press down 2 px. Keep that look in new components.
- Building labels are DOM text on top of the canvas (`ui/townOverlay.ts`). Their size follows the stage scale (`--stage-scale`).

## Web and platform rules

- The build is a static folder. `base` is `'./'`. Use relative asset paths so it works on GitHub Pages and Vercel.
- No server code. Saves live in the browser. File export and import is planned, not built yet.
- Every action must work with touch. Do not hide information behind hover.
- Add a dependency only when it removes real work. Prefer small code over a library.

## Code style

- Write self-documenting code. Use game-domain names and put the technical detail in the name (`rollAffixValue`, `slotsOccupiedByItem`).
- Use clear names first. Add a short comment only where the code hides important technical behaviour or a non-obvious reason: a browser quirk, an ordering or determinism rule, a boundary of a layer. Never add a comment that repeats the code. (This project is TypeScript. The Java rules in the global file do not apply.)
- Never use em dashes (the long dash character) in code, UI text, data files or docs. Use a normal hyphen - instead.
- TypeScript `strict`. No `any`.
- One concept per file. Keep files under about 200 lines. No `utils.ts` or `helpers.ts`.
- Prefer data tables in `content/` over `if`/`switch` chains in systems.

## Working rules

- Work in small steps. Make one system work end to end before you start the next.
- Run `npm run check` before you say a task is done. Say clearly what you did not verify.
- Do not commit unless the user asks.
