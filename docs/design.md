# Emberforge - Game Design

Working title. Pixel-art, real-time-battle, Middle-earth-style fantasy. You lead a company of heroes and run a workshop.

This file and the files in `docs/design/` hold the game rules and the current numbers. They do not hold code layout or change history (see `docs/architecture.md` and git). Numbers that live in `data/` are named by their JSON key. Balance tables for each bracket (curves, pacing, dungeons, crafts, boss, simulator results) live in `docs/balance/bracket-NN.md`.

Sections 1-3, 10 and 12 are in this file. The other sections are in `docs/design/`, and each has a stub heading below. Read the topic file only for the area you work in.

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

In `docs/design/heroes-and-spells.md`: classes, attributes, Defence, hiring.

## 4b. Spells

In `docs/design/heroes-and-spells.md`: trainers, effects, cast order, resources.

## 5. Items

In `docs/design/items-and-crafting.md`: item types, quality, affixes, drops.

## 6. Materials and crafting

In `docs/design/items-and-crafting.md`: materials, recipes, crafters, the Workshop, the merchant.

## 7. Backpack and Bank

In `docs/design/items-and-crafting.md`: storage.

## 8. Battle

In `docs/design/battle-and-monsters.md`: real-time rules, monsters, boss, experience, balance scenarios.

## 9. World, travel and dungeons

In `docs/design/world-and-dungeons.md`: the ten towns, travel, dungeons, drops, recovery.

## 10. Save

Saves are never dropped on an update. Each change of the saved data adds a migration, and a save always loads.

- **Salvage:** if the migrations cannot read a save (it is from a newer game, or a step is missing), or a part of it is broken, the game reads it part by part. Priority: heroes (class, level, experience, gear, spells), dungeon progress, the town, money, crafters and Bank purchases. A part that is wrong is left out and the rest loads: a piece of gear whose base item is gone, a spell that does not exist, a broken or off-grid backpack entry, a report, a job. A hero with an unknown class is dropped. Anything missing comes from a new game. The raw text of a save that was not intact is kept under `emberforge.save.unreadable`. A save loads as nothing only when it is not JSON, or not an object.
- **When:** the game saves after every **player move** (equip, craft, sell, buy, travel, start or stop a run) and after every battle.
- **Format:** one JSON object with a `version` number and migrations. Storage: browser local storage. The previous save is kept as a backup.
- **Export and import** of the save file is in the menu, to move a save between devices.
- **Old saves:** old backpack stacks split into single units, and the backpack grows by whole upgrades until everything fits. A save from before the 6 column grid has its entries packed again (big pieces first).
- **Settings** (language, volumes, Quick dispatch choice, seen changelog version) are saved apart from the game save, under `emberforge.settings`.

## 11. Art and audio

In `docs/design/screens-and-art.md`: art and sound rules.

## 11b. Screens and flow

In `docs/design/screens-and-art.md`: stage, menus, dungeons and runs, victory.

## 12. Current scope and roadmap

- **Now:** Hollowbrook (town 1), level cap 10, 7 dungeons and 1 boss. 7 base classes with spells up to level 10. All 6 crafting professions with tier 1 (Jewelcrafting hidden). All 11 gear slots. Merchant, Tavern, Academy, Bank, Mill, Castle, world map (view only), auto-save, save export and import, and the balance simulator and data validator.
- **Not built yet:** travel, promotion, Enchanting, Unique item pool, Jewelcrafting in the Workshop, passive talents, Speed-up of recovery, and every town after Hollowbrook.
- **Next:** town 2 (Barrowgate, levels 11-20). It raises the level cap and needs: monster curves fitted again, spell price anchors extended, the XP table above level 10, tier 2 materials and recipes, 2 bosses in total, and a Unique pool of 2 items per bracket. The Barbarian unlock moves to a dungeon of town 2.
- **Done when (town 1):** a new game plays from Lv 1 to the cap (fight, loot, craft, equip, learn spells, clear the boss) and a reload keeps the exact state. **Done when (town 2):** the same to Lv 20 with travel and promotion.
- **Later:** brackets 3-10, second promotion branches and master classes, sockets for gems, town orders (the merchant asks for crafted items for gold), mobile PWA, Tauri desktop builds.
