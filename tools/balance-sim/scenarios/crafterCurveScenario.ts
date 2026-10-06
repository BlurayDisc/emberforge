import { DUNGEONS } from '../../../src/content/dungeons';
import { createRandom, type Random } from '../../../src/kernel/random';
import { applyCraftingExperience, craftingExperienceForCraft, listRecipes, type Recipe } from '../../../src/systems/crafting';
import { createEncounter } from '../../../src/systems/dungeons';
import { rollMonsterLoot } from '../../../src/systems/loot';
import { experienceForKill, experienceToNextLevel } from '../../../src/systems/progression';
import { dungeonForLevel } from '../economy';
import { CRAFTER_CURVE_PRESET, type CrafterCurvePreset } from './presets';
import { printTable } from './table';

const LEVEL_ONE_DUNGEONS = DUNGEONS.filter((dungeon) => dungeon.level === 1 && dungeon.bossMonsterId === null);

// Basic recipes only, because the basic material is what the level 1 dungeons drop.
function basicRecipesOfProfession(professionId: string): Recipe[] {
  return listRecipes(1).filter((recipe) => recipe.setMaterialId === null && recipe.profession === professionId);
}

function pickDungeon(heroLevel: number, fightNumber: number, levelOneDungeonFightShare: number, random: Random) {
  if (random.chance(levelOneDungeonFightShare)) return LEVEL_ONE_DUNGEONS[fightNumber % LEVEL_ONE_DUNGEONS.length]!;
  return dungeonForLevel(heroLevel);
}

// Returns the crafter level at the moment the hero reaches each level.
function crafterLevelsAtHeroLevels(professionId: string, seed: number, preset: CrafterCurvePreset, levelOneDungeonFightShare: number): Map<number, number> {
  const recipes = basicRecipesOfProfession(professionId);
  const random = createRandom(seed);
  const crafterLevelAtHeroLevel = new Map<number, number>();
  const materialsHeld: Record<string, number> = {};
  let heroLevel = 1;
  let heroExperience = 0;
  let crafter = { level: 1, experience: 0 };
  for (let fightNumber = 0; heroLevel < preset.lastLevel; fightNumber++) {
    const dungeon = pickDungeon(heroLevel, fightNumber, levelOneDungeonFightShare, random.fork(`dungeon-${fightNumber}`));
    for (const monster of createEncounter(dungeon, 1, random.fork(`encounter-${fightNumber}`))) {
      for (const stack of rollMonsterLoot(monster.definitionId, random.fork(`loot-${fightNumber}-${monster.id}`)).materials) {
        materialsHeld[stack.materialId] = (materialsHeld[stack.materialId] ?? 0) + stack.quantity;
      }
      heroExperience += experienceForKill(monster.level, heroLevel, monster.rank);
    }
    for (;;) {
      const affordable = recipes.filter((recipe) => recipe.requiredCraftLevel <= crafter.level && recipe.ingredients.every((ingredient) => (materialsHeld[ingredient.materialId] ?? 0) >= ingredient.quantity));
      if (affordable.length === 0) break;
      const best = affordable.reduce((top, recipe) => (craftingExperienceForCraft(recipe, crafter.level) > craftingExperienceForCraft(top, crafter.level) ? recipe : top));
      for (const ingredient of best.ingredients) materialsHeld[ingredient.materialId]! -= ingredient.quantity;
      crafter = applyCraftingExperience(crafter, craftingExperienceForCraft(best, crafter.level));
    }
    while (heroExperience >= experienceToNextLevel(heroLevel) && heroLevel < preset.lastLevel) {
      heroExperience -= experienceToNextLevel(heroLevel);
      heroLevel += 1;
      crafterLevelAtHeroLevel.set(heroLevel, crafter.level);
    }
  }
  return crafterLevelAtHeroLevel;
}

export function runCrafterCurveScenario(): void {
  const preset = CRAFTER_CURVE_PRESET;
  console.log(`\nCrafter curve: ${preset.description}`);
  for (const { levelOneDungeonFightShare, maximumLevelsBehind } of preset.cases) {
    const averageCrafterLevels = preset.professionIds.map((professionId) => {
      const games = Array.from({ length: preset.games }, (_, index) => crafterLevelsAtHeroLevels(professionId, preset.firstSeed + index, preset, levelOneDungeonFightShare));
      return Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => games.reduce((sum, game) => sum + game.get(preset.firstLevel + index)!, 0) / games.length);
    });
    const rows = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => {
      const heroLevel = preset.firstLevel + index;
      const crafterLevels = averageCrafterLevels.map((levels) => levels[index]!);
      const levelsBehindOfWorstCrafter = heroLevel - Math.min(...crafterLevels);
      return [heroLevel, ...crafterLevels.map((level) => level.toFixed(1)), levelsBehindOfWorstCrafter.toFixed(1), levelsBehindOfWorstCrafter <= maximumLevelsBehind ? 'ok' : 'too far behind'];
    });
    printTable(`${Math.round(levelOneDungeonFightShare * 100)}% of the fights in the level 1 dungeons: average crafter level when the hero reaches each level (target: at most ${maximumLevelsBehind} behind)`, ['Hero lvl', ...preset.professionIds, 'Worst behind', 'Check'], rows);
  }
}
