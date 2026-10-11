# Pixel-art rules

- Logical resolution 480×270. The stage scales to fill the window, so the scale can be a fraction. `image-rendering: pixelated` keeps the pixels hard-edged.
- Textures use nearest-neighbour scaling (`scaleMode = 'nearest'` in Pixi.js), no mipmaps. The renderer has antialiasing off. Pixi.js runs with `roundPixels`.
- Put sprites and the camera on whole-pixel positions. No sub-pixel movement.
- Use colors from `render/palette.ts` (stage) and `ui/styles/theme.css` (menus) only. Add a color there first.
- Keep one pixel scale on the stage. Heroes are drawn in code in `src/heroArt/` (battle sprite: `battle/<class>Art.ts`, full-body portrait: `portrait/<class>Figure.ts`, shared head and palette files next to them). Each class has its own silhouette and pose. Change a class in both files so the sprite and the portrait match. Monsters are in `render/creatureArt.ts`, backdrops in `render/battleBackdrops.ts`, the town in `render/townGroundArt.ts` and `render/buildingArt.ts`. Menu pictures are in `ui/iconArt.ts` and `ui/portraitArt.ts`. Crafter headshots (all human) are 64x64 in `ui/crafterPortrait/`, one file per trade, with a shared painter and face; view them with `npm run sprites -- crafters`. The full-body portrait frame (backdrop and border) is in `ui/fullBody/`.
- Battle animation has no frame sheets. The archer, mage and priest have extra poses (`heroArt/heroPose.ts`: ready, charge, released, reload) that the stage swaps in around a shot: the string loosed and a new arrow, the hand empty and a new light. Melee units draw a slash arc (`render/weaponSlashArt.ts`) over the blow. The timing is in `render/unitMotion.ts`. View the poses with `npm run sprites -- poses`. A new class with a held spell or arrow adds its poses in its `heroArt/battle/` file and joins `CLASSES_WITH_POSES`.
- Cache every drawn sprite and texture. Do not create objects in the per-frame loop. Reuse them. A hero looks the same in the portrait and in battle, because both use `pickHeroAppearance`.
- Fonts and assets are bundled in the repo. No CDN. Fonts from `@fontsource`: Jacquard 12 (titles, signs), Pixelify Sans (text), Fusion Pixel 12px SC (English and Chinese text). Atkinson Hyperlegible supplies only the digits of the Chinese version. Chinese text uses full-width punctuation.
- Menu frames use notched box-shadow outlines (no border radius). Buttons press down 2 px. Keep that look in new components.
- Building labels are DOM text on top of the canvas (`ui/townOverlay.ts`). Their size follows the stage scale (`--stage-scale`).

## Art preloading

- `drawingToImage` encodes each canvas to a data URL once (a `WeakMap` keyed by canvas). A cold browser needs over 600 ms for the first encodes, so never encode on a screen open.
- `app/townArtPreloader.ts` draws and encodes the art of one town (icons of its tier, crafter portraits, spell icons, dungeon backdrops, monsters, castle figures) in slices of 12 ms. `main.ts` runs it behind the loading screen (`ui/loadingScreen.ts`) before `mountApp`.
- Travel to a new town runs it again in the background. It first releases the icons of lower tiers (`releaseIconsBelowTier`) and the drawn backdrops and monsters (`releaseDrawnArt`). A released picture is drawn again when a screen asks for it.
- A new kind of art that a panel builds on open must join the preloader task list, or use a cache.

## Spell visuals

- Spell looks are in `data/spell-visuals.json` (theme, cast, projectile, impact, buff, debuff, icon). The art is drawn in code in `src/render/spellEffects/`. The art ids are listed in `content/spellVisuals.ts`.
- The spell gallery (`npm run gallery`) reads `SPELL_VISUALS`, so a new spell with a visual shows in it with no extra step. A new art id, a new theme or a new kind of effect (for example a new status) may need a change in `tools/spell-gallery/main.ts` too. The gallery is a dev tool. `vite build` does not include it.
- When you add or change a spell animation: follow the loop in `SKILL.md`. Use the gallery (`npm run gallery`) as the page to open. Keep the gallery working for the new effect kind.
