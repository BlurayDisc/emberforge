import { RESOURCE_RULES } from '../../content/balance/resources';
import type { ResourceId } from '../../model/resource';

export function startingResourceOf(resourceId: ResourceId, maxResource: number): number {
  return maxResource * RESOURCE_RULES[resourceId].startFraction;
}

export function maximumResourceOf(resourceId: ResourceId): number {
  return RESOURCE_RULES[resourceId].maximum;
}
