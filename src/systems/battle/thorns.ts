import type { BattleEvent } from '../../model/battle';
import { statusStrength, type Combatant } from './combatant';
import { shieldFieldsOf, takeDamage } from './damageTaken';

// The damage that comes back ignores armour. Thorns never trigger on damage that Thorns sent back, because the reflected hit is not a normal hit.
// damageTaken is the health the wearer lost, so a shield that absorbed the hit reflects nothing.
export function reflectThorns(attacker: Combatant, struck: Combatant, damageTaken: number, timeSeconds: number): BattleEvent[] {
  if (struck.unit.hp <= 0 || attacker.unit.hp <= 0) return [];
  const reflectedDamage = Math.round(damageTaken * statusStrength(struck, 'thorns', timeSeconds));
  if (reflectedDamage <= 0) return [];
  const taken = takeDamage(attacker, reflectedDamage, timeSeconds);
  return [{
    timeSeconds,
    kind: 'attack',
    actorId: struck.unit.id,
    targetId: attacker.unit.id,
    amount: reflectedDamage,
    isCritical: false,
    targetHpAfter: attacker.unit.hp,
    actorResourceAfter: struck.unit.resource,
    targetResourceAfter: attacker.unit.resource,
    isReflect: true,
    ...shieldFieldsOf(attacker, taken),
  }];
}
