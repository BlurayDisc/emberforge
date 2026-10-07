# Battle sim page (`npm run battlesim`)

A dev page like the spell gallery. A dummy hero (or two) fights any creep in the real-time battle, so you can watch the fight and check the numbers. It is not part of `vite build`.

- Start: `npm run battlesim` (opens `/battle-sim.html`). Files: `battle-sim.html` and `tools/battle-sim/`.
- It runs `simulateRealtimeBattle` and plays the report with the same battle view and event presenter as the game (`render/battleView.ts`, `app/battleEventPresenter.ts`, `app/battleLogEntries.ts`).

## Controls (stable ids)

| Id | What |
|---|---|
| `sim-class`, `sim-level`, `sim-gear` | Hero class (all 7), level 1-10, gear: `none`, `weapon` (starting weapon only), `common` (Common best gear), `magic` (Magic best gear). Gear and spells use the balance sim code (`equipBestGear`, `learnSpellsFor` with the best spells). |
| `sim-second-hero`, `sim-second-class`, `sim-second-level` | A second hero (a boss needs two). The two boxes appear when the check box is on. |
| `sim-creep`, `sim-creep-level`, `sim-creep-count` | Any monster (normal, rare, boss), its level (follows the hero level until you edit it), count 1-3. |
| `sim-seed`, `sim-random-seed` | Battle seed and a random seed button. |
| `sim-start`, `sim-pause` | Start / Restart, Pause / Resume. |
| `sim-speed-1`, `sim-speed-2`, `sim-speed-4` | Speed 1x, 2x, 4x. Pause freezes units, effects, projectiles and damage numbers. |
| `sim-monte-carlo`, `sim-monte-result` | Runs 20 battles (seeds from the seed field upward) and shows win rate, average duration, average HP lost of the heroes. |
| `sim-lang-en`, `sim-lang-zh` | Language. Note: it uses the game language setting. |

Panels: `sim-hero-stats` and `sim-creep-stats` (HP, damage, Defence or armour, resistance, attack time, crit, move speed, range, spells), `sim-live` (health bars), `sim-clock`, `sim-log` (hit, crit, heal, cast, dodge, defeat), `sim-summary` (winner, duration, HP lost, damage, damage per second and healing for each unit).

## Setting the page from the address

`?class=archer&level=5&gear=magic&second=priest&secondLevel=4&creep=wolf&creepLevel=5&count=2&seed=7&speed=2&start=1&at=2.4`

`start=1` starts the battle. `at=<seconds>` starts it and shows it paused at that battle time (an exact moment, run with fixed steps). `window.battleSim` also has `start()`, `jumpTo(seconds)`, `togglePause()`, `setSpeed(n)`, `runMonteCarlo()`. In a `{"eval": ...}` step make the expression return a value (`battleSim.jumpTo(2.4)` does).

## Screenshots

A background browser tab gets no animation frames, so use `npm run shot`. Start `npx vite --port 5190` first (use `localhost`, not `127.0.0.1`). Stop the server when done.

```
npm run shot -- 'http://localhost:5190/battle-sim.html?class=archer&level=3&creep=cave-rat&count=1&seed=3' '[{"wait":1500},{"eval":"battleSim.jumpTo(0)"},{"shot":"sim-start"},{"eval":"battleSim.jumpTo(1.2)"},{"shot":"sim-run"},{"eval":"battleSim.jumpTo(2.5)"},{"shot":"sim-arrow"}]' 1280 720
npm run shot -- 'http://localhost:5190/battle-sim.html?class=mage&level=5&creep=goblin&count=2&seed=4&at=2.5' '[{"wait":1500},{"shot":"sim-mobile"}]' 412 915
npm run shot -- 'http://localhost:5190/battle-sim.html?class=warrior&level=3&creep=cave-rat&seed=3&start=1&speed=4' '[{"wait":2500},{"shot":"sim-fast"},{"click":"Run 20 battles"},{"wait":2000},{"eval":"document.getElementById(\"sim-monte-result\").textContent"}]'
```

To find a good moment, print `report.actionEvents` for the setup (`attackStart`, `castStart`, `death`) and use their times. Shots go to `out/shots/`.

## How the stage plays a report

- `battleView.setRealtimeBattle(report)` after `showUnits`, then `setBattleTime(seconds)` each frame. The caller owns the battle time, so speed and pause are the caller's choice. `setTimeScale(n)` gives the effects the same speed (0 = pause). `advanceTime(seconds)` steps the effects without a frame.
- Positions come from the tracks, linearly interpolated between ticks. Field x maps to the stage width (44 px margins), field y to the ground depth (draw order by feet y). A side is drawn a little apart from the body circle (`render/fieldProjection.ts`) because sprites are wider than the circles.
- The pose comes from the action events (`render/unitActionWindows.ts`, `render/unitMotion.ts`): a hop while moving, a pull back during the windup and a lunge at the hit (a short draw and recoil for a ranged attack), a raise and a glow while casting. Sprites are mirrored by the facing. All offsets are whole pixels. There are no run or attack frames.
- Damage, flashes, spell effects and sounds come from the old events (`presentBattleEvent`). A ranged hit shows when its projectile lands.

## Shots of the real game

Use a built copy, not `npm run dev`: the dev server reloads the page when a data file changes, which ends a fight in the middle.

1. `npx vite build --outDir /tmp/emberforge-dist --emptyOutDir` then `npx vite preview --outDir /tmp/emberforge-dist --port 5180`. Use `localhost`. Stop the server at the end.
2. `tools/shot-save-fixture.ts` prints a save: `npx tsx tools/shot-save-fixture.ts <dungeonId> <class:level> [<class:level>] [--run]`. Heroes wear the best Common gear and the best spells. Every dungeon before the chosen one is cleared. `--run` puts the run in the save, but the run then plays from the page load, so you miss the start. Without `--run`, start the run from the dungeon screen.
3. In `npm run shot`: open the app, then `{"eval":"localStorage.setItem('emberforge.save', <save text>); localStorage.setItem('emberforge.settings', '{\"language\":\"en\"}'); location.reload(); 1"}`, wait 3000, tap the Dungeons button (1280x720: `[640,686]`, 412x915: `[70,893]`), wait 1200, click the dungeon row (an `eval` that clicks the text leaf of the dungeon name), pick heroes for a boss (click the hero names), then click the `Fight!` button inside the dungeon window and take shots with short waits. The Dungeons button has a number badge when a run is active, so click it by position, not by text.
4. The run ends about 1.5 s after the fight and the report opens by itself.
