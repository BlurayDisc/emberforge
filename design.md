# Emberforge - Game Design

Working title. Pixel-art, real-time-battle, Middle-earth-style fantasy. You lead a company of heroes and run a workshop.

This file holds the game rules and the current numbers. It does not hold code layout or change history (see `docs/agent/` and git). Numbers that live in `data/` are named by their JSON key. Balance tables for each bracket (curves, pacing, dungeons, crafts, boss, simulator results) live in `docs/balance/bracket-NN.md`, made from `docs/balance/_template.md`.

## 1. Core loop

Fight → Loot → Craft → Equip → Travel → Fight (harder).

Heroes fight automatically. The player sends heroes into dungeons (one hero for a normal dungeon, two for a boss dungeon). Different heroes can fight in different dungeons at the same time, and the player watches one battle at a time. The player crafts, equips and sells while the fights go on.

## 2. Technology

**Pixi.js + TypeScript + Vite.** Static site. No server.

- **Stage** (town, battle, castle): Pixi.js, 480×270 logical pixels, scaled to fill the window. One Pixi canvas draws every stage view.
- **UI** (backpack, crafting, roster, panels): DOM and CSS with a pixel font.
- **Audio:** synthesized in the browser with Tone.js, no sound files.
- **Logic:** plain TypeScript with no browser, Pixi.js or audio code, so a Node balance simulator can run it.
- **Later:** Tauri 2 desktop builds (also iOS and Android), installable PWA.

Why not libGDX or Godot: the game is menu-heavy (grids, tooltips), libGDX UI is weak and its web build is slow; Godot is editor-centred, its web build is large and text-only (AI-assisted) work is harder.

## 3. Glossary

| Word | Meaning |
|---|---|
| Company | All heroes the player owns (max 12). |
| Run party | The hero or heroes sent into one dungeon run. A dungeon hosts one run at a time and a hero is in one run at a time. A normal dungeon takes exactly 1 hero. A boss dungeon takes exactly 2 (`minimumPartySize` and `maxPartySize` in `dungeons.json`; the validator checks that `minimumPartySize` is 2 if and only if the dungeon has a boss). There is no permanent party. |
| Bracket | A block of 10 levels (1-10, 11-20 … 91-100). |
| Tier | Material grade. Tier N belongs to bracket N. |
| Town | Hub of one bracket: workshop, merchant, tavern, dungeons. |
| Dungeon | A place with 1-3 monster types. The player runs it again and again. |
| Encounter | One fight: 1-3 monsters. |
| Material | A loot item used to craft. |
| Base | An item type, for example Sword. |
| Affix | A prefix or suffix that adds a stat to an item. |
| Quality | Common, Uncommon, Magic, Rare or Unique. Legendary is reserved between Rare and Unique, with no rules yet. |
| Resource | The pool that pays for the spells of a class: Mana, Stamina, Hatred or Rage. The pool is fixed: no level and no attribute changes it. |
| Attribute | Strength, Agility or Intelligence. Most hero stats follow them. Defence is the one exception. |
| Defence / Resistance | Flat armour. Defence takes points off a physical hit, Resistance off a magical hit. |
| Attack time | Seconds for one basic attack. |
| Battlefield | The 2D field of one fight (36 long, 8 deep). Heroes start on the left and monsters on the right. |
| Range | How far a unit can hit, edge to edge. A melee unit must touch its target. A ranged class (Archer, Mage, Priest) hits across about 1/3 of the field. |
| Movement speed | How fast a unit runs on the battlefield. Boots add a percent bonus. |
| Cast time | Seconds that a unit stands still while it casts a spell. |
| Hit moment | The point of an attack where the damage lands: half of the attack time. A ranged projectile is only visual. |
| Stat factor | The one number (`statFactor` in `monsters.json`) that lifts the HP, damage, armour and resistance of a normal or rare monster together. A boss has flat numbers instead (`flatStats`) that sit on one common factor of the curve. |
| Spell | An active ability that a hero learns from a trainer and equips. An Ultimate is a strong spell with its own slot. |
| Player move | Any command from the player. The game saves after each one. |

## 4. Heroes and classes

- **Level cap 10** (`levelCap` in `data/balance/progression.json`): the first town is the whole game for now, and the cap grows when a new town opens. A hero at the cap gets no more experience, and its bar says MAX LEVEL. Spells above the cap stay in the data, but the Academy does not list them.
- **Attributes:** Strength (Str), Agility (Agi) and Intelligence (Int). There is no Skill stat. Each class has a start value and a gain per level for each attribute (`attributes` in `classes.json`). Attribute at level L = round(start + gain × (L - 1)). Every class has about the same attribute total (start total and gain total within 15% of the baseline classes). A class differs by how the points are split. The validator checks this.
- **Primary attribute** (like Warcraft or Dota): each class has one (`primaryAttribute` in `classes.json`). One point gives 1 attack damage. Warrior, Barbarian and Fighter use Strength. Archer and Thief use Agility. Mage and Priest use Intelligence.
- **Derived stats** (constants in `data/balance/hero-stats.json`, class base values in `classes.json`). Every derived stat is rounded to a whole number.

| Stat | Formula |
|---|---|
| Physical damage | `baseDamage` + primary attribute (physical class) or Strength (magic class) + weapon |
| Magical damage | `baseDamage` + Intelligence + weapon |
| Max HP | `baseHp` + Strength × 14.6 + gear |
| Defence | `baseDefence` + gear + abilities. No attribute and no level gives Defence. |
| Resistance | `baseResistance` + Intelligence × 0.2 + gear |
| Attack time | `baseAttackSeconds` ÷ (1 + attack speed bonus). The bonus is Agility × 0.003 + gear + Haste, and Slow is a negative number in the same pool. There is no minimum attack time, but `1 + bonus` never goes below 0.1 (`minimumAttackSpeedFactor` in `battle.json`). |
| Critical chance | 4% for every hero (`baseCriticalChance`) + class trait + gear. The Thief has +2%. At most 50%. |
| Critical damage | 200% (`criticalDamageMultiplier`) + gear |
| Mana, Stamina, Hatred, Rage | A fixed pool (`maximum` in `data/balance/resources.json`) |

- **Balance status:** a class has `balanceStatus` in `classes.json`: `baseline` (Warrior, Archer, Mage: the numbers of the rebalance spec) or `placeholder` (Priest, Thief, Barbarian, Fighter: derived from the baseline so the game runs, and waiting for their own balance pass).
- **Damage of a hero:** a hero attacks with the damage kind of its class.
- **Start and money:** the company starts empty. The player starts with 50 copper, for the first crafter fees. The **first hero is free** at the Tavern (any open class). More heroes cost gold: 3s (300 copper), 9s, 27s … (×3 each, `heroHireCostByCompanySize`). Monsters drop no money: the player earns money only by selling materials and items at the merchant. A solo hero who sells every material holds about 75 copper at level 3, 215 at level 6 and 420 at level 10, so the second hero is a goal for level 5 to 6.
- **Money:** 100 copper = 1 silver, 100 silver = 1 gold. The game stores copper only.
- **Statistics:** each hero records monsters defeated, damage dealt and taken, healing done, fight time, and battles won and lost. The Heroes screen shows them with damage per second and **Power** (the square root of damage output times durability).
- **Promotion** (Fire Emblem style): at Lv 20 the player picks one of two branches. At Lv 50 the hero takes the master class. The hero keeps the level. The data and texts exist in `data/advancements.json` (2 branches per base class, 1 master per branch). The promotion command and screen are not built yet.

| Class | Role | Lv 20 branches | Lv 50 master | Weapon | Off hand | Armour |
|---|---|---|---|---|---|---|
| Warrior | Front melee | Knight / Berserker | Marshal / Warlord | Sword, Axe, Mace | Shield | Heavy |
| Archer | Ranged physical | Ranger / Hunter | Pathfinder / Deadeye | Bow | Quiver | Medium |
| Mage | Ranged magic | Sorcerer / Warlock | Archmage / Voidcaller | Staff, Wand | Tome | Light |
| Priest | Healer, support | Cleric / Druid | Saint / Wildwarden | Mace, Wand | Tome | Light |
| Thief | Fast melee, crit | Assassin / Trickster | Nightblade / Shadowmaster | Dagger | Dagger | Medium |
| Barbarian | Two-handed brute | Marauder / Totem Warrior | Ravager / Spirit Chieftain | Greataxe, Maul | None (two-handed) | Medium |
| Fighter | Bare-handed brawler | Brawler / Disciple | Champion / Grandmaster | Knuckles | Knuckles (Cestus) | Medium |

- **Armour weights:** a class wears one or more weights (`armourWeights` in `classes.json`). The first is its main weight and sets the sound of a hit on the hero. The workshop class tags and the equip check use the list. The Barbarian wears Medium only (hide armour), so it takes more damage than the Warrior.
- **Hiring lock:** Warrior, Archer and Mage are open from the start. The others unlock when the player first clears a dungeon (`unlockAfterDungeonId` in `classes.json`). The Tavern shows a locked class with the dungeon to clear, and the hire command rejects it.

| Class | Unlocks after clearing |
|---|---|
| Thief | Goblin Chief's Lair |
| Priest | Goblin Chief's Lair |
| Barbarian | Goblin Chief's Lair (moves to a dungeon of the second town when that town exists) |
| Fighter | Old Wood Hollow |

### Defence and class direction

Defence and Resistance are flat armour. They are main stats, not attributes: Strength, Agility and Intelligence give no Defence, and no level gives Defence. Resistance follows Intelligence (`resistancePerIntelligence`). Gear and abilities add more of both.

**The flat rule.** Armour takes points off each hit. There is no percentage cut and no cap:

`hit = attack × swing × spell power × critical multiplier - armour`

If the result is 0 or less, the hit does 1 damage. The result is rounded once, at the end. A monster and a hero can never be hit for less than 1. Many small hits (Quick Shot, Combo Strike, Volley, the Thief) are weaker against armour. This is by design.

Each class aims at a direction:

| Class | Direction |
|---|---|
| Warrior | The physical wall. The highest base Defence and the heaviest armour. |
| Archer | Glass cannon. High attack and Agility, low Defence. |
| Mage | Magic damage and the Mana Shield. Fragile like the Archer. |
| Priest | Support and healing with mid magic attack. More Resistance than the Mage (placeholder numbers). |
| Thief | Fast base attack time, +2% critical chance, lower damage per hit (placeholder numbers). |
| Barbarian | More damage than the Warrior, less Defence (placeholder numbers). |
| Fighter | Between the Warrior and the Thief (placeholder numbers). |

Only the Warrior, Archer and Mage have baseline numbers. The other four are placeholders.

### Look

A hero looks the same in the portrait, the full-body figure and the battle sprite. Skin is one of 4 fair tones (`data/hero-appearance.json`). The Warrior is always male. The Archer and the Mage are always female, and the Mage always has red hair (`gender` and `hair` in `classLooks`). Names come from the matching list in `data/hero-names.json`; for the other classes the name sets the gender (`femaleNames`). Each class has its own face, pose, gear and weapon: the Warrior is a bulky knight with a smirk and a shield, the Mage a cold girl with eyeliner, purple eyeshadow and red lipstick who casts a spell, the Archer a swift girl who draws her bow. Girls have long hair beside the face, lashes, blush and fuller lips. Boys have a firm jaw line and light stubble.

## 4b. Spells

- **Active only.** Passive talents come later. The AI casts every spell in battle. The player chooses which spells a hero equips.
- **Slots:** each hero equips 3 spells and 1 Ultimate. A spell has a class and a level, and the hero learns it at that level.
- **Ranks:** a spell can have ranks (`familyId` and `rank` in `spells.json`, rank 1 has neither): Shield Bash, Shield Bash II, Shield Bash III. A hero must know the rank below. Learning a rank **replaces** the lower rank in the same slot and in the learned list, so a hero never holds two versions. A lower rank cannot be learned again. Ranks make a spell stronger (power, status value, cost). The names are `spell.<id>` in `i18n`. Every spell that is not an Ultimate shows its rank in Roman numerals in its name (Shield Bash I, II, III). The spell badge in the Academy shows the rank in Arabic numerals (Lv 1, Lv 2).
- **One schedule for all classes.** The Warrior is the blueprint: a new spell or rank every 2-3 levels, ranks of one family spread far apart so no basic spell maxes early, 6 families with 17 spells and ranks, and one Ultimate at level 20. New spells stop at the Ultimate, and ranks go on to level 42. Every class uses the same levels (family A 2/10/27, B 4/14/32, C 6/22/37, D 8/25/40, E 12/30/42, F 17/35, Ultimate 20), the same cooldowns and about the same costs and power, so the Academy price of the first 10 levels is the same for all classes (1,461 copper in total).
- **Identity, not filler.** Each family has one clear job. A spell that does not fit the class does not exist (the Warrior has no heal and no haste).
- **Reserved spells:** each class keeps 6 later spells and later Ultimates (levels 45, 70, 95) in `spells.json` with `reservedFor: "specialisation"`. The game does not load them, the validator still checks them, and a specialisation reuses them later, possibly with new numbers. The Warrior's are Crushing Blow, Thunder Slam, Unbreakable, Earthsplitter, Last Stand and Blade of Legends.

| Class | A: filler (2/10/27) | B (4/14/32) | C: self (6/22/37) | D (8/25/40) | E (12/30/42) | F (17/35) | Ultimate (20) |
|---|---|---|---|---|---|---|---|
| Warrior | Power Strike 162-198% | Shield Bash 100-120% + 62-80% Defence | Guard Stance, self Fortify +35 / 50 / 65% Defence for 8 s | Cleave, all enemies 175-225% and Weaken 10-15% for 5-6 s | Mighty Blow 210-270% and Sunder 12-18% for 6 s | Iron Wall, all allies Fortify +25 / 35%, self Thorns 20 / 30% for 8 s | Heroic Strike 468% |
| Archer | Aimed Shot 162-198% | Quick Shot, 2 hits of 99-119% | Fleet Foot, self Haste 20-36% | Evasive Shot 200-260% and Evade the next hit (2 hits at rank 3) for 6-10 s | Volley, 5 arrows of 45-55% spread over the enemies in turn, and Slow 10-15% | Hunter's Focus, self Empower +25 / 35% Agility for 10 s | Sniper Shot |
| Mage | Fire Bolt 162-198% | Frost Shard 150-180% and Slow 20-30% | Mana Shield: costs 25% of the maximum mana, absorbs 45 / 90 / 140 damage plus 6 / 9 / 12% of the maximum health, 10 s | Fireball 190-240% and Burn 20-30% of the attack each second for 4-5 s | Arcane Unravel 120-140% and Hex +15-25% magic damage taken for 8 s | Arcane Surge, self Empower +25 / 35% Intelligence for 10 s | Inferno |
| Priest | Minor Heal 200-260% | Smite 167-200% | Divine Shield, self Guard 25-40% | Healing Wave, all allies 120-160% | Holy Fire 210-270% and Weaken 12-18% | Sanctuary, all allies Guard 20 / 28% | Divine Hymn |
| Thief | Backstab 162-198% | Quick Stab, 2 hits of 99-119% | Dodge Roll, self Guard 25-40% | Smoke Bomb 175-225% and Weaken 10-15% | Eviscerate 210-270% and Sunder 12-18% | Adrenaline, self Haste 25 / 35% | Shadow Strike |
| Barbarian | Savage Swing 162-198% | Blood Fury 170-210% and heals 40-60% of the damage | Rage, self Haste 20-36% | Ground Pound 175-225% and Weaken 10-15% | Rending Blow 210-270% and Sunder 12-18% | Thick Skin, self Guard 28 / 38% | Mountain Breaker |
| Fighter | Jab 162-198% | Combo Strike, 3 hits of 70-86% | Iron Skin, self Guard 25-40% | Sweeping Kick 175-225% and Slow 10-15% | Tiger Fist 210-270% and Weaken 12-18% | Inner Peace, heals one ally 200 / 250% | Dragon Fist |

Identity in one line each: the Warrior wins by Defence, Fortify and Thorns. The Archer is a selfish damage dealer that buffs its Agility, slows, shoots many arrows and dodges (Evade comes at level 8, before the cap). The Mage controls with Slow, Burn and Hex and shields itself, with no heal and no aura. The Priest heals, guards and weakens. The Thief is fast and uses Haste. The Barbarian lives on life steal, Haste and Thick Skin. The Fighter combines combos, Guard, Slow and a small heal.

### Trainers and price

- Trainers live in the Academy (Lord's Square). Each class has its own trainer. The player picks a hero, then pays the trainer to teach a spell the hero is high enough to learn. The Academy lists only spells the hero can learn now, plus a note for the level of the next one. A new spell takes the first free slot of its kind. The Heroes screen has a Spells tab to change the slots.
- **Price curve:** a curve through anchor points (`learnCostAnchors` in `data/balance/spells.json`: level 2 = 18 copper, level 10 = 127 copper). Between two anchors the price is a power of the level (a straight line on a log-log scale). Past the last anchor it continues with the last exponent (about level^1.2). An Ultimate costs double. **The anchors must reach the level cap** (the validator fails otherwise), so when the cap grows the designer adds anchors from the economy sim.
- **Budget:** the price is set from the gold that a solo hero earns by crafting and selling. The economy sim (`spellBudgetPercent` = 65 in its preset) prints the share that spells take at each level and flags a level over budget. Spells up to level 10 cost 352 copper in total, 61% of the 573 copper earned by level 10. The rest pays for the second hero (300 copper) and the Bank. Every class has spells at levels 2, 4, 6, 8 and 10 for 18, 42, 69, 97 and 127 copper. Above level 10 the curve is only an extension until the anchors are set from real income. A full tree is a gold sink next to hero hiring.
- **No changes in a run:** learning and equipping are rejected while the hero is in a run, because the run replays its fight from the hero's state (same rule as gear).

### Effects and statuses

- **Damage:** one enemy (one hit or several) or all enemies. Power is a fraction of the hero's attack per hit. The damage kind is physical (Defence takes points off each hit) or magic (Resistance does). A damage spell can:
  - inflict a status on the enemy it hits (`inflicts`);
  - add a share of the caster's Defence to each hit (`defencePower`, Fortify counted). This is a stopgap while spell numbers wait for the spell pass: with flat Defence it adds little;
  - add a second magic part (`magicPower`, a fraction of the attack that Resistance takes points off and Defence does not). Each part rolls its own swing and critical hit;
  - give the caster a status (`alsoOnSelf`, for example Evasive Shot gives Evade);
  - shoot its hits at the living enemies in turn (target `spreadEnemies`, for example Volley).
- **Drain:** damage to one enemy, and the caster heals a fraction of it.
- **Heal:** the weakest ally, the caster, or all allies. Power is a fraction of the hero's attack.
- **Status:** lasts a few seconds. One of each kind at a time (a new one replaces the old one). A status spell targets the caster, all allies, one enemy or all enemies, and can give the caster a second status (`alsoOnSelf`, for example Iron Wall).
  - **Guard:** more armour (a share of the flat armour value).
  - **Fortify:** more Defence (a share of the flat Defence value), so it also raises the damage of spells that use Defence.
  - **Thorns:** the unit sends a share of each hit it takes back to the attacker, ignoring armour. A reflected hit (`isReflect`) never triggers Thorns again.
  - **Sunder:** less armour (a share of the flat armour value).
  - **Hex:** more magic damage taken. It raises the damage of the hit before Resistance takes its points off.
  - **Haste / Slow:** Haste adds to the attack speed bonus and Slow is a negative number in the same pool (see the attack time rule in section 4).
  - **Weaken:** less damage dealt (a share of the hit before the armour).
  - **Wound:** less healing received.
  - **Evade:** the unit dodges its next hit or hits. A dodged hit does 0 damage, shows "Dodge", and never triggers Thorns or life steal.
  - **Burn:** magic damage each second: a share of the caster's attack minus the Resistance of the target. No swing, no critical hit. A tick is a plain damage event with no spell look.
  - **Empower:** adds a share of the caster's main attribute to its attack.
- **Shield** (Mana Shield): costs a share of the maximum resource pool (`resourceFraction`, with `resourceCost` 0) and gives the caster a shield with its own counter. It absorbs `absorbFlat` damage plus `absorbMaxHpFraction` of the maximum health of the caster (the resource pool does not grow, so the flat part is the early power spike and the health part scales late), takes every hit before the health, and ends after its duration. The AI does not cast a shield on top of a shield. The health bar shows it as a blue part after the health, and the log shows how much of a hit it took.

### AI

When a hero acts, it tries the Ultimate first, then slot 1 to 3. It casts the first spell that is off cooldown, affordable and useful (no heal when nobody is below 60% HP, no status that is already active). If none is ready, it attacks. A cast takes the whole action.

### Resources

Each class has one resource (`resourceId` in `classes.json`, numbers in `data/balance/resources.json`). Each spell has a resource cost, a cooldown in seconds and a cast time (`castSeconds`, default 0.8 s from `defaultCastSeconds` in `data/balance/spells.json`, 0 is an instant cast). The battle does not use the cast time yet: it is data for the real-time battle phase. An Ultimate starts on a 15 second cooldown, so it comes in the middle of the fight.

| Resource | Classes | Pool | Start | Regeneration and gain |
|---|---|---|---|---|
| Mana | Mage, Priest | Fixed 42 | Full | 1.8% of the maximum each second |
| Stamina | Warrior, Archer | Fixed 38 | Full | 2.2% each second |
| Hatred | Thief | Fixed 31 | Half | 2% each second, and 4% per hit dealt |
| Rage | Barbarian, Fighter | Fixed 33 | Empty | None by itself. 8% per hit dealt and 8% per hit taken. |

The pools are fixed: no level and no attribute gives more. Skills and items change them later. The numbers are placeholders from the old level 1 to 10 pools.

**The pool must limit the player.** The old targets (a dip to about 55-65% at Lv 2-3 and to about 5-35% from Lv 6 on) came from growing pools and are not re-tuned for fixed pools yet. Check it with `npm run scenarios -- resource-use`. The Priest spells Minor Heal, Smite and Divine Shield cost 5, 6 and 8, because the Priest has the least Magic and casts the most.

### Looks, sounds and log

- **Spell looks and sounds:** every spell up to level 10 (all 7 classes) has a look in `data/spell-visuals.json` and sounds in `data/audio/sound-effects.json` (`spellSounds`). A look has a theme (colours) and up to 5 parts: **cast** (on the caster), **projectile** (flies to the target, with a trail), **impact** (on the target), **buff** and **debuff** (stay on the unit while the status lasts). A damage spell with an inflicted status shows its debuff after the impact. A many-hit spell shows its hits 0.16 s apart. The effects are pixel-art frames drawn in code and cached once per theme. The sound of a part matches its look part. A spell without a look keeps the plain weapon hit and heal chime. The validator fails when a spell up to level 10 has no look or sound, when a look part has no sound, or when an id is unknown. Spells above level 10 have no look yet.
- **Log:** a spell cast shows the spell name. A spell with several targets gives one event per target.
- **Balance:** at levels 1-10 spells make fights 10-25% shorter and make a Priest lose much less HP. They do not change win rates.

## 5. Items

An item is: **Base + Item level (ilvl) + Quality + Affixes**. A hero needs level ≥ ilvl to equip it.

- **Slots (11):** Main hand, Off hand, Helm, Armour, Gloves, Legs, Boots, Belt, Amulet, Ring ×2.
- **Base stats** are whole numbers. They roll inside a range (±15%, rounded) and do not grow with the item level, except weapon damage. See `docs/balance/combat-and-growth-mechanism.md` section 14.
  - **Weapon damage** = round(W x type multiplier) at the item level L, with W(L) = 7 + 1.6 x (L - 1). Multipliers: one-handed main hand 1.0, Staff 1.15, main-hand dagger and knuckles families 0.85, Greataxe and Maul 1.5, off-hand Quiver and Tome 0.25, off-hand Parrying Dagger and Cestus 0.4 (`weaponDamage` in `data/balance/items.json`). Examples: Sword (1) 7, Axe (3) 10, Longsword (5) 13, Battle Axe (7) 17, Broadsword (9) 20. A base item lists the damage at item level 1 (`baseStats`) and a flat gain for each further level (`growthPerItemLevel`). Light weapons give +3% attack speed, two-handed weapons -3% (percent points, no range).
  - **Armour** gives Defence (no HP) and Resistance. Defence at the item level of the piece: Boots (1) 4 / 3 / 2, Gloves (2) 5 / 4 / 2, Helm (4) 5 / 4 / 3, Shield (5) 5, Legs (6) 7 / 5 / 4, Chest (8) 12 / 8 / 5 for Heavy / Medium / Light. No piece gives less than 2 Defence, and Heavy > Medium >= Light. Boots also give +5% movement speed (percent points, no growth with the item level, no spread; it replaces the old +3% attack speed). The main stat of boots stays Defence, so an upgrade adds +1 Defence. HP comes only from affixes and set bonuses.
  - **Accessories (placeholders):** Belt (6) Defence 3 and HP 30, Ring (7) critical chance +2%, Amulet (9) attack speed +4%.
  - **Agility** stays only on bows and daggers. Each base item has a `mainStat` that upgrades raise.
- **Item card** (inventory, item popup and equip compare):
  - Under the name: "Requires level N" in bold gold (N is the item level), and who can use it ("Usable by: Mage, Priest", or "Usable by: all classes" for belts, rings and amulets).
  - One fixed stat table first. Weapons: Physical damage, Magical damage, Attack speed. Armour, shields, belts and jewellery: Health, Armour, Magic resist. The movement speed of boots is listed below the table with the other extra stats.
  - Below it: the other stats (Strength, Agility, Intelligence) and the affixes, prefixes in blue and suffixes in gold.
- **Quality** (order: Common, Uncommon, Magic, Rare, Legendary, Unique; the affix counts are `affixRulesByQuality` in `data/balance/items.json`):
  - Common: 0 affixes. Uncommon: 1. Magic: 2 (1 prefix, 1 suffix). Rare: 3-4 (max 2 prefix, 2 suffix).
  - Legendary: reserved, no rules yet.
  - Unique: fixed name and fixed affix set, with rolled values. Drops only.
  - Colours: green (Uncommon), blue (Magic), gold (Rare), orange (Unique).
- **Name order:** each language has its own order (`format.itemName`). English: prefix, item, suffix ("Arcane Copper Sword of the Bear"). Chinese: suffix, prefix, item. The stat table lists an affix by its short name (`affix.<id>.short`), for example "Bear: +9 Health".
- **Affixes** are random. They have a kind (prefix or suffix), a stat and a value range (`minimumValue`, `maximumValue`). The value grows with the item level (`affixGrowthPerItemLevel`) unless `scalesWithItemLevel` is false. There is no minimum item level and no affix tier yet. There are 4 prefixes and 15 suffixes (HP affixes are 10 times the old numbers, for the new HP scale), for example *Sharp* (+Attack), *Sturdy* (+Defence), *of the Bear* (+HP), *of Insight* (+Intelligence), *of Precision* (+Agility), *of Haste* (+attack speed %). Three suffixes give combat bonuses that are not class stats: *of the Leech* (life steal 2-5%), *of the Viper* (critical chance 1-3%) and *of Carnage* (critical damage 5-15%). Their values (and the attack speed of *of Haste* and *of the Fox*) are percent points and do not grow with item level (`scalesWithItemLevel` is false in `affixes.json`). A crafted Magic or Rare item picks its suffixes at random, each suffix in the pool with the same chance.
- **Unique items** drop from rare monsters (4%) and bosses (25%). The player cannot craft them.
- **Item drops:** a monster can drop a ready item (`itemDrops` in `monsters.json`: base item, fixed quality, item level, chance). It is built like a crafted one, priced from the basic recipe, with affixes rolled from the fixed quality. It goes to the backpack, or waits at the dungeon when the backpack is full (see section 7). The report lists dropped items. Now: the Spider of Old Wood Hollow drops a Common Ring of item level 7 (5%), and the Goblin Chief drops an Uncommon Ring of item level 7 (35%).
- **Backpack size (width × height):**

| Size | Items |
|---|---|
| 1×1 | Ring, Amulet, Material |
| 2×1 | Belt |
| 1×2 | Dagger, Wand, Quiver, Knuckles, Cestus |
| 1×3 | Sword, Axe, Mace |
| 1×4 | Staff |
| 2×2 | Helm, Gloves, Boots, Tome |
| 2×3 | Armour, Legs, Shield, Bow, Greataxe, Maul |

## 6. Materials and crafting

**Bracket rule: a recipe uses materials of one tier only.** Tier N materials drop only from bracket N monsters and craft items with ilvl inside bracket N. The validator rejects a recipe that mixes tiers.

### Materials

- **Main materials:** Ore, Wood, Hide, Cloth, Gem.
- **Set materials:** one for each dungeon after the first dungeons of a bracket (Fang, Toadskin, Bone, Silk, Sinew in tier 1). They give fixed bonuses (see Set recipes).
- **Essence:** used by Enchanting. **Catalyst:** rare drop, kept for Enchanting, no use yet.
- **Source:** materials come from monster drops and from the Mill. The merchant only buys, and never sells loot materials.
- **Size:** `width` and `height` in `data/materials.json`. Bulky materials (Pine Wood, Rawhide, Linen) fill 2 cells, others 1.

### Recipes

Recipe = Base × Tier. The tier sets the item name, for example *Copper Sword*, *Pine Bow*, *Linen Robe*. Counts scale with item size.

| Profession | Makes | Ingredients (same tier) |
|---|---|---|
| Weaponsmithing | Sword, Axe, Dagger, Parrying Dagger, Mace, Greataxe, Maul, Knuckles, Cestus | Ore |
| Armoursmithing | Heavy armour, Shield | Ore |
| Fletching | Bow, Quiver | Wood |
| Enchanting | Staff, Wand, Tome (all magic items) | Wood (Tome: Cloth) |
| Leatherworking | Medium armour, Belt | Hide |
| Tailoring | Light armour | Cloth |
| Jewelcrafting | Ring, Amulet | Gem |
| Item enchanting (later, not built) | Changes an existing item | Essence (same tier as the item) |

- **Ingredient count** is fixed per base item (`mainIngredientQuantity` in `base-items.json`), of the main material only. Warrior weapons 2 (Broadsword 3), Heavy armour 2-3 (Shield 3), Archer bows 3-4 (Quiver 1), Barbarian two-hand weapons 3-4, Staff 3, Mace 2-3, small magic and light weapons 1-2, Medium and Light armour 1-2, Jewellery and Belt 1. No main count is above 4. A weapon line starts at 3 and steps up once to 4 for its two later recipes. A set recipe adds 1 set material (2 for items of 6 cells or more).
- **Item level** is fixed for each recipe: tier start - 1 + the base offset (a set recipe uses its higher level), never above the last level of the tier. The Workshop shows it before the craft. The crafter level does not change it. Quality, affixes, the ±15% spread and the upgrade level stay random. A level 1 Mage can equip the Wand (1) and the light Boots (1), the Staff from level 7, the Tome from level 5.
- **Recipe level:** a recipe needs crafter level (tier - 1) × 10 + the base item's offset. Locked recipes show the needed level. A recipe row shows its recipe level in the title ("Copper Gloves (Lv 3)") and the item level on a second line ("Item level 3").
- **Quality odds** (Common / Uncommon / Magic / Rare): 55 / 20 / 15 / 10. A craft never uses a Catalyst.
- **Crafting reveal:** the item is rolled when the craft starts, but the player sees only its base name while the crafter works. The full name with affixes shows when the craft is done.

### Upgrade level (+1 to +7)

A crafted item can come out with an upgrade level, shown at the end of the name ("Iron Sword +3"). The "+N" has its own colour: green +1, cyan +2, blue +3, purple +4, pink +5, orange +6, red +7 (+5 and higher glow), and the rest of the name keeps the quality colour. A window title or tooltip shows "+N" as plain text.

- Each level adds a flat +1 to the main stat of the item (Defence for armour, shield and belt, damage for weapons and off-hand damage items, critical chance for the ring, attack speed for the amulet), and 3% to the sell value. It does not change the item level or the other stats. The recipe screen says that each +1 adds 1 to the main stat.
- Most crafts have no upgrade. The game rolls step by step and stops at the first failed step, so +N needs N successes in a row.
- The chance to reach at least +N runs in a straight line from a value at the recipe level to a value for a crafter 9 or more levels above the recipe (the most a level 10 crafter can be above a level 1 recipe). For +1: 5% at the recipe level, 23% at 9 levels above. For +4: 0.005% and 5%. More levels above give nothing more. The values for +1 to +7 are in `data/balance/crafting.json` and must fall with each level (the validator checks it). The recipe screen shows the chance of +1 or better.
- Unique and looted items have no upgrade level.

### Fee, level plan and recipe rules

- **Crafter fee:** every craft costs materials and a gold fee: 1 copper + 0.25 copper for each level the recipe needs (`craftFeeBaseCopper`, `craftFeePerRequiredLevelCopper`). A crafter cannot start a craft when the player cannot pay.
- **First materials:** the two level 1 dungeons drop Copper Ore, Rawhide, Pine Wood and Linen, so every basic recipe works from the start. **A level 1 monster always drops each of its basic materials** (Cave Rat: Rawhide and Copper Ore; Straw Scarecrow: Linen and Pine Wood): chance 100%, quantity 1, or 2 with a 10% chance (`maxQuantityChance` in `monsters.json`). Quartz first drops in the Goblin Camp. The merchant buys every material but sells none, so the level 1 dungeons and the Mill are the source of basic materials.
- **Recipe rule:** a recipe must not need a material that first drops in a dungeon above the recipe's craft level (the validator checks it). So the level 1 recipes use only the four basic materials, and the Ring (Quartz) is at offset 7 and the Amulet at offset 9.
- **Level plan:** every class can craft a weapon and an armour piece at crafter level 1, and **every crafter level from 1 to 9 opens something new for every class** (the validator checks both).
  - Weapons open on odd levels (1, 3, 5, 7, 9).
  - Armour opens in this order: Boots 1, Gloves 2, Helm 4, Legs 6, body Armour 8 (the Shield opens at 5). The body Armour is the last of the set pieces.
  - Off-hand items open early, so the slot is not empty: Quiver 4, Parrying Dagger 4, Cestus 4, Shield 5, Tome 5.
  - Belt 6, Ring 7, Amulet 9. Level 10 opens nothing new, because every set recipe opens with its base item. A level 10 crafter can make every base of the tier.
- **Weapon steps:** every class gets a stronger weapon every 2 crafter levels inside a bracket, the last at offset 7 or higher. **Each new weapon has more damage than every weapon before it** (physical for a physical class, magical for a magic class). A stronger weapon is a new base with the same gear type and size, so the same classes can use it. The step follows the weapon damage rule in section 5. The validator checks both rules.

| Class | Main hand weapons (offset: damage at that item level) |
|---|---|
| Warrior | Sword (1: 7), Axe (3: 10), Longsword (5: 13), Battle Axe (7: 17), Broadsword (9: 20) |
| Archer | Bow (1: 7), Longbow (3: 10), Composite Bow (5: 13), Warbow (7: 17) |
| Mage | Wand (1: 7), Runed Wand (3: 10), Scepter (5: 13), Staff (7: 19), Arcane Staff (9: 23) |
| Priest | Wand (1: 7), Runed Wand (3: 10), Mace (3: 10), Scepter (5: 13), Flanged Mace (7: 17) |
| Thief | Dagger (1: 6), Stiletto (3: 9), Dirk (5: 11), Kris (7: 14) |
| Barbarian | Maul (1: 11), Sledgehammer (3: 16), Bearded Axe (5: 20), Greataxe (7: 25) |
| Fighter | Knuckles (1: 6), Brass Knuckles (3: 9), Spiked Knuckles (5: 11), Steel Claws (7: 14) |

The Mace and Flanged Mace are Priest weapons: they give magical damage and resistance. The Warrior shares no weapon type with another class.

### Set recipes

Each set material makes a set of gear: every main hand weapon, every off-hand item, and the Helm, Gloves, Boots, Legs and Armour of every weight. Belts and jewellery have none. A set recipe needs the main material of the base plus the set material, and is a separate recipe next to the basic one. The item is named after the set material (*Fang Heavy Gloves*, *Fang Axe*).

- **Every piece made from a set material gets the same fixed flat bonus.** Quality, the usual random Affixes and the upgrade level roll on top, exactly like a basic craft. The bonus comes from the material, so it is not stored in the item.
- **Every set recipe of a base item opens at the same crafter level as the basic recipe of that base**, even when the player does not own the set material yet. So when the body Armour opens at level 8, the basic recipe and all 5 set recipes open at level 8, and the player farms dungeons for the set materials.
- **A weapon or off-hand item that opens at crafter level 1 has no set recipes** (`setRecipeFirstBaseCraftLevelOffset` in `items.json` is 2), so the level 1 weapons are basic only. This rule is for weapons only: every armour piece of every weight has set recipes, whatever its level (Boots at level 1 too).
- **Sort order** inside one recipe level: the variants of one base item stay together. Ascending is the basic recipe, then the set recipes by dungeon level. Descending is the exact reverse.
- **Validator:** a set material drops in exactly one dungeon, `setCraftLevelOffset` equals the level of that dungeon, and each dungeon after the first dungeons of a bracket drops exactly one set material.

| Set material | Dungeon | Bonus on each piece | Sort position (1 = basic) |
|---|---|---|---|
| Sharp Fang | Wolf Trail | +2 Agility | 2 |
| Toadskin | Sunken Mill | +80 Health | 3 |
| Bone Shard | Goblin Camp | +2 Armour (defence) | 4 |
| Spider Silk | Old Wood Hollow | +2 Attack speed | 5 |
| Coarse Sinew | Goblin Chief's Lair | +2 Strength | 6 |

### Crafters and the Workshop

- **Crafter levels:** each profession is a crafter with level 1-100 and XP. XP to the next level: levels 1 to 8 cost 43, 47, 98, 116, 153, 215, 400 and 410 XP (`experienceToNextByLevel`), then 58 × L^1.3. The table follows the best weapon of a Warrior (Sword, Axe, Longsword and Battle Axe use 2 main material, the Broadsword 3): one craft from level 1 lands on 2.3, from level 2 on 3.0, from level 3 on 3.9 (a 2nd craft on 4.7), from level 4 on 4.7 (a 2nd on 5.3). Levels 5 and 6 take 2 crafts, levels 7 and 8 take 3, and level 9 takes 4. A crafter below level 2 gains at most 2 levels from one craft (`maximumLevelsPerCraft`, `levelsPerCraftCapBelowLevel`), so a big first craft does not jump to level 4 or 5. The extra XP stays banked for the next craft. A craft gives (20 + 8 × recipe level) XP for each unit of its main material, minus 8% for each level the crafter is above the recipe (down to 10%) (`experiencePerMaterialBase`, `experiencePerMaterialPerRequiredLevel` in `crafting.json`). So crafter XP follows the basic material that dungeons drop, and a recipe with twice the material pays twice the XP. A Mage needs more crafts for a level than a Warrior, because its early weapons use 1 material (Wand, Runed Wand) and the first 2-material weapon, the Scepter, opens at level 5.
- **Crafter pace target:** the player keeps the crafter level with the hero. Whenever the crafter is below the hero level, the player runs a round: 2 fights in the level 1 dungeon that drops the main material of the best recipe, then crafts everything it can afford (`basicFightsPerRound`). The two level 1 dungeons are the only dungeon source of basic material. The share of all fights spent in them should stay between 30% and 50% (`basicFightShareRange`). Check it with `npm run scenarios -- crafter-curve`. The current curve does not meet this: the share is about 60% to 77% at hero level 10 (the Warrior 65%). Lower crafter XP costs, or raise the level 1 double-drop chance (`maxQuantityChance`, now 10%; 60% gives about 50%).
- **Timed jobs:** selling and crafting take real time, also while the page is closed. A crafter makes one item at a time, (5 s + 1.5 s per required level) × (1 + 0.3 for each main material above 2, minus 0.3 for each below 2) (`craftSecondsFactorPerMaterial`). So a 1 material recipe takes 70% of the time of a 2 material recipe of the same level, and 3 materials take 130%. This applies to every recipe. Jobs show a progress bar. After the player starts a craft, the Workshop goes back to the crafter list.
- **Workshop screen:** two sections on one screen with no scroll, Weapons (Weaponsmithing, Fletching, Enchanting) and Armour (Armoursmithing, Leatherworking, Tailoring) (`data/workshop-sections.json`). Jewelcrafting is in no section, so the Workshop hides it until a later stage unlocks it. The validator checks that each profession is known and in one section only.
  - Each crafter is a raised tile (light top and left edge, dark bottom and right edge, hard shadow, so it reads as a button) with a portrait, level and job. On a wide screen the tiles share the height in two rows of three, with the picture on the left. On a phone (640 px or less) the section titles go away and the six tiles share the screen in two columns, with a same-size picture in each.
  - A click on a crafter shows only the recipes it can make now (higher recipes stay hidden, with a note for the next level). A click on a recipe shows a big portrait, the stat ranges, the fixed item level and the classes that can use the item, so the player does not craft gear that no hero can wear.
- **Workshop recipe list:** a crafter shows only recipes the crafter level has opened, and only recipes that at least one unlocked class can use (see Hiring lock). The Class and Slot filters list only the classes and slots of those recipes. A recipe for a locked class appears when the player clears the dungeon that unlocks the class.
- **Collecting a craft:** a finished craft waits at the crafter and does not go to the backpack by itself. The crafter tile gets a gold frame and a big Collect button, and a click collects. The crafter gets its XP only at that click. A summary window opens: the crafter portrait, the same experience bar as the fight result (level, gain, level-up line), and below it the new item with its stats. If the backpack has no room, the click is refused and the item keeps waiting.
- **Enchanting** is not built yet. Planned actions: Reroll the values of one affix, Add an affix (up to the quality limit), Reforge all affixes (needs a Catalyst).

### Merchant and selling

- The merchant only buys, items and materials. A sale takes 5 s + 0.6 s per copper of value, up to 10 minutes (`saleSecondsMinimum`, `saleSecondsPerCopper`, `saleSecondsMaximum`). The merchant runs 3 sales at once (`merchantSaleSlots`), and the Bank sells up to 4 more slots.
- Goods stay in their backpack cell while they sell, marked with the sale (`saleJobId`), so cancelling never needs room. A sale in progress can be cancelled. Goods on sale cannot be crafted with, equipped, or sold again.
- The backpack grid looks the same in the Inventory and at the merchant. A tap on an entry opens a popup next to the tap with View and Sell, the sale value and the sale time. The timer and progress bar show in the cell of the goods. A tap on goods on sale shows View and Cancel. A line above the grid shows how many sale slots are used.
- **Sell value:** a crafted item sells for ((materials + fee + 3 copper for every ingredient used) × quality factor + 5 copper for every affix + 1 copper for the item) × upgrade factor (`sellAddedValueCopperPerIngredient`, `sellQualityFactor`, `sellAddedValueCopperPerAffix`, `sellAddedValueCopperPerItem`, `sellGrowthPerUpgradeLevel`).
  - Quality factor: Common 1, Uncommon 1.1, Magic 1.2, Rare 1.5. Upgrade factor: 1 + 0.03 per upgrade level.
  - The price follows the effort: more material, a set material or more affixes sell for more, but never for double. Every ingredient, the set material too, adds the same 3 copper. The item level adds nothing of its own, because the crafter fee already grows with the recipe level.
  - A smith who uses dropped materials earns a small profit on each craft (the sale is about 1.6 times the cost). The smoke tool checks this.
  - Examples: a level 1 Sword (2 ore, cost 7) sells for 14 (Common), 20 (Uncommon), 27 (Magic) or 36-41 (Rare). A level 1 Wand (1 wood, cost 3) sells for 7, 13, 18 or 25-30. A Fang Sword (level 3, 3 ingredients) sells for 22, 29, 36 or 48-53.
  - Basic materials from the first dungeons sell for 2 or 3 copper. A set material sells for more the later its dungeon is: Sharp Fang 4, Toadskin 5, Bone Shard 6, Spider Silk 7, Coarse Sinew 8 (the validator checks that the price rises with the dungeon level). A set item is the basic item plus a fixed bonus: it only costs and sells more because its set material is worth more and it needs one more ingredient.

### Mill

The Mill makes materials by the real clock, also while the page is closed. It is the only source of materials besides monster drops.

- It makes 1 material every 10 minutes (600 s) at first. The material is random from `producedMaterialIds` in `data/balance/mill.json` (Copper Ore, Pine Wood, Rawhide, Linen). The validator accepts only tier 1 materials without a set bonus there. Each product has its own random stream by its number, so the same seed gives the same products.
- It holds 1 material at first (`baseStorageCapacity`). A full Mill stops its clock, so time spent full is not saved up. The player collects the materials in the Mill panel. What does not fit in the backpack stays at the Mill. After a collect, the clock starts again.
- The Bank sells upgrades (prices and intervals in `mill.json`): up to 5 storage upgrades (+1 material each, up to 6) and up to 5 speed upgrades (the interval goes 600, 480, 360, 270, 200, 150 s). The bought counts are saved in `millCapacityUpgrades` and `millSpeedUpgrades`.

## 7. Backpack and Bank

- **Grid:** 6 columns by 5 rows (30 cells), in the style of Diablo 2. Space is a real limit.
- **Nothing stacks.** Every item and every material unit takes its own place.
- **Moving items (Inventory):** a tap on an entry selects it. A fixed action bar above the grid shows the entry name and its buttons: View, Equip (items only) and Sell. A tap on an empty spot moves the entry there (its top-left corner goes on that spot). A spot where the entry does not fit is refused. A tap on the selected entry clears the selection. No long press or drag: it clashes with scrolling on a phone and nothing shows it exists. At the merchant a tap opens a View and Sell popup and there is no move.
- **Equip:** opens a list of heroes. A hero that cannot use the item shows the reason and stays disabled. A pick opens the compare screen: the large picture of both items (the same as View) above each item card, green for better and red for worse.
- A tooltip compares the item with the equipped item. On touch screens, a tap shows the tooltip.
- **Full backpack, craft:** a finished craft that finds no room stays at the crafter, marked as waiting. The crafter cannot start a new craft until the player makes room and collects.
- **Full backpack, drops:** drops that find no room wait at the dungeon (`pendingLoot`, `pendingItems`, saved). The run report lists them. That dungeon cannot start a new run until the player makes room and presses Collect loot in the Dungeons list. A collect takes what fits and the rest keeps waiting. No drop is ever lost.
- **Menu badges:** the bottom menu has one badge style, in the corner of the button, so a badge moves nothing.
  - **Yellow with a number:** the Dungeons button counts fights in progress plus results the player has not opened. The Workshop button counts crafts in progress plus crafts that wait for a click. The button title says which ("1 in progress, 2 ready").
  - **Red with a mark and no number:** the Inventory button, when the backpack is full. There is one level only: at `fullFillFraction` (90%) of the cells, or when dungeon loot waits and still does not fit. The warning ends as soon as the player makes room, with no trip to the dungeon.
  - No flash, no pulse, no movement.

### Bank

The Bank is in Lord's Square. Prices are in `data/balance/backpack.json` and `economy.json`.

- **Backpack space:** one row of 6 cells per purchase, up to 14 purchases (114 cells). The price rises exponentially: 100 copper × 1.5 for each purchase already made (100, 150, 225, 338 … 19,462). Saved as `backpackExpansions`.
- **Merchant sale slots:** 200, 600, 1,800, 5,400 copper. Saved as `merchantExtraSlots`.
- **Mill storage:** 300, 900, 2,700, 8,100, 24,300 copper (+1 material each). **Mill speed:** 250, 750, 2,250, 6,750, 20,250 copper (a shorter interval).
- **Features,** once each (`bankUnlockCostsCopper`). Until the player buys one, the game hides it and says so. The bought ids are saved in `bankUnlockIds`.
  - **Backpack sorting** (150): a Sort button in the backpack. Items go first by slot, quality and level, then materials by id, packed from the top left. If it cannot fit, nothing changes.
  - **Drop rates** (300): the loot table and chances in the dungeon screen.
  - **Monster statistics** (500): health, attack, armour, magic resist and attack time of each monster at the dungeon level.
  - **Quick dispatch** (250): the Dungeons panel gets the "Stay on this screen after sending a hero" checkbox (see section 11b).
  - **Main stat growth** and **Attribute growth** (200 each): show the growth per level of each class. The Tavern always shows one bar per stat, in two groups: the attributes (Strength, Agility, Intelligence) and the main stats (Health, Magic resist, Attack speed; Defence has no growth). The numbers of a group show only after its purchase. Attribute growth also adds the gain (like "19 +1.9/lvl") to the attribute rows of the hero details screen.

## 8. Battle

### Rules

- **Real-time battle.** There are no rounds. Heroes and monsters move on the battlefield (36 long, 8 deep) and fight in real time, simulated in fixed ticks of 0.05 s. The whole fight is simulated at once from a seed and then played back. Spells use cooldowns only: attack speed does not change a cooldown. Numbers: `data/balance/battlefield.json`. Details: `docs/balance/realtime-battle.md`.
  - **Opening:** both sides start apart. Melee units meet after about 2.5 s of running. The run-up counts in the fight length.
  - **Range:** a melee unit must touch its target. A ranged class (Archer, Mage, Priest) hits across 1/3 of the field. A spell has the range of the attack of the unit, unless the spell sets its own.
  - **Movement speed:** a stat. All melee classes and all monsters run at 6 per second, ranged classes at 0.9 of that. Boots add +5%. Haste does not change movement speed.
  - **Blocking:** units are circles (hero and normal monster radius 0.5, rare 0.6, boss 1.0). They cannot stand inside each other. A blocked unit slides around the blocker. Dead units do not block.
  - **Start position:** with a melee unit in the team, the ranged classes start 2 behind it. Without one, all start on one line. A side with 8 or more units on one start line would overlap, so such fights need a second rank or a deeper field first.
  - **Targeting:** a unit attacks the nearest enemy and switches only when another enemy is clearly closer (margin 2) or the target cannot be reached. A boss `targetPriority` still overrides this.
  - **Cast time and hit moment:** a unit stands still while it casts (`castSeconds`) and while it attacks. The damage of a basic attack lands at half of the attack time. A ranged projectile is only visual, and its damage lands at the release.
- **Attack time** = base attack seconds ÷ (1 + attack speed bonus). The bonus is Agility × 0.003 + gear + Haste, and Slow is a negative number in the same pool. There is no minimum attack time, but `1 + bonus` never goes below `minimumAttackSpeedFactor` (0.1). Example: 1.65 ÷ (1 + 0.25) = 1.32 s. A monster has a `baseAttackTime` (`attackSeconds`, default 1.65 s) and no Agility. **Attack time rule for monsters:** every normal, rare and boss monster has a basic attack time from 1.0 to 2.0 s (the validator checks it). The Warrior is 1.65 s. Cave Rat, Wolf and their rares 1.4 s, Bark Spider and Hollow Broodmother 1.5 s, Goblin and Goblin Captain 1.65 s, Straw Scarecrow, Mill Toad, Hobgoblin and their rares 1.8 s, the boss 1.65 s.
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
- **Rare monster:** 2% of encounters. All stats lifted by one stat factor (1.25, the user may change it). Drops ×3, one Catalyst, 4% Unique. Pays ×3 XP.
- **Flat stats only.** A monster has HP, damage, armour, Resistance and attack time, and no attributes. It follows one level curve (`data/balance/monster-scaling.json`: anchors per level, joined by straight lines, and above the last anchor the last segment goes on). A normal or rare monster has one `statFactor` in `monsters.json` (default 1) that lifts HP, damage, armour and resistance together. A boss has explicit `flatStats` (HP, damage, armour, Resistance, attack seconds). The validator keeps the four stats of the boss on one common factor of the curve at its dungeon level, within 15%. Never lift one stat alone: a stronger unit gets every stat lifted by the same factor.

| Level | HP | Damage | Armour | Resistance | HP / damage |
|---|---|---|---|---|---|
| 1 | 413 | 35 | 0 | 0 | 11.8 |
| 2 | 500 | 48 | 1 | 0 | 10.4 |
| 3 | 580 | 51 | 2 | 0.5 | 11.4 |
| 4 | 655 | 58 | 3 | 1 | 11.3 |
| 5 | 730 | 66 | 4.5 | 1.5 | 11.1 |
| 6 | 810 | 74 | 6 | 2 | 10.9 |
| 7 | 890 | 82 | 8 | 3 | 10.9 |
| 8 | 960 | 90 | 10 | 4 | 10.7 |
| 9 | 1020 | 95 | 12 | 5 | 10.7 |
| 10 | 1075 | 99 | 13 | 5.5 | 10.9 |

Armour and Resistance are rounded to whole numbers when a monster is built. Armour grows from 0 at level 1 to 13 at level 10 (about 16% of a hero hit at level 10). Resistance is set at about 40% of armour: all monsters hit physically, but a magic hero (basic attack and spells) hits Resistance, and the Mage is already the weakest class in the first fight. At this value armour lengthens the kill time of the Mage by 4-7% and of the physical classes by 8-15%.

- **Targets (soft, tolerance 15%, set from the first-fight sim, `npm run scenarios -- first-fight`):** a hero of level L meets a normal monster of level L for the first time. Level 1 (main hand weapon only) loses about 50% HP on average over Warrior, Archer and Mage (40-60%). Levels 2-10 (Common gear of the best item level in every slot) lose about 60-70% on average. Monster HP / damage stays near 10-12. Normal monster HP at level 10 is at least about 900 (more is allowed). Crafted Magic gear must be clearly better than the first-meeting gear. Armour may reach about 10-15 at level 9. Fight length is not a target (about 12-19 s for the baseline classes).
- **Result (average HP lost of Warrior / Archer / Mage, first meeting; crafted Magic gear in brackets):** level 1: 52 (41), level 2: 60 (47), 3: 64 (51), 4: 59 (42), 5: 65 (44), 6: 61 (35), 7: 67 (33), 8: 63 (27), 9: 62 (26), 10: 68 (29). The dips at levels 4, 6 and 8 are the steps where the helm, the legs and the chest unlock: the anchors stay smooth and the gear makes the steps. The crafted gear gives 13 to 37 points of HP lost back, and the gap grows with the level.
- **Result on the real-time simulator (before any retune; also with the monster attack times of 1.4-1.8 s):** first meeting, level 1 to 10: 43, 45, 60, 52, 44, 37, 41, 42, 50, 49. Crafted Magic gear: 33, 35, 48, 37, 29, 18, 20, 16, 18, 20. This is below the 60-70% target at most levels, because ranged classes got stronger. A later pass retunes the monster anchors and the hero numbers. The numbers above this line come from the old turn-based simulator.
- **Known limits:** (1) The class spread is large at levels 7-10 and comes from hero numbers: Warrior 44-56%, Archer 61-68%, Mage 78-92%, Priest (placeholder) 95-99% (level 8-10). At level 8 the Mage loses 85% against 43% for the Warrior. About two thirds of that comes from Defence (19 against 44) and one third from HP (676 against 868). The Mage also wastes a slot on Mana Shield, which absorbs only about 10-15 damage per fight (its absorb is 25% of a 42-point pool). A Mage without Mana Shield loses 76% instead of 85%. (2) Multi-hit spells lose more to armour: at level 10 a basic attack loses 16% of a hit to armour 13, Quick Shot and Quick Stab (2 hits, power 0.99) lose the same 16% per hit, Combo Strike (3 hits, power 0.7) loses 25% per hit. Volley (level 12, 5 arrows at power 0.45) will lose about 40% per arrow. This is by design (section 4), and the Fighter pays most (it loses 81% at level 10 against 47% for the Warrior). (3) Fight length of a normal fight is 12-18 s, against the old duration targets of 19-25 s at levels 7-10 (`mob-kill-time`). The old targets are not met and not chased.

- **Linked growth rule:** for the same share of HP lost in a fight, monster damage growth = hero HP growth ÷ fight duration growth. Check this before you set a duration target.
- **All normal monsters use `statFactor` 1 for now.** The old per-monster factors (for example the stronger Goblin and Hobgoblin) are gone. Rare monsters keep `statFactor` 1.25.
- **Armour penetration (mechanism only):** a monster can have `armourPenetration` in `monsters.json` (above 0, below 1). Its physical hits ignore that share of the flat Defence of the hero. Resistance is not cut. No monster uses it yet. It is kept for later tiers.

### Boss

- One boss per town. The Goblin Chief's Lair opens after the Goblin Camp is cleared, and a hero of level 8 can enter. The recommended level is 10-11, so an early party can try, at a risk.
- **Party and adds:** the boss needs 2 heroes. The fight has 0 or 1 adds (a normal monster of its dungeon), because adds never exceed the party size minus 1.
- **Rewards:** drops ×5, two Catalysts, 25% Unique, ×5 XP.
- **Stats (flat numbers in `flatStats`):** the Goblin Chief is a normal monster lifted by one common factor of x1.45 of the level 10 curve (1,075 / 99 / 13 / 5.5): HP 1,559, damage 144, armour 19, Resistance 8, and a basic attack every 1.65 s like the Warrior (the validator keeps the four stats within 15% of their common factor and the attack time inside 1.0-2.0 s). The boss burst comes from its spells, not from a slow attack. The dungeon level does not change a boss. The spells use a share of its attack, so they follow the attack (Crushing Cleaver is 1.95x, about 281 damage). The first try at x2 (HP 2,150) was too strong in the real-time battle (3% win at the gear floor).
- **Targeting:** a monster can have `targetPriority`. `highestDefence` (the Goblin Chief) makes it attack the hero with the most Defence first, then the next, with basic attacks and single-target spells (ties go to the hero with less health). The frontline (Warrior, Barbarian, Fighter) takes the hits, and the other classes are safe until it falls. Other monsters pick a random hero for basic attacks. A Warrior with a Priest is the safest pair, because the Priest is never hit.
- **Spells:** a boss casts spells (`spellIds` in `monsters.json`, data in `data/monster-spells.json`, ids start with the monster id). A monster spell costs no resource and waits only for its cooldown. The Goblin Chief has:
  - Cowing Roar: weakens the hero 20% for 8 s, every 20 s.
  - War Cry: +25% attack speed for 8 s, every 24 s.
  - Crushing Cleaver: a hit of 1.95× attack that also wounds (healing received -85% for 9 s), every 12 s. The wound is the answer to heal spells, so the Priest and the Fighter cannot out-heal the boss.
  - The dungeon screen shows the three spells with their numbers.
- **Tuning target (soft, `npm run scenarios -- boss-fight`, real-time simulator):** the boss is tuned for the weakest sensible party: a level 10 hero and a level 7 partner, each with Common gear and one prefixed item (the gear floor). That party wins about 60% on average over Warrior, Archer and Mage as the strong hero (result 65%). With normal crafted gear about 85% (result 84%). One hero without gear never wins (0%). Two level 10 heroes still win almost always: a full pair is the goal of the town. The fight lasts about 18 s in the real-time simulator (expected 20-40 s, the length is a soft target and was not chased).
- **Weapon-only rule:** a weapon alone must not beat a boss. A hero with only its best weapon must lose (win rate under 30%, result 19% over the baseline classes), and the boss still needs a hero with all 11 slots filled.

### Duration targets (1× speed)

These targets are from the old model. The flat and real-time model has not been tuned to them yet (see section 11 of `docs/balance/combat-and-growth-mechanism.md` for the new draft targets).

- **Normal encounter** (reference hero with crafted gear): 7 s at Lv 1, rising by 2 s per level to 25 s at Lv 10 (7, 11, 15, 19, 23 s at Lv 1, 3, 5, 7, 9), then by 0.4 s per level (about 61 s at Lv 100).
- **Boss:** about 5 × the normal duration of its level (about 2 min at Lv 10).

### Experience

- **XP is a table of absolute numbers** (`data/balance/progression.json`). `experienceToNextLevelByLevel` holds the XP for levels 1 to 10: 380, 464, 540, 658, 800, 960, 1147, 1377, 1647, 1973.
- `normalKillExperienceByHeroLevelThenMonsterLevel` has one row per hero level and one number per monster level at or below it: what a normal kill pays. There is no gap factor and no formula. A monster above the hero level pays like a monster of the hero level. Above level 10 the hero uses the level 10 row, scaled by how much more its level needs (exponent 1.5). Every party member gets full XP.
- **Kills to level** in the best dungeon: 1.9, 2.9, 2.9, 2.9, 3.9, 4.9, 4.9, 5.4, 5.4, 6.9 for levels 1 to 10 (target: 2-4 in the first levels, 5-7 in the last). The numbers sit just under a whole kill on purpose, so a level-up leaves a bit of XP over and the next bar is never empty. Each lower monster level adds about 1.5 kills, so a level 10 hero needs about 19 level 1 kills: low monsters stay a slow but real source. Kills in each column grow by 1 to 4 from one level to the next, so no level jumps.
- **Rank multiplier:** rare ×3, boss ×5 (the Goblin Chief pays 1,820 XP to a level 10 hero, about 0.9 of a level).
- Check and change: edit the numbers in the file, then run `npm run scenarios -- experience`. It prints the XP left after each level-up and flags a level where more than 15% of level-ups land on the line, with 0%, 30% and 50% of fights in the level 1 dungeons.
- The first town takes a hero from level 1 to the cap of 10. The XP table above level 10 and the late-game pace come with the next town.

### Balance targets

These targets are from the old model. The flat model has not been tuned to them yet. `npm run scenarios` reports the numbers against them.

| Case | Win rate | Party HP lost | Duration |
|---|---|---|---|
| Level L, Magic gear (ilvl L) | ≥ 90% | 30-40% | curve ±15% |
| Level L, Common gear | 60-80% | - | - |
| Level L, Rare gear | ≥ 98% | - | ≤ 80% of curve |
| Level L + 26, gear ilvl L + 26, monsters Lv L | ≥ 99% | ≤ 10% | ≤ 40% of curve |
| Level L, monsters Lv L + 5 | ≤ 50% | - | - |
| Boss, level L, Rare gear | 70-90% | - | 10 × curve ±20% |
| Boss, level 10 hero and level 7 partner, gear floor, average over classes and partners | about 60% | - | 10 × curve ±20% |
| Boss, same party with normal crafted gear, average | about 85% | - | - |
| Boss, one hero, no gear | 0% | - | - |

### Balance scenarios

- Every fight scenario uses the real-time simulator (`simulateRealtimeBattle`). Six scenarios run from preset files in `tools/balance-sim/presets/`: `economy`, `experience-curve`, `mob-kill-time`, `boss-fight`, `resource-use`, `crafter-curve`. Run all with `npm run scenarios`, or one with `npm run scenarios -- boss-fight` (names: `economy`, `experience`, `mob-kill-time`, `boss-fight`, `resource-use`, `crafter-curve`).
- **To test a balance idea, change the preset file or the game data. Do not change the simulator code.** A preset holds the level range, the classes, the number of fights, the seed and the targets.
- In the fight scenarios the hero wears the best gear it can equip at its level (the recipe with the highest item level per slot, without set pieces) and uses its best spells.
- `economy`: fights and copper (all loot sold) at each level. `experience`: kills to level against each monster level and in the best dungeon. `mob-kill-time`: seconds, win rate and HP lost per class and level. `boss-fight`: win rate and fight time per class at hero level 9 and 10 with a partner of every class at level 4 and 5; a row averages the partners and shows the worst, and the last line is the average of all rows. The preset uses `gearFloor` (Common gear and one prefixed item per hero) and aims at 60-65%. Set `gearFloor` to null for normal crafted gear, and add 10 to `partnerLevels` to test two level 10 heroes. `crafter-curve`: crafter level per profession at each hero level for a share of fights (`levelOneDungeonFightShare`) in the level 1 dungeons, with every basic material going into the best recipe; it flags a crafter more than `maximumLevelsBehind` behind. `resource-use`: the lowest point and the average of each class resource pool in a normal fight and the boss fight.
- Run `npm run scenarios` after any change to XP, stats, items, spells or monsters, and fix the numbers in `data/` until the targets hold.

## 9. World, travel and dungeons

Ten brackets. Each bracket has one town.

| # | Levels | Town | Region | Monster families | Boss |
|---|---|---|---|---|---|
| 1 | 1-10 | Hollowbrook | Farmland, Old Wood | rats, wolves, goblins, spiders, hobgoblins | Goblin Chief |
| 2 | 11-20 | Barrowgate | Barrow Downs | skeletons, wights, clay golems | Barrow Lord |
| 3 | 21-30 | Mirewatch | Marshes | lizardfolk, bog wraiths, giant spiders | Bog Hag |
| 4 | 31-40 | Deepdelve | Ruined mines | cave goblins, stone golems, trolls | Troll Chieftain |
| 5 | 41-50 | Highpass | Mountain pass | orcs, wargs, hill giants | Orc Warlord |
| 6 | 51-60 | Frostmere | Frozen north | frost trolls, ice wraiths, snow beasts | Frost Giant |
| 7 | 61-70 | Sunscar | Desert ruins | scorpions, sand wraiths, sand golems | Sand Tyrant |
| 8 | 71-80 | Emberhold | Volcano | fire imps, drakes, fire golems | Magma Colossus |
| 9 | 81-90 | Blackspire | Dark fortress | black orcs, dread knights, necromancers | Dread Lord |
| 10 | 91-100 | Worldsend | Dragon abyss | demons, titans, dragons | The Ancient Wyrm |

Only Hollowbrook exists in the game now.

- **Town buildings:** workshop (craft, enchant), merchant (sell), tavern (hire heroes), academy (learn spells), bank, mill, dungeon gate.
- **Travel:** the army marker moves on the world map. Time = 2 s + 1 s per bracket crossed. Going back is always allowed. The next town opens when the player beats the boss of the current bracket. Travel is not built yet.
- **World map:** a pixel map of the land. Every town has a place on it (`mapX`, `mapY`, `biome` in `data/towns.json`). Land, biomes and roads are drawn from the town list. A tap on a town shows details.
- **Dungeons:** 5-8 per town. Levels rise in steps of at most 2 (a step of 1 only at the end of a bracket), so a hero never grinds more than about 2 levels in one dungeon. The last dungeon is the boss dungeon, at the last level of the bracket.
- **Hollowbrook:** 7 dungeons at levels 1, 1, 3, 5, 7, 9, 10. Rat Cellar and Scarecrow Field are the two level 1 dungeons. The Rat Cellar is open at the start. The Scarecrow Field and the Wolf Trail both open after the first win in the Rat Cellar. The Sunken Mill opens after the Wolf Trail. The Scarecrow Field drops the wood, cloth and sinew that the first Archer, Mage and Priest recipes need.
- **Dungeon content:** 1-3 monster families from the town list and 1 rare monster. **Every dungeon has its own monsters:** a monster id and a sprite key appear in one dungeon only (the validator checks it).

| Dungeon | Monsters | Drops |
|---|---|---|
| Rat Cellar (1) | Cave Rat, Rat King | Rawhide, Copper Ore |
| Scarecrow Field (1) | Straw Scarecrow, Harvest King | Linen, Pine Wood |
| Wolf Trail (3) | Wolf, Alpha Wolf | Sharp Fang |
| Sunken Mill (5) | Mill Toad, Warty Elder | Toadskin |
| Goblin Camp (7) | Goblin, Goblin Captain | Bone Shard, Quartz |
| Old Wood Hollow (9) | Bark Spider, Hollow Broodmother | Spider Silk |
| Goblin Chief's Lair (10) | Goblin Chief, Hobgoblin adds | Coarse Sinew, Quartz, Faint Essence |

- **Locks and levels:** only the first dungeon is open at the start. Clearing a dungeon opens the next. Each dungeon has a **minimum hero level** (`minimumHeroLevel` in `dungeons.json`, the same as the monster level). A hero below it cannot enter: the start command rejects and the Start button stays off. In a boss party, one hero must have the level and the partner can be weaker. The dungeon also shows a best range (up to `recommendedMaxLevel`). Gear matters more than level: a level 1 hero with a full set of crafted gear wins at Wolf Trail 98% of the time.
- **Drop tables:** a normal monster drops 3 crafting materials in the first dungeons of a bracket, and 2 in later dungeons. Two dungeons share at most 1 crafting material between their normal monsters (the validator checks it). Rare monsters and bosses drop more of their dungeon materials, plus Faint Essence and Catalysts. **Base materials (Copper Ore, Pine Wood, Rawhide, Linen) drop only in the first dungeons of a bracket. Every later dungeon drops exactly one set material** (Quartz and Faint Essence are not set materials).
- **Drops per fight:** no gold (the aim is to craft). At least 1 crafting material is guaranteed. Each other drop rolls its own chance, so lucky fights give more. The guaranteed drop does not roll a second time, so no drop gives more than its maximum quantity. All drops are of the bracket tier.
- **Run:** one run is one fight. Wounds stay after it.
- **Recovery:** heroes regenerate health by the clock (`data/balance/recovery.json`). A level 1 hero heals from empty to full in 60 s. The time grows in a straight line to `regenSecondsToFullAtMaxLevel` at the level cap (82 s at level 10). The class `recoveryRate` speeds it up or slows it down (Thief 1.75, Priest and Fighter 1.25, Warrior, Archer and Barbarian 1, Mage 0.8). A hero at 0 health is down for (60 s + 5 s per level) divided by the class rate, then returns at 30% health. A down hero cannot start a run. Speed-up is not built yet (a later spell may unlock it).

## 10. Save

Saves are never dropped on an update. Each change of the saved data adds a migration, and a save always loads.

- **Salvage:** if the migrations cannot read a save (it is from a newer game, or a step is missing), or a part of it is broken, the game reads it part by part. Priority: heroes (class, level, experience, gear, spells), dungeon progress, the town, money, crafters and Bank purchases. A part that is wrong is left out and the rest loads: a piece of gear whose base item is gone, a spell that does not exist, a broken or off-grid backpack entry, a report, a job. A hero with an unknown class is dropped. Anything missing comes from a new game. The raw text of a save that was not intact is kept under `emberforge.save.unreadable`. A save loads as nothing only when it is not JSON, or not an object.
- **When:** the game saves after every **player move** (equip, craft, sell, buy, travel, start or stop a run) and after every battle.
- **Format:** one JSON object with a `version` number and migrations. Storage: browser local storage. The previous save is kept as a backup.
- **Export and import** of the save file is in the menu, to move a save between devices.
- **Old saves:** old backpack stacks split into single units, and the backpack grows by whole upgrades until everything fits. A save from before the 6 column grid has its entries packed again (big pieces first).
- **Settings** (language, volumes, Quick dispatch choice, seen changelog version) are saved apart from the game save, under `emberforge.settings`.

## 11. Art and audio

- **Resolution:** 480×270 logical pixels. The stage scales to fill the window (nearest-neighbour, so the scale can be a fraction). Units are 16×16 pixels (bosses 32×32). One shared palette. Pixel font bundled with the game. Every sprite and texture is drawn once and cached.
- **Style:** pixel art, wood and parchment menus, blackletter panel titles (Jacquard 12). English and Chinese body text and row titles use Fusion Pixel 12px, which has clear digits and Latin letters. Chinese also takes its digits from Atkinson Hyperlegible ("Readable Digits") and its Latin letters from Pixelify Sans.
- **Audio:** all sound is made in the browser, so the game has no sound files. A music track plays for the town, for battles, for bosses and for the castle. The Throne Hall and the Ramparts share one castle track: a slow, majestic march in D major. Music patterns and sound recipes are data in `data/audio/`. The audio engine is Tone.js.
  - Combat sounds depend on who hits: a hero attack is the weapon plus the monster cry. A monster attack is its strike plus a hit on the hero's armour (heavy metal clang, medium leather thud, light cloth thump).
  - There are sounds for criticals, heals, defeats, victory, level-up (`level-up`, a rising fanfare), crafter level-up (`crafter-level-up`, an anvil strike and two bright rings), and button clicks.
  - Only the watched run makes combat sound. Runs in the background are silent.
  - Fight music also plays in the town while a run is active (the `boss` track if the oldest run is in a boss dungeon, else `battle`). Inside the castle the `castle` track plays. With no run, the town track plays.
  - The Settings screen has music volume, effects volume and mute.

## 11b. Screens and flow

### Stage and town

- **Town screen** is the main stage when no run is active. The town is three stage screens wide (480 pixels each). The player moves with the arrow buttons on the sides (or the left and right keys). On a touch screen a swipe left or right moves too (48 pixels or more, mostly horizontal). The view slides. The screen name shows in the top left corner. The new game starts on the middle screen. The arrow that points to the Tavern pulses until the first hero is hired.
  - **Market Quarter (west):** Tavern, Merchant, a market square with a well and three stalls, a mill, cottages and town houses.
  - **Lord's Square (middle):** Lord's Keep (decoration), Workshop, Bank, Academy, a chapel, a keep square with a well, the Castle gate, cottages and town houses.
  - **East Gate (east):** Barracks, Stables, a watchtower, the Dungeons gate, cottages and town houses.
- **Buildings:** the Tavern, Workshop, Bank, Mill, Merchant, Academy, Barracks (opens the Heroes screen), Stables (opens the World map) and Dungeons gate open a panel. The Chapel has a name sign only. Houses, stalls and the tower have no function. All buildings are in `data/buildings.json` (`label` is null for a building without a sign).
- **Life:** a main street and a south street cross all three screens, and short lanes join each door to a street. Villagers and guards walk on the roads together with animals (cats, dogs and hens). A cat is slow and sits often, a dog trots, a hen pecks. Animals never use words, but the player can touch one (town and castle). A touched animal is happy for 5 seconds: it stands still, hops, hearts rise, and it calls (a cat purrs and mews, a dog yips, a hen cheeps). When the touch stops it calls once more, as if it wants another. Rarely (every 25 to 60 seconds) one visible animal calls by itself. Now and then a villager on the visible screen stops and says a full sentence in a speech bubble. Most sentences (about 70%) come from the facts of the save: gold, heroes, levels, classes, worn and carried items, crafting, the mill, runs, cleared dungeons and the time of day. The rest are stories about the town. A sentence does not repeat until six others were said. Heroes do not stand in town.
- **Stage corners:** the stage shows the player's gold in its top left corner and the local date and time in its top right corner. The version label sits in a corner too.
- **Castle:** the Castle in Castle Square opens when the player clicks it. Inside are two screens that slide like the town: the **Throne Hall** (screen 4) and the **Ramparts** (screen 5). The arrows (or left and right keys) move between them. The Leave button (or Escape) goes back to the town. The castle is a place to visit, not a game rule, so nothing in it is saved.
  - People and places are in `data/castle.json` (screen, position, size, number of tales). A click opens a story popup with a portrait and the tales (`castle.<id>.name`, `.title`, `.tale.<n>` in `data/i18n/`). A gold mark floats over a spot the player has not heard yet in this session.
  - The Throne Hall has King Aldric, Queen Isolde, a knight commander, a young knight, a bishop, a steward, a jester and a chronicler, plus the princess's little throne, her portrait, the Forge window and the founding tapestry. The Ramparts have a captain, an archer, a falconer and a lamplighter, plus the north tower, the Old Wood and the far spire, with a blue sky, mountains, farmland in perspective, the curtain wall and the gatehouse. A dog and a cat rest in each screen (decoration only).
- **Story:** nine nights ago, at midsummer, Princess Elowen was taken from the north tower by a winged creature that left cold black feathers. It flew east. The clues point to Blackspire (the unseen king) and to the Ember Forge: Elowen may carry the blood of the first Smith-Queen. The villagers talk about it too.
- **Lore:** an opening story shows before the first hero is hired (and after a reset), with a language choice. It has 5 paragraphs (`lore.prologue.1` to `lore.prologue.5`): the Ember Forge and the Long Dark, the night Princess Elowen was taken, why the king and his knights cannot leave, the player as the smith of Hollowbrook, and why the road goes town by town (worse beasts in every land, so heroes need better gear). It names no final place, so the ending stays open. Every town, monster and material has a short lore text (`town.<id>.lore`, `monster.<id>.lore`, `material.<id>.lore`), shown in the world map town popup, the dungeon screen and the material popup. The validator requires lore for all new content.

### Menus and panels

- **Bottom bar** is always visible (also during a fight): Heroes, Inventory, Dungeons, World, Settings. It does not show gold. A panel covers the stage, so the Inventory and Merchant screens show the gold again. On a wide screen the combat log stands beside the stage.
- **Lists:** every menu shows one item per row, with a pixel picture: hero portraits, item and material icons, dungeon icons.
- **Close anywhere:** the player can click the empty space around a panel or modal to close it, not only the x button. Escape closes too.
- **Hero bars:** hero lists show a live health bar and an experience bar.
- **Heroes screen:**
  - Stats tab: the full-body portrait, the main stats (Health, the class resource, Physical damage, Magical damage, Armour, Magic resist, Attack time, Critical chance, Critical damage, Life steal), the attributes as bars (Str red, Agi green, Int blue), and Power.
  - Equipment tab: a paper doll with slots around the full-body portrait. A click on a slot gives Equip new item (side by side compare), View item (big portrait and stats) or Unequip.
  - Spells tab: 3 spell slots and 1 ultimate slot. A tap on a slot picks a learned spell.
  - Battle record tab: kills, damage, healing and battles won and lost.
- **Settings:** language, music volume, effects volume, mute, save export and import, the build label (git commit count and hash, also in the page corner and the browser tab title), a Watch the victory screen button once the victory dungeon is cleared, and a red Danger zone with RESET GAME (needs a second click to confirm).
- **Languages:** English and Simplified Chinese, chosen in Settings (and on the opening story page) and saved apart from the game save. All text and content names are in `data/i18n/`. Item names are built from parts (material, base, affixes), so they change language too.
- **Data:** all game data is JSON in `data/`. A README there explains each file.

### Dungeons and runs

- **First start:** the Tavern opens. The player hires the free first hero. Then the Dungeons panel opens. The player picks a dungeon and presses Fight! (or taps the dungeon row).
- **Dungeon screen:** both open the dungeon screen, all on one screen with no scroll on desktop and on a phone:
  - the dungeon picture and a short story;
  - the monsters with pictures (a tap opens a monster's details: lore, statistics and drops, as the Bank features allow);
  - the monster loot tables with chances (after Drop rates) and statistics (after Monster statistics);
  - the hero choice and the Fight! button.
  - For a one-hero dungeon the first free hero is chosen already, a tap on another hero moves the choice, and Fight! starts the run. A party dungeon (the boss) lets the player tap heroes up to the party size. A hero in another run, or below the dungeon level, shows the reason and cannot be picked. A locked or busy dungeon opens the same screen with no hero choice.
- **Dungeon list:** the team strip at the top of the Dungeons panel shows hero chips (portrait, name, health bar), a hero in a fight has a gold frame, and a tap on a chip opens the Heroes panel. A busy row shows "Under fight", a fight icon, a progress bar and the seconds left, with Watch battle and Run away buttons. Locked dungeons show a lock and the dungeon to clear first.
- **Several heroes:** each hero can go to a different dungeon. Running away gives no loot, XP or report. The hero keeps the wounds taken until that moment (the same seeded fight is replayed up to it) and heals from there.
- **Quick dispatch** (Bank feature): a checkbox on the Dungeons panel, "Stay on this screen after sending a hero", keeps the panel open and skips the battle view, so the player can send the next hero at once. It is saved in `emberforge.settings` and is off by default. Without the Bank feature the checkbox is hidden and the normal flow always applies.
- **During a run:** a themed battle scene for each dungeon.
  - Health bars float above the heads. Each has a level badge and tick lines for chunks of HP (bigger ticks at every fifth). A pale chunk shows the damage just taken and drains away.
  - A hero bar has a thin resource strip below it (blue Mana, gold Stamina, violet Hatred, orange Rage).
  - Units bob, flash and collapse. Melee units lunge. The Archer shoots an arrow and the Mage a magic bolt: the shot flies to the target, and the hit sparks and damage number show when it lands. Damage numbers float up and hit sparks fly.
- **Combat log:** a title, and lines grouped into numbered turns (one turn is one second of battle). Hero names are blue, monster names red. Damage is a gold chip, damage taken red, a critical hit orange, healing green. A spell line ends with the cost, for example (-6 Stamina). After a victory, one line per hero shows the experience that hero gains.
- **After a run:** there is no pop-up notice. The report opens at once only when the player watches the battle screen (the stage with no panel open). Everywhere else, also on the Dungeons panel, the report waits: its dungeon row shows "Fight over" and View results, and the Dungeons button counts it in its yellow badge. The player clicks the row to read it, then the dungeon can start again.
  - The report shows result, damage, level-ups and loot. Each hero has an experience bar with no number: blue is the experience the hero had, and a gold part grows to show what the fight gave. A level-up leaves only the gold part, on the bar of the new level. A hero that levelled up also shows its growth: one chip for each stat that the new levels raised (Health, Strength, Agility, Intelligence, Armour, Magic resist, Attack speed and the class resource), counted from the class numbers without gear. A hero that did not level up shows no chips.
  - Each loot stack is a big box. Hover shows its details, and a tap opens them.
  - Buttons are large for touch.
- **Repeat:** the report has a Repeat button next to Close. It sends the same heroes into the same dungeon again, marks the report as read and shows the new fight at once. In the Dungeons list, a dungeon that shows "Results ready" has a Repeat button next to View results, and it does the same (it follows the Quick dispatch setting). If the start is rejected (a hero is down, or loot waits at the dungeon), the player sees the reason and the report stays.

### Victory and version

- **Victory screen:** the first clear of the victory dungeon (`victoryDungeonId` in `progression.json`, now the Goblin Chief's Lair) opens a Victory screen after the player closes the run report. It covers the whole page: rotating light rays, falling pixel confetti, a gold trophy, a big VICTORY! title with the heroes of the winning party, the story, and a fanfare (`victory-fanfare`). It has a button to the wiki (https://bluraydisc.github.io/emberforge-wiki/) and a Keep playing button (Esc also closes it). It opens by itself once, because only a first clear sets `firstClear`. `npm run validate` checks that the dungeon exists and has a boss.
- **Version notice:** after an update, a pulsing button next to the version label says that a new version is here. One tap opens the wiki changelog (https://bluraydisc.github.io/emberforge-wiki/changelog/) and hides the button for good. The seen version is saved in `emberforge.settings` (`seenChangelogVersion`), so the button comes back only with the next version.

## 12. Current scope and roadmap

- **Now:** Hollowbrook (town 1), level cap 10, 7 dungeons and 1 boss. 7 base classes with spells up to level 10. All 6 crafting professions with tier 1 (Jewelcrafting hidden). All 11 gear slots. Merchant, Tavern, Academy, Bank, Mill, Castle, world map (view only), auto-save, save export and import, and the balance simulator and data validator.
- **Not built yet:** the `balance-report` tool (TODO, it fills the generated half of each bracket balance file), `docs/balance/bracket-01.md`, travel, promotion, Enchanting, Unique item pool, Jewelcrafting in the Workshop, passive talents, Speed-up of recovery, and every town after Hollowbrook.
- **Next:** town 2 (Barrowgate, levels 11-20). It raises the level cap and needs: monster curves fitted again, spell price anchors extended, the XP table above level 10, tier 2 materials and recipes, 2 bosses in total, and a Unique pool of 2 items per bracket. The Barbarian unlock moves to a dungeon of town 2.
- **Done when (town 1):** a new game plays from Lv 1 to the cap (fight, loot, craft, equip, learn spells, clear the boss) and a reload keeps the exact state. **Done when (town 2):** the same to Lv 20 with travel and promotion.
- **Later:** brackets 3-10, second promotion branches and master classes, sockets for gems, town orders (the merchant asks for crafted items for gold), mobile PWA, Tauri desktop builds.
