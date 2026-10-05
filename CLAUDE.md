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
| `npm run scenarios` | Five balance scenarios from the preset files in `tools/balance-sim/presets/`: `economy`, `experience`, `mob-kill-time`, `boss-fight`, `resource-use`. The hero wears the best gear it can equip at its level. Run one with `npm run scenarios -- boss-fight`. Change a preset file, not the code. |
| `npm run smoke` | Headless smoke play (`tools/smoke-play.ts`): hire, craft, equip, sell, and several dungeon runs at once, and a same-seed check. Fails on a broken rule. |
| `npm run gallery` | Spell gallery in the browser (`spell-gallery.html`, `tools/spell-gallery/main.ts`). It plays every spell that has a visual in `data/spell-visuals.json` on the real battle stage. See Spell visuals. |
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

## Spell visuals

- Spell looks are in `data/spell-visuals.json` (theme, cast, projectile, impact, buff, debuff, icon). The art is drawn in code in `src/render/spellEffects/`. The art ids are listed in `content/spellVisuals.ts`.
- The spell gallery (`npm run gallery`) reads `SPELL_VISUALS`, so a new spell with a visual shows in it with no extra step. A new art id, a new theme or a new kind of effect (for example a new status) may need a change in `tools/spell-gallery/main.ts` too. The gallery is a dev tool. `vite build` does not include it.
- When you add or change a spell animation: start the gallery (`npm run gallery`, or tell the user to run it), open the new spell in the browser, look at it with a screenshot, and show the user the page. Keep the gallery working for the new effect kind. Do not leave the dev server running when you finish.

## UI rules (layout, buttons, mobile and desktop)

Read these before you touch any file in `src/ui/` or any CSS. Keep them true. When the user agrees a new UI rule, add it here in the same step.

**Screen order (top to bottom)**
1. Tabs, if the screen has them (heroes, settings).
2. Main content first: the grid, the list or the map. The thing the player came for is at the top.
3. Short info lines (space, gold, counts). Long descriptions are hidden on a phone, or left out.
4. Content that grows over time (stored materials, lists of results) is last, above the footer.
5. Footer row: the action buttons, always last, in the class `panel-footer` (sticky, so a short desktop window never hides it). Leave / Back is the last button. Links to another screen (for example "Upgrade ... at the bank") sit in the same footer.
- Never put action buttons in the middle of a list, or above the content they act on.

**No dynamic movement (most important)**
- A timer or an automatic event must never move or resize anything on a screen. Only a player action may change the content, and even then the other elements keep their place.
- Give a thing that comes and goes a fixed slot: one tile for each merchant sale slot (empty or not), a selection bar of fixed height, a status area with a fixed `min-height`.
- Rows that change state (dungeon free / fighting / results) share the `min-height` of the tallest state.
- Do not swap a grid for a text line when it is empty. Show the empty grid.
- A new element goes below the things that exist, or into a reserved slot. It never pushes them.
- Warnings are quiet: a static colour or a small mark. No flash, no pulse, no movement (see the backpack warning).

**Mobile and desktop**
- Mobile first. Check every change at about 360x640 and at about 1280x720.
- Every action works with touch. No information only on hover (a `title` is an extra, not the only place).
- Touch targets are about 44 px high. Tile grids use a fixed column count that fits a phone (2 for big tiles, up to 6 for small tiles).
- No sideways scroll. Wrap chips and buttons into rows.
- A panel is at most 820 px wide. The world map panel is full screen.
- Use the shared classes (`panel-body`, `list`, `list-row`, `tile-grid`, `tab-row`, `hero-choice-row`, `status-row`, `panel-footer`) before you write a new one.

**Where things live**
- Gold and the local date and time are on the stage, in the top right corner (`ui/gameHud.ts`). A panel covers the stage, so a screen that deals with gold shows it again as an info line.
- The team (hero chips) is at the top of the Dungeons panel.
- Nothing else sits in the top corners of the stage: the town title is top left, the castle Leave button is under the gold in the top right.
- Text goes through `t()` in both languages. Colours come from `theme.css`.

**Before you finish a UI task**
- Ask: "What moves when a timer fires or a sale ends here?" The answer must be: nothing.
- Say clearly if you did not look at the screen in a browser.

**Known gaps** (older screens that do not follow the footer rule yet): Leave buttons in Workshop, Mill, Tavern and Bank are the last element of the body but not sticky. Move them to `panel-footer` when you touch those screens.

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
