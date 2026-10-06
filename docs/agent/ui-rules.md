# UI rules (layout, buttons, mobile and desktop)

Read these before you touch any file in `src/ui/` or any CSS. Keep them true. When the user agrees a new UI rule, add it here in the same step.

**Screen order (top to bottom)**
1. Tabs, if the screen has them (heroes, settings).
2. Main content first: the grid, the list or the map. The thing the player came for is at the top.
3. Short info lines (space, gold, counts). Keep long descriptions short.
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

**Notices and going back**
- A small notice (`ui/toastStack.ts`, called with `context.notify`) shows at the top centre of the stage for 3.5 s. It ignores the pointer, so it never blocks a button or a building. Never put a notice at the bottom, where the buttons and the town hints are.
- Notices stack (up to 3) and are not removed when a panel closes or redraws. Send one for events the player did not start: a hero level-up, a finished craft, a finished sale. Do not open a window for them.
- Escape and Back go back one screen at a time. A sub screen (a crafter inside the Workshop) hands its back action to `enterSubScreen(goBack)`. Escape runs it first and closes the panel only from the main screen. An open dropdown list takes the first Escape.
- The Back or Leave button of every panel and sub screen is in the sticky `panel-footer`, never at the end of a long list.

**Mobile and desktop**
- Mobile first, for a modern phone in portrait: a Pixel 9 (about 412x915) and the current iPhones (about 393x852 to 430x932). Check every change at 412x915 and at 1280x720 (`npm run shot -- <url> '<steps>' 412 915`). Do not squeeze a screen for a small old phone such as 360x640: no hidden text, no tiny pictures and no cut padding to save height. A screen that is taller than the phone scrolls, and its footer stays in view.
- Every action works with touch. No information only on hover (a `title` is an extra, not the only place).
- Touch targets are about 44 px high. Tile grids use a fixed column count that fits a phone about 390 px wide (2 for big tiles, up to 6 for small tiles).
- No sideways scroll. Wrap chips and buttons into rows.
- A panel is at most 820 px wide. The world map panel is full screen.
- Use the shared classes (`panel-body`, `list`, `list-row`, `tile-grid`, `tab-row`, `hero-choice-row`, `status-row`, `panel-footer`) before you write a new one.

**Where things live**
- Gold and the local date and time are on the stage, in the top right corner. Pixi.js draws them over the town, the battle and the castle (`render/hud/stageHud.ts`, fed by `app/stageHudPresenter.ts`). Gold that comes in bumps the panel and floats a "+" beside it. A panel covers the stage, so a screen that deals with gold shows it again as an info line.
- The Dungeons panel has no team strip. The hero health shows in the fight screen and the run report.
- Nothing else sits in the top corners of the stage: the town title is top left, the castle Leave button is under the gold in the top right.
- Text goes through `t()` in both languages. Colours come from `theme.css`.

**Before you finish a UI task**
- Ask: "What moves when a timer fires or a sale ends here?" The answer must be: nothing.
- Say clearly if you did not look at the screen in a browser.

**Selectable things (raised, never hollow)**
- Every thing the player can click or choose (crafter tile, hero choice, monster tile) is raised: use `--raised-shadow` from `theme.css` and a `wood-600` background. Hover is `wood-500`. A chosen or active one uses `--raised-selected-shadow` (gold frame). Do not use the dark inset look (`leather` with an `ink` inset) for a thing the player can click. That look is only for info cards and empty slots.
- Leave 4 to 6 px below a raised thing for its hard shadow.

**Menu badges and pop-ups**
- One badge style (`.bar-badge`) in the corner of a menu button. Yellow with a number is activity (fights, crafts). Red with a mark is the full backpack. Add new alerts to this style.
- A report or summary window opens by itself only when the player is on the battle screen. Everywhere else it waits for a click.

**Dungeon screen**
- The Fight button and the dungeon row open the same screen (`ui/dungeonModal.ts`): picture, monster tiles, hero choice, Fight button. It must fit one screen with no scroll at 412x915 and 1280x720.

**Workshop crafter list**
- One screen, no scroll, on desktop and phone. The panel takes the full height (`.panel:has(.crafter-list-body)`), the sections share it, the tiles share each section.
- A crafter tile is raised (light top and left edge, dark bottom and right edge, hard shadow). A crafter with a finished craft has a gold frame and a big Collect button. The frame and button stay still. Clicking the tile collects the item and opens the summary (`ui/craftCollectSummary.ts`).
- On a phone the Weapons and Armour sections stay: a title and one row of three tiles for each. The experience bar in a tile is a small mark (70% wide, 6 px high), and the tile title is 14 px so that "Armoursmithing" fits.
- The picture in a tile has the same size in every state, and the status area has a fixed `min-height`, so a craft that finishes moves nothing.



## The town (Pixi.js)

- The town fills the whole stage area on a phone and on a wide window (`stage.setLayout('fill')`). The height is 270 logical pixels. The width follows the shape of the screen, from 170 to 640 logical pixels. The battle and the castle keep the framed 480x270 picture (`'fixed'`).
- Everything on the town scene is drawn by Pixi.js, not by DOM: building signs and tap areas (`render/town/townSigns.ts`), the arrows, the area name and the hint (`townInterface.ts`), the mill timer and Collect button (`townMillStatus.ts`), the speech bubbles, and the guide arrow for a new player (`townGuide.ts`). Menus, panels and modals stay DOM.
- Text on the stage uses `render/uiText.ts`. It draws at screen resolution, so letters stay sharp, and it takes its fonts from the same CSS variables as the menus.
- The town scrolls freely: drag with a finger or the mouse, the wheel, the arrow keys or the arrow buttons.
- `app/townPresenter.ts` gives the town its words (sign names, hint, mill timer) from the game state and the language. `render/` never imports `ui/` or the state.
- Test the town with `npm run shot` at about 360x640 and 1512x772. The tool can tap, drag and hover with the real mouse.
