import { DUNGEONS } from '../../../src/content/dungeons';
import { createRandom, type Random } from '../../../src/kernel/random';
import { applyCraftingExperience, craftingExperienceForCraft, listRecipes, type Recipe } from '../../../src/systems/crafting';
import { createEncounter } from '../../../src/systems/dungeons';
import { rollDungeonBonusDrops, rollMonsterLoot } from '../../../src/systems/loot';
import { experienceForKill, experienceToNextLevel } from '../../../src/systems/progression';
import { dungeonForLevel } from '../economy';
import { CRAFTER_CURVE_PRESET, type CrafterCurvePreset } from './presets';
import { printTable } from './table';

const LEVEL_ONE_DUNGEONS = DUNGEONS.filter((dungeon) => dungeon.level === 1 && dungeon.bossMonsterId === null);

interface HeroLevelMilestone {
  crafterLevel: number;
  basicFightShare: number;
}

// Basic recipes only, because the basic material is what the level 1 dungeons drop.
function basicRecipesOfProfession(professionId: string): Recipe[] {
  return listRecipes(1).filter((recipe) => recipe.setMaterialId === null && recipe.profession === professionId);
}

function levelOneDungeonThatDrops(materialId: string, random: Random) {
  const dungeonDropsMaterial = (dungeon: (typeof LEVEL_ONE_DUNGEONS)[number], sample: number): boolean =>
    createEncounter(dungeon, 1, random.fork(`probe-${dungeon.id}-${sample}`)).some((monster) =>
      rollMonsterLoot(monster.definitionId, random.fork(`probe-loot-${dungeon.id}-${sample}-${monster.id}`)).materials.some((stack) => stack.materialId === materialId));
  return LEVEL_ONE_DUNGEONS.find((dungeon) => Array.from({ length: 12 }, (_, sample) => sample).some((sample) => dungeonDropsMaterial(dungeon, sample))) ?? LEVEL_ONE_DUNGEONS[0]!;
}

// The player keeps the crafter level with the hero. Returns the crafter level and the share of fights in the level 1 dungeons when the hero reaches each level.
function milestonesPerHeroLevel(professionId: string, seed: number, preset: CrafterCurvePreset): Map<number, HeroLevelMilestone> {
  const recipes = basicRecipesOfProfession(professionId);
  const random = createRandom(seed);
  const milestones = new Map<number, HeroLevelMilestone>();
  const materialsHeld: Record<string, number> = {};
  let heroLevel = 1;
  let heroExperience = 0;
  let crafter = { level: 1, experience: 0 };
  let fights = 0;
  let basicFights = 0;

  const fight = (dungeon: (typeof DUNGEONS)[number], isBasicFight: boolean): void => {
    fights += 1;
    if (isBasicFight) basicFights += 1;
    for (const monster of createEncounter(dungeon, 1, random.fork(`encounter-${fights}`))) {
      for (const stack of rollMonsterLoot(monster.definitionId, random.fork(`loot-${fights}-${monster.id}`)).materials) {
        materialsHeld[stack.materialId] = (materialsHeld[stack.materialId] ?? 0) + stack.quantity;
      }
      heroExperience += experienceForKill(monster.level, heroLevel, monster.rank);
    }
    for (const stack of rollDungeonBonusDrops(dungeon, random.fork(`dungeon-bonus-drops-${fights}`))) {
      materialsHeld[stack.materialId] = (materialsHeld[stack.materialId] ?? 0) + stack.quantity;
    }
  };

  const craftEverythingAffordable = (): void => {
    for (;;) {
      const affordable = recipes.filter((recipe) => recipe.requiredCraftLevel <= crafter.level && recipe.ingredients.every((ingredient) => (materialsHeld[ingredient.materialId] ?? 0) >= ingredient.quantity));
      if (affordable.length === 0) return;
      const best = affordable.reduce((top, recipe) => (craftingExperienceForCraft(recipe, crafter.level) > craftingExperienceForCraft(top, crafter.level) ? recipe : top));
      for (const ingredient of best.ingredients) materialsHeld[ingredient.materialId]! -= ingredient.quantity;
      crafter = applyCraftingExperience(crafter, craftingExperienceForCraft(best, crafter.level));
    }
  };

  while (heroLevel < preset.lastLevel) {
    if (crafter.level < heroLevel) {
      const target = recipes.filter((recipe) => recipe.requiredCraftLevel <= crafter.level).reduce((top, recipe) => (craftingExperienceForCraft(recipe, crafter.level) > craftingExperienceForCraft(top, crafter.level) ? recipe : top));
      const dungeon = levelOneDungeonThatDrops(target.ingredients[0]!.materialId, random.fork(`choice-${fights}`));
      for (let round = 0; round < preset.basicFightsPerRound; round++) fight(dungeon, true);
      craftEverythingAffordable();
    } else {
      fight(dungeonForLevel(heroLevel), false);
    }
    while (heroExperience >= experienceToNextLevel(heroLevel) && heroLevel < preset.lastLevel) {
      heroExperience -= experienceToNextLevel(heroLevel);
      heroLevel += 1;
      milestones.set(heroLevel, { crafterLevel: crafter.level, basicFightShare: basicFights / fights });
    }
  }
  return milestones;
}

export function runCrafterCurveScenario(): void {
  const preset = CRAFTER_CURVE_PRESET;
  const [lowestShare, highestShare] = preset.basicFightShareRange;
  console.log(`\nCrafter curve: ${preset.description}`);
  const gamesPerProfession = preset.professionIds.map((professionId) => Array.from({ length: preset.games }, (_, index) => milestonesPerHeroLevel(professionId, preset.firstSeed + index, preset)));
  const rows = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => {
    const heroLevel = preset.firstLevel + index;
    const averageShares = gamesPerProfession.map((games) => games.reduce((sum, game) => sum + game.get(heroLevel)!.basicFightShare, 0) / games.length);
    const averageCrafterLevels = gamesPerProfession.map((games) => games.reduce((sum, game) => sum + game.get(heroLevel)!.crafterLevel, 0) / games.length);
    const worstShare = averageShares.reduce((worst, share) => (Math.abs(share - (lowestShare + highestShare) / 2) > Math.abs(worst - (lowestShare + highestShare) / 2) ? share : worst));
    return [heroLevel, ...averageShares.map((share, professionIndex) => `${Math.round(share * 100)}% (crafter ${averageCrafterLevels[professionIndex]!.toFixed(1)})`), worstShare >= lowestShare && worstShare <= highestShare ? 'ok' : worstShare < lowestShare ? 'too few basic fights' : 'too many basic fights'];
  });
  printTable(`Share of all fights in the level 1 dungeons when the hero reaches each level (target: ${Math.round(lowestShare * 100)}% to ${Math.round(highestShare * 100)}%, ${preset.basicFightsPerRound} fights for each round)`, ['Hero lvl', ...preset.professionIds, 'Check'], rows);
}
