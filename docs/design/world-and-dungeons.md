# Emberforge design - World, travel and dungeons

Part of the game design. The headings of `docs/design.md` list every section and the file it is in. Section numbers are the same in every file.

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
- **Dungeons of a town:** the list (levels, unlock chain, monsters, drops, bonus drops) is in A5 of `docs/balance/bracket-NN.md`.
- **Dungeon content:** 1-3 monster families from the town list and 1 rare monster. **Every dungeon has its own monsters:** a monster id and a sprite key appear in one dungeon only (the validator checks it).

- **Locks and levels:** only the first dungeon is open at the start. Clearing a dungeon opens the next. Each dungeon has a **minimum hero level** (`minimumHeroLevel` in `dungeons.json`, the same as the monster level). A hero below it cannot enter: the start command rejects and the Start button stays off. In a boss party, one hero must have the level and the partner can be weaker. The dungeon also shows a best range (up to `recommendedMaxLevel`).
- **Drop tables:** a normal monster drops 3 crafting materials in the first dungeons of a bracket, and 2 in later dungeons. Two dungeons share at most 1 crafting material between their normal monsters (the validator checks it). Rare monsters and bosses drop more of their dungeon materials. **Base materials (Copper Ore, Pine Wood, Rawhide, Linen) drop from monsters only in the first dungeons of a bracket. Every later dungeon drops exactly one set material** (Quartz is not a set material).
- **Quartz** is a rare drop. The chance rises slowly with the dungeon level, each rare monster has 3 × the chance of its normal monster, and a boss has its own chance (A5 and A8 of the bracket file). Always 1 Quartz.
- **Dungeon bonus drops:** a dungeon can drop materials of its own, on top of the monster drops (`bonusDrops` in `dungeons.json`). Each entry rolls its chance once for each won fight and gives `quantity` of one of its `materialIds`, each with the same chance. The entries of a bracket are in A5 of the bracket file. They cut the fights the player needs in the first dungeons. The first dungeons have an empty list. The dungeon screen does not show them.
- **Drops per fight:** no gold (the aim is to craft). At least 1 crafting material is guaranteed. The guaranteed drop is picked from the drops with their chances as weights. A drop with `canBeGuaranteed: false` (every Quartz drop) is never picked, so its chance in the data is its real chance. The validator requires at least one other drop on each monster. Each other drop rolls its own chance, so lucky fights give more. The guaranteed drop does not roll a second time, so no drop gives more than its maximum quantity. All drops are of the bracket tier.
- **Run:** one run is one fight. Wounds stay after it.
- **Recovery:** heroes regenerate health by the clock (`data/balance/recovery.json`). A level 1 hero heals from empty to full in 60 s. The time grows in a straight line to `regenSecondsToFullAtMaxLevel` at the level cap (82 s at level 10). The class `recoveryRate` speeds it up or slows it down (Thief 1.75, Priest and Fighter 1.25, Warrior, Archer and Barbarian 1, Mage 0.8). A hero at 0 health is down for (60 s + 5 s per level) divided by the class rate, then returns at 30% health. A down hero cannot start a run. Speed-up is not built yet (a later spell may unlock it).
