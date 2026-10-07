# Combat and hero growth mechanism (rebalance v1)

Status: draft, rules locked in chat on 2026-10-07. No number here is final. Numbers are placeholders until round 2.
Nothing in `data/`, `design.md` or the bracket template is changed yet. When the user approves the numbers, change `design.md` in the same step as the data.

This file replaces the percentage armour rule, the Skill stat, the HP exponent curve and the fixed-HP boss in `design.md` sections 4 and 8.

## 1. Principles

- **Flat numbers.** Armour subtracts from damage. There is no percentage cut and no 85% cap.
- **Whole numbers.** Stats, gear values and hits are whole numbers. The sim computes in doubles and rounds once, at the end of a hit, a heal or a derived stat.
- **Scale 10x.** A level 1 hero has about 550 HP. Damage per hit is about 30-60. A level 1 monster has about 400 HP and about 20 damage. Armour at the start is about 5-15. This keeps the swing and the armour working in whole numbers.
- **All stats lift together.** Never inflate one side (HP, damage, Defence, magic damage, Resistance) to make a fight harder or easier. A stronger unit gets all its stats lifted by the same factor. This holds for rare monsters and bosses too. No boss with 4,700 HP and 10 damage.
- **Attributes drive stats.** Most hero stats come from Strength, Agility and Intelligence. Defence is the one exception.
- **Monsters have flat stats only.** No attributes. A boss may get attributes later, but only the flat stats count in combat.
- **Targets are soft.** Every balance target in this file is a guide. A result inside a tolerance is a pass. Unless a target says otherwise, the tolerance is 15%. Do not chase the last few points at the cost of another rule (for example the HP / damage ratio of monsters).
- **Every craft must matter.** A crafted item must give a clear gain, so the player has a reason to craft it. No item gives 0 of every useful stat. Every armour piece gives at least 1 Defence at every item level. A stat that the current monsters cannot use (for example Resistance while all monsters hit physically) does not count as a gain. Check this for upgrade levels too: with whole numbers, a +3% step on a small value shows nothing.
- **Item numbers are whole numbers.** No decimals on items. Quality and affixes still add on top.
- **Boss stats are flat numbers** in `monsters.json`, not a factor. A validator check keeps the four stats (HP, damage, armour, Resistance) on one factor of the level curve, within the tolerance.

## 2. Hero stats from attributes

| Stat | Formula |
|---|---|
| Physical damage | base physical damage + main attribute x k + weapon. The main attribute is Strength or Agility (`primaryAttribute`). |
| Magical damage | base magical damage + Intelligence x k + weapon |
| Max HP | class base HP + Strength x k |
| Mana, Stamina, Rage, Hatred | Fixed pool. No attribute and no level gives more. Skills and items change it later. Warrior and Archer use Stamina. Only Mage and Priest use Mana. |
| Defence (physical armour) | class base Defence + gear + abilities. No attribute and no level gives Defence. |
| Resistance (magical armour) | base Resistance + Intelligence x k + gear |
| Attack speed | see section 3 |
| Critical chance | see section 5 |

- A `k` and a class base value can have decimals. The derived stat is rounded to a whole number. Avoid round values (ending in 0 or 5) for `k` and for starting values such as base HP, so the results do not all end in 0 or 5.
- Resistance = class base Resistance + Intelligence x k. There is no gain per level.
- A magic class uses Strength for its physical damage, as before.
- The Skill stat is deleted. Agility replaces it. Skill no longer gives crit.
- Each class has a base and a gain per level for Strength, Agility and Intelligence (the Dota and Warcraft 3 way). The current wide spread of growth is dropped. HP, damage and Mana then follow from the attributes. The `growthPerLevel` block in `classes.json` is replaced by attribute growth plus base values.

### Attribute budget

- **Every class has about the same attribute total.** The sum Strength + Agility + Intelligence at level 1 is close for all classes. The sum of the gains per level is close for all classes too. A difference of up to 15% between classes is allowed. A class differs mostly by how the points are split.
- Round 2 draft: start total 53 / 50 / 51 and gain total 5.2 / 4.8 / 4.6 for Warrior, Archer and Mage. Check this for every new class and every change to an attribute value.
- The primary attribute gain is about the same for all damage classes, so damage stays equal at the same gear.

## 3. Attack speed and attack time

Attack time is the number of seconds for one basic attack. It is not attacks per second.

```
attackTime = baseAttackTime / (1 + attackSpeedBonus)
attackSpeedBonus = Agility x k + gear + buffs
```

- Default `baseAttackTime` is 1.65 seconds. A class or monster can have its own value (round 2).
- Example: 1.65 / (1 + 0.25) = 1.32 seconds.
- Bonuses add together: Agility, gear, Haste, and Slow as a negative number. One shared pool, as in Dota.
- There is no minimum attack time.
- The pool must keep `1 + attackSpeedBonus` above 0, or the division breaks. The code needs a guard for this (value to decide).
- Spells use cooldowns only. Attack speed does not change a spell cooldown.
- **Cast time.** Each spell has a fixed `castSeconds` in `spells.json`. The default is 0.8 s. A spell can set a different value, including a fast cast or an instant cast (0 s).
- While a hero casts, it does not attack. The cooldown starts when the cast starts.
- Attack speed (Agility, gear, Haste, Slow) does not change cast time for now. The class base attack time does not change it either.
- A cast costs the attacks the hero would have made in that time. A spell needs enough power to be worth it. Check every spell against its cast time when we tune spells.
- Monsters have a `baseAttackTime` and no Agility.

## 4. Hit order

1. Attack = (base + attribute x k + weapon) x swing. The swing is a random number around 1 (the class value in `classes.json`). It stands for a damage range like 11-13 in Warcraft 3, shown as one number.
2. x spell power (the percentage of a spell, for example 162%). A basic attack has power 1.0.
3. x critical multiplier, if the hit crits.
4. minus the armour of the target (Defence for a physical hit, Resistance for a magical hit).
5. If the result is 0 or less, the hit does 1 damage.
6. Round once.

- Armour applies to each hit. Many small hits (Quick Shot, Combo Strike, Volley, the Thief) are weaker against armour. This is by design. Monsters keep low armour, about 5-10 at the start.
- Status effects: Fortify is a percentage of the Defence value. Guard and Sunder are percentages of the armour value that the hit uses (Defence for a physical hit, Resistance for a magical hit). Weaken and Hex work as percentages of damage. Slow is a negative value in the attack speed pool (section 3). Armour penetration is a share of the flat armour.
- Burn uses the attack of the caster and the Resistance of the target. It has no swing and no crit.

## 5. Critical hits

| Part | Rule |
|---|---|
| Chance | Base 4% for all heroes. Gear and passives add to it. |
| Damage | 200% |
| Thief | +2% base chance (class trait), so 6%. |
| Spells | A spell can crit. Each hit rolls on its own. A 5-arrow Volley rolls 5 times. |
| Burn ticks and heals | No crit. |
| Later | Passives. Example: the Ranger turns Agility into crit chance, the Barbarian turns Strength into crit damage. Both stay locked behind upgrades. Items add chance and damage. |

## 6. Healing

- A heal is a percentage of magic attack. It is not a separate stat.
- A later, stronger heal can use both: `magic attack x power + Intelligence x k`.
- A value can be a raw number or a percentage, as the skill needs.

## 7. Monsters, rare monsters and bosses

- A normal monster has HP, damage, armour, Resistance and `baseAttackTime`, all from one level curve. Armour is low, about 5-10 at the start.
- A rare monster is the same curve with all stats lifted by one factor. A boss has flat numbers in `monsters.json` that sit on one common factor of the curve (validator, 15%). The old rare rule (2.5x HP only) and the old boss `fixedStats` (8,000 HP, 7.7 attack) go away.
- The boss still has spells and a target rule. Spell numbers follow the same lift.
- Round 2 sets the numbers.

### Linked growth rule

Fight duration, hero HP and monster damage are linked. For the same share of HP lost in a fight:

`monster damage growth = hero HP growth / fight duration growth`

If hero HP grows 1.5x and the fight gets 1.4x longer, monster damage grows about 1.07x. A duration target that grows faster than hero HP makes monster damage fall. Check this before you set a duration target.

## 8. Class traits so far

| Class | Trait |
|---|---|
| Thief | +2% base crit chance |
| Warrior | High armour. The numbers come in round 2. |

## 9. What changes in the repo (after approval)

- `data/classes.json`: remove Skill. Add base and gain for Strength, Agility, Intelligence. Add base attack time and the base stats of section 2.
- `data/balance/battle.json`: remove `maximumDamageCut`, `mitigationBase`, `mitigationPerAttackerLevel` and the Skill crit values. Add crit chance and crit damage.
- `data/balance/monster-scaling.json`, `data/monsters.json`: new flat curve. Remove `hpFactor`-only rare rule and boss `fixedStats`.
- `src/systems/battle/damage.ts` and the stats code: new hit order and derived stats.
- `data/base-items.json`, `data/affixes.json`: flat damage and armour, attribute affixes, crit and attack speed affixes. Keep the names and give them the new effects.
- `data/spells.json`: recheck multi-hit spells, Empower crit, and every percentage of Defence.
- `design.md` sections 4, 4b, 8 and the glossary, plus `docs/agent/` files that name Skill or the cut table.
- `tools/balance-sim/` presets and targets, then `npm run check`.

## 10. Open questions

Decided: no minimum attack time. Slow is a negative value in the attack speed pool.

| Question | Default if no answer |
|---|---|
| Cast time and fast heroes: a fixed 0.8 s cast is slow for a fast hero, and costs it more attacks. | Later problem. Idea from the user: when attack time is shorter than the cast time, the cast uses the attack time. Decide when balancing fast classes. |
| Cast time per spell (fast and instant spells) | Default 0.8 s. Round 2 and the spell pass set the exceptions. |
| Guard value for `1 + attackSpeedBonus` (for example, the lowest allowed value 0.1) | Lowest allowed value 0.1. |
| Base attack time for each class | 1.65 s for all, then tune in round 2. |
| Values of every `k` (damage, HP, Mana, Resistance, attack speed per attribute point) | Round 2. |
| How much do boss and rare lift all stats? | Round 2. |

## 11. Round 2 draft numbers (not final)

Baseline classes: Warrior, Archer, Mage. All 7 classes stay in the game. The Priest, Thief, Barbarian and Fighter are balanced later, from these three. Values below are placeholders from the scratch simulation (basic attacks only, no spells, expected values, swing and crit left out).

Constants: HP per Strength 14.6. Resistance per Intelligence 0.2. Attack speed bonus 0.3% per Agility point. Monster attack time 1.65 s. Weapon damage placeholder 8 + 1.5 per level. Gear Defence placeholder per level: Warrior 1.0, Archer 0.55, Mage 0.45.

| Class | Start Str / Agi / Int | Start total | Gain per level | Gain total | Class base HP | Class base damage | Base Defence | Base Resistance | Base attack time |
|---|---|---|---|---|---|---|---|---|---|
| Warrior | 26 / 18 / 8 | 52 | 2.2 / 1.9 / 0.9 | 5.0 | 213 | 13 | 5 | 3 | 1.65 s |
| Archer | 18 / 23 / 11 | 52 | 2.1 / 2.6 / 1.2 | 5.9 | 207 | 13 | 3 | 4 | 1.5 s |
| Mage | 16 / 12 / 23 | 51 | 2.1 / 1.2 / 2.6 | 5.9 | 196 | 21 | 1 | 4 | 1.7 s |

Note: Warrior Strength gain per level lowered from 2.4 to 2.2 (the Warrior won 63% with full Magic gear, the other melee classes 46-49%). Its Full Magic gear win rate is now 58%.

| Level | Class | HP | Base damage | + Item | Base Defence | + Item |
|---|---|---|---|---|---|---|
| 1 | Warrior | 593 | 39 | 8 | 5 | 0 |
| 1 | Archer | 470 | 36 | 8 | 3 | 0 |
| 1 | Mage | 430 | 44 | 8 | 1 | 0 |
| 5 | Warrior | 739 | 49 | 14 | 5 | 4 |
| 5 | Archer | 587 | 46 | 14 | 3 | 2 |
| 5 | Mage | 546 | 54 | 14 | 1 | 2 |
| 10 | Warrior | 914 | 61 | 22 | 5 | 9 |
| 10 | Archer | 747 | 59 | 22 | 3 | 5 |
| 10 | Mage | 707 | 67 | 22 | 1 | 4 |

Normal monsters (balance pass 4 on the real-time simulator: HP up to 1,250, damage up to 115, armour up to 13; the table is for statFactor 1). HP lost is the average of the baseline classes in the first fight against a same-level monster, from `npm run scenarios -- first-fight` (spells on; level 1 with the main hand weapon only, levels 2-10 with Common gear of the best item level; in brackets: crafted Magic gear). Kill time is the average of Warrior, Archer and Mage.

| Level | HP | Damage | Armour | Resistance | HP / damage | HP lost Warrior / Archer / Mage | Average | Kill time |
|---|---|---|---|---|---|---|---|---|
| 1 | 430 | 36 | 0 | 0 | 11.9 | 44 / 48 / 54 | 49 (38) | 16.2 s |
| 2 | 580 | 53 | 1 | 0 | 10.9 | 57 / 65 / 70 | 64 (52) | 16.2 s |
| 3 | 660 | 59 | 2 | 0.5 | 11.2 | 64 / 69 / 75 | 69 (55) | 15.0 s |
| 4 | 750 | 67 | 3 | 1 | 11.2 | 64 / 55 / 63 | 61 (43) | 13.6 s |
| 5 | 840 | 75 | 4.5 | 1.5 | 11.2 | 68 / 67 / 73 | 69 (47) | 15.5 s |
| 6 | 930 | 84 | 6 | 2 | 11.1 | 61 / 66 / 57 | 61 (34) | 16.9 s |
| 7 | 1015 | 93 | 8 | 3 | 10.9 | 67 / 62 / 52 | 60 (30) | 15.8 s |
| 8 | 1095 | 101 | 10 | 4 | 10.8 | 57 / 67 / 64 | 63 (27) | 17.3 s |
| 9 | 1170 | 108 | 12 | 5 | 10.8 | 64 / 67 / 63 | 65 (25) | 16.5 s |
| 10 | 1250 | 115 | 13 | 5.5 | 10.9 | 58 / 63 / 72 | 64 (29) | 15.3 s |

Targets used (soft, tolerance 15%): HP lost on the first fight averages 50% at level 1 and 60-70% at levels 2-10. Monster HP / damage stays near 10-12. Level 10 HP is at least about 900. Armour reaches about 13 at level 10. Resistance is about 40% of armour (a magic hero hits it, but all monsters hit physically). Crafted Magic gear stays clearly better (13 to 37 points less HP lost).

Method of this pass: armour was added first (it cut the average HP lost by about 20%), then HP and damage were lifted together (HP lost grows with HP x damage) until the average sat at 60-68%. Damage went down against pass 2 (112 to 99 at level 10) because armour makes the same damage cost more time. The dips of the first-meeting average at levels 4, 6 and 8 are the gear unlock steps (helm, legs, chest).

Method of pass 4 (real-time simulator): first the mob factors, then the anchors. A fast mob hits more often, so each normal monster got `statFactor` = sqrt(attack seconds / 1.65) (rat and wolf 0.92, spider 0.95, goblin 1, scarecrow, toad and hobgoblin 1.04). This removed the jumps between levels that came from the dungeon mob (before: 60 at level 3 with the wolf, 37 at level 6 with the toad). Then HP and damage were lifted together by about 1.2-1.25 and trimmed twice. HP lost reacts strongly to the lift (a 25% lift of HP and damage raised it from about 42 to about 80), so one trim step of 6-8% moved it by about 15 points. Armour, Resistance and monster attack times were not changed. Monster speed and size in `battlefield.json` were not changed. Result: 49, 64, 69, 61, 69, 61, 60, 63, 65, 64 (crafted Magic 38, 52, 55, 43, 47, 34, 30, 27, 25, 29).

Boss (flat numbers in `monsters.json`, level 10 curve = 1,250 / 115 / 13 / 5.5): Goblin Chief HP 1,500 (x1.20), damage 138 (x1.20), armour 17 (x1.31), Resistance 7 (x1.27), basic attack every 1.65 s. One common factor of about x1.2, each stat within 15% of it (armour is a whole number and stays higher on purpose: it cuts the weak weapon-only heroes hardest). Crushing Cleaver power 1.95 (about 269 damage), cooldown 12 s. Result with `boss-fight` on the real-time simulator (baseline classes): gear floor 60%, normal crafted gear 77%, weapon only 28%, one hero without gear 0%. The fight lasts about 17.6 s. Later buff (the fight was too easy with full Uncommon to Rare gear, and each dungeon clear now unlocks story and lore): the whole monster curve in `data/balance/monster-scaling.json` is lifted by a ramp of x1.00 at level 1 to x1.25 at level 10, all four stats together. Rare monsters follow the curve. Goblin Chief flat stats: HP 1,650, damage 152, armour 19, Resistance 8. Hobgoblin `statFactor` 1.12 (it only appears in this lair). `boss-fight` has a new state "full Magic gear" (between Uncommon and Rare). Result: gear floor 41%, normal crafted gear 44%, full Magic gear 58%, weapon only 11%, one hero without gear 0%. New targets: 25-50, 30-55, 55-75. In `first-fight`, Common gear now loses 66-99% of health against a monster of its own level (the player must craft), and crafted Magic gear loses 51-65%. Resource pressure: mana, stamina and hatred regeneration was halved (mana 0.9%, stamina 1.1%, hatred 1% of the pool each second) and the pools still start full. Goblin Chief HP 1,600, damage 148. `boss-fight` result: gear floor 43%, normal crafted gear 44%, full Magic gear 57%, weapon only 13%, one hero without gear 0%. Tried and rejected: the factor x1.45 (36% / 50% / 3%: too hard), a higher Cleaver power (2.6) with lower base stats (64% / 80% / 35%: weapon only over 30%), the factor x1.25 (57% / 71% / 21%: crafted gear too low). The gap between the gear floor and crafted gear stays near 17 points for every setting, so the crafted gear target of 85% sits at 77%, inside the 15% tolerance.

Open in this draft: the class spread of HP lost at levels 7-10 is smaller after pass 4 (Mage 52-72%, Warrior 57-67%, Archer 62-67%), but the placeholder classes are far off: Priest 76-99%, Fighter 79-99%, Thief 72-86%, Barbarian up to 90% at level 10. Attack time is not changed for now. Starting damage includes +5 for every class to offset the run-up time of the real-time battle.

## 12. Real-time battle spec (decided 2026-10-07, built and wired in stage B)

No rounds. Heroes and monsters move on a battlefield and fight in real time. The simulation uses fixed ticks and stores positions, so the same seed gives the same battle and playback stays deterministic. `simulateRealtimeBattle` runs the game, the balance simulator and the checks.

| Topic | Decision |
|---|---|
| Opening | Both sides start apart. Melee units meet after about 2.5 seconds of running. |
| Range | Each class and monster has an attack range. A ranged class covers about 1/3 of the battlefield. A melee unit must touch its target. Abilities may raise the range later. |
| Blocking | Units block each other. They cannot stand inside one another. A blocked unit slides sideways around the blocker. |
| Targeting | A unit targets the nearest enemy and checks again when a closer enemy arrives. |
| Start position | If the team has a melee unit, Archer and Mage (ranged classes) start slightly behind it. Without melee units, all start on one line. |
| Movement speed | A stat. All melee classes and all monsters have the same base value (6 per second). Ranged classes have 0.9 of it. Boots add +5% (percent points, no growth, no spread). Buffs come later. Haste does not change movement speed. |
| Casting | A hero stands still while it casts (see section 3). |
| Hit moment | Damage lands at half of the attack time. A ranged projectile is only visual and the damage lands at the release. |
| Target switching | Switch only when the new enemy is clearly closer (margin 2), or when the current one is out of reach for 1 s, so units do not flicker between targets. |
| Field shape | A shallow 2D field, 36 long and 8 deep. |
| Spell range | The range of a spell is the attack range of the unit, unless the spell says otherwise (`spellRangeFieldFractions`). |
| Monster attack time | Every normal, rare and boss monster of this town has a basic attack time of 1.0 to 2.0 seconds. The Warrior is 1.65 s. The validator checks the range. |
| Boss | A normal monster lifted by one common factor (x1.2 now). The burst comes from its spells. |
| Duration targets | Run-up time is not counted in the targets for now. Each class got +5 starting damage to offset it. |

Placeholders to tune in the simulation: battlefield length, start gap, movement speed, body size, range of each class (all in `data/balance/battlefield.json`).

Known limit: a side puts its units in one start line spread over the depth, so each unit gets depth 8 / (units + 1). With 8 or more units on one line this is less than the body width of 1.0 and the bodies overlap. A second rank or a deeper field is needed before such fights exist. Today a fight has at most 3 monsters and a party of at most 2.

Open questions (defaults if no answer):

| Question | Default |
|---|---|
| Ranged units never kite: they stand and shoot even when a monster is on top of them. | Keep for now. |
| Units act in input order within a tick, so the first unit wins a same-tick trade. | Keep. A tick is 0.05 s. |

## 13. Later work (planned)

- **Customisable hero sprites.** Equipped items change the look of the full-body figure and the battle sprite. Portraits stay as they are. This needs a link from items to looks in the data, layered sprite parts, and updates to `docs/agent/pixel-art.md`.
- **Attack animation and movement in the battle view.** Run-up, attack frames and positions. Needs the position and event format of the real-time simulation.
- **Plan.** Phase 1: stats and damage core. Phase 2: real-time simulation. Phase 3: battle view. Phase 4: customisable sprites. Phase 5: items, affixes and spells rebalance. Each phase ends with `npm run check` and the user's review.
- **Effect on balance.** Fight duration targets, `maximumBattleSeconds` and ranged classes need a re-check after phase 2.

## 14. Gear budget (decided)

Phase 5 numbers. They are final for bracket 1 (soft tolerance 15%). All item stats are whole numbers. Percent stats (attack speed, movement speed, critical chance, critical damage, life steal) are percent points. Movement speed is only on boots and stays unscaled (`unscaledBaseStats`).

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

Heavy is strictly above Medium, and Medium is at or above Light. No armour piece gives less than 2 Defence. Resistance of boots stays as before. Boots give +5% movement speed (percent points, no growth, no spread) in place of the old +3% attack speed.

**Rule of thumb.** Each piece cuts 5-10% of the monster hit of its own item level for Heavy, and slightly less for Light. Cut by hero level with the full set (all pieces of the level worn):

| Hero level | Heavy | Medium | Light |
|---|---|---|---|
| 1 | 26% | 17% | 9% |
| 8 | 42% | 26% | 17% |
| Target | 40% | 25% | 15% |

Levels between 1 and 8 grow in steps as the pieces unlock.

**HP.** Basic gear gives no HP. HP comes only from affixes (of the Bear, of the Whale) and set bonuses. The belt is the one exception, as a placeholder (below).

**Weapon damage** = round(W x typeMultiplier) at the item level L of the recipe, with W(L) = 7 + 1.6 x (L - 1).

| Type | Multiplier |
|---|---|
| One-handed main hand (sword, axe, mace, bow, wand) | 1.0 |
| Staff | 1.15 |
| Main-hand dagger and knuckles families | 0.85 |
| Two-handed (greataxe, maul) | 1.5 |
| Off-hand quiver and tome | 0.25 |
| Off-hand parrying dagger and cestus | 0.4 |

Examples: Sword (1) 7, Axe (3) 10, Longsword (5) 13, Battle Axe (7) 17, Broadsword (9) 20. The data keeps `baseStats` at item level 1 and a flat `growthPerItemLevel`, set so the damage at the own item level of the recipe equals the rule. The validator allows a difference of 1. Attack speed on weapons stays +3 for light weapons and -3 for two-handed weapons. Agility stays only on bows and daggers.

**Accessories (placeholders, usable by all classes).** Belt (6): Defence 3 and HP 30. Ring (7): critical chance +2%. Amulet (9): attack speed +4%.

**Upgrades (+1 to +7).** Each step adds a flat +1 to the main stat: Defence for armour, shield and belt, damage for weapons and off-hand damage items, critical chance for the ring, attack speed for the amulet. The item level and the other stats do not change. Sell value still grows 3% per step.

**Every craft must matter.** The validator fails when an armour piece gives less than 2 Defence, the order Heavy > Medium >= Light breaks, a base stat is not a whole number, a weapon differs from the rule by more than 1, or a craftable item has no useful stat (Resistance alone does not count).

**Resource pools (fix of the regeneration halving).** Halving the regeneration was the wrong lever: a cost of 35 was too big for a pool of 42. The regeneration is back at mana 0.018, stamina 0.022 and hatred 0.02 of the pool each second. The pools are cut: mana 42 to 30, stamina 38 to 28, hatred 31 to 24, rage 33 to 26. Every spell cost is now a share of the pool of its class: basic 17-30%, mid 34-37%, big non-ultimate 40% (one thief spell is 42% by rounding), Ultimate 55-92%. Cost before and after (old pool, new pool): Warrior Power Strike 6 to 5, Cleave 11 to 8, Mighty Blow 16 to 10, Iron Wall 35 to 11, Heroic Strike (Ultimate) 39 to 15; Mage Fire Bolt 6 to 6, Fireball 11 to 9, Arcane Surge 35 to 12, Inferno 39 to 16; Priest Minor Heal 5 to 5, Smite 6 to 6, Divine Shield 8 to 7, Sanctuary 35 to 12; Thief Backstab 6 to 5, Eviscerate 16 to 8, Shadow Strike 39 to 13; Barbarian Savage Swing 6 to 5, Thick Skin 22 to 10, Mountain Breaker 39 to 14. Biggest Ultimates 69 / 99 / 129 became 70 / 82 / 90% of the pool. `resource-use` (lowest point at Lv 10, normal fight): Warrior 3 to 6, Archer 10 to 7, Mage 20 to 16, Priest 31 to 29, Thief 7 to 6 percent (about the same pressure as the halved regeneration). `boss-fight` (baseline classes): gear floor 42%, normal crafted gear 45%, full Magic gear 58%, all inside the targets 25-50 / 30-55 / 55-75. Intelligence gives no pool and no regeneration (it gives Magical damage and Resistance only).

Intelligence and mana: Intelligence adds 1% of the base mana regeneration for each point (`manaRegenBonusPerIntelligence`). Mage and Priest have 23-47 Intelligence at levels 1-10, so +23% to +47% before gear. `boss-fight` full Magic gear moved from 58% to 60%. Stamina, hatred and rage have no attribute link.
