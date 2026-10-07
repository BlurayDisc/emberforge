import type { Texture } from 'pixi.js';
import { createPixelCanvas } from './pixelCanvas';
import { PALETTE } from './palette';
import { createPixiTexture } from './pixiTextures';

export const SLASH_FRAME_COUNT = 5;

export type SlashSize = 'small' | 'large';
const SLASH_DIMENSIONS: Readonly<Record<SlashSize, { outerRadius: number; maximumBandWidth: number }>> = {
  small: { outerRadius: 13, maximumBandWidth: 5 },
  large: { outerRadius: 22, maximumBandWidth: 8 },
};
// A unit shorter than this draws the small slash.
export const SMALL_SLASH_BELOW_SPRITE_HEIGHT = 30;
const START_DEGREES = -62;
const SWEEP_DEGREES = 124;
const HEAD_FRAMES = 3;
const MINIMUM_VISIBLE_DEGREES = 14;
const ANGLE_STEP_DEGREES = 1;
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

// One frame of a blade sweeping down across the front of the unit. The bright head moves on and the tail catches up, so the arc fades out.
// The frame looks to the right. The stage mirrors it for a unit that looks left.
function drawSlashFrame(frameIndex: number, size: SlashSize): HTMLCanvasElement {
  const { outerRadius, maximumBandWidth } = SLASH_DIMENSIONS[size];
  const frameHeight = 2 * outerRadius + 4;
  const arcCenter = { x: 0, y: frameHeight / 2 };
  const frame = createPixelCanvas(outerRadius + 4, frameHeight);
  const headDegrees = START_DEGREES + SWEEP_DEGREES * Math.min(1, (frameIndex + 1) / HEAD_FRAMES);
  const tailDegrees = Math.min(headDegrees - MINIMUM_VISIBLE_DEGREES, START_DEGREES + SWEEP_DEGREES * Math.max(0, (frameIndex - 1) / HEAD_FRAMES));
  for (let degrees = tailDegrees; degrees <= headDegrees; degrees += ANGLE_STEP_DEGREES) {
    const progressToHead = (degrees - tailDegrees) / (headDegrees - tailDegrees);
    const bandWidth = Math.max(1, Math.round(maximumBandWidth * progressToHead));
    for (let band = 0; band < bandWidth; band++) {
      const radius = outerRadius - band;
      const color = band === 0 ? PALETTE.cloud : band === 1 ? PALETTE.steel : band < bandWidth - 1 ? PALETTE.ash : PALETTE.shadow;
      frame.fill(color, arcCenter.x + Math.cos(toRadians(degrees)) * radius, arcCenter.y + Math.sin(toRadians(degrees)) * radius, 1, 1);
    }
  }
  if (frameIndex >= 1) {
    const sparkX = arcCenter.x + Math.cos(toRadians(headDegrees)) * (outerRadius + 2);
    const sparkY = arcCenter.y + Math.sin(toRadians(headDegrees)) * (outerRadius + 2);
    frame.fill(PALETTE.gold, sparkX, sparkY, 2, 2);
    frame.fill(PALETTE.cloud, sparkX + 1, sparkY - 3 + frameIndex, 1, 1);
  }
  return frame.canvas;
}

const cachedFramesBySize = new Map<SlashSize, Texture[]>();

export function slashFrameTextures(size: SlashSize): readonly Texture[] {
  let frames = cachedFramesBySize.get(size);
  if (!frames) {
    frames = Array.from({ length: SLASH_FRAME_COUNT }, (_, frameIndex) => createPixiTexture(drawSlashFrame(frameIndex, size)));
    cachedFramesBySize.set(size, frames);
  }
  return frames;
}
