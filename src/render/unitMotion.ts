import type { UnitMotionState, UnitTrack } from '../model/realtimeBattle';
import type { ActionWindow } from './unitActionWindows';

const MELEE_WINDUP_PULL_BACK_PIXELS = 4;
const MELEE_LUNGE_PIXELS = 9;
const RANGED_DRAW_PIXELS = 3;
const RANGED_RECOIL_PIXELS = 2;
const FOLLOW_THROUGH_SECONDS = 0.3;
const CAST_RAISE_PIXELS = 3;
const CAST_RAISE_RAMP_FRACTION = 0.25;
const CAST_GLOW_PULSES_PER_SECOND = 6;
const RUN_HOPS_RADIANS_PER_SECOND = 14;
const RUN_HOP_PIXELS = 2;
const IDLE_BREATH_RADIANS_PER_SECOND = 3;

// What the stage draws for one unit at one moment. forwardPixels is along the facing of the unit, liftPixels is up.
export interface UnitPlacement {
  fieldX: number;
  fieldY: number;
  facing: 1 | -1;
  state: UnitMotionState;
  forwardPixels: number;
  liftPixels: number;
  isGlowing: boolean;
}

export function createUnitPlacement(): UnitPlacement {
  return { fieldX: 0, fieldY: 0, facing: 1, state: 'idle', forwardPixels: 0, liftPixels: 0, isGlowing: false };
}

export interface UnitMotion {
  sampleAt(timeSeconds: number, out: UnitPlacement): void;
}

function poseOfWindow(window: ActionWindow, timeSeconds: number, out: UnitPlacement): void {
  if (window.kind === 'cast') {
    const castSeconds = Math.max(0.001, window.releaseSeconds - window.startSeconds);
    if (timeSeconds < window.releaseSeconds) {
      out.liftPixels = Math.round(CAST_RAISE_PIXELS * Math.min(1, (timeSeconds - window.startSeconds) / (castSeconds * CAST_RAISE_RAMP_FRACTION)));
      out.isGlowing = Math.floor(timeSeconds * CAST_GLOW_PULSES_PER_SECOND) % 2 === 0;
    } else {
      out.forwardPixels = RANGED_RECOIL_PIXELS * (1 - (timeSeconds - window.releaseSeconds) / Math.max(0.001, window.endSeconds - window.releaseSeconds));
    }
    return;
  }
  if (timeSeconds < window.releaseSeconds) {
    const windupProgress = (timeSeconds - window.startSeconds) / Math.max(0.001, window.releaseSeconds - window.startSeconds);
    out.forwardPixels = -(window.isRanged || window.isHeal ? RANGED_DRAW_PIXELS : MELEE_WINDUP_PULL_BACK_PIXELS) * windupProgress;
    return;
  }
  const followProgress = (timeSeconds - window.releaseSeconds) / Math.min(FOLLOW_THROUGH_SECONDS, Math.max(0.001, window.endSeconds - window.releaseSeconds));
  if (followProgress >= 1) return;
  out.forwardPixels = (window.isRanged || window.isHeal ? RANGED_RECOIL_PIXELS : MELEE_LUNGE_PIXELS) * (1 - followProgress);
}

// The tracks hold where and in which state a unit is at every tick. The action windows add the poses between the ticks: windup, strike, cast.
// There are no run or attack frames in the sprites, so the motion is a hop, a pull back and a lunge, all in whole pixels.
export function createUnitMotion(track: UnitTrack, tickSeconds: number, windows: readonly ActionWindow[], bobPhase: number): UnitMotion {
  const lastTick = track.x.length - 1;
  let windowCursor = 0;
  return {
    sampleAt: (timeSeconds, out) => {
      const exactTick = Math.min(lastTick, Math.max(0, timeSeconds / tickSeconds));
      const tick = Math.floor(exactTick);
      const nextTick = Math.min(lastTick, tick + 1);
      const blend = exactTick - tick;
      out.fieldX = (track.x[tick] as number) + ((track.x[nextTick] as number) - (track.x[tick] as number)) * blend;
      out.fieldY = (track.y[tick] as number) + ((track.y[nextTick] as number) - (track.y[tick] as number)) * blend;
      out.facing = track.facing[tick] as 1 | -1;
      out.state = track.state[tick] as UnitMotionState;
      out.forwardPixels = 0;
      out.liftPixels = 0;
      out.isGlowing = false;
      if (out.state === 'dead') return;
      if (windows.length > 0 && windows[windowCursor] && timeSeconds < (windows[windowCursor] as ActionWindow).startSeconds) windowCursor = 0;
      while (windowCursor + 1 < windows.length && (windows[windowCursor + 1] as ActionWindow).startSeconds <= timeSeconds) windowCursor += 1;
      const window = windows[windowCursor];
      if (window && timeSeconds >= window.startSeconds && timeSeconds < window.endSeconds) {
        poseOfWindow(window, timeSeconds, out);
        return;
      }
      if (out.state === 'moving') out.liftPixels = Math.round(Math.abs(Math.sin(timeSeconds * RUN_HOPS_RADIANS_PER_SECOND + bobPhase)) * RUN_HOP_PIXELS);
      else out.liftPixels = Math.max(0, Math.round(Math.sin(timeSeconds * IDLE_BREATH_RADIANS_PER_SECOND + bobPhase)));
    },
  };
}
