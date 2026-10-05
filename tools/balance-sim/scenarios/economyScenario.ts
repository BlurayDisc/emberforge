import { dungeonForLevel, playUntilLevels, type LevelMilestone } from '../economy';
import { spellsOfClass } from '../../../src/content/spells';
import { learnCostCopper } from '../../../src/systems/spells';
import { ECONOMY_PRESET } from './presets';
import { printTable } from './table';

// Every class has the same spell levels and prices, so the Warrior stands for all.
function spellCostsUpTo(level: number): number {
  return spellsOfClass('warrior').filter((spell) => spell.unlockLevel <= level).reduce((sum, spell) => sum + learnCostCopper(spell), 0);
}

export function runEconomyScenario(): void {
  const preset = ECONOMY_PRESET;
  const games = Array.from({ length: preset.games }, (_, index) => playUntilLevels(preset.firstSeed + index, preset.lastLevel));
  const average = (level: number, pick: (milestone: LevelMilestone) => number): number => {
    if (level === preset.firstLevel) return 0;
    return games.reduce((sum, game) => sum + pick(game.get(level)!), 0) / games.length;
  };
  const rows = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => {
    const level = preset.firstLevel + index;
    const fights = average(level, (milestone) => milestone.fights);
    const copper = average(level, (milestone) => milestone.copperFromSoldMaterials);
    const itemsCrafted = average(level, (milestone) => milestone.itemsCrafted);
    const craftedCopper = average(level, (milestone) => milestone.copperFromCraftedItems);
    const fightsBefore = level === preset.firstLevel ? 0 : average(level - 1, (milestone) => milestone.fights);
    const copperBefore = level === preset.firstLevel ? 0 : average(level - 1, (milestone) => milestone.copperFromSoldMaterials);
    const fightsInLastLevel = fights - fightsBefore;
    return [
      level,
      level === preset.firstLevel ? '-' : dungeonForLevel(level - 1).name,
      fights.toFixed(0),
      fightsInLastLevel.toFixed(0),
      copper.toFixed(0),
      (copper - copperBefore).toFixed(0),
      fightsInLastLevel === 0 ? '-' : ((copper - copperBefore) / fightsInLastLevel).toFixed(1),
      itemsCrafted.toFixed(0),
      craftedCopper.toFixed(0),
      (craftedCopper - spellCostsUpTo(level)).toFixed(0),
      craftedCopper === 0 ? '-' : `${((100 * spellCostsUpTo(level)) / craftedCopper).toFixed(0)}%`,
      craftedCopper === 0 || (100 * spellCostsUpTo(level)) / craftedCopper <= preset.spellBudgetPercent ? 'ok' : `over ${preset.spellBudgetPercent}%`,
    ];
  });
  console.log(`\nEconomy: ${preset.description} (average of ${preset.games} games)`);
  printTable('Copper if every loot material is sold, at the moment the hero reaches each level', ['Level', 'Dungeon fought', 'Fights (total)', 'Fights (last level)', 'Copper (total)', 'Copper (last level)', 'Copper per fight', 'Items crafted', 'Copper if crafted and sold', 'After spells', 'Spells share', 'Check'], rows);
  console.log('Crafted: every loot material is crafted into the most profitable basic recipe the hero level allows (crafter level = hero level), and every item is sold. Leftover materials (set materials, essence) are sold as they are. Fees are paid. Quality is the average of the odds. After spells: crafted copper minus the cost of every spell up to that level for one hero.');
}
