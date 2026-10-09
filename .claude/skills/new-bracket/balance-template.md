# Bracket N - TOWN (levels FIRST-LAST) - Balance file

Copy this file to `docs/balance/bracket-NN.md` (two digits). One file for each bracket.

- **Part A (targets)** is written by hand and approved by the user before anything is built. It is the spec for the data, the art and the lore.
- **Part B (actuals)** is a manual snapshot of `npm run scenarios` and `npm run balance`, as in `bracket-01.md`.
- **One copy of every value.** Dungeons, monsters, the boss, set materials and boss spells live in the data files (`dungeons.json`, `monsters.json`, `materials.json`, `monster-spells.json`). A5, A7 and A8 hold only the design intent (mood, role, trick, reason) and point to those files. Do not copy data values here. The curves, pacing and balance targets are not in data files, so they stay here.
- A bracket is done only when every row in Part B passes against Part A.
- Rules live in `docs/design.md`. This file holds numbers and tables only.
- Do not copy the numbers of the earlier bracket. Take them from the curves in A2, so the game can scale to level 100.

Status: draft | targets approved | built | balanced

---

# Part A - Targets (hand-written)

## A1. Parameters

| Name | Value |
|---|---|
| Bracket `N` and tier | |
| Levels `FIRST`-`LAST` (new level cap `LAST`) | |
| Town (id), region (biome) | |
| Monster families | |
| Boss, previous boss that opens the town | |
| Boss partner level (`LAST` - 3) | |
| Earlier bracket file | `bracket-(N-1).md` |

## A2. Curve mechanism

Every number in this file comes from one of these curves. A curve has one rule for all brackets. A bracket changes the inputs, not the rule. If a bracket needs a one-off number, change the curve and run the report for every earlier bracket again.

| Curve | Rule (formula or anchors) | At `FIRST` | At `LAST` | Projection at level 100 | Data key or file |
|---|---|---|---|---|---|
| XP to next level | | | | | `experienceToNextLevelByLevel` |
| XP per normal kill | | | | | `normalKillExperienceByHeroLevelThenMonsterLevel` |
| Monster HP (anchor levels) | | | | | `monster-scaling.json` |
| Monster damage (anchor levels) | | | | | `monster-scaling.json` |
| Monster armour / Resistance (anchor levels) | | | | | `monster-scaling.json` |
| Normal fight duration (s) | | | | | A11 of the previous balance file |
| Boss fight duration (s) | | | | | A11 of the previous balance file |
| Base weapon damage | W(L) = 7 + 1.6 x (L - 1), times type multiplier | | | | `items.json` `weaponDamage` |
| Armour piece Defence (by piece and weight) | | | | | `base-items.json` |
| Affix value scale | | | | | `affixGrowthPerItemLevel` |
| Flat armour (Defence and Resistance) of the reference hero | `hit - armour`, a hit never does less than 1 | | | | `classes.json`, gear |
| Crafter XP per unit | | | | | `crafting.json` |
| Crafter fee | | | | | `crafting.json` |
| Sell value | | | | | `items.json` |
| Spell price | | | | | `learnCostAnchors` |
| Hero heal time | | | | | `recovery.json` |

## A3. Boundary check (bracket N-1 to N)

The first level of this bracket must not feel like a cliff or a reset. Compare level `FIRST - 1` with level `FIRST`.

| Measure | Level `FIRST - 1` | Level `FIRST` | Allowed change |
|---|---|---|---|
| XP to next level | | | |
| Kills to level (best dungeon) | | | |
| Normal fight duration (s) | | | |
| Monster HP | | | |
| Hero Defence and Resistance (best gear, same level) | | | |
| Copper income for each fight | | | |
| Crafts to next crafter level | | | |

## A4. Pacing targets (level by level)

One row for each level. Kills and crafts are the numbers a player needs to reach the next level.

| Level | XP to next | Kills (best dungeon) | Kills (lower dungeon) | Crafts for crafter level | Real minutes (fights, craft, sell) |
|---|---|---|---|---|---|
| FIRST | | | | | |
| ... | | | | | |
| LAST | | | | | |

## A5. Dungeons and monsters

The level, unlock chain, party size, bonus drops and drops of each dungeon are in `data/dungeons.json` and `data/monsters.json`. The stats and attack time of each monster are in `data/monsters.json` (curve anchors of A2 times `statFactor`). This table holds the design intent only.

| Dungeon (id) | Mood | Normal monsters | Rare monster | Role or trick |
|---|---|---|---|---|
| | | | | |

Write any rule of the chain here (for example which dungeons open at the start, and why a monster has a `statFactor` below the equal threat rule).

## A6. New crafts (base items)

One row for each base item of the tier. The set recipes are not listed here: they follow from A7.

| Base | Profession | Crafter level (offset) | Item level | Main ingredients | Base damage or armour | Classes |
|---|---|---|---|---|---|---|
| | | | | | | |

## A7. Set materials and set effects

The set bonus (`setBonus`), the sell price and the craft level offset of each set material are in `data/materials.json`. The dungeon that drops it is in `data/monsters.json`. A set recipe exists for every base item that opens at crafter level 2 or higher (see `docs/design/items-and-crafting.md` section 6).

| Set material | Dungeon | Why this bonus |
|---|---|---|
| | | |

## A8. Boss

The boss stats (`flatStats`), the add monsters, the drops and the spells are in `data/monsters.json` and `data/monster-spells.json`. This table holds the idea and the targets.

| Item | Target |
|---|---|
| Idea and role of each spell (no numbers) | |
| Target priority | |
| Party size | |
| Fight duration | |
| Win rate: gear floor (Common in every slot, 1 prefixed item each) | |
| Win rate: normal crafted gear | |
| Win rate: full Magic gear | |
| Win rate: weapon only | |
| Win rate: one hero, no gear | |

## A9. Class direction at level `LAST`

| Class | Direction | Defence at `LAST` | Resistance at `LAST` |
|---|---|---|---|
| Warrior | | | |
| Archer | | | |
| Mage | | | |
| Priest | | | |
| Thief | | | |
| Barbarian | | | |
| Fighter | | | |

## A10. Economy targets

| Measure | Target |
|---|---|
| Copper income at `FIRST` and `LAST` (solo hero, all loot sold) | |
| Spell cost share of income (limit 65%) | |
| Next hero cost and the level where the player can pay it | |
| Bank purchases in the bracket (which, when) | |
| Crafter fee at `FIRST` and `LAST` | |

## A11. Balance targets

The targets are for the average of the baseline classes (Warrior, Archer, Mage). Start from the bands of the previous bracket. The bands live in the preset files in `tools/balance-sim/presets/`.

| Case | Win rate | HP lost | Duration | Source |
|---|---|---|---|---|
| First meeting, Common gear | - | | - | `first-fight.json` |
| Same level, crafted Magic gear (the reference) | - | | - | `first-fight.json` |
| Normal fight length, best gear at normal odds | - | - | | `mob-kill-time.json` |
| Boss, gear floor | | - | | `boss-fight.json` |
| Boss, normal crafted gear | | - | | `boss-fight.json` |
| Boss, full Magic gear | | - | | `boss-fight.json` |
| Boss, weapon only | under 30% | - | - | `boss-fight.json` |
| Boss, one hero, no gear | 0% | - | - | `boss-fight.json` |
| Resource pool, lowest point in a normal fight | - | | - | `resource-use.json` |
| Level 1 dungeon share of fights | - | | - | `crafter-curve.json` |
| Spell cost share of income | - | at most 65% | - | `economy.json` |

Change a target only with the user's approval, and say why.

## A12. Open questions and decisions

| Question | Recommendation | Decision |
|---|---|---|
| | | |

---

# Part B - Actuals (manual snapshot)

Each table shows the target (from Part A), the actual number and a pass or fail mark.

## B1. Win rate matrix

Gear quality (Common, Magic, Rare) against monster level, for every level `FIRST`-`LAST`.

## B2. Damage taken per dungeon and class

HP lost for each class in each dungeon, and the kill time.

## B3. Mob kill time per class and level

## B4. Boss matrix

Win rate, fight time and HP lost for each hero class with each partner class.

## B5. Resource use

Lowest point and average of each resource pool, normal fight and boss fight.

## B6. Hero stat curve

HP, damage, Defence, Resistance and attack time for each class at each level, with best gear. Pass or fail against A9.

## B7. XP and kills to level

Kills in the best dungeon and in each lower dungeon, for each level. XP left after a level-up.

## B8. Crafter curve and crafts to level

Crafter level for each profession at each hero level, and the crafts needed for each crafter level.

## B9. Material flow

Materials needed for the recipes of each level against the materials the dungeons drop, in fights. Set materials included.

## B10. Drops per dungeon

Material, chance and expected count for each fight.

## B11. Economy

Copper income for each level, sell values, spell cost share, hero cost and Bank purchase timeline.

## B12. Academy

Spell, level and price for each class.

## B13. Affix scale

Minimum and maximum value of each affix at the first, middle and last item level of the bracket.

## B14. Pacing

Real minutes for each level (fights, crafting, selling).

## B15. Recovery

Heal time and downtime for each level.

## B16. Regression

Every earlier bracket, before and after this bracket's changes. Any change is a fail unless Part A says why.

## B17. Scaling check

The curves of A2 fitted to all built brackets, and the projection to level 100. A bracket that sits off the curve is flagged.
