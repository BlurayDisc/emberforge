import data from '../../../data/balance/resources.json';
import type { ResourceId } from '../../model/resource';
import type { StatBlock } from '../../model/statBlock';

export interface ResourceRules {
  maximumBase: number;
  maximumPerLevel: number;
  attribute: keyof StatBlock;
  maximumPerAttributePoint: number;
  startFraction: number;
  regenFractionPerSecond: number;
  gainFractionPerHitDealt: number;
  gainFractionPerHitTaken: number;
}

export const RESOURCE_RULES = data as Record<ResourceId, ResourceRules>;
