# Emberforge design - Battle and monsters

Part of the game design. The headings of `docs/design.md` list every section and the file it is in. Section numbers are the same in every file.

## 8. Battle

### Rules

- **Real-time battle.** There are no rounds. Heroes and monsters move on the battlefield (36 long, 8 deep) and fight in real time, simulated in fixed ticks of 0.05 s. The whole fight is simulated at once from a seed and then played back. Spells use cooldowns only: attack speed does not change a cooldown. Numbers: `data/balance/battlefield.json`. Details: `docs/balance/realtime-battle.md`.
  - **Opening:** both sides start apart. Melee units meet after about 2.5 s of running. The run-up counts in the fight length.
  - **Range:** a melee unit must touch its target. A ranged class (Archer, Mage, Priest) hits across about 38% of the field. A spell has the range of the attack of the unit, unless the spell sets its own.
  - **Movement speed:** a stat. All melee classes and all monsters run at 6 per second, ranged classes at 0.8 of that. Boots add +5%. Haste does not change movement speed.
  - **Blocking:** units are circles (hero and normal monster radius 0.5, rare 0.6, boss 1.0). They cannot stand inside each other. A blocked unit slides around the blocker. Dead units do not block.
  - **Start position:** with a melee unit in the team, the ranged classes start 2 behind it. Without one, all start on one line. A side with 8 or more units on one start line would overlap, so such fights need a second rank or a deeper field first.
  - **Targeting:** a unit attacks the nearest enemy and switches only when another enemy is clearly closer (margin 2) or the target cannot be reached.
  - **Cast time and hit moment:** a unit stands still while it casts (`castSeconds`) and while it attacks. The damage of a basic attack lands at half of the attack time. A ranged projectile is only visual, and its damage lands at the release.
- **Attack time** = base attack seconds ÷ (1 + attack speed bonus). The bonus is Agility × 0.003 + gear + Haste, and Slow is a negative number in the same pool. There is no minimum attack time, but `1 + bonus` never goes below `minimumAttackSpeedFactor` (0.1). Example: 1.65 ÷ (1 + 0.25) = 1.32 s. A monster has a `baseAttackTime` (`attackSeconds`, default 1.65 s) and no Agility. **Attack time rule for monsters:** every normal, rare and boss monster has a basic attack time from 1.0 to 2.0 s (the validator checks it). The Warrior is 1.65 s. The attack time of each monster is in A5 of `docs/balance/bracket-NN.md`.
- **Action:** a spell (see section 4b), or a basic attack. The Priest first heals an ally below 50% HP with its basic action (never itself), so a lone Priest fights like any other hero.
- **Damage (the flat rule).** `hit = attack × swing × spell power × critical multiplier - armour`. Armour is Defence for a physical hit and Resistance for a magical hit. If the result is 0 or less the hit does 1 damage. The result is rounded once, at the end. There is no percentage cut and no cap.
  - Fortify, Guard and Sunder are shares of the flat armour value. Weaken and Hex are shares of the damage, applied before the armour. Armour penetration (`armourPenetration`) is a share of the flat Defence. Burn is the caster's attack × strength minus the Resistance, with no swing and no crit.
- **Swing:** the attack of each hit is multiplied by a random number around 1. The size belongs to the class (`damageVarianceFraction` in `classes.json`): Warrior 90-110%, Fighter 88-112%, Priest 85-115%, Thief 82-118%, Archer and Mage 80-120%, Barbarian 75-125%. Monsters swing 90-110%. Burn has no swing.
- **Critical hit:** base chance 4% for every hero (the Thief 6%), damage 200% (`data/balance/battle.json`). Gear adds chance and damage. The chance stays at most 50%. A spell can crit, and each hit rolls on its own (a 5-arrow Volley rolls 5 times). Burn ticks and heals never crit. Monsters use the same base chance.
- **Life steal:** a unit heals this part of the damage it deals, with basic attacks and damage spells, up to its maximum health. The heal shows as a heal event on the unit itself. Monsters have none.
- **No misses.**
- **Deterministic:** a battle is simulated first from a seed (`simulateRealtimeBattle`), then played back at 1×, 2× or 4× speed. The seed and the party are stored when the battle starts, and the report (events, tracks, action events) is rebuilt from them, so after a reload the same battle replays from its start.
- **Between fights:** heroes heal 30% of max HP. Knocked-out heroes wake with 30% HP.
- **End of a run** (stop, wipe or weak party): the party returns to town and heals fully. The player keeps all loot. There is no other penalty.

### Monsters

- **Encounter size:** 1-3 monsters, never more than the party size. A solo hero meets 1 monster.
- **Rare monster:** 2% of encounters. All stats lifted by one stat factor (1.25, the user may change it). Drops ×3 of its dungeon material and 3 × the Quartz chance of its normal monster. Pays ×3 XP.
- **Flat stats only.** A monster has HP, damage, armour, Resistance and attack time, and no attributes. It follows one level curve (`data/balance/monster-scaling.json`: anchors per level, joined by straight lines, and above the last anchor the last segment goes on). A normal or rare monster has one `statFactor` in `monsters.json` (default 1) that lifts HP, damage, armour and resistance together. A boss has explicit `flatStats` (HP, damage, armour, Resistance, attack seconds). The validator keeps the four stats of the boss on one common factor of the curve at its dungeon level, within 15%. Never lift one stat alone: a stronger unit gets every stat lifted by the same factor.

The anchors (HP, damage, armour, Resistance for each level) are in `data/balance/monster-scaling.json`. The values of each bracket are in A2 of `docs/balance/bracket-NN.md`. Armour and Resistance are rounded to whole numbers when a monster is built. Resistance is set at about 40% of armour: all monsters hit physically, but a magic hero (basic attack and spells) hits Resistance.

- **Targets (soft, `npm run scenarios -- first-fight`):** a hero of level L meets a normal monster of level L for the first time. Crafted Magic gear of the best item level is the reference. Common gear is a hard fight. The HP lost band for each level and gear state is in A11 of `docs/balance/bracket-NN.md` and in `targetHealthLostPercentByLevel` in `tools/balance-sim/presets/first-fight.json`. Monster HP / damage stays near 10-12.
- **Results and known limits** of a bracket are in its balance file (Part B and A12).

- **Linked growth rule:** for the same share of HP lost in a fight, monster damage growth = hero HP growth ÷ fight duration growth. Check this before you set a duration target.
- **Equal threat for every mob.** Mob attack times differ. A fast mob would hit more often, so each normal monster has `statFactor` = sqrt(attack seconds / 1.65). A fight costs about HP x damage / attack time, so this square root keeps the HP lost the same for every mob. A monster may sit below the rule on purpose. The balance file says which one and why (A5). The anchors are for a monster with `statFactor` 1.
- **Armour penetration (mechanism only):** a monster can have `armourPenetration` in `monsters.json` (above 0, below 1). Its physical hits ignore that share of the flat Defence of the hero. Resistance is not cut. No monster uses it yet. It is kept for later tiers.

### Boss

- One boss per town. The balance file of the bracket names the boss, its dungeon, the enter level and the recommended level (A5, A8).
- **Party and adds:** the boss needs 2 heroes. The fight has 0 or 1 adds (a normal monster of its dungeon), because adds never exceed the party size minus 1.
- **Rewards:** the drops are in A8 of the bracket file. A boss pays ×5 XP.
- **Stats (flat numbers in `flatStats`):** a boss is a normal monster lifted by one common factor of the level curve at its dungeon level. The validator keeps the four stats (HP, damage, armour, Resistance) within 15% of their common factor and the attack time inside 1.0-2.0 s. The boss burst comes from its spells, not from a slow attack. The dungeon level does not change a boss. The spells use a share of its attack, so they follow the attack.
- **Targeting:** every monster picks its target like a hero does: the nearest enemy (see the real-time battle rules).
- **Spells:** a boss casts spells (`spellIds` in `monsters.json`, data in `data/monster-spells.json`, ids start with the monster id). A monster spell costs no resource and waits only for its cooldown. Each boss has three spells with their numbers in A8 of the bracket file. The dungeon screen shows them. A boss has a wound spell (healing received down), so a heal class cannot out-heal it.
- **Tuning target (soft, `npm run scenarios -- boss-fight`, real-time simulator):** the win rate bands for the gear states (gear floor, normal crafted gear, full Magic gear, weapon only, one hero without gear) and the fight length are in A8 and A11 of the bracket file. The bands are `targetWinRatePercent` in `tools/balance-sim/presets/boss-fight.json`.
- **Weapon-only rule:** a weapon alone must not beat a boss. A hero with only its best weapon must lose (win rate under 30%), and the boss still needs a hero with all 11 slots filled.

### Duration targets (1× speed)

- **Normal fight** (one hero, best gear at the normal quality odds, a monster of the hero level): the target seconds by level are `targetSecondsByLevel` in `mob-kill-time.json` and A11 of the bracket file. The run-up of the real-time fight (about 2.5 s) is in the time.
- **Boss:** `targetSeconds` in `boss-fight.json` (about 20 s).

### Experience

- **XP is a table of absolute numbers** (`data/balance/progression.json`). `experienceToNextLevelByLevel` holds the XP for each level. The values of each bracket are in A4 of the bracket file.
- `normalKillExperienceByHeroLevelThenMonsterLevel` has one row per hero level and one number per monster level at or below it: what a normal kill pays. There is no gap factor and no formula. A monster above the hero level pays like a monster of the hero level. Above level 10 the hero uses the level 10 row, scaled by how much more its level needs (exponent 1.5). Every party member gets full XP.
- **Kills to level** in the best dungeon: the target is 2-4 in the first levels and 5-7 in the last (A4 of the bracket file). The numbers sit just under a whole kill on purpose, so a level-up leaves a bit of XP over and the next bar is never empty. Each lower monster level adds about 1.5 kills, so low monsters stay a slow but real source. Kills in each column grow by 1 to 4 from one level to the next, so no level jumps.
- **Rank multiplier:** rare ×3, boss ×5.
- Check and change: edit the numbers in the file, then run `npm run scenarios -- experience`. It prints the XP left after each level-up and flags a level where more than 15% of level-ups land on the line, with 0%, 30% and 50% of fights in the level 1 dungeons.

### Balance targets

The targets live in the preset files in `tools/balance-sim/presets/` and in Part A of `docs/balance/bracket-NN.md`. `npm run scenarios` prints each result next to its target.

### Balance scenarios

- Every fight scenario uses the real-time simulator (`simulateRealtimeBattle`). Six scenarios run from preset files in `tools/balance-sim/presets/`: `economy`, `experience-curve`, `mob-kill-time`, `boss-fight`, `resource-use`, `crafter-curve`. Run all with `npm run scenarios`, or one with `npm run scenarios -- boss-fight` (names: `economy`, `experience`, `mob-kill-time`, `boss-fight`, `resource-use`, `crafter-curve`).
- **To test a balance idea, change the preset file or the game data. Do not change the simulator code.** A preset holds the level range, the classes, the number of fights, the seed and the targets.
- In the fight scenarios the hero wears the best gear it can equip at its level (the recipe with the highest item level per slot, without set pieces) and uses its best spells.
- `economy`: fights and copper (all loot sold) at each level. `experience`: kills to level against each monster level and in the best dungeon. `mob-kill-time`: seconds, win rate and HP lost per class and level. `boss-fight`: win rate and fight time for each gear state (`gearStates`), with a level 10 hero of every class and a level 7 partner of every class; the result averages the Warrior, Archer and Mage as the strong hero. Add 10 to `partnerLevels` to test two level 10 heroes. `crafter-curve`: crafter level per profession at each hero level for a share of fights (`levelOneDungeonFightShare`) in the level 1 dungeons, with every basic material going into the best recipe; it flags a crafter more than `maximumLevelsBehind` behind. `resource-use`: the lowest point and the average of each class resource pool in a normal fight and the boss fight.
- Run `npm run scenarios` after any change to XP, stats, items, spells or monsters, and fix the numbers in `data/` until the targets hold.
