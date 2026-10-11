---
name: art-change
description: Use when you add or change Emberforge sprites, hero or creature art, backdrops, town or castle art, spell effects, animation, spell visuals or the spell gallery. Loads the pixel-art rules and runs the render, inspect, fix loop with headless tools.
---

# Art and animation change

Follow the rules in `pixel-art-rules.md` (this folder): stage resolution, palette, sprites, fonts, art preloading and spell visuals. Read it first. Hero art direction is in the memory note `hero-art-direction` (WC3 style, European heroes).

Keep these project rules:
- Draw art in code. Use only colours from `render/palette.ts` (add a colour there first).
- Cache every drawn sprite and texture. Create no objects in the per-frame loop.
- Reuse the shared effects code (`render/battleEventEffects.ts`, `render/battleParticles.ts`, `render/floatingText.ts`, `render/spellEffects/`) for hit flashes, damage numbers and particles. Do not code them again for each spell.
- A new kind of art that a panel builds on open must join the preloader or use a cache.

## Render, inspect, fix

1. **Render it.** Pick the tool by what you changed, and look at the result in context, not only alone:

   | You changed | Look at it first | Then look at it in the fight |
   |---|---|---|
   | A spell or effect (`spell-visuals.json`, `render/spellEffects/`) | Spell gallery: `npm run gallery`, then `shot` and click the spell. Frame strip: `npm run animation -- <spellId>` | Battle sim with a hero of that class, paused at the cast time (see below) |
   | A creature or monster sprite | `npm run sprites -- creatures` (contact sheet) | Battle sim with `creep=<monsterId>`. The monster record must exist in `data/monsters.json` first |
   | A hero sprite, pose or attack animation | `npm run sprites -- heroes` | Battle sim with `class=<class>`: windup, hit and recoil, and the ranged poses |
   | A backdrop | `npm run sprites -- backdrops` | Battle sim (it draws the backdrop behind the fight) |
   | An item, material, dungeon or spell icon | `npm run sprites -- items` (or `materials`, `icons`, `sets`, `spellicons`) | The real game with `npm run shot`: backpack, equipment, workshop and spells screens at phone and web size |
| Town, castle or a menu look | `shot` on the game | Same, at phone and web size |

   Battle sim: start `npx vite --port 5190`, then `npm run shot -- 'http://localhost:5190/battle-sim.html?class=archer&level=5&gear=magic&creep=wolf&count=1&seed=3' '[{"wait":1500},{"eval":"battleSim.jumpTo(1.2)"},{"shot":"cast"}]' 1280 720`. Use `localhost`. The page params, `at=<seconds>` and `battleSim.jumpTo` are in `docs/balance/battle-sim.md`. To find the cast or hit moment, read `castStart` and `attackStart` in `report.actionEvents`. A background tab gets no animation frames, so a fight never advances there. Use `shot`.
2. **Make it repeatable.** Use fixed waits, a fixed seed and the same scenario for each run (the battle sim takes `seed`, `class`, `level` and `creep` in its URL). Then two screenshots can be compared.
3. **Inspect the image yourself** with the image reader. Also compare with the screenshot from before your change, and check the intended design: frame order, timing, position, scale, transparency, looping, pixel-art consistency. A pixel difference alone only catches regressions. It cannot tell if a spell looks exciting or an icon looks good, so you must look.
4. **Fix and render again.** Repeat until it is right.
5. For a spell animation, keep the spell gallery working for the new effect kind. Show the user the gallery page and the screenshots from the gallery and from the battle sim.
6. Stop the dev server. Run `npm run check`.
7. Do not say the work is done until you have looked at the new image. If you could not look, say so.

Follow the browser safety rules in `CLAUDE.md`.
