import { createMonsterUnit } from '../../systems/dungeons';

export interface MonsterStatisticsView {
  health: number;
  attack: number;
  armour: number;
  resistance: number;
  speed: number;
}

export function describeMonsterStatistics(monsterId: string, level: number): MonsterStatisticsView {
  const unit = createMonsterUnit(monsterId, level, 'statistics-preview');
  return { health: unit.maxHp, attack: Math.round(unit.attack), armour: Math.round(unit.defence), resistance: Math.round(unit.resistance), speed: unit.speed };
}
