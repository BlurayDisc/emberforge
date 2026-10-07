import type { AttackKind } from '../../model/battle';
import { createMonsterUnit } from '../../systems/dungeons';

export interface MonsterStatisticsView {
  health: number;
  attack: number;
  attackKind: AttackKind;
  armour: number;
  resistance: number;
  attackSeconds: number;
}

export function describeMonsterStatistics(monsterId: string, level: number): MonsterStatisticsView {
  const unit = createMonsterUnit(monsterId, level, 'statistics-preview');
  return { health: unit.maxHp, attack: Math.round(unit.attack), attackKind: unit.attackKind, armour: Math.round(unit.defence), resistance: Math.round(unit.resistance), attackSeconds: unit.baseAttackSeconds };
}
