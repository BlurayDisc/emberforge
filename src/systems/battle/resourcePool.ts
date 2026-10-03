import { RESOURCE_RULES } from '../../content/balance/resources';
import type { BattleUnit } from '../../model/battle';

type ResourceHolder = Pick<BattleUnit, 'resourceId' | 'resource' | 'maxResource'>;

function addToResource(unit: ResourceHolder, amount: number): void {
  unit.resource = Math.min(unit.maxResource, Math.max(0, unit.resource + amount));
}

export function regenerateResource(unit: ResourceHolder, seconds: number): void {
  addToResource(unit, unit.maxResource * RESOURCE_RULES[unit.resourceId].regenFractionPerSecond * seconds);
}

export function spendResource(unit: ResourceHolder, cost: number): void {
  addToResource(unit, -cost);
}

// Rage builds from fighting. A unit with no pool (a monster) gains nothing.
export function gainResourceFromHit(attacker: ResourceHolder, target: ResourceHolder): void {
  addToResource(attacker, attacker.maxResource * RESOURCE_RULES[attacker.resourceId].gainFractionPerHitDealt);
  addToResource(target, target.maxResource * RESOURCE_RULES[target.resourceId].gainFractionPerHitTaken);
}
