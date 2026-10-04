import type { ProjectileArtId } from '../../content/spellVisuals';
import { buildFrames, plotBlock, plotDiamond, plotDisc, plotLine, plotPixel } from './drawingTools';
import type { EffectArt, EffectArtBuilder } from './effectArt';

const WIDTH = 16;
const HEIGHT = 12;
const MIDDLE_X = WIDTH / 2;
const MIDDLE_Y = HEIGHT / 2;

// Every projectile is drawn flying to the right. The layer mirrors it for a shot that flies to the left.
const arrowGlow: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 12,
  looping: true,
  frames: buildFrames(2, WIDTH, HEIGHT, (frame, _progress, index) => {
    plotLine(frame, light, 2, MIDDLE_Y, 12, MIDDLE_Y);
    plotBlock(frame, main, 13, MIDDLE_Y, 3, 3);
    plotPixel(frame, light, 14, MIDDLE_Y);
    plotBlock(frame, dark, 2, MIDDLE_Y, 3, 3);
    plotLine(frame, main, 4 + index, MIDDLE_Y - 2, 9 + index, MIDDLE_Y - 2);
    plotLine(frame, main, 4 + index, MIDDLE_Y + 2, 9 + index, MIDDLE_Y + 2);
  }),
});

const fireball: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 12,
  looping: true,
  frames: buildFrames(2, WIDTH, HEIGHT, (frame, _progress, index) => {
    plotBlock(frame, dark, 3 - index, MIDDLE_Y - 1 + index, 5, 2);
    plotBlock(frame, main, 5, MIDDLE_Y, 5, 4);
    plotDisc(frame, dark, MIDDLE_X + 2, MIDDLE_Y, 4);
    plotDisc(frame, main, MIDDLE_X + 2, MIDDLE_Y, 3);
    plotDisc(frame, light, MIDDLE_X + 3, MIDDLE_Y, 1 + index);
  }),
});

const iceShard: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 10,
  looping: true,
  frames: buildFrames(2, WIDTH, HEIGHT, (frame, _progress, index) => {
    plotLine(frame, dark, 1, MIDDLE_Y, 5, MIDDLE_Y);
    plotDiamond(frame, dark, MIDDLE_X + 1, MIDDLE_Y, 4);
    plotDiamond(frame, main, MIDDLE_X + 1, MIDDLE_Y, 3);
    plotLine(frame, light, 6, MIDDLE_Y, 13, MIDDLE_Y);
    plotPixel(frame, light, 5 + index, MIDDLE_Y - 2);
  }),
});

const arcaneMissile: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 14,
  looping: true,
  frames: buildFrames(2, WIDTH, HEIGHT, (frame, _progress, index) => {
    plotDisc(frame, dark, MIDDLE_X, MIDDLE_Y, 4);
    plotDisc(frame, main, MIDDLE_X, MIDDLE_Y, 3);
    plotDisc(frame, light, MIDDLE_X, MIDDLE_Y, 1);
    plotPixel(frame, light, MIDDLE_X - 4 + index * 8, MIDDLE_Y - 3 + index * 6);
    plotPixel(frame, main, MIDDLE_X + 3 - index * 6, MIDDLE_Y + 3 - index * 6);
  }),
});

export const PROJECTILE_ART: Readonly<Record<ProjectileArtId, EffectArtBuilder>> = {
  'arrow-glow': arrowGlow,
  fireball,
  'ice-shard': iceShard,
  'arcane-missile': arcaneMissile,
};

// A small spark that the layer leaves behind a flying projectile.
export const trailSparkArt: EffectArtBuilder = ({ main, light }): EffectArt => ({
  anchor: 'body',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(4, 8, 8, (frame, progress) => {
    const radius = progress < 0.5 ? 2 : 1;
    plotDisc(frame, progress < 0.3 ? light : main, 4, 4, radius);
  }),
});
