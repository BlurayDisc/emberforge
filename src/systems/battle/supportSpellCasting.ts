import type { BattleEvent, BattleUnit } from '../../model/battle';
import type { SpellEffect } from '../../model/spell';
import { combatantOf, statusStrength } from './combatant';
import { event, healthFractionOf, type CastContext } from './spellCastContext';

export function castHeal(effect: Extract<SpellEffect, { kind: 'heal' }>, context: CastContext): BattleEvent[] {
  const wounded = (effect.target === 'self' ? [context.actor.unit] : context.allies).filter((unit) => unit.hp < unit.maxHp);
  if (wounded.length === 0) return [];
  const targets = effect.target === 'allAllies' ? wounded : [[...wounded].sort((first, second) => healthFractionOf(first) - healthFractionOf(second))[0] as BattleUnit];
  return targets.map((target) => {
    const woundFactor = 1 - statusStrength(combatantOf(context.combatants, target), 'wound', context.timeSeconds);
    const healed = Math.min(target.maxHp - target.hp, Math.round(context.actor.unit.attack * effect.power * woundFactor));
    target.hp += healed;
    return event(context, target, 'heal', healed);
  });
}

// The shield absorbs a flat amount plus a share of the maximum health, because the resource pool does not grow. It ends when the time runs out or the damage empties it.
export function castShield(effect: Extract<SpellEffect, { kind: 'shield' }>, context: CastContext): BattleEvent[] {
  const remaining = Math.round(effect.absorbFlat + context.actor.unit.maxHp * effect.absorbMaxHpFraction);
  context.actor.shield = { remaining, expiresAtSeconds: context.timeSeconds + effect.durationSeconds };
  return [{ ...event(context, context.actor.unit, 'effect', 0), targetShieldAfter: remaining }];
}
