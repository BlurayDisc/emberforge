# Balance (no unit tests)

- **Do not write unit tests.** Do not add a test framework or coverage tools. This is a personal game. Use tools instead: the balance simulator, the data validator and the smoke play script. When you add a command or a rule, add a step to `tools/smoke-play.ts`.
- Balance is checked by `tools/balance-sim/`. It runs many seeded battles for each dungeon, with and without crafted gear. It prints win rate, duration (against the target curve in design.md section 8) and HP lost.
- Run `npm run balance` after you change stats, formulas, items, affixes, monsters or XP numbers. Fix the numbers in `data/balance/`, then run it again.
- `tools/validate-data.ts` checks the JSON in `data/`. It fails on:
  - a monster drop whose material tier differs from the tier of the dungeon bracket (the bracket rule),
  - a base item that needs a material category that a tier does not have (so a recipe would mix tiers or fail),
  - a dungeon level outside its town bracket,
  - an unknown id or sprite key.
  Run `npm run validate` after you edit `data/`.
- Never put an em dash in `data/` files. Use a normal hyphen - instead.

