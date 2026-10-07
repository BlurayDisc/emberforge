import { BURN_TICK_SECONDS } from '../../content/balance/battle';
import type { BattleEvent } from '../../model/battle';
import { armourFactorOf, statusStrength, type Combatant } from './combatant';

export interface DamageTaken {
  hpLost: number;
  absorbed: number;
}

// The shield takes the damage first. What is left hurts the health.
export function takeDamage(struck: Combatant, amount: number, timeSeconds: number): DamageTaken {
  const shieldLeft = struck.shield && struck.shield.expiresAtSeconds > timeSeconds ? struck.shield.remaining : 0;
  const absorbed = Math.min(shieldLeft, amount);
  if (struck.shield) struck.shield = absorbed === shieldLeft ? null : { ...struck.shield, remaining: shieldLeft - absorbed };
  const hpLost = Math.min(struck.unit.hp, amount - absorbed);
  struck.unit.hp -= hpLost;
  return { hpLost, absorbed };
}

// The shield fields of an event. A unit that never had a shield adds nothing to its events.
export function shieldFieldsOf(struck: Combatant, taken: DamageTaken): Pick<BattleEvent, 'absorbed' | 'targetShieldAfter'> {
  if (taken.absorbed === 0 && struck.shield === null) return {};
  return { absorbed: taken.absorbed, targetShieldAfter: struck.shield?.remaining ?? 0 };
}

// A unit with Evade dodges the hit and spends one charge. The last charge ends the status.
export function dodgesHit(struck: Combatant, timeSeconds: number): boolean {
  const evade = struck.statuses.find((active) => active.status === 'evade' && active.expiresAtSeconds > timeSeconds && (active.charges ?? 0) > 0);
  if (!evade) return false;
  const chargesLeft = (evade.charges ?? 0) - 1;
  struck.statuses = chargesLeft > 0
    ? struck.statuses.map((active) => (active === evade ? { ...active, charges: chargesLeft } : active))
    : struck.statuses.filter((active) => active !== evade);
  return true;
}

export function dodgeEvent(attacker: Combatant, struck: Combatant, timeSeconds: number, spellId?: string): BattleEvent {
  return {
    timeSeconds,
    kind: 'attack',
    actorId: attacker.unit.id,
    targetId: struck.unit.id,
    amount: 0,
    isCritical: false,
    isDodge: true,
    targetHpAfter: struck.unit.hp,
    actorResourceAfter: attacker.unit.resource,
    targetResourceAfter: struck.unit.resource,
    ...(spellId === undefined ? {} : { spellId }),
  };
}

// Burn is magic damage from the attack of the caster, minus the Resistance of the target. It has no swing and no critical hit, so it is easy to read.
export function burnTickEvents(combatants: readonly Combatant[], timeSeconds: number): BattleEvent[] {
  const events: BattleEvent[] = [];
  for (const burning of combatants) {
    if (burning.unit.hp <= 0) continue;
    const burn = burning.statuses.find((active) => active.status === 'burn' && active.burn);
    if (!burn?.burn || burn.burn.nextTickAtSeconds > timeSeconds) continue;
    if (burn.burn.nextTickAtSeconds <= burn.expiresAtSeconds) {
      const source = combatants.find((candidate) => candidate.unit.id === burn.burn?.sourceId);
      const hexFactor = 1 + statusStrength(burning, 'hex', timeSeconds);
      const resistance = burning.unit.resistance * armourFactorOf(burning, 'magic', timeSeconds);
      const taken = takeDamage(burning, Math.max(1, Math.round(burn.burn.sourceAttack * burn.strength * hexFactor - resistance)), timeSeconds);
      events.push({
        timeSeconds,
        kind: 'attack',
        actorId: burn.burn.sourceId,
        targetId: burning.unit.id,
        amount: taken.hpLost + taken.absorbed,
        isCritical: false,
        isDamageOverTime: true,
        targetHpAfter: burning.unit.hp,
        actorResourceAfter: source?.unit.resource ?? 0,
        targetResourceAfter: burning.unit.resource,
        ...shieldFieldsOf(burning, taken),
      });
    }
    const nextTickAtSeconds = Math.round((burn.burn.nextTickAtSeconds + BURN_TICK_SECONDS) * 10) / 10;
    burning.statuses = nextTickAtSeconds <= burn.expiresAtSeconds
      ? burning.statuses.map((active) => (active === burn ? { ...active, burn: { ...burn.burn!, nextTickAtSeconds } } : active))
      : burning.statuses.filter((active) => active !== burn);
  }
  return events;
}
