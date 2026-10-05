import { clamp } from './math';

export interface HealthBarLengthScale {
  lengthPerRootPoint: number;
  minimum: number;
  maximum: number;
}

// The square root keeps a 40 HP hero and a 400 HP monster both readable. The bar grows only when the maximum health grows.
export function healthBarLength(maximumHealth: number, scale: HealthBarLengthScale): number {
  return Math.round(clamp(Math.sqrt(Math.max(0, maximumHealth)) * scale.lengthPerRootPoint, scale.minimum, scale.maximum));
}
