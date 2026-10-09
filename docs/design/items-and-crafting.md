# Emberforge design - Items, crafting and storage

Part of the game design. The headings of `docs/design.md` list every section and the file it is in. Section numbers are the same in every file.

## 5. Items

An item is: **Base + Item level (ilvl) + Quality + Affixes**. A hero needs level ≥ ilvl to equip it.

- **Slots (11):** Main hand, Off hand, Helm, Armour, Gloves, Legs, Boots, Belt, Amulet, Ring ×2.
- **Base stats** are whole numbers. They roll inside a range (±15%, rounded) and do not grow with the item level, except weapon damage. See `docs/balance/combat-and-growth-mechanism.md` section 14.
  - **Weapon damage** = round(W x type multiplier) at the item level L, with W(L) = 7 + 1.6 x (L - 1). Multipliers: one-handed main hand 1.0, Staff 1.15, main-hand dagger and knuckles families 0.85, Greataxe and Maul 1.5, off-hand Quiver and Tome 0.25, off-hand Parrying Dagger and Cestus 0.4 (`weaponDamage` in `data/balance/items.json`). Examples: Sword (1) 7, Axe (3) 10, Longsword (5) 13, Battle Axe (7) 17, Broadsword (9) 20. A base item lists the damage at item level 1 (`baseStats`) and a flat gain for each further level (`growthPerItemLevel`). Light weapons give +3% attack speed, two-handed weapons -3% (percent points, no range).
  - **Armour** gives Defence (no HP) and Resistance. Defence at the item level of the piece: Boots (1) 4 / 3 / 2, Gloves (2) 5 / 4 / 2, Helm (4) 5 / 4 / 3, Shield (5) 5, Legs (6) 7 / 5 / 4, Chest (8) 12 / 8 / 5 for Heavy / Medium / Light. No piece gives less than 2 Defence, and Heavy > Medium >= Light. Boots also give +5% movement speed (percent points, no growth with the item level, no spread). The main stat of boots stays Defence, so an upgrade adds +1 Defence. HP comes only from affixes and set bonuses.
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
- **Affixes** are random. They have a kind (prefix or suffix), a stat and a value range (`minimumValue`, `maximumValue`). The value grows with the item level (`affixGrowthPerItemLevel`) unless `scalesWithItemLevel` is false. There is no minimum item level and no affix tier yet. There are 15 prefixes and 15 suffixes (the HP affixes are tuned for a level 10 hero with 700-900 base HP: *of the Bear* 20-50, *of the Whale* 30-70, *Vital* 15-40, *Robust* 25-60). Prefixes: *Mighty* and *Brutal* (Strength), *Arcane* and *Wise* (Intelligence), *Swift* (Agility), *Sturdy* and *Stalwart* (Defence), *Warded* and *Blessed* (Resistance), *Vital* and *Robust* (HP), *Keen* (critical chance), *Savage* (critical damage), *Vampiric* (life steal) and *Brisk* (attack speed). Examples of suffixes: *of the Bear* (+HP), *of Insight* (+Intelligence), *of Precision* (+Agility), *of Haste* (+attack speed %). Combat bonuses that are not class stats are percent points: the suffixes *of the Leech* (life steal 2-5%), *of the Viper* (critical chance 1-3%) and *of Carnage* (critical damage 5-15%), and the prefixes *Keen* (critical chance 1-3%), *Savage* (critical damage 4-12%), *Vampiric* (life steal 1-4%) and *Brisk* (attack speed 2-4%). Their values (and the attack speed of *of Haste* and *of the Fox*) are percent points and do not grow with item level (`scalesWithItemLevel` is false in `affixes.json`). A crafted Magic or Rare item picks its suffixes at random, each suffix in the pool with the same chance.
- **Unique items** drop from rare monsters (4%) and bosses (25%). The player cannot craft them.
- **Item drops:** a monster can drop a ready item (`itemDrops` in `monsters.json`: base item, fixed quality, item level, chance). It is built like a crafted one, priced from the basic recipe, with affixes rolled from the fixed quality. It goes to the backpack, or waits at the dungeon when the backpack is full (see section 7). The report lists dropped items. In the data: the Spider of Old Wood Hollow drops a Common Ring of item level 7 (5%), and the Goblin Chief drops an Uncommon Ring of item level 7 (35%).
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
- **Essence and Catalyst:** no monster drops them. Faint Essence and Tarnished Catalyst stay in `materials.json` so that old saves load and the player can sell them. Enchanting will use them later.
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

- **Ingredient count** is fixed per base item (`mainIngredientQuantity` in `base-items.json`), of the main material only. Warrior weapons 2 (Broadsword 3), Heavy armour 2-3 (Shield 3), Archer bows 3-4 (Quiver 1), Barbarian two-hand weapons 3-4, Staff 2, Mace 2-3, small magic and light weapons 1-2, Medium and Light armour 1-2, Jewellery and Belt 1. No main count is above 4. A weapon line starts at 3 and steps up once to 4 for its two later recipes. A set recipe adds 1 set material (2 for items of 6 cells or more).
- **Item level** is fixed for each recipe: tier start - 1 + the base offset (a set recipe uses its higher level), never above the last level of the tier. The Workshop shows it before the craft. The crafter level does not change it. Quality, affixes, the ±15% spread and the upgrade level stay random. A level 1 Mage can equip the Wand (1) and the light Boots (1), the Staff, the Tome and the light Leggings from level 5.
- **Recipe level:** a recipe needs crafter level (tier - 1) × 10 + the base item's offset. Locked recipes show the needed level. A recipe row shows its recipe level in the title ("Copper Gloves (Lv 3)") and the item level on a second line ("Item level 3").
- **Quality odds** (Common / Uncommon / Magic / Rare): 55 / 20 / 15 / 10. A craft never uses a Catalyst.
- **Crafting reveal:** the item is rolled when the craft starts, but the player sees only its base name while the crafter works. The full name with affixes shows when the craft is done.

### Upgrade level (+1 to +7)

A crafted item can come out with an upgrade level, shown at the end of the name ("Iron Sword +3"). The "+N" has its own colour: green +1, cyan +2, blue +3, purple +4, pink +5, orange +6, red +7 (+5 and higher glow), and the rest of the name keeps the quality colour. A window title or tooltip shows "+N" as plain text.

- Each level adds to the main stat of the item the larger of 1 and 5% of that stat before the upgrade (rounded; `upgradeMainStatFractionPerLevel` in `crafting.json`). So a low item gets a flat +1 for each level, and a strong item (a main stat of 30 or more) gets the percentage. Every level of one item adds the same amount. The main stat is Defence for armour, shield and belt, damage for weapons and off-hand damage items, critical chance for the ring and attack speed for the amulet. Each level also adds 3% to the sell value. It does not change the item level or the other stats. The recipe screen says that each +1 adds 1 to the main stat, or 5% of it on a strong item.
- Most crafts have no upgrade. The game rolls step by step and stops at the first failed step, so +N needs N successes in a row.
- The chance to reach at least +N runs in a straight line from a value at the recipe level to a value for a crafter 9 or more levels above the recipe (the most a level 10 crafter can be above a level 1 recipe). For +1: 10% at the recipe level, 40% at 9 levels above. For +4: 0.3% and 9%. More levels above give nothing more. The values for +1 to +7 are in `data/balance/crafting.json` and must fall with each level (the validator checks it). The recipe screen shows the chance of +1 or better.
- Unique and looted items have no upgrade level.

### Fee, level plan and recipe rules

- **Crafter fee:** every craft costs materials and a gold fee: 1 copper + 0.25 copper for each level the recipe needs (`craftFeeBaseCopper`, `craftFeePerRequiredLevelCopper`). A crafter cannot start a craft when the player cannot pay.
- **First materials:** the two level 1 dungeons drop Copper Ore, Rawhide, Pine Wood and Linen, so every basic recipe works from the start. **A level 1 monster always drops each of its basic materials** (Cave Rat: Rawhide and Copper Ore; Straw Scarecrow: Linen and Pine Wood): chance 100%, quantity 1, or 2 with a 10% chance (`maxQuantityChance` in `monsters.json`). Quartz first drops in the Wolf Trail, as a rare drop. The merchant buys every material but sells none, so the level 1 dungeons and the Mill are the source of basic materials.
- **Recipe rule:** a recipe must not need a material that first drops in a dungeon above the recipe's craft level (the validator checks it). So the level 1 recipes use only the four basic materials, and the Ring (Quartz) is at offset 7 and the Amulet at offset 9.
- **Level plan:** every class can craft a weapon and an armour piece at crafter level 1, and **every crafter level from 1 to 9 opens something new for every class** (the validator checks both).
  - Weapons open on odd levels (1, 3, 5, 7, 9).
  - Armour opens in this order: Boots 1, Gloves 2, Helm 4, Legs 6, body Armour 8. The light Leggings open at 5, so the Mage and the Priest get a second cloth piece with the Staff and the Tome. The Shield opens at 5. The body Armour is the last of the set pieces.
  - Off-hand items open early, so the slot is not empty: Quiver 4, Parrying Dagger 4, Cestus 4, Shield 5, Tome 5.
  - Belt 6, Ring 7, Amulet 9. Level 10 opens nothing new, because every set recipe opens with its base item. A level 10 crafter can make every base of the tier.
- **Weapon steps:** every class gets a stronger weapon every 2 crafter levels inside a bracket, the last at offset 7 or higher. **Each new weapon has more damage than every weapon before it** (physical for a physical class, magical for a magic class). A stronger weapon is a new base with the same gear type and size, so the same classes can use it. The step follows the weapon damage rule in section 5. The validator checks both rules.

| Class | Main hand weapons (offset: damage at that item level) |
|---|---|
| Warrior | Sword (1: 7), Axe (3: 10), Longsword (5: 13), Battle Axe (7: 17), Broadsword (9: 20) |
| Archer | Bow (1: 7), Longbow (3: 10), Composite Bow (5: 13), Warbow (7: 17) |
| Mage | Wand (1: 7), Runed Wand (3: 10), Scepter (5: 13), Staff (5: 15), Arcane Staff (7: 19) |
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

The set materials of a bracket, their bonus and their sort position are in A7 of `docs/balance/bracket-NN.md`.

### Crafters and the Workshop

- **Crafter levels:** each profession is a crafter with level 1-100 and XP. XP to the next level: levels 1 to 8 cost 43, 47, 98, 108, 130, 180, 330 and 345 XP (`experienceToNextByLevel`), then 48 × L^1.3 (`experienceToNextBase`, `experienceToNextExponent`; level 9 costs 835). The table follows the best weapon of a Warrior (Sword, Axe, Longsword and Battle Axe use 2 main material, the Broadsword 3): one craft from level 1 lands on 2.3, from level 2 on 3.2, from level 3 on 4.1, then 2 more crafts on 4.8 and 5.5. Levels 5 to 8 take 2 crafts each (a fresh level 7 or 8 takes 3), and level 9 takes 3 to 4. From level 3 upwards one craft never gives more than 1 level. A crafter below level 2 gains at most 2 levels from one craft (`maximumLevelsPerCraft`, `levelsPerCraftCapBelowLevel`), so a big first craft does not jump to level 4 or 5. The extra XP stays banked for the next craft. A craft gives (20 + 8 × recipe level) XP for each unit of its main material, minus 8% for each level the crafter is above the recipe (down to 10%) (`experiencePerMaterialBase`, `experiencePerMaterialPerRequiredLevel` in `crafting.json`). So crafter XP follows the basic material that dungeons drop, and a recipe with twice the material pays twice the XP. A Mage needs more crafts for a level than a Warrior, because its early weapons use 1 material (Wand, Runed Wand) and the first 2-material weapon, the Scepter, opens at level 5.
- **Crafter pace target:** the player keeps the crafter level with the hero. Whenever the crafter is below the hero level, the player runs a round: 2 fights in the level 1 dungeon that drops the main material of the best recipe, then crafts everything it can afford (`basicFightsPerRound`). The two level 1 dungeons are the only dungeon source of basic material. The share of all fights spent in them should stay between 30% and 50% (`basicFightShareRange`). Check it with `npm run scenarios -- crafter-curve`. The results are in `docs/balance/bracket-01.md`. To lower the share, cut crafter XP costs, or raise the level 1 double-drop chance (`maxQuantityChance`, 10%).
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
