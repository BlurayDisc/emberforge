import type { RealtimeActionEvent } from '../model/realtimeBattle';

export interface ActionWindow {
  kind: 'attack' | 'cast';
  startSeconds: number;
  // The moment the blow lands, the arrow leaves, or the spell effect shows.
  releaseSeconds: number;
  endSeconds: number;
  isRanged: boolean;
  isHeal: boolean;
}

// An instant spell has no cast time. It still shows its pose for this long, so the player can see it.
const MINIMUM_CAST_POSE_SECONDS = 0.3;

export function actionWindowsByUnit(actionEvents: readonly RealtimeActionEvent[]): Map<string, ActionWindow[]> {
  const windowsByUnit = new Map<string, ActionWindow[]>();
  const add = (unitId: string, window: ActionWindow): void => {
    const windows = windowsByUnit.get(unitId);
    if (windows) windows.push(window);
    else windowsByUnit.set(unitId, [window]);
  };
  for (const event of actionEvents) {
    if (event.kind === 'attackStart') add(event.actorId, { kind: 'attack', startSeconds: event.timeSeconds, releaseSeconds: event.hitAtSeconds, endSeconds: event.endsAtSeconds, isRanged: event.projectile, isHeal: event.isHeal });
    else if (event.kind === 'castStart') add(event.actorId, { kind: 'cast', startSeconds: event.timeSeconds, releaseSeconds: event.effectAtSeconds, endSeconds: Math.max(event.effectAtSeconds, event.timeSeconds + MINIMUM_CAST_POSE_SECONDS), isRanged: false, isHeal: false });
  }
  windowsByUnit.forEach((windows) => windows.sort((first, second) => first.startSeconds - second.startSeconds));
  return windowsByUnit;
}
