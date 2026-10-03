# Emberforge - Game Design

Working title. Pixel-art, turn-based, Middle-earth-style fantasy. You lead a company of heroes and run a workshop.

## 1. Core loop

Fight → Loot → Craft → Equip → Travel → Fight (harder).

Heroes fight automatically. The player sends one hero into a dungeon. The player can send all heroes to different dungeons at the same time, and watches one battle at a time. The player crafts, equips and sells while the fights go on.

## 2. Technology decision

**three.js + TypeScript + Vite.** Static site. No server.

| Option | Verdict | Reason |
|---|---|---|
| libGDX (Java) | No | The web build (GWT/TeaVM) is slow and limits Java libraries. The game is menu-heavy (grids, tooltips) and libGDX UI is weak. |
| Godot | No | Strong engine, but its work is editor-centered. The web build is large. Text-only (AI-assisted) work is harder. |
| **three.js** | **Yes** | Web-first. Deploys as a static folder to GitHub Pages or Vercel. All code is text. The UI uses DOM and CSS, which suits an inventory grid. |

- **Stage** (world map, battle scene): three.js, orthographic camera, 480×270 logical pixels, scaled to fill the window.
- **UI** (backpack, crafting, roster): DOM and CSS with a pixel font.
- **Logic**: plain TypeScript with no browser or three.js code, so a Node balance simulator can run it.
- **Desktop** (Windows, macOS): wrap the web build with Tauri 2 (later). Tauri 2 can also target iOS and Android.
- **Mobile bonus**: touch-first UI and an installable PWA (later).

## 3. Glossary

| Word | Meaning |
|---|---|
| Company | All heroes the player owns (max 12). |
| Run party | The hero or heroes sent into one dungeon run. A dungeon hosts one run at a time. A hero is in one run at a time. Every dungeon takes exactly 1 hero (`maxPartySize` is 1, and the validator checks it). There is no permanent party. |
| Bracket | A block of 10 levels (1-10, 11-20 … 91-100). |
| Tier | Material grade. Tier N belongs to bracket N. |
| Town | Hub of one bracket: workshop, merchant, tavern, dungeons. |
| Dungeon | A place with 1-3 monster types. The player runs it again and again. |
| Encounter | One fight: 1-3 monsters. |
| Material | A loot item used to craft. |
| Base | An item type, for example Sword. |
| Affix | A prefix or suffix that adds a stat to an item. |
| Quality | Common, Magic, Rare or Unique. |
| Resource | The pool that pays for the spells of a class: Mana, Stamina, Hatred or Rage. |
| Spell | An active ability that a hero learns from a trainer and equips. An Ultimate is a strong spell with its own slot. |
| Player move | Any command from the player. The game saves after each one. |

## 4. Heroes and classes

- Level cap 100. Stats: HP, Strength, Magic, Skill (crit), Speed, Defence, Resistance. Players read them as Strength (Str), Intelligence (Int = Magic) and Agility (Agi = Skill).
- **Hero sheet:** Physical damage = Strength + weapon physical damage. Magical damage = Magic + weapon magical damage. A hero attacks with the damage of its class kind. Resource pool = base + a number for each level + a number for each point of one attribute (the attribute depends on the resource). Spells spend the class resource (see section 4b).
- The company starts empty. The player starts with 50 copper, to pay the first crafter fees. The player hires the **first hero for free** at the town tavern (any open class). More heroes cost gold: 3s (300 copper), 9s, 27s … (×3 each). Monsters drop no money. The player earns money only by selling materials and items at the merchant. The balance simulator shows that a solo hero who sells every material holds about 75 copper at level 3, 215 at level 6 and 420 at level 10, so the second hero is a goal for level 5 to 6.
- **Money:** 100 copper = 1 silver, 100 silver = 1 gold. The game stores copper only. The bottom bar always shows the amount.
- **Statistics:** each hero records monsters defeated, damage dealt, damage taken, healing done, fight time, and battles won and lost. The Heroes screen shows them, with damage per second and a **Power** number (the square root of damage output times durability). Power tells how strong the hero is.
- Each class has growth rates and a list of spells (see section 4b). The AI casts the equipped spells when they are ready.
- **Promotion** (Fire Emblem style): at Lv 20 the player picks one of two branches. At Lv 50 the hero takes the master class. The hero keeps the level.

| Class | Role | Lv 20 branches | Lv 50 master | Weapon | Off hand | Armour |
|---|---|---|---|---|---|---|
| Warrior | Front melee | Knight / Berserker | Marshal / Warlord | Sword, Axe, Mace | Shield | Heavy |
| Archer | Ranged physical | Ranger / Hunter | Pathfinder / Deadeye | Bow | Quiver | Medium |
| Mage | Ranged magic | Sorcerer / Warlock | Archmage / Voidcaller | Staff, Wand | Tome | Light |
| Priest | Healer, support | Cleric / Druid | Saint / Wildwarden | Mace, Wand | Tome | Light |
| Thief | Fast melee, crit | Assassin / Trickster | Nightblade / Shadowmaster | Dagger | Dagger | Medium |
| Barbarian | Two-handed brute | Marauder / Totem Warrior | Ravager / Spirit Chieftain | Greataxe, Maul | None (two-handed) | Heavy and Medium |
| Fighter | Bare-handed brawler | Brawler / Disciple | Champion / Grandmaster | Knuckles | Knuckles (Cestus) | Medium |

- **Look:** a hero looks the same in the portrait, the full-body figure and the battle sprite (`pickHeroAppearance`). Skin is one of 4 fair tones (`data/hero-appearance.json`). The warrior is always male. The archer and the mage are always female, and the mage always has red hair (`gender` and `hair` in `classLooks`). Their names come from the matching name list (`heroNamesForClass`). For the other classes the hero name sets the gender (`femaleNames` in the same file; every other name is male). Each class has its own face and pose: the warrior is a bulky knight with a smirk and a shield, the mage is a cold girl with eyeliner, purple eyeshadow and red lipstick who casts a spell, the archer is a swift girl who draws her bow. Girls have long hair beside the face, lashes, blush and fuller lips. Boys have a firm jaw line and light stubble.
- **Armour weights:** a class can wear one or more armour weights (`armourWeights` in `classes.json`). The Barbarian wears Heavy and Medium, so it shares the Armoursmithing pieces of the Warrior (Helm, Gloves, Boots, Armour, including set pieces) and keeps its Medium pieces. The workshop class tags and the equip check use the list. The first weight of a class is its main weight and sets the sound of a hit on the hero.
- **Hiring lock:** Warrior, Archer and Mage are open from the start. The other classes unlock when the player clears a dungeon for the first time. The rule is data (`unlockAfterDungeonId` in `classes.json`). The tavern shows a locked class with the dungeon to clear, and the hire command rejects it.

| Class | Unlocks after clearing |
|---|---|
| Thief | Goblin Chief's Lair (clears the first town) |
| Priest | Goblin Camp |
| Fighter | Old Wood Hollow |
| Barbarian | Goblin Chief's Lair (for now; it moves to a dungeon of the second town when that town exists) |

- **Advancement classes** are in `data/advancements.json`: 2 branches for each base class (level 20) and 1 master class for each branch (level 50), so 4 for each base class. The game data and the texts exist. The promotion command and screen are not built yet.

## 4b. Spells

- **Active only.** Passive talents come later. Every spell is cast by the AI in battle. The player chooses which spells a hero equips.
- **Slots:** each hero equips 3 spells and 1 Ultimate. A hero can learn 20 spells from level 2 to 95: 16 normal spells (one every 3 levels, from level 2 to 47) and 4 Ultimates for each class (`data/spells.json`). Spells belong to a class. Each has a level, so the hero learns it when it reaches that level.
- **Trainers** live in the Academy, a town building in Lord's Square. Each class has its own trainer. The player picks a hero, then pays the trainer to teach a spell. The hero needs the spell's level. The price = 10 copper × level^1.8, and an Ultimate costs double (`data/balance/spells.json`). This is a gold sink next to hero hiring: the spells of one hero up to level 10 cost about 638 copper (the first spell, at level 2, costs 35) (a solo hero holds about 420 copper when it reaches level 10, and the second hero costs 300), and a full tree of 20 spells costs about 200,000 copper (the eighth hero costs 218,700). The Academy shows only the spells a hero can learn now (its level is high enough), plus a note for the level of the next one. A new spell takes the first free slot of its kind, so the hero uses it at once. The Heroes screen has a Spells tab to change the slots.
- **No changes in a run.** Learning and equipping are rejected while the hero is in a run, because the run replays its fight from the hero's state (same rule as gear).
- **Effects:**
  - Damage: one enemy (one hit or several hits) or all enemies. Power is a fraction of the hero's attack for each hit. The spell has a damage kind, physical (Defence) or magic (Resistance).
  - Drain: damage to one enemy, and the caster heals a fraction of it.
  - Heal: the weakest ally, the caster, or all allies. Power is a fraction of the hero's attack.
  - Status for a few seconds, one of each kind at a time (a new one replaces the old one): Guard (less damage taken), Haste (more Speed) and Weaken (less damage dealt). They target the caster, all allies, one enemy or all enemies.
- **AI:** when a hero acts, it tries the Ultimate first, then slot 1 to 3. It casts the first spell that is off cooldown, paid for with the class resource, and useful: no heal when nobody is below 60% HP, no status that is already active. If none is ready, it attacks. A cast takes the whole action.
- **Resource:** each class has one resource that pays for its spells (`resourceId` in `data/classes.json`, numbers in `data/balance/resources.json`). A fight starts with the start share of the pool. Each resource has its own rules:
  - **Mana** (Mage, Priest): pool grows with Magic. Starts full. Comes back at 2% of the maximum each second.
  - **Stamina** (Warrior, Archer): pool grows with Strength. Starts full. Comes back at 3% of the maximum each second.
  - **Hatred** (Thief, a dark energy like the Diablo Demon Hunter): pool grows with Skill. Starts at half. Comes back at 2% each second and grows 4% with each hit the Thief deals.
  - **Rage** (Barbarian, Fighter): pool grows with Strength. Starts empty. Does not come back by itself. It grows 8% with each hit dealt and 8% with each hit taken.
  - Each spell has a resource cost and a cooldown in seconds. An Ultimate starts on a 15 second cooldown, so it comes in the middle of the fight.
- **Log:** a spell cast shows the spell name in the combat log. A spell with several targets gives one event for each target.
- **Balance:** the balance simulator has two spell loadouts (the first spells learned, and the highest level spells). At levels 1-10 spells make fights 10-25% shorter and make a Priest lose much less HP. They do not change win rates.

## 5. Items

An item is: **Base + Item level (ilvl) + Quality + Affixes**. A hero needs level ≥ ilvl to equip it.

- **Slots (10):** Main hand, Off hand, Helm, Armour, Gloves, Boots, Belt, Amulet, Ring ×2.
- **Base stats** roll inside a range (±15%) and grow with ilvl. Weapons give Physical damage and Magical damage (and sometimes Attack speed). Attack speed is a flat number: it does not grow with ilvl and does not roll a range. Light weapons give +1. Two-handed weapons (Greataxe, Maul) give -1. Armour gives Defence (Armour) and Resistance.
- **Item stat table:** every item shows one fixed table first. Weapons: Physical damage, Magical damage, Attack speed. Armour, shields, belts and jewellery: Health, Armour, Magic resist. Below the table come the other stats (Strength, Agility, Intelligence) and the affixes, prefixes in blue and suffixes in gold.
- **Quality:**
  - Common: 0 affixes.
  - Magic: 1-2 affixes (max 1 prefix, 1 suffix).
    - Name order: each language has its own order in `format.itemName`. English: prefix, item, suffix ("Arcane Copper Sword of the Bear"). Chinese: suffix, prefix, item ("熊之奥术的铜剑"). The stat table lists an affix by its short name (`affix.<id>.short`), for example "Bear: +9 Health".
  - Rare: 3-4 affixes (max 2 prefix, 2 suffix).
  - Unique: fixed name and fixed affix set, with rolled values. Drops only.
- **Affixes** have a stat, a value range per affix tier, and a minimum ilvl. Examples: *Sharp* (+Attack), *Sturdy* (+Defence), *of the Bear* (+HP), *of Insight* (+Magic), *of Precision* (+Skill).
- **Backpack size (width × height):**

| Size | Items |
|---|---|
| 1×1 | Ring, Amulet, Material (stacks to 99) |
| 2×1 | Belt |
| 1×2 | Dagger, Wand, Quiver, Knuckles, Cestus |
| 1×3 | Sword, Axe, Mace |
| 1×4 | Staff |
| 2×2 | Helm, Gloves, Boots, Tome |
| 2×3 | Armour, Shield, Bow, Greataxe, Maul |

## 6. Materials and crafting

**Bracket rule: a recipe uses materials of one tier only.** Tier N materials drop only from bracket N monsters. They craft items with ilvl inside bracket N. The content validator rejects any recipe that mixes tiers.

- **Materials (all from monster drops):**
  - Main materials: Ore, Wood, Hide, Cloth, Gem.
  - Set materials: one for each dungeon after the first dungeons of a bracket (Fang, Toadskin, Bone, Silk, Sinew in tier 1). Armour made with a set material always gets a fixed bonus (see Set recipes).
  - Essence: used by Enchanting.
  - Catalyst: rare drop. It has no use yet. It is kept for Enchanting.
- **Recipes are generated:** Recipe = Base × Tier. The tier sets the item name, for example *Copper Sword*, *Pine Bow*, *Linen Robe*. Counts scale with item size.

| Profession | Makes | Ingredients (same tier) |
|---|---|---|
| Weaponsmithing | Sword, Axe, Dagger, Parrying Dagger, Mace, Greataxe, Maul, Knuckles, Cestus | Ore |
| Armoursmithing | Heavy armour, Shield | Ore |
| Fletching | Bow, Quiver | Wood |
| Woodworking | Staff, Wand | Wood |
| Tailoring | Medium armour, Belt / Light armour, Tome (Satchel later) | Hide / Cloth |
| Jewelcrafting | Ring, Amulet | Gem |
| Enchanting | Changes an existing item | Essence (same tier as the item) |

- **Craft:** pay the materials. The result is instant. Ingredient count = half the item cells (rounded up) of the main material, and nothing else. A set recipe adds 1 set material (2 for items of 6 cells or more).
- **Item level:** random from the bracket start up to your best hero's level (capped by the bracket end). The game rolls twice and keeps the higher result. So a crafted item is always usable by your best hero. Base stats, Quality and Affixes are random.
- **Quality odds** (Common / Magic / Rare): 55 / 35 / 10. A craft never uses a Catalyst.
- **Upgrade level (+1 to +7):** a crafted item can come out with an upgrade level. The name ends with the level (for example "Iron Sword +3"). The "+N" part has its own colour for each level: green +1, cyan +2, blue +3, purple +4, pink +5, orange +6, red +7 (+5 and higher glow). The rest of the name keeps the colour of the item quality. The colours are in `ui/styles/theme.css`. A window title or a tooltip shows the "+N" as plain text. Each level counts as one more item level for base stats and sell value. It does not change the item level that limits who can equip the item. Most crafts have no upgrade. The game rolls step by step and stops at the first failed step, so +N needs N successes in a row. The chance to reach at least +N runs in a straight line from a value at the recipe level to a value for a crafter 9 or more levels above the recipe (the most a level 10 crafter can be above a level 1 recipe). For +1 that is 5% at the recipe level, 23% at 9 levels above (+2% for each level), and for +4 it is 0.005% and 5%. A crafter above 9 levels gains nothing more. The values for +1 to +7 are in `data/balance/crafting.json` and must fall with each level (the validator checks it). The recipe screen shows the chance of +1 or better. Unique and looted items have level 0.
- **Crafter fee:** every craft costs materials (from monster drops) and a gold fee paid to the crafter: 3 copper + 0.5 copper for each level the recipe needs. A crafter cannot start a craft when the player cannot pay. The two level 1 dungeons drop Copper Ore, Rawhide, Pine Wood and Linen, so every basic recipe works from the start. Quartz first drops in the Goblin Camp. The merchant sells every material, so a hero can craft before it reaches those dungeons.
- **Enchanting actions:** Reroll the values of one affix. Add an affix (up to the quality limit). Reforge all affixes (needs a Catalyst).
- **Unique items** drop from rare monsters (4%) and bosses (25%). The player cannot craft them.
- **Starter gear:** every class can craft a weapon and an armour piece at crafter level 1 (the validator checks this). Harder bases need a higher offset inside the bracket. **Armour sets unlock one piece every 2 crafter levels, and the body armour comes last** (the validator checks this). Armoursmithing: Heavy Helm 1, Heavy Gloves 3, Heavy Boots 5, Shield 7, Heavy Armour 9. Tailoring: Helm 1, Gloves 3, Boots 5, Belt 7, Tome 7, Armour 9 (medium and light share the same levels). **Every recipe opens on an odd crafter level: 1, 3, 5, 7 or 9** (the validator checks this). A crafter at level 10 can make every base of the tier. A hero still needs level ≥ ilvl to equip what the crafter makes.
- **Recipe rule:** a recipe must not need a material that first drops in a dungeon above the recipe's craft level (the validator checks this). So the level 1 starter recipes of every class use only materials from the two level 1 dungeons: Copper Ore, Rawhide, Linen and Pine Wood. Quartz first drops at level 7, so the Ring is at offset 7 and the Amulet at offset 9.
- **Set recipes:** each set material makes a set of armour: Helm, Gloves, Boots and Armour of every weight. A set recipe needs the main material of the base plus the set material (it replaces nothing in the basic recipe, it is a separate recipe). The item is named after the set material (for example *Fang Heavy Helm*). **Every piece made from a set material gets the same fixed flat bonus**, and the usual random Affixes still roll on top. The bonus comes from the material, so it is not stored in the item. **A set recipe needs a crafter level 1 above the basic recipe of the same base** (`setRecipeLevelStep` in `data/balance/items.json`). The set material can raise it further: the recipe never opens before the crafter level `setCraftLevelOffset` of the material (the level of its dungeon). The body armour is the last piece of a set, so it uses `setBodyArmourCraftLevelOffset` instead, and it may go above crafter level 10 (the second town is not built yet, so 10 is only a soft cap). The validator checks that a set material drops in exactly one dungeon and that each dungeon after the first dungeons of a bracket drops exactly one set material.

  | Set material | Dungeon | Bonus on each piece | Helm | Gloves | Boots | Armour |
  |---|---|---|---|---|---|---|
  | Sharp Fang | Wolf Trail | +2 Agility (skill) | 3 | 4 | 6 | 10 |
  | Toadskin | Sunken Mill | +8 Health | 5 | 5 | 6 | 11 |
  | Bone Shard | Goblin Camp | +2 Armour (defence) | 7 | 7 | 7 | 12 |
  | Spider Silk | Old Wood Hollow | +2 Attack speed | 9 | 9 | 9 | 13 |
  | Coarse Sinew | Goblin Chief's Lair | +2 Strength | 10 | 10 | 10 | 14 |

  The table lists the crafter level that each set recipe needs.

- **Weapon steps:** every class gets a stronger weapon every 2 crafter levels inside a bracket, and its last weapon is at offset 7 or higher. **Each new weapon of a class has more damage than every weapon before it** (physical damage for a physical class, magical damage for a magic class). The validator checks both rules. A stronger weapon is a new base with the same gear type and size as the weapon it follows, so the same classes can use it. The step is small (about +1 base damage), so the boss rule below still holds.

  | Class | Main hand weapons (offset: base damage) |
  |---|---|
  | Warrior | Sword (1: 5), Axe (3: 6), Longsword (5: 7), Battle Axe (7: 8), Broadsword (9: 9) |
  | Archer | Bow (1: 6), Longbow (3: 7), Composite Bow (5: 8), Warbow (7: 9) |
  | Mage | Wand (1: 5), Runed Wand (3: 6), Scepter (5: 7), Staff (7: 8), Arcane Staff (9: 9) |
  | Priest | Wand (1: 5), Runed Wand (3: 6), Mace (3: 6), Scepter (5: 7), Flanged Mace (7: 8) |
  | Thief | Dagger (1: 4), Stiletto (3: 5), Dirk (5: 6), Kris (7: 7) |
  | Barbarian | Maul (1: 10), Sledgehammer (3: 11), Bearded Axe (5: 12), Greataxe (7: 13) |
  | Fighter | Knuckles (1: 4), Brass Knuckles (3: 5), Spiked Knuckles (5: 6), Steel Claws (7: 7) |

  The Mace and the Flanged Mace are priest weapons. They give magical damage (6 and 8) and resistance. The warrior shares no weapon type with another class. Off-hand items open at Quiver 5, Cestus 5, Parrying Dagger 7, Shield 7 and Tome 7.

- **Boss rule:** a weapon alone must not beat a boss. The balance simulator has a "best weapon only" case. A hero with only its best weapon must lose to the boss (win rate under 30%), and the boss still needs a hero with all 10 slots filled.
- **Crafter levels:** each profession is a crafter with level 1-100 and XP. Every craft gives XP (more for higher recipes, less for recipes far below the crafter level). XP to the next crafter level = 10 × L^1.3. A craft gives 14 + 3 × (recipe level) XP, minus 8% for each level the crafter is above the recipe (down to 10%). A crafter who always makes the best recipe it has reaches level 3 after about 3 crafts, level 5 after about 8, and level 9 after about 23 (`data/balance/crafting.json`; the first design was about twice as slow). A recipe needs level (tier - 1) x 10 + the base item's offset. Locked recipes show the needed level. A recipe row shows its recipe level in the title (for example "Copper Gloves (Lv 3)"). This is the crafter level that opens the recipe, so a later recipe always shows a higher number. A second line shows the item level range of a craft (for example "Item level 1-3"), which every recipe of a tier shares.
- The Workshop is in town. It lists the crafters, each with a portrait, level and job. Click a crafter to see only the recipes that crafter can make now (recipes above the crafter level stay hidden, with a note for the next level). Click a recipe to see a big portrait and the stat ranges.
- **Timed jobs:** selling and crafting take time (real clock, also while the page is closed). A sale takes 5 s + 0.6 s per copper of value, up to 10 minutes. The merchant runs 3 sales at once, and the Bank sells up to 4 more sale slots. A crafter makes one item at a time, 5 s + 1.5 s per required level. Jobs show a progress bar. A finished craft waits at the crafter when the backpack is full (see section 7). After the player starts a craft, the workshop goes back one menu, to the crafter list.
- **Merchant:** a sale in progress can be cancelled. The goods return to the backpack (if it has room). It only buys items and materials from the player. It never sells loot materials, so materials come from monster drops only. Item value = (ingredient value + crafter fee) × quality factor (1, 2, 4, 10) × (1 + 0.1 × (ilvl − 1)). A smith who uses dropped materials earns a small profit on each craft (on average the sale is about 1.6 times the cost). The smoke tool checks this. The backpack grid looks the same in the Inventory and at the merchant. A tap on an entry opens a popup next to the tap with View and Sell. The popup shows the sale value and the sale time. Sales in progress stay in a list with progress bars.
- **Mill:** the Mill makes 1 basic material every 10 minutes (600 s), by the real clock, also while the page is closed. The material is random from the list in `data/balance/mill.json` (`producedMaterialIds`: Copper Ore, Pine Wood, Rawhide, Linen). The validator accepts only tier 1 materials without a set bonus there. The Mill holds up to 6 materials (`storageCapacity`). A full Mill stops its clock, so time spent full is not saved up. The player collects the materials in the Mill panel. What does not fit in the backpack stays at the Mill. After a collect, the clock starts again. Each product has its own random stream by its number (`fork('mill-N')`), so the same seed gives the same products. This is the only source of materials besides monster drops.
- Enchanting is not built yet.

## 7. Backpack

- Grid 6 columns by 5 rows (30 cells), in the style of Diablo 2. This is about a third of the first design (80 cells), so space is a real limit.
- **Nothing stacks.** Every item and every material unit takes its own place. Bulky materials (Pine Wood, Rawhide, Linen) fill 2 cells (1 by 2). Other materials fill 1 cell. The size of a material is `width` and `height` in `data/materials.json`.
- **Bank upgrades:** the Bank sells more backpack space: one row of 6 cells for each purchase, up to 14 purchases (114 cells). The price rises exponentially: 100 copper × 1.5 for each purchase already made (100, 150, 225, 338 … 19462). The Bank also sells more sale slots at the merchant (200, 600, 1800, 5400 copper). The prices are in `data/balance/backpack.json` and `economy.json`. The bought counts are saved in `backpackExpansions` and `merchantExtraSlots`.
- **Bank features:** the Bank also sells three features, once each (prices in `bankUnlockCostsCopper` in `economy.json`: 150, 300 and 500 copper). Until the player buys one, the game hides it and says so: **Backpack sorting** (a Sort button in the backpack: items first by slot, quality and level, then materials by id, packed from the top left; if it cannot fit, nothing changes), **Drop rates** (the loot table and chances in the dungeon window) and **Monster statistics** (health, attack, armour, magic resist and speed of each monster at the dungeon level, in the dungeon window). The bought ids are saved in `bankUnlockIds`.
- **Moving items:** in the Inventory, a tap on an entry selects it. The action bar above the grid has a fixed place and shows the entry name and its buttons: View, Equip (items only) and Sell. Then a tap on an empty spot moves the entry there, and its top-left corner goes on that spot. A spot where the entry does not fit is refused. A tap on the selected entry clears the selection. A long press or a drag was not chosen: it clashes with scrolling on a phone and nothing shows it exists. Equip opens a list of heroes. A hero that cannot use the item shows the reason and stays disabled. A pick opens the compare screen. The compare screen shows the large picture of both items (the same picture as in View), above each item card. At the merchant a tap opens a popup next to the tap with View and Sell, and there is no move.
- A save from before this rule is migrated: old stacks split into single units, and the backpack grows by whole upgrades until everything fits. A save from before the 6 column grid has its entries packed again in the new grid (big pieces first).
- A tooltip compares the item with the equipped item. On touch screens, a tap shows the tooltip.
- **Full backpack, craft:** a finished craft that finds no room stays at the crafter and is marked as waiting. The clock does not try again. The crafter cannot start a new craft until the player makes room and presses Collect in the workshop. The crafter experience is paid at that moment.
- **Full backpack, drops:** drops that find no room wait at the dungeon (`pendingLoot`, saved). The run report lists them. That dungeon cannot start a new run until the player makes room and presses Collect loot in the Dungeons list. A collect takes what fits. The rest keeps waiting. No drop is ever lost.

## 8. Battle

- **Auto-battle by speed.** Each unit has a charge meter that fills at its Speed. The unit acts at 100. One action at Speed 100 takes 1 second.
- **Action:** a spell (see section 4b), or a basic attack. The Priest heals an ally below 50% HP first with its basic action, never itself, so a lone Priest fights like any other hero.
- **Damage** = Attack × (1 − reduction). Reduction = Defence ÷ (Defence + 50 + 10 × attacker level). A crit does ×1.5. There are no misses.
- **Deterministic:** a battle is simulated first from a seed, then played back at 1×, 2× or 4× speed. After a reload, the same battle replays from its start.
- **Duration targets at 1× speed:**
  - Normal encounter: 7 s at Lv 1, rising in a straight line to 60 s at Lv 100.
  - Boss: 10 × the normal duration of its level (about 2 min at Lv 10, about 10 min at Lv 100).
- **Monster stats come from a reference curve.** The reference hero is a single hero at level L with Magic-quality gear of ilvl L. Monster HP makes the reference party need the target duration. Monster damage makes it lose about 35% of its HP.
- **Rare monster:** 2% of encounters. About 2.5 × HP. Drops ×3, one Catalyst, 4% Unique.
- **Boss:** 1 boss. A boss fight has adds only when the party is bigger than 1, so with one hero per run the boss fights alone. Drops ×5, two Catalysts, 25% Unique.
- **Encounter size:** 1-3 monsters, never more than the party size. A solo hero meets 1 monster.
- **End of a run** (stop, wipe or weak party): the party returns to town and heals fully. The player keeps all loot. There is no other penalty.
- **Between fights:** heroes heal 30% of max HP. Knocked-out heroes wake with 30% HP.

### Level and gear balance

- XP to next level = 40 × L^1.5. Each monster gives XP = (XP to next ÷ (10 + 0.15 × L)) × gap factor × early bonus. Every party member gets full XP.
- **Early bonus:** a new hero levels fast. The bonus factor = 1 + 2.5 × (1 - (hero level - 1) ÷ 10), never below 1. So XP is 3.5× at level 1, 3.25× at level 2, and the bonus is gone at level 11 (`earlyExperienceBonus` and `earlyExperienceFadeLevels` in `data/balance/progression.json`). A solo hero reaches level 3 in about 12 fights and level 10 in about 59 fights.
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
| Boss, level L, one hero, all 10 slots filled with crafted gear (mixed quality) | 85-100% | - | 10 × curve ±20% |
| Boss, level L, one hero, no gear | 0% | - | - |

The balance simulator checks these targets. See CLAUDE.md.

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

- **Town:** workshop (craft, enchant), merchant (sell items and materials for gold), tavern (hire heroes), academy (learn spells), dungeon board.
- **Travel:** the army marker moves on the world map. Time = 2 s + 1 s per bracket crossed. Going back is always allowed. The next town opens when the player beats the boss of the current bracket.
- **Dungeons:** 5-8 per town. Dungeon levels rise in steps of at most 2 (a step of 1 only at the end of a bracket), so a hero never grinds more than about 2 levels in one dungeon. The last dungeon is the boss dungeon, at the last level of the bracket. Hollowbrook has 7 dungeons at levels 1, 1, 3, 5, 7, 9 and 10. It has two level 1 dungeons (Rat Cellar and Scarecrow Field). The Rat Cellar is open at the start. The Scarecrow Field and the Wolf Trail both open after the first win in the Rat Cellar. The Sunken Mill opens after the Wolf Trail. The Scarecrow Field drops the wood, cloth and sinew that the first Archer, Mage and Priest recipes need.
- **Dungeon content:** 1-3 monster families from the town list and 1 rare monster. An encounter holds 1-3 monsters. **Every dungeon has its own monsters.** A monster id and a sprite key appear in one dungeon only (the validator checks it). Hollowbrook: Rat Cellar (Cave Rat, Rat King), Scarecrow Field (Straw Scarecrow, Harvest King), Wolf Trail (Wolf, Alpha Wolf), Sunken Mill (Mill Toad, Warty Elder), Goblin Camp (Goblin, Goblin Captain), Old Wood Hollow (Bark Spider, Hollow Broodmother), Goblin Chief's Lair (Goblin Chief, Hobgoblin adds).
- **Run:** one run is one fight. Wounds stay after it (see Recovery).
- **Recovery:** heroes regenerate health by the clock. A level 1 hero heals from empty to full in 1 minute. The time grows in a straight line to 5 minutes at level 100 (a high level hero has more health). The class rate speeds it up or slows it down (thief 1.75, priest 1.25, warrior and archer 1, mage 0.8). A hero at 0 health is down for (60 s + 5 s per level) divided by the class rate, then returns at 30% health. A down hero cannot start a run. A report notification shows the result and the loot. Speed-up is not built yet (a later spell may unlock it).
- **Locks and levels:** only the first dungeon is open. Clearing a dungeon opens the next. Each dungeon also has a **minimum hero level** (`minimumHeroLevel` in `dungeons.json`, the same as the monster level). A hero below it cannot enter: the start command rejects, and the Start button stays off. Every hero of a boss party needs the level. The dungeon also shows a best range (up to `recommendedMaxLevel`). The balance simulator shows why: gear matters more than level, and a level 1 hero with a full set of crafted gear wins at Wolf Trail 98% of the time.
- **Drop tables:** every dungeon has its own materials. A normal monster drops 3 crafting materials in the first dungeons of a bracket, and 2 in later dungeons. Two dungeons share at most 1 crafting material between their normal monsters (the validator checks it). Rare monsters and bosses drop more of their dungeon materials, plus Faint Essence and Catalysts. Hollowbrook: Rat Cellar (Rawhide, Copper Ore), Scarecrow Field (Linen, Pine Wood), Wolf Trail (Sharp Fang), Sunken Mill (Toadskin), Goblin Camp (Bone Shard, Quartz), Old Wood Hollow (Spider Silk), Goblin Chief's Lair (Coarse Sinew, Quartz, Faint Essence). **Base materials (Copper Ore, Pine Wood, Rawhide, Linen) drop only in the first dungeons of a bracket** (the validator checks this). **Every later dungeon drops exactly one set material** (Quartz and Faint Essence are not set materials). A material the dungeons do not drop can be bought at the merchant.
- **Drops per fight:** no gold (the aim of the game is to craft); at least 1 crafting material (guaranteed); each other drop rolls its own chance, so lucky fights give more. The guaranteed drop does not roll a second time, so no drop gives more than its maximum quantity (a Cave Rat never drops more than 2 Copper Ore). All are of the bracket tier.
- **Sell value** = 10 × ilvl × quality factor (Common 1, Magic 2, Rare 4, Unique 10). Materials sell at a fixed price per tier.

## 10. Save

Saves are never dropped on an update. Each change of the saved data adds a migration (`systems/save/migrations.ts`). A save that cannot load is kept under `emberforge.save.unreadable`.

- The game saves after every **player move** (equip, craft, sell, buy, travel, start or stop a run) and after every battle.
- Format: one JSON object with a `version` number and migrations. Storage: browser local storage. The previous save is kept as a backup.
- Export and import of the save file is in the menu. This moves a save between devices.
- The battle seed and party are stored when a battle starts.

## 11. Art and audio

- 480×270 logical resolution. The stage scales to fill the window (nearest-neighbour, so the scale can be a fraction). Units are 16×16 pixels (bosses 32×32). One shared palette. Pixel font bundled with the game.
- Audio: chiptune loops and WebAudio effects. Optional, after the MVP.

## 11b. Screens and flow

- **Town screen** is the main stage when no run is active. The town is three stage screens wide (480 pixels each). The player moves between them with the arrow buttons on the sides (or the left and right keys). The view slides. The screen name shows in the top left corner. The new game starts on the middle screen. The arrow that points to the Tavern pulses until the first hero is hired.
  - **Market Quarter (west):** Tavern, Merchant, a market square with a well and three stalls, a mill, cottages and town houses.
  - **Lord's Square (middle):** Lord's Keep (decoration), Workshop, the Bank (sells storage upgrades), the Academy (spell trainers), a chapel, a keep square with a well, cottages and town houses.
  - **East Gate (east):** Barracks, Stables, a watchtower, the Dungeons gate, cottages and town houses.
  - The Tavern, Workshop, Bank (sells backpack space and merchant sale slots), Mill, Merchant, Barracks (opens the Heroes screen), Stables (opens the World map) and Dungeons gate open a panel. The Mill opens a panel (see Mill). The Chapel has a name sign only. Houses, stalls and the tower have no function. All buildings are in `data/buildings.json` (`label` is null for a building without a sign).
  - A main street and a south street cross all three screens. Short lanes join each door to a street. Villagers and guards walk on the roads, together with animals (cats, dogs and hens, set for each road in `townLayout.ts`). A cat is slow and sits often, a dog trots, a hen pecks. Animals never talk. Now and then a villager on the visible screen stops and says a full sentence in a speech bubble about the player, the heroes or the town. Heroes do not stand in town.
- **Lore:** an opening story shows before the first hero is hired (and after a reset). Every town, monster and material has a short lore text (`town.<id>.lore`, `monster.<id>.lore`, `material.<id>.lore` in `data/i18n/`). The text shows in the world map town popup, the dungeon popup and the material popup. The validator requires lore for all new content.
- **Castle:** the Castle in the middle town screen (Castle Square) opens when the player clicks it. Inside there are two screens that slide like the town: the **Throne Hall** (screen 4) and the **Ramparts** (screen 5). The arrows (or left and right keys) move between them. The Leave button (or Escape) goes back to the town. The castle is a place to visit, not a game rule, so nothing in it is saved.
  - People and places are in `data/castle.json`. Each has a screen, a position, a size and a number of tales. A click opens a story popup with a portrait and the tales (`castle.<id>.name`, `.title`, `.tale.<n>` in `data/i18n/`). A gold mark floats over a spot the player has not heard yet in this session.
  - The Throne Hall has King Aldric, Queen Isolde, a knight commander, a young knight, a bishop, a steward, a jester and a chronicler, plus the princess's little throne, her portrait, the Forge window and the founding tapestry. The Ramparts have a captain, an archer, a falconer and a lamplighter, plus the north tower, the Old Wood and the far spire. Four pets rest in the castle, a dog and a cat in each of the two screens (decoration only, not clickable). The Ramparts show a blue sky, mountains, farmland in perspective, the curtain wall and the gatehouse.
  - **Story:** nine nights ago, at midsummer, Princess Elowen was taken from the north tower by a winged creature that left cold black feathers. The creature flew east. The clues point to Blackspire (the unseen king) and to the Ember Forge: Elowen may carry the blood of the first Smith-Queen. The villagers in town talk about it too.
- **World map:** the World screen draws a pixel map of the land. Every town has a place on it (`mapX`, `mapY`, `biome` in `data/towns.json`). Land, biomes and roads are drawn from the town list. Tap a town for details. Travel is not built yet.
- **Bottom bar** is always visible: Heroes, Inventory, Dungeons, World, Settings, and the money (gold, silver and copper coins).
- **Lists:** every menu shows one item per row, with a pixel picture: hero portraits, item and material icons, dungeon icons.
- **First start:** the Tavern opens. The player hires the free first hero. Then the Dungeons panel opens. The player picks a dungeon and presses Fight!. A window then lists the heroes, and one tap on a hero starts the run. A hero in another run, or below the dungeon level, shows the reason and cannot be picked.
- **Dungeon details:** click a dungeon row to open a popup with a big dungeon picture, a short story, the monsters (with their pictures) and each monster's loot table with chances (after the Drop rates upgrade) and its statistics (after the Monster statistics upgrade). A busy dungeon row shows a progress bar and the seconds left. The start button says Fight!.
- **Build label:** the build number (git commit count) and commit hash show in the Settings screen, in the corner of the page and in the browser tab title.
- **Hero bars:** hero lists show a live health bar and an experience bar.
- **Several heroes:** each hero can go to a different dungeon. A dungeon in use shows "Under fight" with a fight icon and the buttons Watch battle and Run away. Running away gives no loot, XP or report. The hero keeps the wounds taken until that moment (the same seeded fight is replayed up to it) and heals from there. Locked dungeons show a lock and the dungeon to clear first.
- **During a run:** a themed battle scene for each dungeon. Health bars float above the heads. A hero bar has a thin resource strip below it (blue Mana, gold Stamina, violet Hatred, orange Rage). A spell line in the combat log ends with the cost, for example (-6 Stamina). Each bar has a level badge and tick lines for chunks of HP (bigger ticks at every fifth). A pale chunk shows the damage that was just taken, and it drains away. Units bob, flash and collapse. Melee units lunge. The Archer shoots an arrow and the Mage shoots a magic bolt: the shot flies to the target, and the hit sparks and damage number show when it lands (`render/rangedAttackStyles.ts`). Damage numbers float up and hit sparks fly.
- **After a run:** there is no pop-up notice in the corner. If the player watches the run, the report opens at once. A run in the background leaves a report: its dungeon row shows "Fight over" and View results, and the Dungeons button shows a gold badge. The player reads the stats first, then the dungeon can start again. The report shows result, damage, level-ups and loot. Each hero has an experience bar with no number: blue is the experience the hero had, and a gold part grows to show what the fight gave. A level-up leaves only the gold part, on the bar of the new level. A report in a saved game from before this change shows the hero's current level and experience instead. Buttons are large for touch.
- **Combat log:** it has a title and groups lines into numbered turns (one turn is one second of battle). Hero names are blue, monster names red. Damage is a gold chip, damage taken red, a critical hit orange, healing green. After a victory, the log shows one line for each hero: the experience that hero gains.
- **Crafting reveal:** the item is rolled when the craft starts, but the player sees only its base name (for example Copper Sword) while the crafter works. The full name with the affixes shows when the craft is done.
- **Workshop recipes:** a recipe title shows the item level range that the crafter can roll (from the start of the tier bracket up to the best hero level plus the cap, for example Lv 1-5). A recipe also shows the classes that can use the item, so the player does not craft gear that no hero can wear.
- **Loot boxes:** the report shows each loot stack in a big box. Hover shows its details, and a tap opens them.
- **Menu always free:** the bottom menu stays on the screen during a fight. On a wide screen the combat log stands beside the stage.
- **Close anywhere:** the player can click the empty space around a panel or a modal to close it, not only the x button.
- **Heroes:** the Stats tab shows the full-body portrait, the main stats (Health, the class resource, Physical damage, Magical damage, Armour, Magic resist, Attack speed), the attributes as bars (Str red, Agi green, Int blue), and Power. The Equipment tab shows a paper doll with slots around the full-body portrait. Each class has its own full-body figure (its own gear and weapon), and the hero's skin, hair and eye colours come from the same appearance as the bust portrait. Click a slot: Equip new item (side by side compare, green for better, red for worse), View item (big portrait and stats) or Unequip. The Spells tab shows 3 spell slots and 1 ultimate slot. Tap a slot to pick a learned spell. The Battle record tab shows kills, damage, healing and battles won and lost.
- **Sound:** all sound is made in the browser, so the game has no sound files. A music track plays for the town, for battles and for bosses. Combat sounds depend on who hits: a hero attack is the weapon plus the monster cry; a monster attack is its strike plus a hit on the armour of the hero (heavy metal clang, medium leather thud, light cloth thump). There are sounds for criticals, heals, defeats, victory, level-up and button clicks. The Settings screen has music volume, effects volume and mute. Music and sound recipes are in `data/audio/`. A hero level-up plays a rising fanfare (`level-up`). A crafter level-up plays an anvil strike and two bright rings (`crafter-level-up`).
- **Reset:** the Settings screen has a red Danger zone with RESET GAME. It needs a second click to confirm.
- **Style:** pixel art, wood and parchment menus, blackletter panel titles (Jacquard 12). English and Chinese body text and row titles use Fusion Pixel 12px, which has clear digits and Latin letters. Chinese also takes its digits from Atkinson Hyperlegible ("Readable Digits"), and its Latin letters from Pixelify Sans.
- **Data:** all game data is JSON in `data/`. A README there explains each file.
- **Languages:** English and Simplified Chinese. The player picks the language in the Settings screen. The choice is saved apart from the game save. All text and content names are in `data/i18n/`. Item names are built from parts (material, base, affixes), so they change language too.

## 12. MVP scope

- Brackets 1-2 (Lv 1-20): 2 towns, 7 and at least 6 dungeons, 2 bosses.
- 5 base classes. Promotion works at Lv 20 with one branch for each class.
- All 6 professions with tiers 1-2. All 10 slots. The Unique pool has 2 items per bracket.
- Backpack with tabs, merchant, tavern, world map and travel, auto-save, save export and import.
- Balance simulator and content validator.
- **Done when:** a new game plays from Lv 1 to Lv 20 (fight, loot, craft, equip, travel, promote) and a reload keeps the exact state.

## 13. After the MVP

Brackets 3-10. Second promotion branches and master classes. Sockets for gems. Town orders (the merchant asks for crafted items for gold). Mobile layout and PWA. Tauri desktop builds. Audio.
