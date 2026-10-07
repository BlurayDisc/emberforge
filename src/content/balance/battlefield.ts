import data from '../../../data/balance/battlefield.json';
import type { UnitRank } from '../../model/battle';

export interface MovementProfile {
  // 0 means melee. Otherwise the share of the field length that the unit can hit across.
  rangeFieldFraction: number;
  movementSpeedFactor: number;
}

export const TICK_SECONDS = data.tickSeconds;
export const FIELD_LENGTH = data.fieldLength;
export const FIELD_DEPTH = data.fieldDepth;
export const MELEE_REACH = data.meleeReach;
export const BODY_OVERLAP_TOLERANCE = data.bodyOverlapTolerance;
export const BASE_MOVEMENT_SPEED = data.baseMovementSpeed;
export const MELEE_MEET_SECONDS = data.meleeMeetSeconds;
export const TARGET_SWITCH_DISTANCE_MARGIN = data.targetSwitchDistanceMargin;
export const UNREACHABLE_SWITCH_SECONDS = data.unreachableSwitchSeconds;
export const RANGED_START_OFFSET = data.rangedStartOffset;
export const ATTACK_HIT_FRACTION = data.attackHitFraction;
export const STEERING_ANGLES_DEGREES: readonly number[] = data.steeringAnglesDegrees;

export const DEFAULT_MOVEMENT_PROFILE: MovementProfile = data.defaultProfile;
export const CLASS_MOVEMENT_PROFILES: Readonly<Record<string, MovementProfile>> = data.classProfiles;
export const MONSTER_RANK_MOVEMENT_PROFILES: Readonly<Record<string, MovementProfile>> = data.monsterRankProfiles;
export const MONSTER_MOVEMENT_PROFILES: Readonly<Record<string, MovementProfile>> = data.monsterProfiles;
export const BODY_RADIUS_BY_RANK = data.bodyRadiusByRank as Record<UnitRank, number>;
export const SPELL_RANGE_FIELD_FRACTIONS: Readonly<Record<string, number>> = data.spellRangeFieldFractions;
