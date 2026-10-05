import type { BuffArtId, DebuffArtId } from '../../content/spellVisuals';
import { PALETTE } from '../palette';
import { buildFrames, plotBlock, plotDiamond, plotDisc, plotLine, plotPixel, plotRing, scatterOffset } from './drawingTools';
import { EFFECT_CENTER, EFFECT_FRAME_SIZE, type EffectArtBuilder } from './effectArt';

const SIZE = EFFECT_FRAME_SIZE;
const CENTER = EFFECT_CENTER;

// A status art loops for as long as the status lasts, and stays on its unit.
const guardShield: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 6,
  looping: true,
  frames: buildFrames(4, SIZE, SIZE, (frame, _progress, index) => {
    const radiusX = 15 + (index % 2);
    const radiusY = 19 + (index % 2);
    plotRing(frame, dark, CENTER, CENTER, radiusX + 1, radiusY + 1);
    plotRing(frame, main, CENTER, CENTER, radiusX, radiusY);
    for (const [x, y] of [[-9, -14], [-10, -12], [-11, -10]] as const) plotPixel(frame, light, CENTER + x, CENTER + y);
    const sparkAngle = (index / 4) * Math.PI * 2;
    plotBlock(frame, light, CENTER + Math.round(Math.cos(sparkAngle) * radiusX), CENTER + Math.round(Math.sin(sparkAngle) * radiusY), 2, 2);
  }),
});

const rageFlames: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'feet',
  framesPerSecond: 10,
  looping: true,
  frames: buildFrames(4, SIZE, SIZE, (frame, _progress, index) => {
    [-15, -9, 9, 15].forEach((offsetX, tongue) => {
      const height = 9 + ((index + tongue) % 4) * 3;
      const baseY = CENTER + 1;
      frame.fill(dark as `#${string}`, CENTER + offsetX - 2, baseY - height, 5, height);
      frame.fill(main as `#${string}`, CENTER + offsetX - 1, baseY - height + 2, 3, height - 2);
      frame.fill(light as `#${string}`, CENTER + offsetX, baseY - Math.round(height * 0.6), 1, Math.round(height * 0.5));
    });
  }),
});

// The lines trail behind a unit that runs to the right. The layer mirrors them for a unit that runs to the left.
const windLines: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'body',
  framesPerSecond: 12,
  looping: true,
  frames: buildFrames(4, SIZE, SIZE, (frame, _progress, index) => {
    [[-6, 12], [0, 8], [6, 14]].forEach(([rowOffset, length], line) => {
      const startX = 2 + ((index * 5 + line * 3) % 10);
      plotLine(frame, line === 1 ? light : main, startX, CENTER + (rowOffset as number), startX + (length as number), CENTER + (rowOffset as number));
    });
  }),
});

const weakenMark: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'above',
  framesPerSecond: 6,
  looping: true,
  frames: buildFrames(4, SIZE, SIZE, (frame, _progress, index) => {
    const bob = index % 2;
    plotBlock(frame, PALETTE.outline, CENTER, CENTER + bob - 2, 5, 9);
    plotBlock(frame, PALETTE.outline, CENTER, CENTER + bob + 4, 9, 3);
    plotBlock(frame, main, CENTER, CENTER + bob - 2, 3, 7);
    plotBlock(frame, main, CENTER, CENTER + bob + 3, 7, 1);
    plotBlock(frame, main, CENTER, CENTER + bob + 4, 5, 1);
    plotBlock(frame, light, CENTER, CENTER + bob + 5, 1, 1);
    plotPixel(frame, light, CENTER - 1, CENTER + bob - 4);
    plotPixel(frame, light, CENTER + 8, CENTER + 6 + ((index * 3) % 6));
    plotPixel(frame, light, CENTER - 8, CENTER + 8 + ((index * 2) % 5));
  }),
});

const frostChill: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'feet',
  framesPerSecond: 6,
  looping: true,
  frames: buildFrames(4, SIZE, SIZE, (frame, _progress, index) => {
    plotRing(frame, main, CENTER, CENTER + 1, 14, 4);
    [[-12, 5], [-5, 8], [6, 7], [13, 5]].forEach(([offsetX, height]) => {
      plotDiamond(frame, dark, CENTER + (offsetX as number), CENTER - Math.round((height as number) / 2) + 1, Math.round((height as number) / 2));
      plotDiamond(frame, light, CENTER + (offsetX as number), CENTER - Math.round((height as number) / 2), Math.max(1, Math.round((height as number) / 2) - 1));
    });
    for (let flake = 0; flake < 4; flake++) {
      const offset = scatterOffset(flake, 12);
      plotPixel(frame, light, CENTER + offset.x, CENTER - 6 - ((index * 3 + flake * 5) % 14));
    }
    plotDisc(frame, dark, CENTER, CENTER, 1);
  }),
});

// Small flames lick the body of a burning unit and embers rise from it.
const burnFlames: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 8,
  looping: true,
  frames: buildFrames(4, SIZE, SIZE, (frame, _progress, index) => {
    [-10, -3, 5, 11].forEach((offsetX, tongue) => {
      const height = 5 + ((index + tongue * 2) % 4) * 2;
      const baseY = CENTER + 8 - (tongue % 2) * 4;
      frame.fill(dark as `#${string}`, CENTER + offsetX - 1, baseY - height, 3, height);
      frame.fill(main as `#${string}`, CENTER + offsetX, baseY - height + 1, 2, height - 1);
      plotPixel(frame, light, CENTER + offsetX, baseY - Math.round(height * 0.5));
    });
    for (let ember = 0; ember < 3; ember++) {
      const offset = scatterOffset(ember, 10);
      plotPixel(frame, light, CENTER + offset.x, CENTER - 4 - ((index * 3 + ember * 5) % 12));
    }
  }),
});

export const BUFF_ART: Readonly<Record<BuffArtId, EffectArtBuilder>> = {
  'guard-shield': guardShield,
  'rage-flames': rageFlames,
  'wind-lines': windLines,
};

export const DEBUFF_ART: Readonly<Record<DebuffArtId, EffectArtBuilder>> = {
  'weaken-mark': weakenMark,
  'frost-chill': frostChill,
  'burn-flames': burnFlames,
};
