import {
  BASE_MOVEMENT_SPEED,
  BODY_RADIUS_BY_RANK,
  CLASS_MOVEMENT_PROFILES,
  DEFAULT_MOVEMENT_PROFILE,
  FIELD_LENGTH,
  MELEE_REACH,
  MONSTER_MOVEMENT_PROFILES,
  MONSTER_RANK_MOVEMENT_PROFILES,
  type MovementProfile,
} from '../../../content/balance/battlefield';
import type { BattleUnit } from '../../../model/battle';

export type BattleUnitWithMovement = BattleUnit & { movementSpeedBonus?: number };

// A hero is looked up by class id (its definitionId). A monster by its own id first, then by its rank.
export function movementProfileOf(unit: BattleUnit): MovementProfile {
  if (unit.rank === 'hero') return CLASS_MOVEMENT_PROFILES[unit.definitionId] ?? DEFAULT_MOVEMENT_PROFILE;
  return MONSTER_MOVEMENT_PROFILES[unit.definitionId] ?? MONSTER_RANK_MOVEMENT_PROFILES[unit.rank] ?? DEFAULT_MOVEMENT_PROFILE;
}

export const isRangedProfile = (profile: MovementProfile): boolean => profile.rangeFieldFraction > 0;

export const attackReachOf = (profile: MovementProfile): number => (isRangedProfile(profile) ? profile.rangeFieldFraction * FIELD_LENGTH : MELEE_REACH);

export const movementSpeedOf = (unit: BattleUnitWithMovement, profile: MovementProfile): number => BASE_MOVEMENT_SPEED * profile.movementSpeedFactor * (1 + (unit.movementSpeedBonus ?? 0));

export const bodyRadiusOf = (unit: BattleUnit): number => BODY_RADIUS_BY_RANK[unit.rank];
