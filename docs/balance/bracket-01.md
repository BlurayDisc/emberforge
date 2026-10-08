# Bracket 1 - Hollowbrook (levels 1-10) - Balance file

This is the baseline bracket. Town 2 copies its structure and continues its curves.

- **Part A (targets)** is written by hand. The targets follow the measured game data. The bands live in the preset files in `tools/balance-sim/presets/`.
- **Part B (actuals)** should come from `npm run balance-report -- 1`. That tool is not built yet, so Part B is a manual snapshot of `npm run scenarios` and `npm run balance`. Replace it with the tool output when the tool exists.
- Reference classes: **Warrior, Archer, Mage** (`balanceStatus: baseline`). Priest, Thief, Barbarian and Fighter are placeholders. Their numbers are in Part B for information only and are not checked against Part A.
- Rules live in `design.md`. This file holds numbers and tables only.

Status: targets approved, built, balanced for Warrior, Archer and Mage (economy open, see A12)

---

# Part A - Targets (hand-written)

## A1. Parameters

| Name | Value |
|---|---|
| Bracket and tier | 1, tier 1 |
| Levels (level cap) | 1-10 (cap 10, `levelCap` in `progression.json`) |
| Town (id), region | Hollowbrook (`hollowbrook`), farmland and the Old Wood |
| Monster families | rats, scarecrows, wolves, toads, goblins, spiders, hobgoblins |
| Boss, previous boss | Goblin Chief. None before it (first town). |
| Boss party | strong hero level 10, partner level 7 (preset `boss-fight.json`) |
| Earlier bracket file | none |

## A2. Curve mechanism

| Curve | Rule (formula or anchors) | At 1 | At 10 | Projection at 100 | Data key or file |
|---|---|---|---|---|---|
| XP to next level | absolute table, then x L^1.5 after the table | 380 | 1,973 | not set (town 2 extends the table) | `experienceToNextLevelByLevel` |
| XP per normal kill (same level) | absolute table by hero level and monster level | 200 | 364 | not set | `normalKillExperienceByHeroLevelThenMonsterLevel` |
| Monster HP | anchors per level, straight lines between, last segment goes on | 430 | 1,562 | not set (refit for town 2) | `monster-scaling.json` |
| Monster damage | same anchors | 36 | 144 | not set | `monster-scaling.json` |
| Monster armour / Resistance | same anchors | 0 / 0 | 16.25 / 6.88 | not set | `monster-scaling.json` |
| Normal fight duration (s) | target by level, see A11 | 15 | 18 | - | `mob-kill-time.json` |
| Boss fight duration (s) | target about 20 s | - | 20 | - | `boss-fight.json` (`targetSeconds`) |
| Base weapon damage | W(L) = 7 + 1.6 x (L - 1), times type multiplier | 7 | 21 | 165 | `items.json` `weaponDamage` |
| Armour piece Defence | fixed by piece and weight, no growth by item level | Boots 4 / 3 / 2 | Chest 12 / 8 / 5 | - | `base-items.json` |
| Affix value scale | grows with item level unless `scalesWithItemLevel` is false | - | - | - | `affixGrowthPerItemLevel` |
| Flat armour | `hit - armour`, a hit never does less than 1 | - | - | - | `classes.json`, gear |
| Crafter XP to next level | table for levels 1-8, then 48 x L^1.3 | 43 | 958 | 19,100 | `crafting.json` |
| Crafter XP per main material | 20 + 8 x recipe level, -8% per level above the recipe (min 10%) | 28 | 100 | - | `crafting.json` |
| Crafter fee (copper) | 1 + 0.25 x recipe level | 1.25 | 3.5 | - | `crafting.json` |
| Sell value | (materials + fee + 3 per ingredient) x quality + 5 per affix + 1 | - | - | - | `items.json` |
| Spell price (copper) | log-log curve through anchors | 18 (lv 2) | 127 | not set (anchors must reach the cap) | `learnCostAnchors` |
| Hero heal time, empty to full (s) | straight line, level 1 to the cap | 60 | 82 | - | `recovery.json` |

## A3. Boundary check

Not used for bracket 1. Bracket 2 compares its level 11 with level 10 of this file.

| Measure | Level 10 (this bracket, for town 2) |
|---|---|
| XP to next level | 1,973 |
| Kills to level (best dungeon) | 6.9 |
| Normal fight duration, Magic gear, reference classes | 14-20 s |
| Monster HP (curve) | 1,562 |
| Hero Defence / Resistance, Magic gear (Warrior, Archer, Mage) | 52 / 37, 35 / 41, 25 / 56 |
| Copper for each fight (solo, all sold) | about 11 |
| Crafts to next crafter level (Warrior weapon, level 9) | 3-4 |

## A4. Pacing targets

Target kills in the best dungeon: 1.9-4 in the first levels, 5-7 in the last levels (`experience-curve.json`).

| Level | XP to next | Kills (best dungeon) target | Crafter XP to next |
|---|---|---|---|
| 1 | 380 | 1.9-4 | 43 |
| 2 | 464 | 1.9-4 | 47 |
| 3 | 540 | 1.9-4 | 98 |
| 4 | 658 | 2-5 | 108 |
| 5 | 800 | 3-5 | 130 |
| 6 | 960 | 4-6 | 180 |
| 7 | 1,147 | 4-6 | 330 |
| 8 | 1,377 | 5-7 | 345 |
| 9 | 1,647 | 5-7 | 835 |
| 10 | 1,973 | 5-7 (cap) | 958 |

Level 1 dungeon share of all fights: 30-50% (`crafter-curve.json`, `basicFightShareRange`).

## A5. Dungeons and monsters

| Dungeon (id) | Level | Unlocks after | Party size | Normal monsters | Rare monster | Drops |
|---|---|---|---|---|---|---|
| Rat Cellar (`rat-cellar`) | 1 | - | 1 | Cave Rat | Rat King | Rawhide, Copper Ore |
| Scarecrow Field (`scarecrow-field`) | 1 | Rat Cellar | 1 | Straw Scarecrow | Harvest King | Linen, Pine Wood |
| Wolf Trail (`wolf-trail`) | 3 | Rat Cellar | 1 | Wolf | Alpha Wolf | Sharp Fang, Quartz 2% |
| Sunken Mill (`sunken-mill`) | 5 | Wolf Trail | 1 | Mill Toad | Warty Elder | Toadskin, Quartz 3% |
| Goblin Camp (`goblin-camp`) | 7 | Sunken Mill | 1 | Goblin | Goblin Captain | Bone Shard, Quartz 4% |
| Old Wood Hollow (`old-wood-hollow`) | 9 | Goblin Camp | 1 | Bark Spider | Hollow Broodmother | Spider Silk, Quartz 5% |
| Goblin Chief's Lair (`goblin-chief-lair`) | 10 | Goblin Camp | 2 | Hobgoblin (add, 0 or 1) | - | Coarse Sinew, Quartz 6% (add) and 15% (boss) |

Every dungeon from the Wolf Trail on also gives 1 random basic material in 15% of won fights.

Monster stats as built at the dungeon level (damage per second is damage / attack seconds, before armour):

| Monster (id) | Dungeon | Rank | Level | HP | Damage | Armour | Resistance | Attack s | Dmg/s | Role or trick |
|---|---|---|---|---|---|---|---|---|---|---|
| `cave-rat` | Rat Cellar | normal | 1 | 396 | 33 | 0 | 0 | 1.4 | 24 | fast, weak hits |
| `rat-king` | Rat Cellar | rare | 1 | 538 | 45 | 0 | 0 | 1.4 | 32 | |
| `straw-scarecrow` | Scarecrow Field | normal | 1 | 447 | 37 | 0 | 0 | 1.8 | 21 | slow |
| `harvest-king` | Scarecrow Field | rare | 1 | 538 | 45 | 0 | 0 | 1.8 | 25 | |
| `wolf` | Wolf Trail | normal | 3 | 641 | 57 | 2 | 0 | 1.4 | 41 | fast |
| `alpha-wolf` | Wolf Trail | rare | 3 | 871 | 78 | 3 | 1 | 1.4 | 56 | |
| `mill-toad` | Sunken Mill | normal | 5 | 970 | 86 | 5 | 2 | 1.8 | 48 | slow, heavy |
| `warty-elder` | Sunken Mill | rare | 5 | 1,166 | 104 | 6 | 2 | 1.8 | 58 | |
| `goblin` | Goblin Camp | normal | 7 | 1,184 | 108 | 9 | 4 | 1.65 | 65 | reference mob |
| `goblin-captain` | Goblin Camp | rare | 7 | 1,480 | 135 | 12 | 4 | 1.65 | 82 | |
| `bark-spider` | Old Wood Hollow | normal | 9 | 1,287 | 119 | 13 | 5 | 1.5 | 79 | factor 0.90, below the boss |
| `hollow-broodmother` | Old Wood Hollow | rare | 9 | 1,788 | 165 | 18 | 8 | 1.5 | 110 | |
| `hobgoblin` | Goblin Chief's Lair | normal (add) | 10 | 1,296 | 120 | 13 | 6 | 1.8 | 67 | factor 0.83, about a Goblin plus 10% |
| `goblin-chief` | Goblin Chief's Lair | boss | 10 | 1,800 | 148 | 19 | 8 | 1.5 | 99 | spells, see A8 |

## A6. Crafts (base items)

The tier 1 recipes are in `base-items.json` and the level plan is in `design.md` section 6. Main hand weapon steps (crafter level: damage at that item level):

| Class | Weapons |
|---|---|
| Warrior | Sword (1: 7), Axe (3: 10), Longsword (5: 13), Battle Axe (7: 17), Broadsword (9: 20) |
| Archer | Bow (1: 7), Longbow (3: 10), Composite Bow (5: 13), Warbow (7: 17) |
| Mage | Wand (1: 7), Runed Wand (3: 10), Scepter (5: 13), Staff (5: 15), Arcane Staff (7: 19) |

Armour opens at Boots 1, Gloves 2, Helm 4, Shield 5 (light Leggings 5), Legs 6, Chest 8. Belt 6, Ring 7, Amulet 9 (Ring and Amulet are Jewelcrafting, which is hidden).

## A7. Set materials and set effects

| Set material | Dungeon | Bonus on each piece | Sell price | Sort position |
|---|---|---|---|---|
| Sharp Fang | Wolf Trail | +2 Agility | 4 | 2 |
| Toadskin | Sunken Mill | +25 Health | 5 | 3 |
| Bone Shard | Goblin Camp | +2 Defence | 6 | 4 |
| Spider Silk | Old Wood Hollow | +2 Attack speed | 7 | 5 |
| Coarse Sinew | Goblin Chief's Lair | +2 Strength | 8 | 6 |

## A8. Boss

| Item | Target |
|---|---|
| Boss, HP, damage, armour, Resistance, attack seconds | Goblin Chief: 1,800 / 148 / 19 / 8, 1.5 s (common factor of the level 10 curve within 15%, validator) |
| Adds | 0 or 1 Hobgoblin (50% each), level 10, factor 0.83 |
| Spells | Cowing Roar: Weaken 20% for 8 s, every 20 s. War Cry: self Haste 25% for 8 s, every 24 s. Crushing Cleaver: 1.95 x attack (about 289) and Wound 85% for 9 s, every 12 s. |
| Target priority | nearest enemy, like every unit |
| Party size | exactly 2 |
| Fight duration | about 20 s (`targetSeconds`) |
| Win rate: gear floor (Common in every slot, 1 prefixed item each) | 25-50% |
| Win rate: normal crafted gear | 30-55% |
| Win rate: full Magic gear | 55-75% |
| Win rate: weapon only | 0-30% |
| Win rate: one hero, no gear | 0% |
| Drops | Coarse Sinew 3-5, Quartz 15%, Uncommon Ring (item level 7) 35% |

## A9. Class direction at level 10

Best plain gear of the highest item level in every slot (no set pieces), from the game stat code.

| Class | Direction | Common gear: HP / Def / Res | Magic gear: HP / Def / Res |
|---|---|---|---|
| Warrior | the physical wall | 914 / 46 / 13 | 1,164 / 52 / 37 |
| Archer | glass cannon, fast attacks | 776 / 31 / 17 | 1,026 / 35 / 41 |
| Mage | magic damage, high Resistance, low Defence | 736 / 21 / 31 | 986 / 25 / 56 |
| Priest | placeholder | - | - |
| Thief | placeholder | - | - |
| Barbarian | placeholder | - | - |
| Fighter | placeholder | - | - |

Damage and attack time at level 10, Magic gear: Warrior 90 / 1.30 s, Archer 91 / 1.14 s, Mage 99 / 1.38 s.

## A10. Economy targets

| Measure | Target |
|---|---|
| Copper income (solo hero, all loot sold) | rises every level; about 11 copper for each fight at level 10 |
| Spell cost share of income | at most 65% (`spellBudgetPercent`) |
| Second hero (300 copper) | payable at about level 5-6 for a hero who crafts and sells |
| Bank purchases | Backpack row (100), Sorting (150), Quick dispatch (250), Drop rates (300) inside the bracket |
| Crafter fee | 1.25 copper at recipe level 1, 3.5 at recipe level 10 |

## A11. Balance targets

These targets follow the measured game data and are for the Warrior, Archer and Mage average.

| Case | Win rate | HP lost | Duration | Source |
|---|---|---|---|---|
| First meeting, Common gear (level 1 weapon only) | - | 1: 40-55%, 2: 60-72%, 3-4: 70-85%, 5: 80-95%, 6-9: 85-100%, 10: 90-100% | - | `first-fight.json`, gear state "first meeting" |
| Same level, crafted Magic gear (the reference) | - | 1: 30-45%, 2: 45-60%, 3: 55-70%, 4: 45-62%, 5: 52-70%, 6: 50-67%, 7-8: 45-63%, 9: 38-55%, 10: 45-63% | - | `first-fight.json`, gear state "crafted magic" |
| Normal fight length, best gear at normal odds | - | - | 15 s (levels 1-3), 16 s (5), 17 s (7), 18 s (9-10) | `mob-kill-time.json` |
| Boss, gear floor | 25-50% | - | about 20 s | `boss-fight.json` |
| Boss, normal crafted gear | 30-55% | - | about 20 s | `boss-fight.json` |
| Boss, full Magic gear | 55-75% | - | about 20 s | `boss-fight.json` |
| Boss, weapon only | 0-30% | - | - | `boss-fight.json` |
| Boss, one hero, no gear | 0% | - | - | `boss-fight.json` |
| Resource pool, lowest point in a normal fight | - | 75-90% at level 2, 0-15% at level 10 | - | `resource-use.json` |
| Level 1 dungeon share of fights | - | 30-50% | - | `crafter-curve.json` |
| Spell cost share of income | - | at most 65% | - | `economy.json` |

Change a target only with the user's approval, and say why.

## A12. Open questions and decisions

| # | Question | Recommendation | Decision |
|---|---|---|---|
| 1 | Which gear is the reference for a normal fight? | Crafted Magic gear. Common gear is a hard fight. | decided |
| 2 | Spells take 87% of the solo income by level 10 (limit 65%). | Lower the spell price anchors (level 10: 127 to about 90), or raise the set material sell prices. | open |
| 3 | Normal fight length target. | 15-18 s. | decided |
| 4 | Boss fight length target. | About 20 s. | decided |
| 5 | Placeholder classes (Priest, Thief, Barbarian, Fighter) are far outside the bands at levels 8-10. | A separate balance pass before town 2. | open |
| 6 | How does a hero choose a spell? | Slot 1, 2, 3, then the Ultimate, with one basic attack after each spell. The player sets the order. | decided |
| 7 | Multi-hit spells lose much to flat armour (a Volley arrow at level 12 is about 34 before armour). | Raise the power per arrow (0.45 to about 0.55), or add an `armourPenetration` field to spells (about 30%). Decide in the spell pass of bracket 2. | open |
| 8 | Do the Archer and the Mage kite (step back while they shoot)? | Not needed in bracket 1. They stand and shoot. | open |

---

# Part B - Actuals (manual snapshot)

<!-- generated:start -->

Manual snapshot of `npm run scenarios` and `npm run balance`. 20 fights for each case unless said otherwise, so a single cell can move by 10-20 points between runs. Columns W / A / M are Warrior / Archer / Mage.

## B1. First meeting (`first-fight`)

HP lost, a hero against a normal curve monster (factor 1) of its own level, best spells. Average of Warrior, Archer and Mage.

| Level | Common | Target | Check | Magic | Target | Check |
|---|---|---|---|---|---|---|
| 1 | 49 | 40-55 | ok | 39 | 30-45 | ok |
| 2 | 66 | 60-72 | ok | 54 | 45-60 | ok |
| 3 | 79 | 70-85 | ok | 64 | 55-70 | ok |
| 4 | 75 | 70-85 | ok | 53 | 45-62 | ok |
| 5 | 87 | 80-95 | ok | 62 | 52-70 | ok |
| 6 | 90 | 85-100 | ok | 56 | 50-67 | ok |
| 7 | 93 | 85-100 | ok | 52 | 45-63 | ok |
| 8 | 95 | 85-100 | ok | 51 | 45-63 | ok |
| 9 | 93 | 85-100 | ok | 44 | 38-55 | ok |
| 10 | 99 | 90-100 | ok | 55 | 45-63 | ok |

Win rate with Common gear at levels 9 / 10 (Warrior base damage 11): Warrior 65 / 10%, Archer 35 / 45%, Mage 60 / 5%. With Magic gear: 100% at every level.

## B2. Mob kill time and HP lost (`mob-kill-time`)

Best gear at normal quality odds, monsters from the dungeons without a boss at the hero level.

| Level | Seconds W / A / M | Win % W / A / M | HP lost % W / A / M |
|---|---|---|---|
| 1 | 17.0 / 15.0 / 14.8 | 100 / 100 / 100 | 38 / 41 / 46 |
| 3 | 16.9 / 15.4 / 14.1 | 100 / 100 / 100 | 68 / 75 / 75 |
| 5 | 19.6 / 15.5 / 15.6 | 100 / 90 / 100 | 75 / 75 / 65 |
| 7 | 21.2 / 15.3 / 16.6 | 80 / 95 / 85 | 81 / 77 / 75 |
| 9 | 21.3 / 16.4 / 17.3 | 95 / 80 / 95 | 68 / 79 / 78 |
| 10 | 21.6 / 15.7 / 16.1 | 65 / 85 / 55 | 85 / 75 / 93 |

Level 9 (Bark Spider): the Archer and the Mage win 80% and 95%.

## B4. Boss (`boss-fight`, hero level 10 and partner level 7, every partner class)

| Gear state | W | A | M | Baseline avg | Fight s | Target | Check |
|---|---|---|---|---|---|---|---|
| Gear floor | - | - | - | 38% | 18.1 | 25-50% | ok |
| Normal crafted gear | - | - | - | 46% | 18.9 | 30-55% | ok |
| Full Magic gear | - | - | - | 69% | 19.4 | 55-75% | ok |
| Weapon only | - | - | - | 9% | 15.8 | 0-30% | ok |
| One hero, no gear | 0% | 0% | 0% | 0% | 10.9 | 0% | ok |

Fight length is 18-20 s against the 20 s target.

## B4b. Spell damage per cast

Average damage of one cast, best Common gear, against a Goblin (factor 1) of the hero level. Cleave is the damage on one target.

| Class, level | Spells |
|---|---|
| Warrior 5 | Power Strike 92, Shield Bash 95 |
| Warrior 10 | Power Strike II 142, Cleave 120 |
| Archer 5 | Aimed Shot 101, Quick Shot 119 |
| Archer 10 | Aimed Shot II 150, Evasive Shot 151 |
| Mage 5 | Fire Bolt 118, Frost Shard 117 |
| Mage 10 | Fire Bolt II 177, Fireball 162 (plus Burn) |

## B5. Resource use (`resource-use`, 200 fights)

Boss fight, lowest point / average of the pool: level 10 Warrior 26% / 52%, Archer 6% / 38%, Mage 26% / 52%.

## B7. XP and kills to level (`experience`)

Kills in the best dungeon for levels 1 to 10: 1.9, 2.9, 2.9, 2.9, 3.9, 4.9, 4.9, 5.4, 5.4, 6.9. Every level passes the overshoot check (at most 14% of level-ups land on the line).

## B8. Crafter curve (`crafter-curve`, 200 games)

Share of all fights in the level 1 dungeons when the hero reaches each level.

| Hero level | Weapon | Fletching | Enchanting | Armour | Leather | Tailoring |
|---|---|---|---|---|---|---|
| 4 | 46% | 44% | 26% | 46% | 41% | 26% |
| 6 | 48% | 39% | 34% | 44% | 48% | 34% |
| 8 | 46% | 41% | 22% | 44% | 44% | 35% |
| 10 | 47% | 55% | 25% | 51% | 46% | 43% |

Fletching and Armoursmithing are a little above 50%. Enchanting is below 30% (its early recipes need little material).

## B11. Economy (`economy`, 200 games, solo hero, all loot sold)

| Level | Dungeon | Fights total | Copper total | Copper per fight | Crafted and sold | After spells | Spell share |
|---|---|---|---|---|---|---|---|
| 2 | Scarecrow Field | 2 | 9 | 4.6 | 47 | 29 | 39% |
| 4 | Wolf Trail | 8 | 40 | 6.3 | 123 | 63 | 49% |
| 6 | Sunken Mill | 15 | 94 | 8.4 | 170 | 42 | 75% |
| 8 | Goblin Camp | 24 | 183 | 10.2 | 275 | 50 | 82% |
| 10 | Old Wood Hollow | 35 | 299 | 11.7 | 405 | 53 | 87% |

Levels 6-10 include the dungeon bonus drops. Quartz is the only extra sell material, and it is rare.

## Not measured

B3, B6, B9, B10, B12-B17 need the `balance-report` tool.

<!-- generated:end -->
