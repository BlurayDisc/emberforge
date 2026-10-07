import { TARGET_SWITCH_DISTANCE_MARGIN } from '../../../content/balance/battlefield';
import { edgeDistanceBetween, isAlive, unitIdOf, type RealtimeUnit } from './realtimeUnit';

// Nearest enemy by edge distance. The unit keeps its current target unless another enemy is closer by the margin,
// so two enemies at nearly the same distance do not make it flicker.
// avoidId is a target that the unit could not reach for a while: the unit picks another one if there is one.
export function chooseEnemyTarget(actor: RealtimeUnit, enemies: readonly RealtimeUnit[], avoidId: string | null = null): RealtimeUnit | null {
  const living = enemies.filter(isAlive);
  if (living.length === 0) return null;
  const candidates = avoidId !== null && living.length > 1 ? living.filter((enemy) => unitIdOf(enemy) !== avoidId) : living;
  const nearest = candidates.reduce((best, enemy) => (edgeDistanceBetween(actor, enemy) < edgeDistanceBetween(actor, best) ? enemy : best));
  const current = candidates.find((enemy) => unitIdOf(enemy) === actor.targetId);
  if (current && edgeDistanceBetween(actor, nearest) + TARGET_SWITCH_DISTANCE_MARGIN >= edgeDistanceBetween(actor, current)) return current;
  return nearest;
}
