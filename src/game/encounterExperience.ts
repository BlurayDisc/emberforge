import type { BattleUnit } from '../model/battle';
import { experienceForKill } from '../systems/progression';

// The combat log and the run report both show this number, so one function works it out.
export function experienceForDefeatedMonsters(monsters: readonly BattleUnit[], heroLevel: number): number {
  return monsters.reduce((total, monster) => total + experienceForKill(monster.level, heroLevel, monster.rank), 0);
}
