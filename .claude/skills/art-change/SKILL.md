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

1. **Render it.**
   - Sprites: `npm run sprites -- heroes|creatures|backdrops`. It writes a contact sheet to `out/art/`.
   - Spell animation: `npm run animation -- <spellId>` (for example `warrior.cleave`), or one effect (`impact:steel-cleave:steel`).
   - Stage, gallery or anything that moves: start `npm run dev`, then `npm run shot` against the spell gallery (`npm run gallery`), the battle sim (`npm run battlesim`) or the game. A background tab gets no animation frames, so a fight never advances there.
2. **Make it repeatable.** Use fixed waits, a fixed seed and the same scenario for each run (the battle sim takes `seed`, `class`, `level` and `creep` in its URL). Then two screenshots can be compared.
3. **Inspect the image yourself** with the image reader. Also compare with the screenshot from before your change, and check the intended design: frame order, timing, position, scale, transparency, looping, pixel-art consistency. A pixel difference alone only catches regressions. It cannot tell if a spell looks exciting or an icon looks good, so you must look.
4. **Fix and render again.** Repeat until it is right.
5. For a spell animation, keep the spell gallery working for the new effect kind. Show the user the gallery page and the screenshot.
6. Stop the dev server. Run `npm run check`.
7. Do not say the work is done until you have looked at the new image. If you could not look, say so.

Follow the browser safety rules in `CLAUDE.md`.
