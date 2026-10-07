import { HEAL_POWER_MULTIPLIER } from '../../../content/balance/battle';
import type { Random } from '../../../kernel/random';
import type { BattleEvent } from '../../../model/battle';
import { armourFactorOf, damageFactorBetween, empowerAttackBonusOf, statusStrength, type Combatant } from '../combatant';
import { rollDamage } from '../damage';
import { dodgeEvent, dodgesHit, shieldFieldsOf, takeDamage } from '../damageTaken';
import { applyLifeSteal } from '../lifeSteal';
import { gainResourceFromHit } from '../resourcePool';
import { reflectThorns } from '../thorns';

// The hit moment of a basic attack. The rules are the ones of the turn battle: rollDamage, armour, shield, life steal and thorns.
export function resolveBasicAttack(attacker: Combatant, struck: Combatant, timeSeconds: number, random: Random): BattleEvent[] {
  const actor = attacker.unit;
  const target = struck.unit;
  if (dodgesHit(struck, timeSeconds)) return [dodgeEvent(attacker, struck, timeSeconds)];
  const damage = rollDamage(actor, target, random, {
    statusFactor: damageFactorBetween(attacker, struck, timeSeconds),
    targetArmourFactor: armourFactorOf(struck, actor.attackKind, timeSeconds),
    attackBonus: empowerAttackBonusOf(attacker, timeSeconds),
  });
  const taken = takeDamage(struck, damage.amount, timeSeconds);
  gainResourceFromHit(actor, target);
  const attackEvent: BattleEvent = {
    timeSeconds,
    kind: 'attack',
    actorId: actor.id,
    targetId: target.id,
    amount: damage.amount,
    isCritical: damage.isCritical,
    targetHpAfter: target.hp,
    actorResourceAfter: actor.resource,
    targetResourceAfter: target.resource,
    ...shieldFieldsOf(struck, taken),
  };
  const damageThatLanded = damage.amount - taken.absorbed;
  return [attackEvent, ...applyLifeSteal(actor, damageThatLanded, timeSeconds), ...reflectThorns(attacker, struck, damageThatLanded, timeSeconds)];
}

export function resolveBasicHeal(healer: Combatant, healed: Combatant, timeSeconds: number): BattleEvent[] {
  const actor = healer.unit;
  const target = healed.unit;
  const healedAmount = Math.min(target.maxHp - target.hp, Math.round(actor.attack * HEAL_POWER_MULTIPLIER * (1 - statusStrength(healed, 'wound', timeSeconds))));
  target.hp += healedAmount;
  return [{ timeSeconds, kind: 'heal', actorId: actor.id, targetId: target.id, amount: healedAmount, isCritical: false, targetHpAfter: target.hp, actorResourceAfter: actor.resource, targetResourceAfter: target.resource }];
}
