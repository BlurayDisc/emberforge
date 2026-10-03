# Emberforge - Game Design

Working title. Pixel-art, turn-based, Middle-earth-style fantasy. You lead a company of heroes and run a workshop.

## 1. Core loop

Fight → Loot → Craft → Equip → Travel → Fight (harder).

Heroes fight automatically. The player sends one hero (two for a boss) into a dungeon. The player can send all heroes to different dungeons at the same time, and watches one battle at a time. The player crafts, equips and sells while the fights go on.

## 2. Technology decision

**three.js + TypeScript + Vite.** Static site. No server.

| Option | Verdict | Reason |
|---|---|---|
| libGDX (Java) | No | The web build (GWT/TeaVM) is slow and limits Java libraries. The game is menu-heavy (grids, tooltips) and libGDX UI is weak. |
| Godot | No | Strong engine, but its work is editor-centered. The web build is large. Text-only (AI-assisted) work is harder. |
| **three.js** | **Yes** | Web-first. Deploys as a static folder to GitHub Pages or Vercel. All code is text. The UI uses DOM and CSS, which suits an inventory grid. |

- **Stage** (world map, battle scene): three.js, orthographic camera, 480×270 logical pixels, integer scaling.
- **UI** (backpack, crafting, roster): DOM and CSS with a pixel font.
- **Logic**: plain TypeScript with no browser or three.js code, so a Node balance simulator can run it.
- **Desktop** (Windows, macOS): wrap the web build with Tauri 2 (later). Tauri 2 can also target iOS and Android.
- **Mobile bonus**: touch-first UI and an installable PWA (later).

## 3. Glossary

| Word | Meaning |
|---|---|
| Company | All heroes the player owns (max 12). |
| Run party | The hero or heroes sent into one dungeon run. A dungeon hosts one run at a time. A hero is in one run at a time. The dungeon sets the maximum: 1 for normal dungeons, 2 for boss dungeons. There is no permanent party. |
| Bracket | A block of 10 levels (1-10, 11-20 … 91-100). |
| Tier | Material grade. Tier N belongs to bracket N. |
| Town | Hub of one bracket: workshop, merchant, tavern, dungeons. |
| Dungeon | A place with 1-3 monster types. The player runs it again and again. |
| Encounter | One fight: 1-3 monsters. |
| Material | A loot item used to craft. |
| Base | An item type, for example Sword. |
| Affix | A prefix or suffix that adds a stat to an item. |
| Quality | Common, Magic, Rare or Unique. |
| Player move | Any command from the player. The game saves after each one. |

## 4. Heroes and classes

- Level cap 100. Stats: HP, Strength, Magic, Skill (crit), Speed, Defence, Resistance.
- The company starts empty. The player hires the **first hero for free** at the town tavern (any of the 5 classes). More heroes cost gold: 1s, 3s, 9s, 27s … (×3 each).
- **Money:** 100 copper = 1 silver, 100 silver = 1 gold. The game stores copper only. The bottom bar always shows the amount.
- **Statistics:** each hero records monsters defeated, damage dealt, damage taken, healing done, fight time, and battles won and lost. The Heroes screen shows them, with damage per second and a **Power** number (the square root of damage output times durability). Power tells how strong the hero is.
- Each class has growth rates and one active skill per tier. The AI uses the skill when it is ready.
- **Promotion** (Fire Emblem style): at Lv 20 the player picks one of two branches. At Lv 50 the hero takes the master class. The hero keeps the level.

| Class | Role | Lv 20 branches | Lv 50 master | Weapon | Off hand | Armour |
|---|---|---|---|---|---|---|
| Warrior | Front melee | Knight / Berserker | Marshal / Warlord | Sword, Axe, Mace | Shield | Heavy |
| Archer | Ranged physical | Ranger / Hunter | Pathfinder / Deadeye | Bow | Quiver | Medium |
| Mage | Ranged magic | Sorcerer / Warlock | Archmage / Voidcaller | Staff, Wand | Tome | Light |
| Priest | Healer, support | Cleric / Druid | Saint / Wildwarden | Mace, Wand | Tome | Light |
| Thief | Fast melee, crit | Assassin / Trickster | Nightblade / Shadowmaster | Dagger | Dagger | Medium |

## 5. Items

An item is: **Base + Item level (ilvl) + Quality + Affixes**. A hero needs level ≥ ilvl to equip it.

- **Slots (10):** Main hand, Off hand, Helm, Armour, Gloves, Boots, Belt, Amulet, Ring ×2.
- **Base stats** roll inside a range (±15%) and grow with ilvl. Weapons give attack. Armour gives Defence and Resistance.
- **Quality:**
  - Common: 0 affixes.
  - Magic: 1-2 affixes (max 1 prefix, 1 suffix).
  - Rare: 3-4 affixes (max 2 prefix, 2 suffix).
  - Unique: fixed name and fixed affix set, with rolled values. Drops only.
- **Affixes** have a stat, a value range per affix tier, and a minimum ilvl. Examples: *Sharp* (+Attack), *Sturdy* (+Defence), *of the Bear* (+HP), *of Insight* (+Magic), *of Precision* (+Skill).
- **Backpack size (width × height):**

| Size | Items |
|---|---|
| 1×1 | Ring, Amulet, Material (stacks to 99) |
| 2×1 | Belt |
| 1×2 | Dagger, Wand, Quiver |
| 1×3 | Sword, Axe, Mace |
| 1×4 | Staff |
| 2×2 | Helm, Gloves, Boots, Tome |
| 2×3 | Armour, Shield, Bow |

## 6. Materials and crafting

**Bracket rule: a recipe uses materials of one tier only.** Tier N materials drop only from bracket N monsters. They craft items with ilvl inside bracket N. The content validator rejects any recipe that mixes tiers.

- **Materials (all from monster drops):**
  - Main materials: Ore, Wood, Hide, Cloth, Gem.
  - Beast parts: Fang, Bone, Sinew. (Scale is added from tier 3, with lizardfolk.)
  - Essence: used by Enchanting.
  - Catalyst: rare drop. It improves the quality odds.
- **Recipes are generated:** Recipe = Base × Tier. The tier sets the item name, for example *Copper Sword*, *Pine Bow*, *Linen Robe*. Counts scale with item size.

| Profession | Makes | Ingredients (same tier) |
|---|---|---|
| Blacksmithing | Sword, Axe, Dagger, Parrying Dagger / Mace, Heavy armour, Shield | Ore + Fang / Ore + Bone |
| Fletching | Bow, Quiver | Wood + Sinew |
| Woodworking | Staff, Wand | Wood + Bone |
| Tailoring | Medium armour, Belt / Light armour, Tome (Satchel later) | Hide + Sinew / Cloth + Sinew |
| Jewelcrafting | Ring, Amulet | Gem + Ore |
| Enchanting | Changes an existing item | Essence (same tier as the item) |

- **Craft:** pay the materials. The result is instant. Ingredient count = half the item cells (rounded up) of the main material, plus 1 beast part (2 for items of 6 cells or more).
- **Item level:** random from the bracket start up to your best hero's level (capped by the bracket end). The game rolls twice and keeps the higher result. So a crafted item is always usable by your best hero. Base stats, Quality and Affixes are random.
- **Quality odds** (Common / Magic / Rare): 55 / 35 / 10. With 1 Catalyst: 25 / 45 / 30.
- **Enchanting actions:** Reroll the values of one affix. Add an affix (up to the quality limit). Reforge all affixes (needs a Catalyst).
- **Unique items** drop from rare monsters (4%) and bosses (25%). The player cannot craft them.
- **Crafter levels:** each profession is a crafter with level 1-100 and XP. Every craft gives XP (more for higher recipes, less for recipes far below the crafter level). A recipe needs level (tier - 1) x 10 + the base item's offset. Locked recipes show the needed level.
- The Workshop is in town. Click a recipe to see a big portrait and the stat ranges.
- **Timed jobs:** selling and crafting take time (real clock, also while the page is closed). A sale takes 5 s + 0.6 s per copper of value, up to 10 minutes. The merchant runs 3 sales at once. A crafter makes one item at a time, 5 s + 1.5 s per required level. Jobs show a progress bar. A finished craft waits for backpack room.
- **Merchant:** has a Sell tab and a Buy tab. It buys items and materials. It sells materials at 4 times the sell price, so buying is a gold sink and not a profit loop. Item value = ingredient value × quality factor (1, 2, 4, 10) × (1 + 0.1 × (ilvl − 1)).
- Enchanting is not built yet.

## 7. Backpack

- Grid 10 × 8 per tab, in the style of Diablo 2. Drag and drop. Auto-sort button.
- The company starts with 1 tab and can have up to 8. Buy a tab with gold (cost doubles each time) or craft a Satchel with Tailoring.
- A tooltip compares the item with the equipped item. On touch screens, a tap shows the tooltip.
- If the backpack is full, the dungeon run pauses until the player makes space.

## 8. Battle

- **Auto-battle by speed.** Each unit has a charge meter that fills at its Speed. The unit acts at 100. One action at Speed 100 takes 1 second.
- **Action:** basic attack or active skill. Priority per class (the Priest heals an ally below 50% HP first).
- **Damage** = Attack × (1 − reduction). Reduction = Defence ÷ (Defence + 50 + 10 × attacker level). A crit does ×1.5. There are no misses.
- **Deterministic:** a battle is simulated first from a seed, then played back at 1×, 2× or 4× speed. After a reload, the same battle replays from its start.
- **Duration targets at 1× speed:**
  - Normal encounter: 7 s at Lv 1, rising in a straight line to 60 s at Lv 100.
  - Boss: 10 × the normal duration of its level (about 2 min at Lv 10, about 10 min at Lv 100).
- **Monster stats come from a reference curve.** The reference hero is a single hero at level L with Magic-quality gear of ilvl L. Monster HP makes the reference party need the target duration. Monster damage makes it lose about 35% of its HP.
- **Rare monster:** 2% of encounters. About 2.5 × HP. Drops ×3, one Catalyst, 4% Unique.
- **Boss:** 1 boss and 0-2 adds. Drops ×5, two Catalysts, 25% Unique.
- **Encounter size:** 1-3 monsters, never more than the party size. A solo hero meets 1 monster.
- **End of a run** (stop, wipe, weak party or full backpack): the party returns to town and heals fully. The player keeps all loot. There is no other penalty.
- **Between fights:** heroes heal 30% of max HP. Knocked-out heroes wake with 30% HP.

### Level and gear balance

- XP to next level = 40 × L^1.5. Each monster gives XP = (XP to next ÷ (10 + 0.15 × L)) × gap factor. Every party member gets full XP.
- Gap factor = clamp(1 + 0.1 × (monster level − hero level), 0.05, 1.5). Rare monster ×5 XP. Boss ×20 XP.
- Expected length: about 20 hours to Lv 100 at 1× speed.

| Case | Win rate | Party HP lost | Duration |
|---|---|---|---|
| Level L, Magic gear (ilvl L) | ≥ 90% | 30-40% | curve ±15% |
| Level L, Common gear | 60-80% | - | - |
| Level L, Rare gear | ≥ 98% | - | ≤ 80% of curve |
| Level L + 26, gear ilvl L + 26, monsters Lv L | ≥ 99% | ≤ 10% | ≤ 40% of curve |
| Level L, monsters Lv L + 5 | ≤ 50% | - | - |
| Boss, level L, Rare gear | 70-90% | - | 10 × curve ±20% |

The balance simulator checks these targets. See CLAUDE.md.

## 9. World, travel and dungeons

Ten brackets. Each bracket has one town.

| # | Levels | Town | Region | Monster families | Boss |
|---|---|---|---|---|---|
| 1 | 1-10 | Hollowbrook | Farmland, Old Wood | goblins, rats, wolves | Goblin Chief |
| 2 | 11-20 | Barrowgate | Barrow Downs | skeletons, wights, clay golems | Barrow Lord |
| 3 | 21-30 | Mirewatch | Marshes | lizardfolk, bog wraiths, giant spiders | Bog Hag |
| 4 | 31-40 | Deepdelve | Ruined mines | cave goblins, stone golems, trolls | Troll Chieftain |
| 5 | 41-50 | Highpass | Mountain pass | orcs, wargs, hill giants | Orc Warlord |
| 6 | 51-60 | Frostmere | Frozen north | frost trolls, ice wraiths, snow beasts | Frost Giant |
| 7 | 61-70 | Sunscar | Desert ruins | scorpions, sand wraiths, sand golems | Sand Tyrant |
| 8 | 71-80 | Emberhold | Volcano | fire imps, drakes, fire golems | Magma Colossus |
| 9 | 81-90 | Blackspire | Dark fortress | black orcs, dread knights, necromancers | Dread Lord |
| 10 | 91-100 | Worldsend | Dragon abyss | demons, titans, dragons | The Ancient Wyrm |

- **Town:** workshop (craft, enchant), merchant (sell items for gold, buy backpack tabs), tavern (hire heroes), dungeon board.
- **Travel:** the army marker moves on the world map. Time = 2 s + 1 s per bracket crossed. Going back is always allowed. The next town opens when the player beats the boss of the current bracket.
- **Dungeons:** 5-8 per town. Dungeon *i* of *n* has level = bracket start + round((i − 1) × 9 ÷ (n − 1)). The last dungeon is the boss dungeon.
- **Dungeon content:** 1-3 monster families from the town list and 1 rare monster. An encounter holds 1-3 monsters.
- **Run:** one run is one fight. Wounds stay after it (see Recovery).
- **Recovery:** heroes regenerate health by the clock: 20% of max HP per minute, times the class rate (thief 1.75, priest 1.25, warrior and archer 1, mage 0.8). A hero at 0 health is down for (60 s + 5 s per level) divided by the class rate, then returns at 30% health. A down hero cannot start a run. A report notification shows the result and the loot. Speed-up is not built yet (a later spell may unlock it).
- **Locks and levels:** each dungeon shows a recommended level range. Only the first dungeon is open. Clearing a dungeon opens the next.
- **Drops per fight:** gold; at least 1 crafting material (guaranteed); each other drop rolls its own chance, so lucky fights give more. All are of the bracket tier.
- **Hero training:** the tavern sells XP for gold. The cost per XP grows with the hero level.
- **Sell value** = 10 × ilvl × quality factor (Common 1, Magic 2, Rare 4, Unique 10). Materials sell at a fixed price per tier.

## 10. Save

Saves are never dropped on an update. Each change of the saved data adds a migration (`systems/save/migrations.ts`). A save that cannot load is kept under `emberforge.save.unreadable`.

- The game saves after every **player move** (equip, craft, sell, buy, travel, start or stop a run) and after every battle.
- Format: one JSON object with a `version` number and migrations. Storage: browser local storage. The previous save is kept as a backup.
- Export and import of the save file is in the menu. This moves a save between devices.
- The battle seed and party are stored when a battle starts.

## 11. Art and audio

- 480×270 logical resolution. Integer scaling only. Units are 16×16 pixels (bosses 32×32). One shared palette. Pixel font bundled with the game.
- Audio: chiptune loops and WebAudio effects. Optional, after the MVP.

## 11b. Screens and flow

- **Town screen** is the main stage when no run is active. The town has a Lord's Keep (decoration), a Tavern, a Workshop, a Merchant and a Dungeons gate. They stand apart, joined by winding cobbled roads. Villagers and a guard walk on the roads. Heroes do not stand in town. Click a building to open its panel.
- **Bottom bar** is always visible: Heroes, Inventory, Dungeons, World, Settings, and the money (gold, silver and copper coins).
- **Lists:** every menu shows one item per row, with a pixel picture: hero portraits, item and material icons, dungeon icons.
- **First start:** the Tavern opens. The player hires the free first hero. Then the Dungeons panel opens. The player picks the hero (1 for normal dungeons, up to 2 for bosses) and starts a run.
- **Dungeon details:** click a dungeon row to open a popup with a big dungeon picture, a short story, the monsters (with their pictures) and each monster's loot table with chances. A busy dungeon row shows a progress bar and the seconds left.
- **Build label:** the build number (git commit count) and commit hash show in the Settings screen, in the corner of the page and in the browser tab title.
- **Notifications:** a Clear all button removes every report at once.
- **Hero bars:** hero lists show a live health bar and an experience bar.
- **Several heroes:** each hero can go to a different dungeon. A dungeon in use shows "Under fight" with a fight icon and the buttons Watch battle and Stop run. Locked dungeons show a lock and the dungeon to clear first.
- **During a run:** a themed battle scene for each dungeon. Health bars float above the heads. Each bar has a level badge and tick lines for chunks of HP (bigger ticks at every fifth). A pale chunk shows the damage that was just taken, and it drains away. Units bob, lunge, flash and collapse. Damage numbers float up and hit sparks fly.
- **After a run:** a notification appears. Click it to read the report: result, damage, XP, level-ups and loot. Buttons are large for touch.
- **Heroes:** the Stats tab shows the portrait, attributes, Power and the battle record. The Equipment tab shows a paper doll with slots around the portrait. Click a slot: Equip new item (side by side compare, green for better, red for worse), View item (big portrait and stats) or Unequip.
- **Sound:** all sound is made in the browser, so the game has no sound files. A music track plays for the town, for battles and for bosses. Combat sounds depend on who hits: a hero attack is the weapon plus the monster cry; a monster attack is its strike plus a hit on the armour of the hero (heavy metal clang, medium leather thud, light cloth thump). There are sounds for criticals, heals, defeats, victory, level-up and button clicks. The Settings screen has music volume, effects volume and mute. Music and sound recipes are in `data/audio/`.
- **Reset:** the Settings screen has a red Danger zone with RESET GAME. It needs a second click to confirm.
- **Style:** pixel art, wood and parchment menus, blackletter panel titles (Jacquard 12). English body text and row titles use Atkinson Hyperlegible for easy reading. Chinese keeps the pixel fonts (Pixelify Sans, Fusion Pixel).
- **Data:** all game data is JSON in `data/`. A README there explains each file.
- **Languages:** English and Simplified Chinese. The player picks the language in the Settings screen. The choice is saved apart from the game save. All text and content names are in `data/i18n/`. Item names are built from parts (material, base, affixes), so they change language too.

## 12. MVP scope

- Brackets 1-2 (Lv 1-20): 2 towns, 5 and 6 dungeons, 2 bosses.
- 5 base classes. Promotion works at Lv 20 with one branch for each class.
- All 6 professions with tiers 1-2. All 10 slots. The Unique pool has 2 items per bracket.
- Backpack with tabs, merchant, tavern, world map and travel, auto-save, save export and import.
- Balance simulator and content validator.
- **Done when:** a new game plays from Lv 1 to Lv 20 (fight, loot, craft, equip, travel, promote) and a reload keeps the exact state.

## 13. After the MVP

Brackets 3-10. Second promotion branches and master classes. Sockets for gems. Town orders (the merchant asks for crafted items for gold). Mobile layout and PWA. Tauri desktop builds. Audio.
