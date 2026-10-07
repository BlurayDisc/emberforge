import data from '../../../data/balance/resources.json';
import type { ResourceId } from '../../model/resource';

// The pool is fixed: no level and no attribute changes the maximum.
export interface ResourceRules {
  maximum: number;
  startFraction: number;
  regenFractionPerSecond: number;
  gainFractionPerHitDealt: number;
  gainFractionPerHitTaken: number;
}

export const RESOURCE_RULES = data as Record<ResourceId, ResourceRules>;
