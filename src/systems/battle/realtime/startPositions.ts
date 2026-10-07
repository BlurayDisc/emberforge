import { BASE_MOVEMENT_SPEED, FIELD_DEPTH, FIELD_LENGTH, MELEE_MEET_SECONDS, MELEE_REACH, RANGED_START_OFFSET } from '../../../content/balance/battlefield';
import type { RealtimeUnit } from './realtimeUnit';

// The gap is set so two melee units of base speed that run at each other meet after MELEE_MEET_SECONDS.
function meleeLineX(side: 'party' | 'enemy', bodyRadius: number): number {
  const contactDistance = 2 * bodyRadius + MELEE_REACH;
  const separation = MELEE_MEET_SECONDS * 2 * BASE_MOVEMENT_SPEED + contactDistance;
  const partyLineX = (FIELD_LENGTH - separation) / 2;
  return side === 'party' ? partyLineX : FIELD_LENGTH - partyLineX;
}

// One side stands spread across the depth of the field. Ranged units stand behind the melee line when the side has a melee unit.
// A side with no melee unit stands on one line.
export function placeOnStartPositions(sideUnits: RealtimeUnit[], side: 'party' | 'enemy'): void {
  const hasMeleeUnit = sideUnits.some((unit) => !unit.isRanged);
  sideUnits.forEach((unit, index) => {
    const lineX = meleeLineX(side, unit.bodyRadius);
    const behindOffset = unit.isRanged && hasMeleeUnit ? RANGED_START_OFFSET : 0;
    const x = side === 'party' ? lineX - behindOffset : lineX + behindOffset;
    unit.x = Math.min(FIELD_LENGTH - unit.bodyRadius, Math.max(unit.bodyRadius, x));
    unit.y = (FIELD_DEPTH * (index + 1)) / (sideUnits.length + 1);
    unit.facing = side === 'party' ? 1 : -1;
  });
}
