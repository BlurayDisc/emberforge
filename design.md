# Emberforge — Game Design

Working title. Pixel-art, turn-based, Middle-earth-style fantasy. You lead a company of heroes and run a workshop.

## 1. Core loop

Fight → Loot → Craft → Equip → Travel → Fight (harder).

Heroes fight alone (auto-battle). The player multitasks: craft, equip, sell and plan while the party fights.

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
| Party | Up to 4 heroes who fight together. |
| Bracket | A block of 10 levels (1–10, 11–20 … 91–100). |
| Tier | Material grade. Tier N belongs to bracket N. |
| Town | Hub of one bracket: workshop, merchant, tavern, dungeons. |
| Dungeon | A place with 1–3 monster types. The player runs it again and again. |
| Encounter | One fight: 1–3 monsters. |
| Material | A loot item used to craft. |
| Base | An item type, for example Sword. |
| Affix | A prefix or suffix that adds a stat to an item. |
| Quality | Common, Magic, Rare or Unique. |
| Player move | Any command from the player. The game saves after each one. |

## 4. Heroes and classes

- Level cap 100. Stats: HP, Strength, Magic, Skill (crit), Speed, Defence, Resistance.
- The company starts empty. The player hires the **first hero for free** at the town tavern (any of the 5 classes). More heroes cost gold: 1s, 3s, 9s, 27s … (×3 each).
- **Money:** 100 copper = 1 silver, 100 silver = 1 gold. The game stores copper only. The bottom bar always shows the amount.
- The party has a front row (2) and a back row (2). Melee enemies hit the front row 70% of the time.
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
  - Magic: 1–2 affixes (max 1 prefix, 1 suffix).
  - Rare: 3–4 affixes (max 2 prefix, 2 suffix).
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
  - Beast parts: Fang, Scale, Bone, Sinew.
  - Essence: used by Enchanting.
  - Catalyst: rare drop. It improves the quality odds.
- **Recipes are generated:** Recipe = Base × Tier. The tier sets the item name, for example *Copper Sword*, *Pine Bow*, *Linen Robe*. Counts scale with item size.

| Profession | Makes | Ingredients (same tier) |
|---|---|---|
| Blacksmithing | Sword, Axe, Mace, Dagger / Heavy armour, Shield | Ore + Fang / Ore + Scale |
| Fletching | Bow, Quiver | Wood + Sinew |
| Woodworking | Staff, Wand | Wood + Bone |
| Tailoring | Medium armour / Light armour, Tome, Belt, Satchel | Hide + Scale / Cloth + Sinew |
| Jewelcrafting | Ring, Amulet | Gem + Ore |
| Enchanting | Changes an existing item | Essence (same tier as the item) |

- **Craft:** pay the materials. The result is instant. ilvl is random inside the bracket. Base stats, Quality and Affixes are random.
- **Quality odds** (Common / Magic / Rare): 55 / 35 / 10. With 1 Catalyst: 25 / 45 / 30.
- **Enchanting actions:** Reroll the values of one affix. Add an affix (up to the quality limit). Reforge all affixes (needs a Catalyst).
- **Unique items** drop from rare monsters (4%) and bosses (25%). The player cannot craft them.
- Recipes unlock when the company first enters a town of that tier. Crafting works anywhere.

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
- **Monster stats come from a reference party curve.** The reference party is 4 heroes at level L with Magic-quality gear of ilvl L. Monster HP makes the reference party need the target duration. Monster damage makes it lose about 35% of its HP.
- **Rare monster:** 2% of encounters. About 2.5 × HP. Drops ×3, one Catalyst, 4% Unique.
- **Boss:** 1 boss and 0–2 adds. Drops ×5, two Catalysts, 25% Unique.
- **Encounter size:** 1–3 monsters, never more than the party size. A solo hero meets 1 monster.
- **End of a run** (stop, wipe, weak party or full backpack): the party returns to town and heals fully. The player keeps all loot. There is no other penalty.
- **Between fights:** heroes heal 20% of max HP. Knocked-out heroes wake with 20% HP.

### Level and gear balance

- XP to next level = 40 × L^1.5. Each monster gives XP = (XP to next ÷ (10 + 0.15 × L)) × gap factor. Every party member gets full XP.
- Gap factor = clamp(1 + 0.1 × (monster level − hero level), 0.05, 1.5). Rare monster ×5 XP. Boss ×20 XP.
- Expected length: about 20 hours to Lv 100 at 1× speed.

| Case | Win rate | Party HP lost | Duration |
|---|---|---|---|
| Level L, Magic gear (ilvl L) | ≥ 90% | 30–40% | curve ±15% |
| Level L, Common gear | 60–80% | — | — |
| Level L, Rare gear | ≥ 98% | — | ≤ 80% of curve |
| Level L + 26, gear ilvl L + 26, monsters Lv L | ≥ 99% | ≤ 10% | ≤ 40% of curve |
| Level L, monsters Lv L + 5 | ≤ 50% | — | — |
| Boss, level L, Rare gear | 70–90% | — | 10 × curve ±20% |

The balance simulator checks these targets. See CLAUDE.md.

## 9. World, travel and dungeons

Ten brackets. Each bracket has one town.

| # | Levels | Town | Region | Monster families | Boss |
|---|---|---|---|---|---|
| 1 | 1–10 | Hollowbrook | Farmland, Old Wood | goblins, rats, wolves | Goblin Chief |
| 2 | 11–20 | Barrowgate | Barrow Downs | skeletons, wights, clay golems | Barrow Lord |
| 3 | 21–30 | Mirewatch | Marshes | lizardfolk, bog wraiths, giant spiders | Bog Hag |
| 4 | 31–40 | Deepdelve | Ruined mines | cave goblins, stone golems, trolls | Troll Chieftain |
| 5 | 41–50 | Highpass | Mountain pass | orcs, wargs, hill giants | Orc Warlord |
| 6 | 51–60 | Frostmere | Frozen north | frost trolls, ice wraiths, snow beasts | Frost Giant |
| 7 | 61–70 | Sunscar | Desert ruins | scorpions, sand wraiths, sand golems | Sand Tyrant |
| 8 | 71–80 | Emberhold | Volcano | fire imps, drakes, fire golems | Magma Colossus |
| 9 | 81–90 | Blackspire | Dark fortress | black orcs, dread knights, necromancers | Dread Lord |
| 10 | 91–100 | Worldsend | Dragon abyss | demons, titans, dragons | The Ancient Wyrm |

- **Town:** workshop (craft, enchant), merchant (sell items for gold, buy backpack tabs), tavern (hire heroes), dungeon board.
- **Travel:** the army marker moves on the world map. Time = 2 s + 1 s per bracket crossed. Going back is always allowed. The next town opens when the player beats the boss of the current bracket.
- **Dungeons:** 5–8 per town. Dungeon *i* of *n* has level = bracket start + round((i − 1) × 9 ÷ (n − 1)). The last dungeon is the boss dungeon.
- **Dungeon content:** 1–3 monster families from the town list and 1 rare monster. An encounter holds 1–3 monsters.
- **Run:** encounters repeat until the player stops the run, the party average HP drops below 30%, or the backpack is full. Heroes heal 20% of max HP between encounters. A town visit heals fully.
- **Drops per kill:** gold; 1–2 main materials; a beast part (60%); an essence (15%). All are of the bracket tier.
- **Sell value** = 10 × ilvl × quality factor (Common 1, Magic 2, Rare 4, Unique 10). Materials sell at a fixed price per tier.

## 10. Save

- The game saves after every **player move** (equip, craft, sell, buy, travel, start or stop a run) and after every battle.
- Format: one JSON object with a `version` number and migrations. Storage: browser local storage. The previous save is kept as a backup.
- Export and import of the save file is in the menu. This moves a save between devices.
- The battle seed and party are stored when a battle starts.

## 11. Art and audio

- 480×270 logical resolution. Integer scaling only. Units are 16×16 pixels (bosses 32×32). One shared palette. Pixel font bundled with the game.
- Audio: chiptune loops and WebAudio effects. Optional, after the MVP.

## 12. MVP scope

- Brackets 1–2 (Lv 1–20): 2 towns, 5 and 6 dungeons, 2 bosses.
- 5 base classes. Promotion works at Lv 20 with one branch for each class.
- All 6 professions with tiers 1–2. All 10 slots. The Unique pool has 2 items per bracket.
- Backpack with tabs, merchant, tavern, world map and travel, auto-save, save export and import.
- Balance simulator and content validator.
- **Done when:** a new game plays from Lv 1 to Lv 20 (fight, loot, craft, equip, travel, promote) and a reload keeps the exact state.

## 13. After the MVP

Brackets 3–10. Second promotion branches and master classes. Sockets for gems. Town orders (the merchant asks for crafted items for gold). Mobile layout and PWA. Tauri desktop builds. Audio.
