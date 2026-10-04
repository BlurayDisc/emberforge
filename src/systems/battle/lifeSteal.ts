import type { BattleEvent, BattleUnit } from '../../model/battle';

// Returns the heal event for the damage the attacker just dealt, or nothing when the unit does not heal.
export function applyLifeSteal(attacker: BattleUnit, damageDealt: number, timeSeconds: number, spellId?: string): BattleEvent[] {
  const healedAmount = Math.min(attacker.maxHp - attacker.hp, Math.round(damageDealt * attacker.lifeSteal));
  if (healedAmount <= 0) return [];
  attacker.hp += healedAmount;
  return [{
    timeSeconds,
    kind: 'heal',
    actorId: attacker.id,
    targetId: attacker.id,
    amount: healedAmount,
    isCritical: false,
    targetHpAfter: attacker.hp,
    actorResourceAfter: attacker.resource,
    targetResourceAfter: attacker.resource,
    ...(spellId === undefined ? {} : { spellId }),
  }];
}
