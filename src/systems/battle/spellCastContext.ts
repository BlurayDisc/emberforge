import type { Random } from '../../kernel/random';
import type { BattleEvent, BattleUnit } from '../../model/battle';
import type { BattleSpell } from '../../model/spell';
import type { Combatant } from './combatant';

export interface CastContext {
  actor: Combatant;
  combatants: readonly Combatant[];
  allies: BattleUnit[];
  opponents: BattleUnit[];
  timeSeconds: number;
  random: Random;
  spell: BattleSpell;
  // The real-time battle aims a single-target spell at the enemy that the caster is fighting.
  focusTarget?: BattleUnit;
}

export const healthFractionOf = (unit: BattleUnit): number => unit.hp / unit.maxHp;
export function event(context: CastContext, target: BattleUnit, kind: BattleEvent['kind'], amount: number, isCritical = false): BattleEvent {
  return { timeSeconds: context.timeSeconds, kind, actorId: context.actor.unit.id, targetId: target.id, amount, isCritical, targetHpAfter: target.hp, actorResourceAfter: context.actor.unit.resource, targetResourceAfter: target.resource, spellId: context.spell.id };
}
