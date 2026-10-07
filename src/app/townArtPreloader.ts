import { BASE_ITEMS } from '../content/baseItems';
import { PROFESSION_IDS } from '../content/baseItems';
import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import { MONSTERS } from '../content/monsters';
import { SPELLS } from '../content/spells';
import { TOWNS } from '../content/towns';
import { listWorkshopRecipes, type GameStore } from '../game';
import { createCrafterPortrait } from '../ui/crafterPortraitArt';
import { dungeonBackdropCanvas, monsterSpriteCanvas, castleFigureCanvas, releaseDrawnArt } from '../ui/artProviders';
import { createDungeonIcon, createItemIcon, createMaterialIcon, releaseIconsBelowTier } from '../ui/iconArt';
import { warmPixelIcons } from '../ui/pixelIcons';
import { createSpellIcon } from '../ui/spellIconArt';
import { CASTLE_FIGURE_LOOKS } from './stageArtProviders';

type ArtTask = () => void;

const MAX_MILLISECONDS_WITHOUT_YIELD = 12;

function tasksForTown(store: GameStore, townId: string): ArtTask[] {
  const tier = TOWNS.findIndex((town) => town.id === townId) + 1;
  const townDungeons = DUNGEONS.filter((dungeon) => dungeon.townId === townId);
  const townMonsterIds = new Set(townDungeons.flatMap((dungeon) => [...dungeon.monsterIds, dungeon.rareMonsterId, dungeon.bossMonsterId].filter((id): id is string => id !== null)));
  const recipesOfTown = listWorkshopRecipes(store.getState()).filter((recipe) => recipe.tier === tier);
  return [
    warmPixelIcons,
    ...PROFESSION_IDS.map((professionId) => () => createCrafterPortrait(professionId)),
    ...MATERIALS.filter((material) => material.tier === tier).map((material) => () => createMaterialIcon(material.id, material.category)),
    ...recipesOfTown.map((recipe) => () => createItemIcon(recipe.baseId, recipe.resultMaterialId, requireById(BASE_ITEMS, recipe.baseId).mainCategory)),
    ...SPELLS.map((spell) => () => createSpellIcon(spell.id)),
    ...townDungeons.map((dungeon) => () => { createDungeonIcon(dungeon.id); dungeonBackdropCanvas(dungeon.id); }),
    ...MONSTERS.filter((monster) => townMonsterIds.has(monster.id)).map((monster) => () => monsterSpriteCanvas(monster.spriteKey)),
    ...CASTLE_FIGURE_LOOKS.map((look) => () => castleFigureCanvas(look)),
  ];
}

// Draws and encodes the art of one town ahead of time, in slices of at most 12 ms, so the page stays alive and a loading bar can move.
// Travel to a new town calls this again: the art of the lower tiers is released first.
export async function preloadTownArt(store: GameStore, townId: string, onProgress: (fractionDone: number) => void = () => undefined): Promise<void> {
  const tier = TOWNS.findIndex((town) => town.id === townId) + 1;
  releaseIconsBelowTier(tier);
  releaseDrawnArt();
  const tasks = tasksForTown(store, townId);
  let sliceStart = performance.now();
  for (const [index, task] of tasks.entries()) {
    task();
    if (performance.now() - sliceStart < MAX_MILLISECONDS_WITHOUT_YIELD) continue;
    onProgress((index + 1) / tasks.length);
    await new Promise<void>((resume) => setTimeout(resume));
    sliceStart = performance.now();
  }
  onProgress(1);
}
