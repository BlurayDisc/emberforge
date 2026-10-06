# Pixel-art rules

- Logical resolution 480×270. The stage scales to fill the window, so the scale can be a fraction. `image-rendering: pixelated` keeps the pixels hard-edged.
- Textures use `NearestFilter`, no mipmaps. The renderer has antialiasing off.
- Put sprites and the camera on whole-pixel positions. No sub-pixel movement.
- Use colors from `render/palette.ts` (stage) and `ui/styles/theme.css` (menus) only. Add a color there first.
- Keep one pixel scale on the stage. Heroes are drawn in code in `src/heroArt/` (battle sprite: `battle/<class>Art.ts`, full-body portrait: `portrait/<class>Figure.ts`, shared head and palette files next to them). Each class has its own silhouette and pose. Change a class in both files so the sprite and the portrait match. Monsters are in `render/creatureArt.ts`, backdrops in `render/battleBackdrops.ts`, the town in `render/townGroundArt.ts` and `render/buildingArt.ts`. Menu pictures are in `ui/iconArt.ts` and `ui/portraitArt.ts`. The full-body portrait frame (backdrop and border) is in `ui/fullBody/`.
- Cache every drawn sprite and texture. Do not create objects in the per-frame loop. Reuse them. A hero looks the same in the portrait and in battle, because both use `pickHeroAppearance`.
- Fonts and assets are bundled in the repo. No CDN. Fonts from `@fontsource`: Jacquard 12 (titles, signs), Pixelify Sans (text), Fusion Pixel 12px SC (English and Chinese text). Atkinson Hyperlegible supplies only the digits of the Chinese version. Chinese text uses full-width punctuation.
- Menu frames use notched box-shadow outlines (no border radius). Buttons press down 2 px. Keep that look in new components.
- Building labels are DOM text on top of the canvas (`ui/townOverlay.ts`). Their size follows the stage scale (`--stage-scale`).

