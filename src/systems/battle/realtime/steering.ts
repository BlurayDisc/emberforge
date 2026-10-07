import { BODY_OVERLAP_TOLERANCE, FIELD_DEPTH, FIELD_LENGTH, STEERING_ANGLES_DEGREES } from '../../../content/balance/battlefield';
import { isAlive, type RealtimeUnit } from './realtimeUnit';

interface Point {
  x: number;
  y: number;
}

const clampToField = (point: Point, bodyRadius: number): Point => ({
  x: Math.min(FIELD_LENGTH - bodyRadius, Math.max(bodyRadius, point.x)),
  y: Math.min(FIELD_DEPTH - bodyRadius, Math.max(bodyRadius, point.y)),
});

// A step is free when it does not push the body into another body beyond the tolerance. A step that does not bring the bodies closer is always free,
// so a unit that starts inside the tolerance can still walk away.
function blockerAt(mover: RealtimeUnit, point: Point, others: readonly RealtimeUnit[]): RealtimeUnit | null {
  for (const other of others) {
    if (other === mover || !isAlive(other)) continue;
    const touchingDistance = mover.bodyRadius + other.bodyRadius - BODY_OVERLAP_TOLERANCE;
    const newDistance = Math.hypot(point.x - other.x, point.y - other.y);
    if (newDistance < touchingDistance && newDistance < Math.hypot(mover.x - other.x, mover.y - other.y)) return other;
  }
  return null;
}

// The unit steps straight at the goal. When a body is in the way it turns by a fixed set of angles, away from the blocker, and keeps that side
// until the straight way is free, so it slides round without jitter. Returns how far it moved.
export function stepToward(mover: RealtimeUnit, goal: Point, others: readonly RealtimeUnit[], stepLength: number): number {
  const distanceToGoal = Math.hypot(goal.x - mover.x, goal.y - mover.y);
  if (distanceToGoal < 1e-9) return 0;
  const directionX = (goal.x - mover.x) / distanceToGoal;
  const directionY = (goal.y - mover.y) / distanceToGoal;
  const length = Math.min(stepLength, distanceToGoal);
  const stepAt = (angleRadians: number): Point =>
    clampToField({ x: mover.x + length * (directionX * Math.cos(angleRadians) - directionY * Math.sin(angleRadians)), y: mover.y + length * (directionX * Math.sin(angleRadians) + directionY * Math.cos(angleRadians)) }, mover.bodyRadius);

  const straightStep = stepAt(0);
  const straightBlocker = blockerAt(mover, straightStep, others);
  let chosenStep: Point | null = straightBlocker === null ? straightStep : null;
  if (straightBlocker === null) mover.slideSign = 0;
  if (chosenStep === null) {
    if (mover.slideSign === 0) {
      const blockerIsToTheLeft = directionX * (straightBlocker!.y - mover.y) - directionY * (straightBlocker!.x - mover.x) > 0;
      mover.slideSign = blockerIsToTheLeft ? -1 : 1;
    }
    for (const angleDegrees of STEERING_ANGLES_DEGREES) {
      for (const sign of [mover.slideSign, -mover.slideSign]) {
        const candidate = stepAt((sign * angleDegrees * Math.PI) / 180);
        if (blockerAt(mover, candidate, others) === null) {
          chosenStep = candidate;
          break;
        }
      }
      if (chosenStep) break;
    }
  }
  if (chosenStep === null) return 0;
  const moved = Math.hypot(chosenStep.x - mover.x, chosenStep.y - mover.y);
  mover.x = chosenStep.x;
  mover.y = chosenStep.y;
  return moved;
}
