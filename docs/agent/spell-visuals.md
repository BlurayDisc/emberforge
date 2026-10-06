# Spell visuals

- Spell looks are in `data/spell-visuals.json` (theme, cast, projectile, impact, buff, debuff, icon). The art is drawn in code in `src/render/spellEffects/`. The art ids are listed in `content/spellVisuals.ts`.
- The spell gallery (`npm run gallery`) reads `SPELL_VISUALS`, so a new spell with a visual shows in it with no extra step. A new art id, a new theme or a new kind of effect (for example a new status) may need a change in `tools/spell-gallery/main.ts` too. The gallery is a dev tool. `vite build` does not include it.
- When you add or change a spell animation: follow the Visual validation loop in CLAUDE.md. Start the gallery (`npm run gallery`), open the new spell in the browser and take a screenshot. Keep the gallery working for the new effect kind. Do not leave the dev server running when you finish.

