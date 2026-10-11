# UI rules (layout, buttons, mobile and desktop)

Keep these rules true. When the user agrees a new UI rule, add it here in the same step.

**Screen order (top to bottom)**
1. Tabs, if the screen has them (heroes, settings).
2. Main content first: the grid, the list or the map. The thing the player came for is at the top.
3. Short info lines (space, gold, counts). Keep long descriptions short.
4. Content that grows over time (stored materials, lists of results) is last, above the footer.
5. Footer row: the action buttons, always last, in the class `panel-footer` (sticky, so a short desktop window never hides it). Leave, Back, Cancel and Close are the first button, at the left. The main action (Fight, Collect, Equip, Repeat, Next) is last, at the right: give it the class `footer-action`. Links to another screen (for example "Upgrade ... at the bank") sit in the same footer, on the right. `.report-actions` and `.compare-actions` follow the same rule. Every footer button has the same width (up to 200 px, at most 42% of the row), so a row never mixes a wide and a narrow button.
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
- Escape, the X button and Back go back one screen at a time. A sub screen (a crafter inside the Workshop) hands its back action to `enterSubScreen(goBack)`. Escape runs it first and closes the panel only from the main screen. An open dropdown list takes the first Escape.
- The Back or Leave button of every panel and sub screen is in the sticky `panel-footer`, never at the end of a long list.

**Mobile and desktop**
- Mobile first, for a modern phone (2025 or newer) in portrait. The sizes are examples, not strict: a Pixel 10 is about 412x915 and current iPhones are about 393x852 to 430x932. Check every change at one such phone size and at 1280x720 (`npm run shot -- <url> '<steps>' 412 915`). Do not support small or old phones (for example 360x640): no hidden text, no tiny pictures and no cut padding to save height. A screen that is taller than the phone scrolls, and its footer stays in view.
- Every action works with touch. No information only on hover (a `title` is an extra, not the only place).
- Touch targets are about 44 px high. Tile grids use a fixed column count that fits a phone about 390 px wide (2 for big tiles, up to 6 for small tiles).
- No sideways scroll. Wrap chips and buttons into rows.
- A panel is at most 820 px wide. The world map panel is full screen.
- Use the shared classes (`panel-body`, `list`, `list-row`, `tile-grid`, `tab-row`, `hero-choice-row`, `status-row`, `panel-footer`) before you write a new one.

**Wide town view (setting, off by default)**
- Settings has a "Wide view" switch (`kernel/wideTownView.ts`, saved in `emberforge.settings`). On, the town view shows at least two pages (360 logical px), so one swipe crosses the whole town. On a narrow screen the stage gets less tall. Off, the stage fills the full height.

**Where things live**
- The top bar (`ui/topBar.ts`) is page layout above the stage, always visible, also in a fight and in the castle. It is the only place that shows the gold of the player, in one format (`createMoneyDisplay`). Do not show the player's gold anywhere else. A price (cost, fee, sell value) is not the gold of the player and stays where it is. With no menu open the bar shows the place name (town, castle or the dungeon of the fight), the local date and time, the gold, and the World and Settings buttons (icons, with a title and an aria label). With a menu open it shrinks to the menu title, the gold and the X button. A panel has no header of its own. A gold gain only flashes the colour of the number. A locked panel hides the X button.
- The bottom bar holds the other menu buttons: 7 buttons in two rows on a phone, 4 above 3. A new menu goes to the top bar only if it is a rare, global screen (World, Settings). Otherwise it needs a place in the bottom bar, and a third row is not allowed.
- The Dungeons panel has no team strip. The hero health shows in the fight screen and the run report.
- Nothing sits in the top corners of the stage except the area name of the town screen (top left). The castle Leave button is in the top right corner.
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

- The town fills the whole stage area on a phone and on a wide window (`stage.setLayout('fill')`). The height is 270 logical pixels. The width follows the shape of the screen, from 180 to 540 logical pixels (the whole town), so a phone shows one whole page and a very wide window shows bands at the sides. The battle and the castle keep the framed 480x270 picture (`'fixed'`).
- Everything on the town scene is drawn by Pixi.js, not by DOM: building signs and tap areas (`render/town/townSigns.ts`), the arrows, the area name and the hint (`townInterface.ts`), the mill timer and Collect button (`townMillStatus.ts`), the speech bubbles, and the guide arrow for a new player (`townGuide.ts`). Animals are touchable in the town and the castle (`render/animalPetting.ts`: hop, hearts, a call) and call rarely by themselves (`render/animalChatter.ts`). The villager lines come from `ui/townTalkFacts.ts` (facts of the save) and `ui/townTalkStories.ts` (town stories); a new line needs a key in both languages. Menus, panels and modals stay DOM.
- Text on the stage uses `render/uiText.ts`. It draws at screen resolution, so letters stay sharp, and it takes its fonts from the same CSS variables as the menus.
- The town has 3 pages (west, castle, east) of 180 logical pixels. Drag with a finger or the mouse, the wheel, the arrow keys and the arrow buttons all end on a page, centred in the view. One swipe moves one page. The town opens on the castle page. If a building does not fit a page, move the building in `data/buildings.json`.
- `app/townPresenter.ts` gives the town its words (sign names, hint, mill timer) from the game state and the language. `render/` never imports `ui/` or the state.
- Test the town with `npm run shot` at a modern phone size (about 412x915) and at 1280x720. The tool can tap, drag and hover with the real mouse.
