import { PALETTE } from '../palette';
import type { PixelCanvas } from '../pixelCanvas';
import { buildFrames, plotBlock, plotLine, plotRing, plotStar } from './drawingTools';
import { EFFECT_CENTER, EFFECT_FRAME_SIZE, type EffectArtBuilder } from './effectArt';

const SIZE = EFFECT_FRAME_SIZE;
const CENTER = EFFECT_CENTER;
const FRAME_COUNT = 9;
// About 0.75 seconds. The old impacts lasted about 0.25 seconds, so the metal stays on the enemy longer.
const FRAMES_PER_SECOND = 12;
const SPARK_COUNT = 9;

// Hot sparks fly out of the hit and fall. The last frames keep only a few of them, so the effect fades out and does not vanish.
function plotSparks(frame: PixelCanvas, sparkProgress: number): void {
  if (sparkProgress <= 0) return;
  for (let spark = 0; spark < SPARK_COUNT; spark++) {
    if (sparkProgress > 0.8 && spark % 2 === 1) continue;
    const angle = (spark / SPARK_COUNT) * Math.PI * 2 + 0.5;
    const distance = 4 + sparkProgress * (10 + (spark % 3) * 4);
    const x = CENTER + Math.round(Math.cos(angle) * distance);
    const y = CENTER + Math.round(Math.sin(angle) * distance + sparkProgress * sparkProgress * 9);
    plotBlock(frame, sparkProgress < 0.5 ? PALETTE.flameBright : PALETTE.flame, x, y, 2, 1);
  }
}

// One heavy blade stroke cuts from the upper right to the lower left. It leaves a scratch in the metal that fades slowly.
const steelSlash: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: FRAMES_PER_SECOND,
  looping: false,
  frames: buildFrames(FRAME_COUNT, SIZE, SIZE, (frame, progress) => {
    const cutProgress = Math.min(1, progress * 3);
    const tipX = CENTER + 16 - Math.round(32 * cutProgress);
    const tipY = CENTER - 16 + Math.round(32 * cutProgress);
    const thickness = progress < 0.55 ? 3 : 2;
    if (progress < 0.85) {
      plotLine(frame, dark, CENTER + 16, CENTER - 16, tipX, tipY, thickness + 2);
      plotLine(frame, main, CENTER + 16, CENTER - 16, tipX, tipY, thickness);
    }
    if (progress < 0.7) plotLine(frame, light, CENTER + 15, CENTER - 16, tipX + 1, tipY - 1, 1);
    if (progress >= 0.3 && progress < 0.55) plotStar(frame, light, CENTER, CENTER, 1, 9, 4, Math.PI / 4, 1);
    plotSparks(frame, (progress - 0.3) / 0.7);
  }),
});

// Draws a heater shield. The top is flat and the bottom narrows to a point.
function plotIronPlate(frame: PixelCanvas, halfWidth: number, halfHeight: number, colors: { main: string; light: string; dark: string }): void {
  for (let row = -halfHeight; row <= halfHeight; row++) {
    const rowHalfWidth = row <= 0 ? halfWidth : Math.max(1, Math.round(halfWidth * (1 - row / (halfHeight + 1))));
    frame.fill(colors.dark as `#${string}`, CENTER - rowHalfWidth - 1, CENTER + row, rowHalfWidth * 2 + 3, 1);
    frame.fill(colors.main as `#${string}`, CENTER - rowHalfWidth, CENTER + row, rowHalfWidth * 2 + 1, 1);
    frame.fill(colors.light as `#${string}`, CENTER - rowHalfWidth + 1, CENTER + row, 2, 1);
  }
  frame.fill(colors.dark as `#${string}`, CENTER - halfWidth, CENTER - halfHeight - 1, halfWidth * 2 + 1, 1);
  for (const rivetX of [-halfWidth + 2, halfWidth - 2]) plotBlock(frame, colors.light, CENTER + rivetX, CENTER - halfHeight + 3, 2, 2);
}

// An iron plate slams onto the enemy, rings out a shock wave and cracks. The plate stays and fades.
const ironBash: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: FRAMES_PER_SECOND,
  looping: false,
  frames: buildFrames(FRAME_COUNT, SIZE, SIZE, (frame, progress) => {
    const slamProgress = Math.min(1, progress / 0.3);
    const scale = 1.5 - 0.5 * slamProgress;
    const faded = progress > 0.8;
    plotIronPlate(frame, Math.round(7 * scale), Math.round(9 * scale), faded ? { main: dark, light: dark, dark } : { main, light, dark });
    if (progress < 0.3) return;
    const waveProgress = (progress - 0.3) / 0.7;
    plotRing(frame, light, CENTER, CENTER, 8 + Math.round(waveProgress * 14));
    if (waveProgress < 0.7) plotRing(frame, dark, CENTER, CENTER, 6 + Math.round(waveProgress * 10));
    for (const crackAngle of [0.6, 2.4, 4.0]) {
      const crackLength = 4 + Math.round(waveProgress * 8);
      plotLine(frame, dark, CENTER + Math.cos(crackAngle) * 3, CENTER + Math.sin(crackAngle) * 3, CENTER + Math.cos(crackAngle) * crackLength, CENTER + Math.sin(crackAngle) * crackLength);
    }
    plotSparks(frame, waveProgress);
  }),
});

// Two curved blade sweeps, one inside the other, cut across the enemy. Their scratches stay and fade.
const steelCleave: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: FRAMES_PER_SECOND,
  looping: false,
  frames: buildFrames(FRAME_COUNT, SIZE, SIZE, (frame, progress) => {
    const sweeps = [{ radius: 17, delay: 0, thickness: 3 }, { radius: 10, delay: 0.12, thickness: 2 }];
    for (const { radius, delay, thickness } of sweeps) {
      const sweepProgress = Math.min(1, Math.max(0, (progress - delay) * 3));
      if (sweepProgress <= 0 || progress > 0.85) continue;
      const leadingAngle = -1.3 + 2.6 * sweepProgress;
      for (let angle = -1.3; angle <= leadingAngle; angle += 0.08) {
        const x = CENTER - 8 + Math.cos(angle) * radius;
        const y = CENTER + Math.sin(angle) * radius;
        plotBlock(frame, dark, x, y, thickness + 2, thickness + 2);
        plotBlock(frame, angle > leadingAngle - 0.4 ? light : main, x, y, thickness, thickness);
      }
    }
    plotSparks(frame, (progress - 0.35) / 0.65);
  }),
});

export const STEEL_IMPACT_ART = {
  'steel-slash': steelSlash,
  'iron-bash': ironBash,
  'steel-cleave': steelCleave,
};
