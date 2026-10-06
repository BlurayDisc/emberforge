import { RESOURCE_RULES } from '../../content/balance/resources';
import type { ResourceId } from '../../model/resource';
import type { StatBlock } from '../../model/statBlock';

export function startingResourceOf(resourceId: ResourceId, maxResource: number): number {
  return maxResource * RESOURCE_RULES[resourceId].startFraction;
}

export function maximumResourceOf(resourceId: ResourceId, stats: StatBlock, level: number): number {
  const rules = RESOURCE_RULES[resourceId];
  return Math.round(rules.maximumBase + rules.maximumPerLevel * level + rules.maximumPerAttributePoint * stats[rules.attribute]);
}
