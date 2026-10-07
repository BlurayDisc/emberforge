import type { Random } from '../../../kernel/random';
import type { BattleEvent } from '../../../model/battle';
import type { RealtimeActionEvent } from '../../../model/realtimeBattle';
import type { Combatant } from '../combatant';
import { isAlive, type RealtimeUnit } from './realtimeUnit';

// The state of one running battle. The loop in simulateRealtimeBattle changes it tick by tick.
export interface FieldBattle {
  units: RealtimeUnit[];
  combatants: Combatant[];
  random: Random;
  events: BattleEvent[];
  actionEvents: RealtimeActionEvent[];
}

export const livingEnemiesOf = (battle: FieldBattle, unit: RealtimeUnit): RealtimeUnit[] =>
  battle.units.filter((other) => other.combatant.unit.side !== unit.combatant.unit.side && isAlive(other));

export const livingAlliesOf = (battle: FieldBattle, unit: RealtimeUnit): RealtimeUnit[] =>
  battle.units.filter((other) => other !== unit && other.combatant.unit.side === unit.combatant.unit.side && isAlive(other));

export const findUnit = (battle: FieldBattle, unitId: string | null): RealtimeUnit | undefined => battle.units.find((unit) => unit.combatant.unit.id === unitId);
