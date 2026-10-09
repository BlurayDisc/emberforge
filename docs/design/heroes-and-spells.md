# Emberforge design - Heroes and spells

Part of the game design. The headings of `docs/design.md` list every section and the file it is in. Section numbers are the same in every file.

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
| Mana regeneration | base regeneration × (1 + Intelligence × 0.01). Mana classes only (Mage, Priest). |
| Attack time | `baseAttackSeconds` ÷ (1 + attack speed bonus). The bonus is Agility × 0.003 + gear + Haste, and Slow is a negative number in the same pool. There is no minimum attack time, but `1 + bonus` never goes below 0.1 (`minimumAttackSpeedFactor` in `battle.json`). |
| Critical chance | 4% for every hero (`baseCriticalChance`) + class trait + gear. The Thief has +2%. At most 50%. |
| Critical damage | 200% (`criticalDamageMultiplier`) + gear |
| Mana, Stamina, Hatred, Rage | A fixed pool (`maximum` in `data/balance/resources.json`) |

- **Balance status:** a class has `balanceStatus` in `classes.json`: `baseline` (Warrior, Archer, Mage: balanced numbers) or `placeholder` (Priest, Thief, Barbarian, Fighter: derived from the baseline so the game runs, and waiting for their own balance pass).
- **Damage of a hero:** a hero attacks with the damage kind of its class.
- **Start and money:** the company starts empty. The player starts with 50 copper, for the first crafter fees. The **first hero is free** at the Tavern (any open class). More heroes cost gold: 3s (300 copper), 9s, 27s … (×3 each, `heroHireCostByCompanySize`). Monsters drop no money: the player earns money only by selling materials and items at the merchant. The second hero is a goal for level 5 to 6. The measured income is in `docs/balance/bracket-01.md` (B11).
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

- **Active only.** Passive talents come later. The hero casts every spell in battle by itself, in slot order (see Cast order below). The player chooses which spells a hero equips and in which slot.
- **Slots:** each hero equips 3 spells and 1 Ultimate. A spell has a class and a level, and the hero learns it at that level.
- **Ranks:** a spell can have ranks (`familyId` and `rank` in `spells.json`, rank 1 has neither): Shield Bash, Shield Bash II, Shield Bash III. A hero must know the rank below. Learning a rank **replaces** the lower rank in the same slot and in the learned list, so a hero never holds two versions. A lower rank cannot be learned again. Ranks make a spell stronger (power, status value, cost). The names are `spell.<id>` in `i18n`. Every spell that is not an Ultimate shows its rank in Roman numerals in its name (Shield Bash I, II, III). The spell badge in the Academy shows the rank in Arabic numerals (Lv 1, Lv 2).
- **One schedule for all classes.** The Warrior is the blueprint: a new spell or rank every 2-3 levels, ranks of one family spread far apart so no basic spell maxes early, 6 families with 17 spells and ranks, and one Ultimate at level 20. New spells stop at the Ultimate, and ranks go on to level 42. Every class uses the same levels (family A 2/10/27, B 4/14/32, C 6/22/37, D 8/25/40, E 12/30/42, F 17/35, Ultimate 20), the same cooldowns and about the same costs and power, so the Academy price of the first 10 levels is the same for all classes (1,461 copper in total).
- **Identity, not filler.** Each family has one clear job. A spell that does not fit the class does not exist (the Warrior has no heal and no haste).
- **Reserved spells:** each class keeps 6 later spells and later Ultimates (levels 45, 70, 95) in `spells.json` with `reservedFor: "specialisation"`. The game does not load them, the validator still checks them, and a specialisation reuses them later, possibly with new numbers. The Warrior's are Crushing Blow, Thunder Slam, Unbreakable, Earthsplitter, Last Stand and Blade of Legends.

| Class | A: filler (2/10/27) | B (4/14/32) | C: self (6/22/37) | D (8/25/40) | E (12/30/42) | F (17/35) | Ultimate (20) |
|---|---|---|---|---|---|---|---|
| Warrior | Power Strike 162-210% | Shield Bash 100-120% + 160-190% Defence | Guard Stance, self Fortify +35 / 50 / 65% Defence for 8 s | Cleave, all enemies 175-225% and Weaken 10-15% for 5-6 s | Mighty Blow 210-270% and Sunder 12-18% for 6 s | Iron Wall, all allies Fortify +25 / 35%, self Thorns 20 / 30% for 8 s | Heroic Strike 468% |
| Archer | Aimed Shot 162-210% | Quick Shot, 2 hits of 99-119% | Fleet Foot, self Haste 20-36% | Evasive Shot 200-260% and Evade the next hit (2 hits at rank 3) for 6-10 s | Volley, 5 arrows of 45-55% spread over the enemies in turn, and Slow 10-15% | Hunter's Focus, self Empower +25 / 35% Agility for 10 s | Sniper Shot |
| Mage | Fire Bolt 162-210% | Frost Shard 160-190% and Slow 20-30% | Mana Shield: costs 25% of the maximum mana, absorbs 45 / 90 / 140 damage plus 6 / 9 / 12% of the maximum health, 10 s | Fireball 190-240% and Burn 20-30% of the attack each second for 4-5 s | Arcane Unravel 120-140% and Hex +15-25% magic damage taken for 8 s | Arcane Surge, self Empower +25 / 35% Intelligence for 10 s | Inferno |
| Priest | Minor Heal 200-260% | Smite 167-200% | Divine Shield, self Guard 25-40% | Healing Wave, all allies 120-160% | Holy Fire 210-270% and Weaken 12-18% | Sanctuary, all allies Guard 20 / 28% | Divine Hymn |
| Thief | Backstab 162-198% | Quick Stab, 2 hits of 99-119% | Dodge Roll, self Guard 25-40% | Smoke Bomb 175-225% and Weaken 10-15% | Eviscerate 210-270% and Sunder 12-18% | Adrenaline, self Haste 25 / 35% | Shadow Strike |
| Barbarian | Savage Swing 162-198% | Blood Fury 170-210% and heals 40-60% of the damage | Rage, self Haste 20-36% | Ground Pound 175-225% and Weaken 10-15% | Rending Blow 210-270% and Sunder 12-18% | Thick Skin, self Guard 28 / 38% | Mountain Breaker |
| Fighter | Jab 162-198% | Combo Strike, 3 hits of 70-86% | Iron Skin, self Guard 25-40% | Sweeping Kick 175-225% and Slow 10-15% | Tiger Fist 210-270% and Weaken 12-18% | Inner Peace, heals one ally 200 / 250% | Dragon Fist |

Identity in one line each: the Warrior wins by Defence, Fortify and Thorns. The Archer is a selfish damage dealer that buffs its Agility, slows, shoots many arrows and dodges (Evade comes at level 8, before the cap). The Mage controls with Slow, Burn and Hex and shields itself, with no heal and no aura. The Priest heals, guards and weakens. The Thief is fast and uses Haste. The Barbarian lives on life steal, Haste and Thick Skin. The Fighter combines combos, Guard, Slow and a small heal.

### Trainers and price

- Trainers live in the Academy (Lord's Square). Each class has its own trainer. The player picks a hero, then pays the trainer to teach a spell the hero is high enough to learn. The Academy lists only spells the hero can learn now, plus a note for the level of the next one. A new spell takes the first free slot of its kind. The Heroes screen has a Spells tab to change the slots.
- **Price curve:** a curve through anchor points (`learnCostAnchors` in `data/balance/spells.json`: level 2 = 18 copper, level 10 = 127 copper). Between two anchors the price is a power of the level (a straight line on a log-log scale). Past the last anchor it continues with the last exponent (about level^1.2). An Ultimate costs double. **The anchors must reach the level cap** (the validator fails otherwise), so when the cap grows the designer adds anchors from the economy sim.
- **Budget:** the price is set from the gold that a solo hero earns by crafting and selling. The economy sim (`spellBudgetPercent` = 65 in its preset) prints the share that spells take at each level and flags a level over budget. The measured share is in `docs/balance/bracket-01.md` (B11). The rest of the income pays for the second hero (300 copper) and the Bank. Every class has spells at levels 2, 4, 6, 8 and 10 for 18, 42, 69, 97 and 127 copper. Above level 10 the curve is only an extension until the anchors are set from real income. A full tree is a gold sink next to hero hiring.
- **No changes in a run:** learning and equipping are rejected while the hero is in a run, because the run replays its fight from the hero's state (same rule as gear).

### Effects and statuses

- **Damage:** one enemy (one hit or several) or all enemies. Power is a fraction of the hero's attack per hit. The damage kind is physical (Defence takes points off each hit) or magic (Resistance does). A damage spell can:
  - inflict a status on the enemy it hits (`inflicts`);
  - add a share of the caster's Defence to each hit, before the armour of the target (`defencePower`, Fortify counted). Shield Bash uses 160% / 175% / 190%, so a Warrior with its shield hits about as hard as Power Strike at level 5 and harder from level 10, because its Defence grows faster than its attack;
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
- **Shield** (Mana Shield): costs a share of the maximum resource pool (`resourceFraction`, with `resourceCost` 0) and gives the caster a shield with its own counter. It absorbs `absorbFlat` damage plus `absorbMaxHpFraction` of the maximum health of the caster (the resource pool does not grow, so the flat part is the early power spike and the health part scales late), takes every hit before the health, and ends after its duration. A unit does not cast a shield on top of a shield. The health bar shows it as a blue part after the health, and the log shows how much of a hit it took.

### Cast order

There is no spell AI. A hero follows a fixed order that the player sets with the slots:

- **Cast, attack, cast, attack.** After a spell cast, the next action is always one basic attack (for the Priest, its basic action, which can be a heal, see section 8). After that basic action, the next action is a cast again.
- **Slot order, round robin.** When a cast is due, the hero looks at slot 1, 2, 3, then the Ultimate slot, and starts at the slot after the one it cast last. It casts the first spell in that order that is off cooldown, affordable and in reach. An empty slot is skipped. If no spell is ready, it makes a basic attack and tries again at its next action.
- **Only three guards, so a cast is never wasted:** no heal when no ally (or, for a self heal, the caster) is hurt at all, no status that is already active on its target, and no shield on top of a shield.
- A cast takes the whole action. The player changes the order by moving spells between slots in the Heroes screen (Spells tab), which shows this rule as a hint.
- Monsters (and boss spells) keep their own choice: the first spell in their list that is ready and useful (a monster heal waits until an ally is below `healCastBelowHealthFraction` = 60% HP), else an attack.

### Resources

Each class has one resource (`resourceId` in `classes.json`, numbers in `data/balance/resources.json`). Each spell has a resource cost, a cooldown in seconds and a cast time (`castSeconds`, default 0.8 s from `defaultCastSeconds` in `data/balance/spells.json`, 0 is an instant cast). The unit stands still while it casts (see section 8). An Ultimate starts on a 15 second cooldown, so it comes in the middle of the fight.

| Resource | Classes | Pool | Start | Regeneration and gain |
|---|---|---|---|---|
| Mana | Mage, Priest | Fixed 30 | Full | 1.8% of the maximum each second |
| Stamina | Warrior, Archer | Fixed 28 | Full | 2.2% each second |
| Hatred | Thief | Fixed 24 | Half | 2% each second, and 4% per hit dealt |
| Rage | Barbarian, Fighter | Fixed 26 | Empty | None by itself. 8% per hit dealt and 8% per hit taken. |

The pool is small and the spells cost a clear share of it, so the pool (not the regeneration) is the lever for resource pressure. Regeneration stays at 1.8-2.2% of the pool each second. The resource bar on the stage follows the battle tick by tick, so the player sees the regeneration between two spells. The pools are fixed: no level and no attribute gives more. Intelligence speeds up mana regeneration only (`manaRegenBonusPerIntelligence` in `data/balance/hero-stats.json`, +1% of the base regeneration for each point, so a level 1 Mage with 23 Intelligence regenerates 23% faster and a level 10 Mage about 46% faster, more with gear). Stamina, hatred and rage do not follow any attribute. Skills and items change them later.

**Spell cost curve.** A cost is a share of the pool of the class, so every class pays the same share. A basic spell costs about 17-30% of the pool, a rank-up or mid spell about 34-37%, and a big non-ultimate spell 40% at most. An Ultimate costs 55% (level 20), 70%, 82% and 90% (level 95) of the pool. Examples (Mage, pool 30): Fire Bolt 6, Fireball 9, Arcane Unravel 10, Arcane Surge 12, Inferno 16. Warrior (pool 28): Power Strike 5, Cleave 8, Iron Wall 11, Heroic Strike 15. The Priest spells Minor Heal, Smite and Divine Shield cost 5, 6 and 7, because the Priest has the least Magic and casts the most. A Rage class starts empty and builds 8% of its pool per hit, so a Rage Ultimate (14-17 of 26) needs about 7 hits.

**The pool must limit the player.** Target for the lowest point in a normal fight: 75-90% at level 2 (level 1 has no spell) and 0-15% at level 10 (`resource-use.json`). Barbarian and Fighter start empty, so their lowest point is 0. Check it with `npm run scenarios -- resource-use`. The results are in `docs/balance/bracket-01.md`.

### Looks, sounds and log

- **Spell looks and sounds:** every spell up to level 10 (all 7 classes) has a look in `data/spell-visuals.json` and sounds in `data/audio/sound-effects.json` (`spellSounds`). A look has a theme (colours) and up to 5 parts: **cast** (on the caster), **projectile** (flies to the target, with a trail), **impact** (on the target), **buff** and **debuff** (stay on the unit while the status lasts). A damage spell with an inflicted status shows its debuff after the impact. A many-hit spell shows its hits 0.16 s apart. The effects are pixel-art frames drawn in code and cached once per theme. The sound of a part matches its look part. A spell without a look keeps the plain weapon hit and heal chime. The validator fails when a spell up to level 10 has no look or sound, when a look part has no sound, or when an id is unknown. Spells above level 10 have no look yet.
- **Log:** a spell cast shows the spell name. A spell with several targets gives one event per target.
