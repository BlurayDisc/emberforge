# Runs, reports and crafters

- A run is one fight. A dungeon hosts one run. A hero is in one run. `state.dungeonRuns` holds the active runs.
- Every run command takes the run number: `completeRunCommand(runNumber)`, `stopDungeonRunCommand(runNumber)`. Completion re-plans the same seeded fight, so the result matches the screen. It heals the heroes, rolls loot, adds a report to `state.reports` and clears the dungeon on the first win.
- `app/runPlayback.ts` keeps one player for each run. Only the run in focus (`ui/runFocus.ts`) draws on the stage. Reports stay until the player reads them (`ui/notifications.ts`).
- Dungeons are locked until the one in `unlockAfter` is cleared. Recipes are locked by crafter level (`state.crafters`, level 1-100). Every craft gives crafting XP.
- Gold sinks: hero hiring, the crafter fee and spell training at the Academy. A hero spell loadout (`learnedSpellIds`, `equippedSpellIds`, `equippedUltimateId`) is part of the hero, so it cannot change while the hero is in a run. The merchant never sells loot materials. Numbers are in `data/balance/economy.json`.
- Item and recipe details open in modals (`ui/modal.ts`, `ui/itemModals.ts`). The hero equipment screen is `ui/panels/heroes/equipmentScreen.ts`.
- Time rules: commands that depend on the clock take `nowMs` as the last argument. Systems never read the clock. Selling and crafting are `state.jobs` (`collectFinishedJobsCommand`, run by `app/jobTicker.ts`). Hero health is stored with `healthAsOfMs` and worked out by `systems/recovery`. UI timers use `ui/liveUpdate.ts`.
- Layout is mobile first: the run bar is above the battlefield and the battle log is below it.

