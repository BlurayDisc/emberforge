# Pixel-art rules

- Logical resolution 480×270. The stage scales to fill the window, so the scale can be a fraction. `image-rendering: pixelated` keeps the pixels hard-edged.
- Textures use nearest-neighbour scaling (`scaleMode = 'nearest'` in Pixi.js), no mipmaps. The renderer has antialiasing off. Pixi.js runs with `roundPixels`.
- Put sprites and the camera on whole-pixel positions. No sub-pixel movement.
- Use colors from `render/palette.ts` (stage) and `ui/styles/theme.css` (menus) only. Add a color there first.
- Keep one pixel scale on the stage. Heroes are drawn in code in `src/heroArt/` (battle sprite: `battle/<class>Art.ts`, full-body portrait: `portrait/<class>Figure.ts`, shared head and palette files next to them). Each class has its own silhouette and pose. Change a class in both files so the sprite and the portrait match. Monsters are in `render/creatureArt.ts`, backdrops in `render/battleBackdrops.ts`, the town in `render/townGroundArt.ts` and `render/buildingArt.ts`. Menu pictures are in `ui/iconArt.ts` and `ui/portraitArt.ts`. Crafter headshots (all human) are 64x64 in `ui/crafterPortrait/`, one file per trade, with a shared painter and face; view them with `npm run sprites -- crafters`. The full-body portrait frame (backdrop and border) is in `ui/fullBody/`.
- Cache every drawn sprite and texture. Do not create objects in the per-frame loop. Reuse them. A hero looks the same in the portrait and in battle, because both use `pickHeroAppearance`.
- Fonts and assets are bundled in the repo. No CDN. Fonts from `@fontsource`: Jacquard 12 (titles, signs), Pixelify Sans (text), Fusion Pixel 12px SC (English and Chinese text). Atkinson Hyperlegible supplies only the digits of the Chinese version. Chinese text uses full-width punctuation.
- Menu frames use notched box-shadow outlines (no border radius). Buttons press down 2 px. Keep that look in new components.
- Building labels are DOM text on top of the canvas (`ui/townOverlay.ts`). Their size follows the stage scale (`--stage-scale`).

## Art preloading

- `drawingToImage` encodes each canvas to a data URL once (a `WeakMap` keyed by canvas). A cold browser needs over 600 ms for the first encodes, so never encode on a screen open.
- `app/townArtPreloader.ts` draws and encodes the art of one town (icons of its tier, crafter portraits, spell icons, dungeon backdrops, monsters, castle figures) in slices of 12 ms. `main.ts` runs it behind the loading screen (`ui/loadingScreen.ts`) before `mountApp`.
- Travel to a new town runs it again in the background. It first releases the icons of lower tiers (`releaseIconsBelowTier`) and the drawn backdrops and monsters (`releaseDrawnArt`). A released picture is drawn again when a screen asks for it.
- A new kind of art that a panel builds on open must join the preloader task list, or use a cache.

