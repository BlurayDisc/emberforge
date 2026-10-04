import { dungeonForLevel, playUntilLevels } from '../economy';
import { ECONOMY_PRESET } from './presets';
import { printTable } from './table';

export function runEconomyScenario(): void {
  const preset = ECONOMY_PRESET;
  const games = Array.from({ length: preset.games }, (_, index) => playUntilLevels(preset.firstSeed + index, preset.lastLevel));
  const average = (level: number, pick: (milestone: { fights: number; copperFromSoldMaterials: number }) => number): number => {
    if (level === preset.firstLevel) return 0;
    return games.reduce((sum, game) => sum + pick(game.get(level)!), 0) / games.length;
  };
  const rows = Array.from({ length: preset.lastLevel - preset.firstLevel + 1 }, (_, index) => {
    const level = preset.firstLevel + index;
    const fights = average(level, (milestone) => milestone.fights);
    const copper = average(level, (milestone) => milestone.copperFromSoldMaterials);
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
    ];
  });
  console.log(`\nEconomy: ${preset.description} (average of ${preset.games} games)`);
  printTable('Copper if every loot material is sold, at the moment the hero reaches each level', ['Level', 'Dungeon fought', 'Fights (total)', 'Fights (last level)', 'Copper (total)', 'Copper (last level)', 'Copper per fight'], rows);
}
