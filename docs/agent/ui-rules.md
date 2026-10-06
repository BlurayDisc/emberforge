# UI rules (layout, buttons, mobile and desktop)

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

**Workshop crafter list**
- One screen, no scroll, on desktop and phone. The panel takes the full height (`.panel:has(.crafter-list-body)`), the sections share it, the tiles share each section.
- A crafter tile is raised (light top and left edge, dark bottom and right edge, hard shadow). A crafter with a finished craft has a gold frame and a big Collect button. The frame and button stay still. Clicking the tile collects the item and opens the summary (`ui/craftCollectSummary.ts`).
- The picture in a tile has the same size in every state, and the status area has a fixed `min-height`, so a craft that finishes moves nothing.

**Known gaps** (older screens that do not follow the footer rule yet): Leave buttons in Mill, Tavern and Bank are the last element of the body but not sticky. Move them to `panel-footer` when you touch those screens.

