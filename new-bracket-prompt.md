# Prompt: add a new bracket (town and levels)

Reusable prompt. Every bracket has one balance file, `docs/balance/bracket-NN.md`, made from `docs/balance/_template.md`. Part A of that file (the targets) is the spec for the whole bracket. Part B (the actual numbers) comes from `npm run balance-report -- N` when that tool exists. Today Part B is a manual snapshot of `npm run scenarios` and `npm run balance`.

Status: not used yet. The next bracket to build is bracket 2 (Barrowgate, levels 11-20).

**TODO before the first use:** create the `npm run balance-report -- N` tool. It reads the balance simulator output and `data/`, and writes Part B of the balance file between the `generated` markers. It must not change the simulator code. As the first test, let it write Part B of `docs/balance/bracket-01.md`.

## How to use

**Interactive (recommended):** type `/new-bracket`. The skill in `.claude/skills/new-bracket/SKILL.md` asks you the questions, writes Part A of the balance file, waits for your approval, and then builds the bracket. It uses the rules in this file. You do not paste anything.

**Manual:** use the steps below if you want to run the prompt without the skill.

1. Open a new session in the Emberforge folder.
2. Copy one **paste block** from the examples below (bracket 2 or bracket 3), or fill in the empty one.
3. Paste the block, and then paste everything under "Prompt" (the part inside the markdown fence) right after it.
4. The agent writes Part A of the balance file and stops. You review it, change what you want, and say OK.
5. The agent builds the bracket. It stops again if it hits an open question.

## Parameters (the values you fill in)

Take the town, region, families and boss from the table in `design.md` section 9.

| Name | Meaning | How to get it |
|---|---|---|
| `N` | Bracket number, also the material tier | the next number after the last built bracket |
| `FIRST` | First level | `10 x (N - 1) + 1` |
| `LAST` | Last level, and the new level cap | `10 x N` |
| `TOWN` | Town name and id | `design.md` section 9, or `data/towns.json` |
| `REGION` | Region and biome | `design.md` section 9, or `data/towns.json` |
| `FAMILIES` | Monster families | `design.md` section 9 |
| `BOSS` | Boss of the bracket | `design.md` section 9 |
| `PREVIOUS_BOSS` | Boss that opens the town | the boss of bracket N - 1 |
| `NEXT_TOWN` | Town of the next bracket, for lore links | `design.md` section 9 |
| `PARTNER_LEVEL` | Partner level in the boss scenario | `LAST - 3` |

**Optional inputs.** Add any of these lines to the paste block when you have a view. If you leave them out, the agent proposes a value in A12 of the balance file.

| Optional input | Example |
|---|---|
| Number of dungeons | `DUNGEONS: 7, same shape as bracket 1` |
| Mood and theme notes | `MOOD: cold, quiet, bones and grave fog. No gore.` |
| Class unlock choices | `UNLOCKS: Barbarian moves to the second dungeon of this town` |
| Art direction | `ART: WC3 style, muted greens and greys, see hero-art-direction memory` |
| Things to keep out | `AVOID: no undead healers, no poison in this bracket` |
| Special mechanic | `MECHANIC: one monster family that ignores 20% of Defence (armourPenetration)` |
| Boss idea | `BOSS_IDEA: the Barrow Lord raises two skeleton adds every 30 s` |

### Paste block: bracket 2

```text
PARAMETERS
N: 2
FIRST: 11
LAST: 20
TOWN: Barrowgate (barrowgate)
REGION: Barrow Downs (barrow)
FAMILIES: skeletons, wights, clay golems
BOSS: Barrow Lord
PREVIOUS_BOSS: Goblin Chief
NEXT_TOWN: Mirewatch (marshes)
PARTNER_LEVEL: 17

OPTIONAL
DUNGEONS: 7, same shape as bracket 1 (two level 11 dungeons at the start)
MOOD: cold, quiet, bones and grave fog. No gore.
UNLOCKS: move the Barbarian unlock to a dungeon of this town
BOSS_IDEA: the Barrow Lord calls two skeleton adds, and a wound or weaken spell that fits the boss rules
```

### Paste block: bracket 3

```text
PARAMETERS
N: 3
FIRST: 21
LAST: 30
TOWN: Mirewatch (mirewatch)
REGION: Marshes (marsh)
FAMILIES: lizardfolk, bog wraiths, giant spiders
BOSS: Bog Hag
PREVIOUS_BOSS: Barrow Lord
NEXT_TOWN: Deepdelve (mines)
PARTNER_LEVEL: 27

OPTIONAL
DUNGEONS: 7
MOOD: wet, green, slow and dangerous
```

### Paste block: empty

```text
PARAMETERS
N:
FIRST:
LAST:
TOWN:
REGION:
FAMILIES:
BOSS:
PREVIOUS_BOSS:
NEXT_TOWN:
PARTNER_LEVEL:

OPTIONAL
```

## Prompt

````markdown
# Task: Add bracket N, the town TOWN (levels FIRST-LAST)

The PARAMETERS block above this text holds the values. Use them wherever this text says N, FIRST, LAST, TOWN, REGION, FAMILIES, BOSS, PREVIOUS_BOSS, NEXT_TOWN or PARTNER_LEVEL. Treat the OPTIONAL lines as my decisions. For anything I left out, propose a value in A12 of the balance file.

Read `CLAUDE.md`, `docs/balance/_template.md`, the balance file of the previous bracket, `design.md` (all of sections 4, 4b, 5, 6, 8, 9), the memory notes, and the matching files in `docs/agent/` (`architecture.md`, `balance-and-validation.md`, `runs-and-economy.md`, `languages.md`, `pixel-art.md`, `ui-rules.md`, `audio.md`) before you start. Read any `CONTEXT.md` file if one exists. Use the glossary words: Company, Run party, Bracket, Tier, Affix, Quality. Do not commit. Work on `main`. Do not write unit tests.

## Goal

Make bracket N (levels FIRST-LAST) playable end to end: a new town, new dungeons with a boss, tier N materials and items, spells for the new levels, a new XP table, and lore. It must feel like the earlier towns, with the same balance targets. The balance we set for the earlier brackets is the law. Do not weaken a target to make a number pass. Change the data in `data/` or the preset files in `tools/balance-sim/presets/`. Do not change simulator code.

Bracket 2 is the first test of whether the game can scale to level 100. Use curves, not copied numbers: every number comes from a curve in A2 of the balance file, and a bracket changes only the inputs of a curve. If a curve cannot give a good number, fix the curve and check every earlier bracket again. Do not patch one bracket with a one-off number.

Use the previous bracket as the pattern for the shape only. Open its towns, dungeons, monsters, materials, recipes and i18n keys, and copy the shape, not the numbers.

## Step 0: Write the targets (stop and show me)

Do not edit `data/`, art or code yet.

1. If `npm run balance-report` does not exist, tell me. Building it is a separate task and comes first. It formats the output of the sim and `data/` into Part B of the balance file. It does not change the sim code.
2. Copy `docs/balance/_template.md` to `docs/balance/bracket-NN.md` and fill in **Part A** completely (A1 to A12):
   - A2: the curve for each measure, with its rule, its value at FIRST and LAST, and its projection at level 100. Fit each curve to the earlier brackets, and say how well it fits.
   - A3: the boundary check between bracket N-1 and N. Name any cliff and how you remove it.
   - A4 to A10: the level-by-level pacing, the dungeons and monsters, the base items, the set materials and effects, the boss, the class Defence bands and the economy.
   - A12: every open question, with a recommendation for each.
3. Stop and wait for my OK. I may change the targets. After I approve, set the status to "targets approved". From then on Part A is the spec. Change it only with my approval.

## Part 1: Level cap and progression

- Raise `levelCap` in `data/balance/progression.json` to LAST.
- Extend `experienceToNextLevelByLevel` and `normalKillExperienceByHeroLevelThenMonsterLevel` as absolute numbers (no formula, no gap factor). Keep the method of the earlier brackets: the kills to level in the best dungeon stay in the 5-7 range, with no jump between levels. Each lower monster level adds about 1.5 kills. Boss XP is x5 and rare XP is x3.
- Check the pace with `npm run scenarios -- experience`. The numbers must match A2 and A4 of the balance file. Update the rules in design.md only when a rule changes, and put the numbers in the balance file.
- Add a `learnCostAnchors` anchor in `data/balance/spells.json` for the new levels, from `npm run scenarios -- economy`. The validator fails without it. The price must stay under 65% of the solo hero income.
- Check `regenSecondsToFullAtMaxLevel` and the recovery rules. Keep the straight-line growth. Say what you changed.

## Part 2: Town and world

- Add TOWN to the town data (`data/towns.json` may already hold the map position, biome and levels). Add everything else it needs: town buildings in `data/buildings.json` (workshop, merchant, tavern, academy, dungeon board), the town scene art and the biome battle backdrop (Pixi.js, cached textures; follow `docs/agent/pixel-art.md` and `docs/agent/architecture.md`; the current town code is in `src/render/town/`, `src/render/townView.ts` and `src/app/townPresenter.ts`), the town layout and the town labels, and the travel rules (time = 2 s + 1 s per bracket crossed, the town opens when PREVIOUS_BOSS is beaten).
- Follow `docs/agent/ui-rules.md` for any screen you touch (no dynamic movement, footer buttons, mobile first).
- Region: REGION. Monster families from design.md section 9: FAMILIES. Boss: BOSS.
- Check the Hiring lock rule in design.md (`unlockAfterDungeonId` in `classes.json`). If a class should unlock in this town, decide it with me in A12 of the balance file.

## Part 3: Dungeons and monsters

Follow section 9 rules exactly:
- 6-8 dungeons. Levels rise by at most 2 per step (a step of 1 only at the end). The last dungeon is the boss dungeon at level LAST, for exactly 2 heroes (`minimumPartySize` 2). Use the same shape as the previous bracket, shifted by 10 levels.
- Two dungeons open at the start of the bracket, so the player has a choice and the first-dungeon materials are easy to get.
- 1-3 monster families for each dungeon, 1 rare monster for each normal dungeon. Every dungeon has its own monsters. A monster id and a sprite key appear in one dungeon only.
- Draw each new creature in `render/creatureArt.ts` with a new sprite key. Cache the texture. Use only colours from `render/palette.ts` (add a colour there first if needed). Follow `docs/agent/pixel-art.md`.
- Monster stats come from the per-level anchors in `data/balance/monster-scaling.json` (flat HP, damage, armour, resistance). A monster lifts all four together with one `statFactor`. Do not copy the earlier bracket stats. Add anchors for the new levels so the targets in design.md section 8 hold.
- The boss fight has the same design as the earlier bosses: a boss with flat stats (`flatStats`) on one common factor of the curve, plus add monsters, and the fight length target of design.md section 8. Give BOSS its spells in `monster-spells.json`.
- Each dungeon has `minimumHeroLevel` = monster level and `recommendedMaxLevel`.
- Add the sounds for new monsters and armour types in `data/audio/sound-effects.json`. Follow `docs/agent/audio.md` (the audio engine is Tone.js).

## Part 4: Materials, items and crafting

- Add tier N materials (bracket rule: tier N drops only from bracket N monsters). Main materials: Ore, Wood, Hide, Cloth, Gem. One set material for each dungeon after the first ones of the bracket. Base materials drop only in the first dungeons of the bracket. Every later dungeon drops exactly one set material. Two dungeons share at most 1 crafting material. Set material sell price rises with the dungeon level.
- Add tier N base items, recipes and set recipes for all slots and all 7 classes (item level inside FIRST-LAST). A recipe uses one tier only. Recipes are locked by crafter level. Extend crafter levels so every recipe is craftable at crafter level LAST.
- Add affixes for the new item levels in `data/affixes.json`. Add the Unique items for the bracket (2 per bracket).
- Keep flat armour (`hit - armour`, a hit never does less than 1) and the gear budget in section 14 of `docs/balance/combat-and-growth-mechanism.md`: whole numbers, at least 2 Defence per armour piece, Heavy > Medium >= Light, and the weapon damage rule. Tier N armour values must keep each class on its direction in design.md ("Defence and class direction") and on the A9 targets at level LAST. If a class is off, fix it with data and say so in your report.
- Keep the sell value rules and the upgrade factor. Check with `npm run scenarios -- economy`.
- Add i18n keys for every new name in both `data/i18n/en.json` and `data/i18n/zh.json`.

## Part 5: Hero abilities

Follow the Warrior blueprint (memory note `spell-rank-blueprint-warrior`) for all 7 classes:
- New spells stop at the Ultimate. Ranks carry on after it. Check the schedule in `spells.json` for levels FIRST-LAST. Do not add filler. If a class has no new spell or rank in this bracket, check the "every 2-3 levels" rule and propose one in A12 (a rank, not a new family).
- Reserved spells stay reserved (`reservedFor: "specialisation"`). Do not delete them.
- Make sure every spell up to LAST is learnable at the Academy, that the loadout rules still work, and that each spell has a look in `data/spell-visuals.json` and sounds in `sound-effects.json` (the validator needs them up to the cap).
- Any new spell animation: run `npm run gallery`, open it, take a screenshot, show me the page. Do not leave the dev server running.
- Promotion (level 20 and level 50): if the command and screen are not built, do not build them here. Tell me in the report what is missing.
- Keep each class identity (see design.md 4b).

## Part 6: Balance (the key part)

Use the same kind of targets as the earlier brackets (design.md section 8 and A11 of the previous balance file), with L = hero level FIRST-LAST. The targets are for the average of the Warrior, Archer and Mage:

| Case | Target (bracket 1 bands) |
|---|---|
| First meeting, level L hero against a level L monster, crafted Magic gear | HP lost about 40-65% (30-45% at the first level) |
| First meeting, Common gear | a hard fight: HP lost rises to 85-100% in the late levels |
| Normal fight length, best gear at normal odds | the duration curve in `mob-kill-time.json` |
| Boss, level LAST + level PARTNER_LEVEL, gear floor | win 25-50% |
| Boss, same party, normal crafted gear | win 30-55% |
| Boss, same party, full Magic gear | win 55-75% |
| Boss, weapon only | win under 30% |
| Boss, one hero, no gear | win 0% |
| Boss fight length | about 20 s |

- Update the preset files in `tools/balance-sim/presets/` (level range, partner levels, targets). Do not change the code.
- Run `npm run balance` and `npm run scenarios` (all seven), then `npm run balance-report -- N`. It fills Part B of the balance file. Fix numbers in `data/` until every row in Part B passes against Part A. Read the tables yourself: a pass mark is not proof that the numbers make sense. Resource pools must still dip as in design.md (`resource-use`, the lowest point targets).
- Check that all earlier brackets did not change (table B16). Check that this bracket sits on the curves (table B17) and that the projection to level 100 still looks sane.

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
- Update `design.md` in the same step as each rule change. Rules stay in `design.md`. Numbers and tables stay in `docs/balance/bracket-NN.md`. Move a number out of `design.md` if you find one that belongs to a single bracket. Update `CLAUDE.md` only if a rule changes.
- Update the validator if a new rule needs a check. Run `npm run validate` after every `data/` edit.
- At the end, update the "Not used yet" line in `new-bracket-prompt.md` to say which brackets it built, and fix any step in this prompt, and any table in `_template.md`, that was wrong or missing.

## Execution order (subagents)

- Step 0 (the targets file) runs in the main session. Do not start any agent before I approve Part A.
- **Main session, in series:** Part 1 (cap and XP), Part 3 (dungeons and monster data), Part 4 (materials, items, recipes), Part 6 (balance), Part 8 and Part 9. These parts need the numbers of the step before them. Balance changes shared `data/` files, so only the main session tunes numbers.
- **Subagents, in parallel, after I approve Part A:**
  1. Town art: Part 2 art only (town scene and building art, biome backdrop, town labels).
  2. Creature art: the sprites for the monster list in A5 (`creatureArt.ts`, new colours in `palette.ts`).
  3. Spell looks and sounds: Part 5 entries in `spell-visuals.json` and `sound-effects.json`, and the gallery check.
  4. Lore and translations: Part 7, after the names are final. It writes the lore text and the `zh.json` keys.
- Give each agent its own files and its own list of keys, taken from Part A of the balance file. Two agents never edit the same file. The main session merges `en.json`, `zh.json`, `design.md` and the balance file.
- Each agent follows CLAUDE.md, runs `npm run validate`, and reports the files it changed and anything it did not verify.
- When all agents finish, the main session runs `npm run check` and the browser check. A subagent report is not proof: read the changed files before you say a part is done.

## Done when

1. `npm run check` passes.
2. `docs/balance/bracket-NN.md` exists, its status is "balanced", and every row of Part B passes against Part A. All earlier levels are unchanged (B16), and the curves still fit (B17).
3. A new game plays from level 1 to level LAST: fight, loot, craft, equip, learn spells, travel to TOWN, beat BOSS. A reload keeps the exact state.
4. I can see TOWN in the browser at about 412x915 and about 1280x720.
5. Your final report says what you did, what you did not verify (for example any screen you did not look at in a browser), and what is left.

Work in small steps. Finish one part end to end before the next. Run `npm run check` after each part.
````
