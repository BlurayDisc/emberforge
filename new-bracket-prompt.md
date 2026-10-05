# Prompt: add a new bracket (town and levels)

Reusable prompt. Fill in the parameters, then paste everything below "Prompt" into a new session. Last used for: bracket 2 (Barrowgate, levels 11-20).

## Parameters

Take the town, region, families and boss from the table in `design.md` section 9.

| Name | Meaning | Example (bracket 2) |
|---|---|---|
| `N` | Bracket number, also the material tier | 2 |
| `FIRST` | First level, `10 x (N - 1) + 1` | 11 |
| `LAST` | Last level, `10 x N`. It is the new level cap. | 20 |
| `TOWN` | Town name and id | Barrowgate (`barrowgate`) |
| `REGION` | Region and biome | Barrow Downs (`barrow`) |
| `FAMILIES` | Monster families | skeletons, wights, clay golems |
| `BOSS` | Boss of the bracket | Barrow Lord |
| `PREVIOUS_BOSS` | Boss that opens the town | Goblin Chief |
| `NEXT_TOWN` | Town of the next bracket (for lore links) | Mirewatch (marshes) |
| `PARTNER_LEVEL` | Partner level in the boss scenario, `LAST - 3` | 17 |

## Prompt

````markdown
# Task: Add bracket N, the town TOWN (levels FIRST-LAST)

Read `CLAUDE.md`, `design.md` (all of sections 4, 4b, 5, 6, 8, 9), the memory notes, and every `CONTEXT.md` before you start. Use the glossary words: Company, Run party, Bracket, Tier, Affix, Quality. Do not commit. Work on `main`. Do not write unit tests.

## Goal

Make bracket N (levels FIRST-LAST) playable end to end: a new town, new dungeons with a boss, tier N materials and items, spells for the new levels, a new XP table, and lore. It must feel like the earlier towns, with the same balance targets. The balance we set for the earlier brackets is the law. Do not weaken a target to make a number pass. Change the data in `data/` or the preset files in `tools/balance-sim/presets/`. Do not change simulator code.

Use the previous bracket as the pattern. Open its towns, dungeons, monsters, materials, recipes and i18n keys, and copy the shape, not the numbers.

## Step 0: Plan first (stop and show me)

Write a short plan and wait for my OK before you edit files. The plan lists:
1. The dungeon list (id, name, level, monsters, rare monster, set material, unlock chain).
2. The tier N material and base item list.
3. The new level cap, the new XP table shape, and the spell schedule for levels FIRST-LAST.
4. Every open question you found (list them, with a recommendation for each).

## Part 1: Level cap and progression

- Raise `levelCap` in `data/balance/progression.json` to LAST.
- Extend `experienceToNextLevelByLevel` and `normalKillExperienceByHeroLevelThenMonsterLevel` as absolute numbers (no formula, no gap factor). Keep the method of the earlier brackets: the kills to level in the best dungeon stay in the 5-7 range, with no jump between levels. Each lower monster level adds about 1.5 kills. Boss XP is x5 and rare XP is x3.
- Check the pace with `npm run scenarios -- experience`. Update the design.md "Level and gear balance" text and numbers.
- Add a `learnCostAnchors` anchor in `data/balance/spells.json` for the new levels, from `npm run scenarios -- economy`. The validator fails without it. The price must stay under 65% of the solo hero income.
- Check `regenSecondsToFullAtMaxLevel` and the recovery rules. Keep the straight-line growth. Say what you changed.

## Part 2: Town and world

- Add TOWN to the town data (`data/towns.json` may already hold the map position, biome and levels). Add everything else it needs: town buildings in `data/buildings.json` (workshop, merchant, tavern, academy, dungeon board), the town scene art (`render/townGroundArt.ts`, `render/buildingArt.ts`, `render/battleBackdrops.ts` for the biome), the town labels, and the travel rules (time = 2 s + 1 s per bracket crossed, the town opens when PREVIOUS_BOSS is beaten).
- Follow the UI rules in CLAUDE.md for any screen you touch (no dynamic movement, footer buttons, mobile first).
- Region: REGION. Monster families from design.md section 9: FAMILIES. Boss: BOSS.
- Check the class Hiring lock table. If a class unlock says "for now", decide with me in the plan.

## Part 3: Dungeons and monsters

Follow section 9 rules exactly:
- 6-8 dungeons. Levels rise by at most 2 per step (a step of 1 only at the end). The last dungeon is the boss dungeon at level LAST, for exactly 2 heroes (`minimumPartySize` 2). Use the same shape as the previous bracket, shifted by 10 levels.
- Two dungeons open at the start of the bracket, so the player has a choice and the first-dungeon materials are easy to get.
- 1-3 monster families for each dungeon, 1 rare monster for each normal dungeon. Every dungeon has its own monsters. A monster id and a sprite key appear in one dungeon only.
- Draw each new creature in `render/creatureArt.ts` with a new sprite key. Cache it. Use only colours from `render/palette.ts` (add a colour there first if needed).
- Monster stats come from `data/balance/monster-scaling.json`. Do not copy the earlier bracket stats. Scale them so the targets in design.md section 8 hold.
- The boss fight has the same design as the earlier bosses: a boss plus add monsters, about 5 times the length of a normal fight. Give BOSS a spell from `monster-spells.json`.
- Each dungeon has `minimumHeroLevel` = monster level and `recommendedMaxLevel`.
- Add the sounds for new monsters and armour types in `data/audio/sound-effects.json`.

## Part 4: Materials, items and crafting

- Add tier N materials (bracket rule: tier N drops only from bracket N monsters). Main materials: Ore, Wood, Hide, Cloth, Gem. One set material for each dungeon after the first ones of the bracket. Base materials drop only in the first dungeons of the bracket. Every later dungeon drops exactly one set material. Two dungeons share at most 1 crafting material. Set material sell price rises with the dungeon level.
- Add tier N base items, recipes and set recipes for all slots and all 7 classes (item level inside FIRST-LAST). A recipe uses one tier only. Recipes are locked by crafter level. Extend crafter levels so every recipe is craftable at crafter level LAST.
- Add affixes for the new item levels in `data/affixes.json`. Add the Unique items for the bracket (2 per bracket).
- Keep the Defence curve: `armour / (armour + 50 + 10 x attacker level)`, with the class bands (Low, Mid, High, Wall) from design.md. Tier N armour values must keep each class in its band at level LAST. Check them against the table in design.md. If a class is out of band, fix it with data and say so in your report.
- Keep the sell value rules and the upgrade factor. Check with `npm run scenarios -- economy`.
- Add i18n keys for every new name in both `data/i18n/en.json` and `data/i18n/zh.json`.

## Part 5: Hero abilities

Follow the Warrior blueprint (memory note `spell-rank-blueprint-warrior`) for all 7 classes:
- New spells stop at the Ultimate. Ranks carry on after it. Check the schedule in `spells.json` for levels FIRST-LAST. Do not add filler. If a class has no new spell or rank in this bracket, check the "every 2-3 levels" rule and propose one in the plan (a rank, not a new family).
- Reserved spells stay reserved (`reservedFor: "specialisation"`). Do not delete them.
- Make sure every spell up to LAST is learnable at the Academy, that the loadout rules still work, and that each spell has a look in `data/spell-visuals.json` and sounds in `sound-effects.json` (the validator needs them up to the cap).
- Any new spell animation: run `npm run gallery`, open it, take a screenshot, show me the page. Do not leave the dev server running.
- Promotion (level 20 and level 50): if the command and screen are not built, do not build them here. Tell me in the report what is missing.
- Keep each class identity (see design.md 4b).

## Part 6: Balance (the key part)

Use the same targets as design.md section 8, with L = hero level FIRST-LAST:

| Case | Target |
|---|---|
| Level L, Magic gear (ilvl L) | win >= 90%, party HP lost 30-40%, duration within 15% of the curve |
| Level L, Common gear | win 60-80% |
| Level L, Rare gear | win >= 98%, duration <= 80% of the curve |
| Level L + 26, gear ilvl L + 26, monsters Lv L | win >= 99%, HP lost <= 10% |
| Level L, monsters Lv L + 5 | win <= 50% |
| Boss, level L, Rare gear | win 70-90% |
| Boss, level LAST + level PARTNER_LEVEL, gear floor | about 65% |
| Boss, same party, normal crafted gear | about 85% |
| Boss, one hero, no gear | 0% |

- Update the preset files in `tools/balance-sim/presets/` (level range, partner levels, targets). Do not change the code.
- Run `npm run balance` and `npm run scenarios` (all five). Fix numbers in `data/` until every target holds. Resource pools must still dip as in design.md (`resource-use`): about 30-80% in a normal fight and 5-25% in the boss fight.
- Check that all earlier brackets did not change. Show a before and after table for them.

## Part 7: Lore

- Write a short lore text for TOWN and REGION: who lives in the town, what the threat is, what BOSS is, how it links to PREVIOUS_BOSS and to NEXT_TOWN. Put it in design.md (inside section 9 or a short new section), and the player text in the i18n files (town description, dungeon names and descriptions, boss name, monster names).
- Dungeon names: one place and one mood for each. Keep the tone of the earlier towns.
- Player text goes through `t()` with keys in both languages. Chinese uses full-width punctuation.

## Part 8: Save and rules

- If you change the shape of saved data, raise `CURRENT_SAVE_VERSION` and add one migration in `systems/save/migrations.ts`. A player with a hero at the old cap must load, keep playing, and now get XP.
- Keep determinism: all random from `Random` in `kernel/random.ts`, own stream with `fork('name')`.
- Keep the architecture rules. Do not weaken `tools/check-boundaries.ts`.
- Files under about 200 lines. No `utils.ts`. No em dashes anywhere (code, data, docs, i18n). Use a normal hyphen.

## Part 9: Tools and docs

- Add steps to `tools/smoke-play.ts`: travel to TOWN, clear the first dungeon, craft a tier N item, kill BOSS with a 2-hero party, load an old save.
- Update `design.md` in the same step as each rule change (level cap, XP, dungeon table, materials, items, balance numbers, lore). Update `CLAUDE.md` only if a rule changes.
- Update the validator if a new rule needs a check. Run `npm run validate` after every `data/` edit.
- At the end, update the "Last used for" line in `new-bracket-prompt.md`, and fix any step in this prompt that was wrong or missing.

## Execution order (subagents)

- Step 0 (the plan) runs in the main session. Do not start any agent before I approve the plan.
- **Main session, in series:** Part 1 (cap and XP), Part 3 (dungeons and monster data), Part 4 (materials, items, recipes), Part 6 (balance), Part 8 and Part 9. These parts need the numbers of the step before them. Balance changes shared `data/` files, so only the main session tunes numbers.
- **Subagents, in parallel, after I approve the plan:**
  1. Town art: Part 2 art only (`townGroundArt.ts`, `buildingArt.ts`, `battleBackdrops.ts`, town labels).
  2. Creature art: the sprites for the monster list in the plan (`creatureArt.ts`, new colours in `palette.ts`).
  3. Spell looks and sounds: Part 5 entries in `spell-visuals.json` and `sound-effects.json`, and the gallery check.
  4. Lore and translations: Part 7, after the names are final. It writes the lore text and the `zh.json` keys.
- Give each agent its own files and its own list of keys. Two agents never edit the same file. The main session merges `en.json`, `zh.json` and `design.md`.
- Each agent follows CLAUDE.md, runs `npm run validate`, and reports the files it changed and anything it did not verify.
- When all agents finish, the main session runs `npm run check` and the browser check. A subagent report is not proof: read the changed files before you say a part is done.

## Done when

1. `npm run check` passes.
2. `npm run scenarios` meets all targets for levels FIRST-LAST, and all earlier levels are unchanged.
3. A new game plays from level 1 to level LAST: fight, loot, craft, equip, learn spells, travel to TOWN, beat BOSS. A reload keeps the exact state.
4. I can see TOWN in the browser at about 360x640 and about 1280x720.
5. Your final report says what you did, what you did not verify (for example any screen you did not look at in a browser), and what is left.

Work in small steps. Finish one part end to end before the next. Run `npm run check` after each part.
````
