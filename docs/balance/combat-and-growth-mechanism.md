# Combat and hero growth mechanism

This file is the spec of combat and hero growth. `design.md` holds the game rules, and the data files in `data/` hold the numbers. The balance tables and simulator results of bracket 1 are in `docs/balance/bracket-01.md`. When a rule changes, change `design.md` in the same step as the data.

## 1. Principles

- **Flat numbers.** Armour subtracts from damage. There is no percentage cut.
- **Whole numbers.** Stats, gear values and hits are whole numbers. The sim computes in doubles and rounds once, at the end of a hit, a heal or a derived stat.
- **Large whole numbers.** A level 1 hero has about 430-590 HP and hits for about 35-45. A level 1 monster has 430 HP and 36 damage. This keeps the swing and the armour working in whole numbers.
- **All stats lift together.** Never inflate one side (HP, damage, Defence, magic damage, Resistance) to make a fight harder or easier. A stronger unit gets all its stats lifted by the same factor. This holds for rare monsters and bosses too.
- **Attributes drive stats.** Most hero stats come from Strength, Agility and Intelligence. Defence is the one exception.
- **Monsters have flat stats only.** No attributes. A boss may get attributes later, but only the flat stats count in combat.
- **Targets are soft.** Every balance target in this file is a guide. A result inside a tolerance is a pass. Unless a target says otherwise, the tolerance is 15%. Do not chase the last few points at the cost of another rule (for example the HP / damage ratio of monsters).
- **Every craft must matter.** A crafted item must give a clear gain, so the player has a reason to craft it. No item gives 0 of every useful stat. Every armour piece gives at least 2 Defence at every item level. A stat that the current monsters cannot use (for example Resistance while all monsters hit physically) does not count as a gain. Check this for upgrade levels too: with whole numbers, a +3% step on a small value shows nothing.
- **Item numbers are whole numbers.** No decimals on items. Quality and affixes still add on top.
- **Boss stats are flat numbers** in `monsters.json`, not a factor. A validator check keeps the four stats (HP, damage, armour, Resistance) on one factor of the level curve, within the tolerance.

## 2. Hero stats from attributes

| Stat | Formula |
|---|---|
| Damage | class base damage (`baseDamage`) + main attribute + weapon. The main attribute (`primaryAttribute`) is Strength or Agility for a physical class and Intelligence for a magic class. The weapon adds physical damage for a physical class and magical damage for a magic class. |
| Max HP | class base HP (`baseHp`) + Strength x 14.6 (`hpPerStrength` in `balance/hero-stats.json`) + gear |
| Mana, Stamina, Rage, Hatred | Fixed pool (`balance/resources.json`). No attribute and no level gives more. Warrior and Archer use Stamina. Mage and Priest use Mana. Thief uses Hatred. Barbarian and Fighter use Rage. |
| Mana regeneration | Intelligence adds 1% of the base mana regeneration for each point (`manaRegenBonusPerIntelligence`). Stamina, Hatred and Rage have no attribute link. |
| Defence (physical armour) | class base Defence (`baseDefence`) + gear + abilities. No attribute and no level gives Defence. |
| Resistance (magical armour) | class base Resistance (`baseResistance`) + Intelligence x 0.2 (`resistancePerIntelligence`) + gear |
| Attack speed | see section 3 |
| Critical chance | see section 5 |

- Each attribute is `start + gainPerLevel x (level - 1)`, rounded to a whole number (`attributes` in `classes.json`).
- A factor and a class base value can have decimals. The derived stat is rounded to a whole number. Avoid round values (ending in 0 or 5) for factors and for starting values such as base HP, so the results do not all end in 0 or 5.
- Resistance has no gain per level of its own. It grows only with Intelligence and gear.
- Intelligence gives no resource pool. It gives magical damage (for a magic class), Resistance and mana regeneration.

### Attribute budget

- **Every class has about the same attribute total.** The sum Strength + Agility + Intelligence at level 1 is close for all classes. The sum of the gains per level is close for all classes too. A difference of up to 15% between classes is allowed. A class differs mostly by how the points are split.
- Current values: start total 52 / 52 / 51 and gain total 5.0 / 5.9 / 5.9 for Warrior, Archer and Mage. The placeholder classes have a start total of 51 and a gain total of 5.1-5.7. Check this for every new class and every change to an attribute value.
- The primary attribute gain is about the same for all damage classes, so damage stays equal at the same gear.

## 3. Attack speed and attack time

Attack time is the number of seconds for one basic attack. It is not attacks per second.

```
attackTime = baseAttackTime / (1 + attackSpeedBonus)
attackSpeedBonus = Agility x 0.003 + gear + buffs
```

- Each class has its own `baseAttackSeconds` in `classes.json` (Warrior 1.65 s, Archer 1.5 s, Mage 1.7 s). A monster has `attackSeconds` in `monsters.json` (default 1.65 s, `defaultAttackSeconds` in `balance/monster-scaling.json`).
- Agility gives 0.3% attack speed for each point (`attackSpeedBonusPerAgility` in `balance/hero-stats.json`).
- Example: 1.65 / (1 + 0.25) = 1.32 seconds.
- Bonuses add together: Agility, gear, Haste, and Slow as a negative number. One shared pool, as in Dota.
- There is no minimum attack time.
- `1 + attackSpeedBonus` never goes below 0.1 (`minimumAttackSpeedFactor` in `balance/battle.json`), so the division cannot break.
- Spells use cooldowns only. Attack speed does not change a spell cooldown.
- **Cast time.** A spell can set its own `castSeconds` in `spells.json`, including a fast cast or an instant cast (0 s). Without it, the cast takes 0.8 s (`defaultCastSeconds` in `balance/spells.json`). Today no spell sets its own value.
- While a hero casts, it does not attack. The cooldown starts when the cast starts.
- Attack speed (Agility, gear, Haste, Slow) does not change cast time for now. The class base attack time does not change it either.
- A cast costs the attacks the hero would have made in that time. A spell needs enough power to be worth it. Check every spell against its cast time when we tune spells.
- Monsters have an attack time (`attackSeconds`) and no Agility.

## 4. Hit order

1. Attack = (base + attribute + weapon) x swing. The swing is a random number around 1 (`damageVarianceFraction` in `classes.json`, `monsterDamageVarianceFraction` in `balance/battle.json`). It stands for a damage range like 11-13 in Warcraft 3, shown as one number.
2. x spell power (the percentage of a spell, for example 162%). A basic attack has power 1.0.
3. x critical multiplier, if the hit crits.
4. minus the armour of the target (Defence for a physical hit, Resistance for a magical hit).
5. If the result is 0 or less, the hit does 1 damage.
6. Round once.

- Armour applies to each hit. Many small hits (Quick Shot, Combo Strike, Volley, the Thief) are weaker against armour. This is by design. Monster armour is low: 0 at level 1 and about 16 at level 10 (`balance/monster-scaling.json`).
- Status effects: Fortify is a percentage of the Defence value. Guard and Sunder are percentages of the armour value that the hit uses (Defence for a physical hit, Resistance for a magical hit). Weaken and Hex work as percentages of damage. Slow is a negative value in the attack speed pool (section 3). Armour penetration is a share of the flat armour.
- Burn uses the attack of the caster and the Resistance of the target. It has no swing and no crit.

## 5. Critical hits

| Part | Rule |
|---|---|
| Chance | Base 4% for all heroes (`baseCriticalChance` in `balance/battle.json`). Gear and passives add to it. The cap is 50% (`maximumCriticalChance`). |
| Damage | 200% (`criticalDamageMultiplier`). Gear adds critical damage in percent points. |
| Thief | +2% base chance (class trait), so 6%. |
| Spells | A spell can crit. Each hit rolls on its own. A 5-arrow Volley rolls 5 times. |
| Burn ticks and heals | No crit. |
| Later | Passives. Example: the Ranger turns Agility into crit chance, the Barbarian turns Strength into crit damage. Both stay locked behind upgrades. Items add chance and damage. |

## 6. Healing

- A heal is a percentage of magic attack. It is not a separate stat.
- A later, stronger heal can use both: `magic attack x power + Intelligence x k`.
- A value can be a raw number or a percentage, as the skill needs.

## 7. Monsters, rare monsters and bosses

- A normal monster has HP, damage, armour, Resistance and an attack time. HP, damage, armour and Resistance come from one level curve (`balance/monster-scaling.json`), lifted together by its `statFactor` in `monsters.json`.
- A rare monster is the same curve with all stats lifted by one factor (`statFactor` 1.25). A boss has flat numbers (`flatStats` in `monsters.json`) that sit on one common factor of the curve (validator, 15%).
- The boss has spells (`data/monster-spells.json`). A boss spell uses a share of the boss attack, so it follows the same lift.

### Linked growth rule

Fight duration, hero HP and monster damage are linked. For the same share of HP lost in a fight:

`monster damage growth = hero HP growth / fight duration growth`

If hero HP grows 1.5x and the fight gets 1.4x longer, monster damage grows about 1.07x. A duration target that grows faster than hero HP makes monster damage fall. Check this before you set a duration target.

## 8. Class traits so far

| Class | Trait |
|---|---|
| Thief | +2% base crit chance (`criticalChanceBonus`) |
| Warrior | High base Defence (5) and heavy armour. |

## 9. Where the numbers live

- `data/classes.json`: attributes (start and gain per level), base HP, base damage, base Defence, base Resistance, base attack time, swing, crit bonus.
- `data/balance/hero-stats.json`: HP per Strength, Resistance per Intelligence, attack speed per Agility, mana regeneration per Intelligence.
- `data/balance/battle.json`: crit chance, crit cap, crit damage, attack speed guard, monster swing, heal rules.
- `data/balance/resources.json`: resource pools and regeneration.
- `data/balance/monster-scaling.json` and `data/monsters.json`: the monster curve, `statFactor`, attack times and boss `flatStats`.
- `data/base-items.json`, `data/affixes.json`, `data/balance/items.json`: gear stats and the gear budget (section 14).
- `data/spells.json`, `data/monster-spells.json`, `data/balance/spells.json`: spells, costs, cooldowns and cast time.
- `data/balance/battlefield.json`: the real-time battlefield (section 12).

## 10. Open questions

| Question | Default if no answer |
|---|---|
| Cast time and fast heroes: a fixed 0.8 s cast is slow for a fast hero, and costs it more attacks. | Later problem. Idea from the user: when attack time is shorter than the cast time, the cast uses the attack time. Decide when balancing fast classes. |
| Cast time per spell (fast and instant spells) | Default 0.8 s for every spell. A spell pass sets the exceptions. |

## 11. Current numbers

Baseline classes: Warrior, Archer, Mage (`balanceStatus: baseline`). The Priest, Thief, Barbarian and Fighter are placeholders and are balanced later, from these three. The simulator results (HP lost, win rate, kill time) are in `docs/balance/bracket-01.md`.

| Class | Start Str / Agi / Int | Start total | Gain per level | Gain total | Class base HP | Class base damage | Base Defence | Base Resistance | Base attack time |
|---|---|---|---|---|---|---|---|---|---|
| Warrior | 26 / 18 / 8 | 52 | 2.2 / 1.9 / 0.9 | 5.0 | 213 | 11 | 5 | 3 | 1.65 s |
| Archer | 18 / 23 / 11 | 52 | 2.1 / 2.6 / 1.2 | 5.9 | 207 | 13 | 3 | 4 | 1.5 s |
| Mage | 16 / 12 / 23 | 51 | 2.1 / 1.2 / 2.6 | 5.9 | 196 | 21 | 1 | 4 | 1.7 s |

Hero stats without gear (from the formulas of section 2):

| Level | Class | Str / Agi / Int | HP | Damage | Defence | Resistance |
|---|---|---|---|---|---|---|
| 1 | Warrior | 26 / 18 / 8 | 593 | 37 | 5 | 5 |
| 1 | Archer | 18 / 23 / 11 | 470 | 36 | 3 | 6 |
| 1 | Mage | 16 / 12 / 23 | 430 | 44 | 1 | 9 |
| 5 | Warrior | 35 / 26 / 12 | 724 | 46 | 5 | 5 |
| 5 | Archer | 26 / 33 / 16 | 587 | 46 | 3 | 7 |
| 5 | Mage | 24 / 17 / 33 | 546 | 54 | 1 | 11 |
| 10 | Warrior | 46 / 35 / 16 | 885 | 57 | 5 | 6 |
| 10 | Archer | 37 / 46 / 22 | 747 | 59 | 3 | 8 |
| 10 | Mage | 35 / 23 / 46 | 707 | 67 | 1 | 13 |

Normal monster curve (anchors in `balance/monster-scaling.json`, for `statFactor` 1):

| Level | HP | Damage | Armour | Resistance | HP / damage |
|---|---|---|---|---|---|
| 1 | 430 | 36 | 0 | 0 | 11.9 |
| 2 | 596 | 54 | 1.03 | 0 | 11.0 |
| 3 | 697 | 62 | 2.11 | 0.53 | 11.2 |
| 4 | 812 | 73 | 3.25 | 1.08 | 11.1 |
| 5 | 933 | 83 | 5 | 1.67 | 11.2 |
| 6 | 1059 | 96 | 6.83 | 2.28 | 11.0 |
| 7 | 1184 | 108 | 9.33 | 3.5 | 11.0 |
| 8 | 1308 | 121 | 11.94 | 4.78 | 10.8 |
| 9 | 1430 | 132 | 14.67 | 6.11 | 10.8 |
| 10 | 1562 | 144 | 16.25 | 6.88 | 10.8 |

Targets (soft, tolerance 15%): monster HP / damage stays near 10-12. Resistance is about 40% of armour (a magic hero hits it, but all monsters hit physically). Crafted Magic gear stays clearly better than Common gear. The bands of HP lost and fight time are in the preset files in `tools/balance-sim/presets/` and in `docs/balance/bracket-01.md`.

**Mob factors.** A fast mob hits more often, so each normal monster has `statFactor` = sqrt(attack seconds / 1.65): Cave Rat and Wolf 0.92, Goblin 1, Straw Scarecrow and Mill Toad 1.04. The Bark Spider (0.90) and the Hobgoblin (0.83) sit below this rule on purpose (see `design.md`). Rare monsters have `statFactor` 1.25.

**Boss.** The Goblin Chief has flat stats in `monsters.json`: HP 1,800, damage 148, armour 19, Resistance 8, a basic attack every 1.5 s. The level 10 curve is 1,562 / 144 / 16.25 / 6.88. Each stat stays within 15% of one common factor (the validator checks it). Its spells are Cowing Roar, War Cry and Crushing Cleaver (power 1.95, cooldown 12 s). The boss-fight bands are in `tools/balance-sim/presets/boss-fight.json`.

Open: the placeholder classes (Priest, Thief, Barbarian, Fighter) are not balanced yet. Their results are in `docs/balance/bracket-01.md` for information only.

## 12. Real-time battle spec

No rounds. Heroes and monsters move on a battlefield and fight in real time. The simulation uses fixed ticks and stores positions, so the same seed gives the same battle and playback stays deterministic. `simulateRealtimeBattle` runs the game, the balance simulator and the checks. The numbers are in `data/balance/battlefield.json`. The algorithm and the report format are in `docs/balance/realtime-battle.md`.

| Topic | Rule |
|---|---|
| Opening | Both sides start apart. Melee units meet after about 2.5 seconds of running (`meleeMeetSeconds`). |
| Range | Each class and monster has an attack range. A ranged class (Archer, Mage, Priest) reaches 0.38 of the battlefield length (`rangeFieldFraction`). A melee unit must touch its target. Abilities may raise the range later. |
| Blocking | Units block each other. They cannot stand inside one another. A blocked unit slides sideways around the blocker. |
| Targeting | A unit targets the nearest enemy and checks again when a closer enemy arrives. |
| Start position | If the team has a melee unit, the ranged classes start 2 behind it (`rangedStartOffset`). Without melee units, all start on one line. |
| Movement speed | A stat. All melee classes and all monsters have the same base value (6 per second). Ranged classes have 0.8 of it. Boots add +5% (percent points, no growth, no spread). Buffs come later. Haste does not change movement speed. |
| Casting | A hero stands still while it casts (see section 3). |
| Hit moment | Damage lands at half of the attack time. A ranged projectile is only visual and the damage lands at the release. |
| Target switching | Switch only when the new enemy is clearly closer (margin 2), or when the current one is out of reach for 1 s, so units do not flicker between targets. |
| Field shape | A shallow 2D field, 36 long and 8 deep. |
| Spell range | The range of a spell is the attack range of the unit, unless the spell says otherwise (`spellRangeFieldFractions`). |
| Monster attack time | Every normal, rare and boss monster has a basic attack time of 1.0 to 2.0 seconds (`minimumAttackSeconds`, `maximumAttackSeconds`). The validator checks the range. |
| Boss | A normal monster lifted by one common factor of the curve. The burst comes from its spells. |
| Duration targets | The run-up (about 2.5 s) counts in the fight length and in the duration targets. |

Known limit: a side puts its units in one start line spread over the depth, so each unit gets depth 8 / (units + 1). With 8 or more units on one line this is less than the body width of 1.0 and the bodies overlap. A second rank or a deeper field is needed before such fights exist. Today a fight has at most 3 monsters (`maximumMonstersPerEncounter`) and a party of at most 2.

Open questions (defaults if no answer):

| Question | Default |
|---|---|
| Ranged units never kite: they stand and shoot even when a monster is on top of them. | Keep for now. |
| Units act in input order within a tick, so the first unit wins a same-tick trade. | Keep. A tick is 0.05 s. |

## 13. Later work (planned)

- **Customisable hero sprites.** Equipped items change the look of the full-body figure and the battle sprite. Portraits stay as they are. This needs a link from items to looks in the data, layered sprite parts, and updates to `docs/agent/pixel-art.md`.

## 14. Gear budget

These are the bracket 1 numbers (soft tolerance 15%). All item stats are whole numbers. Percent stats (attack speed, movement speed, critical chance, critical damage, life steal) are percent points. Movement speed is only on boots and is unscaled (`unscaledBaseStats` in `balance/items.json`).

**Unlock order (crafter level = item level in tier 1).** Boots 1, Gloves 2, Helm 4, Shield 5, Legs 6, Chest ("armour" slot) 8. Belt 6, Ring 7, Amulet 9. Set recipes exist for every armour piece whatever its level. Among weapons, only a base that opens at level 2 or higher has them. Belts and jewellery have none.

**Defence of armour at the item level of the piece** (no growth inside a recipe; basic armour has no HP):

| Piece (item level) | Heavy | Medium | Light |
|---|---|---|---|
| Boots (1) | 4 | 3 | 2 |
| Gloves (2) | 5 | 4 | 2 |
| Helm (4) | 5 | 4 | 3 |
| Shield (5), heavy only | 5 | - | - |
| Legs (6) | 7 | 5 | 4 |
| Chest (8) | 12 | 8 | 5 |

Heavy is strictly above Medium, and Medium is at or above Light. No armour piece gives less than 2 Defence (`minimumArmourDefence`). Boots give +5% movement speed (percent points, no growth, no spread).

**Rule of thumb.** Each piece cuts 5-10% of the monster hit of its own item level for Heavy, and slightly less for Light. Cut of the monster hit at the hero level, with the class base Defence and the full set (all pieces of the level worn, no belt):

| Hero level | Heavy (Warrior) | Medium (Archer) | Light (Mage) |
|---|---|---|---|
| 1 | 25% | 17% | 8% |
| 8 | 36% | 22% | 14% |
| Target | 40% | 25% | 15% |

Levels between 1 and 8 grow in steps as the pieces unlock.

**HP.** Basic gear gives no HP. HP comes only from affixes (of the Bear, of the Whale) and set bonuses. The belt is the one exception, as a placeholder (below).

**Weapon damage** = round(W x typeMultiplier) at the item level L of the recipe, with W(L) = 7 + 1.6 x (L - 1) (`weaponDamage` in `balance/items.json`).

| Type | Multiplier |
|---|---|
| One-handed main hand (sword, axe, mace, bow, wand) | 1.0 |
| Staff | 1.15 |
| Main-hand dagger and knuckles families | 0.85 |
| Two-handed (greataxe, maul) | 1.5 |
| Off-hand quiver and tome | 0.25 |
| Off-hand parrying dagger and cestus | 0.4 |

Examples: Sword (1) 7, Axe (3) 10, Longsword (5) 13, Battle Axe (7) 17, Broadsword (9) 20. The data keeps `baseStats` at item level 1 and a flat `growthPerItemLevel`, set so the damage at the own item level of the recipe equals the rule. The validator allows a difference of 1. Light weapons (daggers, wands, knuckles) give +3 attack speed and two-handed weapons give -3. Agility is on bows, daggers, the parrying dagger, the Battle Axe and the Bearded Axe.

**Accessories (placeholders, usable by all classes).** Belt (6): Defence 3 and HP 30. Ring (7): critical chance +2%. Amulet (9): attack speed +4%.

**Upgrades (+1 to +7).** Each step adds 5% of the main stat, rounded, and at least 1 (`upgradeMainStatFractionPerLevel` in `balance/crafting.json`). The main stat is Defence for armour, shield and belt, damage for weapons and off-hand damage items, critical chance for the ring, attack speed for the amulet. The item level and the other stats do not change. Sell value grows 3% per step.

**Every craft must matter.** The validator fails when an armour piece gives less than 2 Defence, the order Heavy > Medium >= Light breaks, a base stat is not a whole number, a weapon differs from the rule by more than 1, or a craftable item has no useful stat (Resistance alone does not count).

**Resource pools** (`balance/resources.json`). Mana 30, Stamina 28, Hatred 24, Rage 26. Regeneration each second: mana 1.8%, stamina 2.2% and hatred 2% of the pool. Rage has no regeneration and comes from hits dealt and taken. Every spell cost is a share of the pool of its class: normal spells 17-42%, Ultimates 53-92%. Intelligence gives no pool. It adds 1% of the base mana regeneration for each point (`manaRegenBonusPerIntelligence`). Mage and Priest have 23-47 Intelligence at levels 1-10, so +23% to +47% before gear. Stamina, hatred and rage have no attribute link. The pressure results (`resource-use`) are in `docs/balance/bracket-01.md`.
