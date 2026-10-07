import data from '../../../data/balance/monster-scaling.json';
import type { CurveAnchor } from '../../kernel/math';
import { interpolateLinearCurve } from '../../kernel/math';

export const DEFAULT_MONSTER_ATTACK_SECONDS = data.defaultAttackSeconds;

export interface MonsterLevelStats {
  hp: number;
  damage: number;
  armour: number;
  resistance: number;
}

const curveOf = (stat: keyof MonsterLevelStats): CurveAnchor[] => data.anchors.map((anchor) => ({ x: anchor.level, y: anchor[stat] }));
const HP_CURVE = curveOf('hp');
const DAMAGE_CURVE = curveOf('damage');
const ARMOUR_CURVE = curveOf('armour');
const RESISTANCE_CURVE = curveOf('resistance');

// The stats of a normal monster (statFactor 1) at a level. The last segment goes on above the last anchor.
export function monsterStatsAtLevel(level: number): MonsterLevelStats {
  return {
    hp: interpolateLinearCurve(HP_CURVE, level),
    damage: interpolateLinearCurve(DAMAGE_CURVE, level),
    armour: Math.max(0, interpolateLinearCurve(ARMOUR_CURVE, level)),
    resistance: Math.max(0, interpolateLinearCurve(RESISTANCE_CURVE, level)),
  };
}
