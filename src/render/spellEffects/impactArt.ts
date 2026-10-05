import type { ImpactArtId } from '../../content/spellVisuals';
import { buildFrames, plotBlock, plotDiamond, plotDisc, plotLine, plotPixel, plotRing, plotStar, scatterOffset } from './drawingTools';
import { STEEL_IMPACT_ART } from './steelImpactArt';
import { EFFECT_CENTER, EFFECT_FRAME_SIZE, type EffectArtBuilder } from './effectArt';

const SIZE = EFFECT_FRAME_SIZE;
const CENTER = EFFECT_CENTER;

const slashCross: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'body',
  framesPerSecond: 20,
  looping: false,
  frames: buildFrames(5, SIZE, SIZE, (frame, progress) => {
    const reach = Math.round(4 + Math.min(1, progress * 1.6) * 14);
    const fade = progress > 0.75;
    for (const [fromX, fromY, toX, toY] of [[-reach, -reach, reach, reach], [reach, -reach, -reach, reach]] as const) {
      plotLine(frame, main, CENTER + fromX, CENTER + fromY, CENTER + toX, CENTER + toY, 3);
      if (!fade) plotLine(frame, light, CENTER + fromX + 1, CENTER + fromY + 1, CENTER + toX + 1, CENTER + toY + 1, 1);
    }
  }),
});

const shockRing: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 18,
  looping: false,
  frames: buildFrames(5, SIZE, SIZE, (frame, progress) => {
    const radius = 3 + Math.round(progress * 17);
    plotRing(frame, dark, CENTER, CENTER, radius + 1);
    plotRing(frame, main, CENTER, CENTER, radius);
    plotRing(frame, light, CENTER, CENTER, Math.max(1, radius - 2));
    for (let debris = 0; debris < 6; debris++) {
      const angle = (debris / 6) * Math.PI * 2 + 0.4;
      plotBlock(frame, light, CENTER + Math.round(Math.cos(angle) * (radius + 3)), CENTER + Math.round(Math.sin(angle) * (radius + 3)), 2, 2);
    }
  }),
});

const flameBurst: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(7, SIZE, SIZE, (frame, progress) => {
    const coreRadius = progress < 0.5 ? 2 + Math.round(progress * 12) : Math.max(1, 8 - Math.round((progress - 0.5) * 14));
    plotDisc(frame, dark, CENTER, CENTER, coreRadius + 2);
    plotDisc(frame, main, CENTER, CENTER, coreRadius + 1);
    plotDisc(frame, light, CENTER, CENTER, coreRadius);
    for (let tongue = 0; tongue < 6; tongue++) {
      const angle = (tongue / 6) * Math.PI * 2;
      const distance = 5 + progress * 11;
      plotBlock(frame, tongue % 2 === 0 ? main : dark, CENTER + Math.round(Math.cos(angle) * distance), CENTER + Math.round(Math.sin(angle) * distance) - Math.round(progress * 8), Math.max(1, 4 - Math.round(progress * 3)), Math.max(2, 5 - Math.round(progress * 3)));
    }
  }),
});

// A big blast: a white-hot flash, a ring of fire that races outwards, and smoke that rises. It fills the frame, so it stands out from the small Flame Burst.
const fireExplosion: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(9, SIZE, SIZE, (frame, progress) => {
    const flashRadius = progress < 0.35 ? 4 + Math.round(progress * 30) : Math.max(0, 14 - Math.round((progress - 0.35) * 22));
    if (flashRadius > 0) {
      plotDisc(frame, main, CENTER, CENTER, flashRadius + 3);
      plotDisc(frame, light, CENTER, CENTER, flashRadius);
    }
    const ringRadius = 4 + Math.round(progress * 19);
    plotRing(frame, dark, CENTER, CENTER, ringRadius + 1);
    plotRing(frame, main, CENTER, CENTER, ringRadius);
    if (progress < 0.7) plotRing(frame, light, CENTER, CENTER, Math.max(1, ringRadius - 2));
    for (let tongue = 0; tongue < 10; tongue++) {
      const angle = (tongue / 10) * Math.PI * 2 + 0.2;
      const distance = ringRadius + 2 + (tongue % 3) * 2;
      plotBlock(frame, tongue % 2 === 0 ? main : light, CENTER + Math.round(Math.cos(angle) * distance), CENTER + Math.round(Math.sin(angle) * distance), 3, 3);
    }
    if (progress > 0.4) {
      for (let puff = 0; puff < 4; puff++) {
        const offset = scatterOffset(puff, 12);
        plotDisc(frame, dark, CENTER + offset.x, CENTER - 6 - Math.round((progress - 0.4) * 22) - puff * 2, 3 - (puff % 2));
      }
    }
  }),
});

const iceBurst: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 16,
  looping: false,
  frames: buildFrames(6, SIZE, SIZE, (frame, progress) => {
    if (progress < 0.4) plotStar(frame, light, CENTER, CENTER, 1, 8, 6, 0.3);
    for (let shard = 0; shard < 8; shard++) {
      const angle = (shard / 8) * Math.PI * 2;
      const distance = 3 + progress * 16;
      plotDiamond(frame, shard % 2 === 0 ? light : main, CENTER + Math.round(Math.cos(angle) * distance), CENTER + Math.round(Math.sin(angle) * distance), progress > 0.7 ? 1 : 2);
    }
    plotRing(frame, dark, CENTER, CENTER, 2 + Math.round(progress * 8));
  }),
});

const arcanePop: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 16,
  looping: false,
  frames: buildFrames(6, SIZE, SIZE, (frame, progress) => {
    plotStar(frame, dark, CENTER, CENTER, 2, 5 + progress * 17, 8, progress);
    plotStar(frame, main, CENTER, CENTER, 2, 4 + progress * 13, 8, progress);
    plotRing(frame, light, CENTER, CENTER, 2 + Math.round(progress * 12));
    plotDisc(frame, light, CENTER, CENTER, Math.max(1, Math.round(3 * (1 - progress))));
  }),
});

const HOLY_PILLAR_WIDTH = 32;
const HOLY_PILLAR_HEIGHT = 64;

// The pillar falls from the sky onto the target. The anchor is the ground.
const holyPillar: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'column',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(7, HOLY_PILLAR_WIDTH, HOLY_PILLAR_HEIGHT, (frame, progress, index) => {
    const halfWidth = Math.max(1, Math.round(1 + Math.sin(progress * Math.PI) * 6));
    const reach = index === 0 ? 24 : HOLY_PILLAR_HEIGHT - 4;
    frame.fill(dark as `#${string}`, 16 - halfWidth - 1, HOLY_PILLAR_HEIGHT - reach, halfWidth * 2 + 2, reach);
    frame.fill(main as `#${string}`, 16 - halfWidth, HOLY_PILLAR_HEIGHT - reach, halfWidth * 2, reach);
    frame.fill(light as `#${string}`, 16 - Math.max(1, Math.floor(halfWidth / 2)), HOLY_PILLAR_HEIGHT - reach, Math.max(2, halfWidth), reach);
    plotRing(frame, light, 16, HOLY_PILLAR_HEIGHT - 3, 4 + Math.round(progress * 10), 2 + Math.round(progress * 3));
    for (let spark = 0; spark < 5; spark++) {
      const offset = scatterOffset(spark + index, 10);
      plotPixel(frame, light, 16 + offset.x, HOLY_PILLAR_HEIGHT - 8 - Math.abs(offset.y) * 3 - Math.round(progress * 6));
    }
  }),
});

const pierceSpark: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'body',
  framesPerSecond: 20,
  looping: false,
  frames: buildFrames(4, SIZE, SIZE, (frame, progress) => {
    const length = Math.max(1, Math.round(12 * (1 - progress)));
    plotLine(frame, main, CENTER - length, CENTER - 1, CENTER + length, CENTER - 1, 3);
    plotStar(frame, light, CENTER, CENTER, 1, 2 + Math.round((1 - progress) * 5), 4, Math.PI / 4);
    plotDisc(frame, light, CENTER, CENTER, 1);
  }),
});

const daggerSlash: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 20,
  looping: false,
  frames: buildFrames(4, SIZE, SIZE, (frame, progress) => {
    const length = Math.round(4 + progress * 12);
    for (const shift of [-5, 0, 5]) {
      plotLine(frame, dark, CENTER + shift + length / 2 + 1, CENTER - length / 2 + 1, CENTER + shift - length / 2 + 1, CENTER + length / 2 + 1);
      plotLine(frame, shift === 0 ? light : main, CENTER + shift + length / 2, CENTER - length / 2, CENTER + shift - length / 2, CENTER + length / 2, 2);
    }
  }),
});

const fistStar: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'body',
  framesPerSecond: 20,
  looping: false,
  frames: buildFrames(4, SIZE, SIZE, (frame, progress) => {
    plotStar(frame, main, CENTER, CENTER, 2, 5 + progress * 9, 6, 0.3);
    plotStar(frame, light, CENTER, CENTER, 1, 3 + progress * 5, 6, 0.3);
    plotDisc(frame, light, CENTER, CENTER, Math.max(1, Math.round(3 * (1 - progress))));
  }),
});

const crushBurst: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(8, SIZE, SIZE, (frame, progress) => {
    const radius = 3 + Math.round(progress * 19);
    plotRing(frame, main, CENTER, CENTER, radius);
    plotRing(frame, light, CENTER, CENTER, Math.max(1, radius - 3));
    for (let crack = 0; crack < 7; crack++) {
      const angle = (crack / 7) * Math.PI * 2 + 0.2;
      const length = 4 + Math.round(progress * (8 + (crack % 3) * 4));
      plotLine(frame, dark, CENTER + Math.cos(angle) * 2, CENTER + Math.sin(angle) * 2, CENTER + Math.cos(angle) * length, CENTER + Math.sin(angle) * length);
    }
    for (let chip = 0; chip < 6; chip++) {
      const offset = scatterOffset(chip, 8 + progress * 10);
      plotBlock(frame, chip % 2 === 0 ? light : main, CENTER + offset.x, CENTER + offset.y + Math.round(progress * progress * 10), 2, 2);
    }
  }),
});

const SPARKLE_COUNT = 5;

const healSparkles: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'body',
  framesPerSecond: 12,
  looping: false,
  frames: buildFrames(8, SIZE, SIZE, (frame, progress, index) => {
    for (let sparkle = 0; sparkle < SPARKLE_COUNT; sparkle++) {
      const phase = (progress * 1.4 + sparkle / SPARKLE_COUNT) % 1;
      const x = CENTER - 12 + sparkle * 6;
      const y = CENTER + 12 - Math.round(phase * 26);
      if (phase > 0.85) continue;
      plotBlock(frame, sparkle % 2 === 0 ? light : main, x, y, 3, 1);
      plotBlock(frame, sparkle % 2 === 0 ? light : main, x, y, 1, 3);
    }
    if (index < 3) plotRing(frame, light, CENTER, CENTER + 10, 8 + index * 3, 3 + index);
  }),
});

export const IMPACT_ART: Readonly<Record<ImpactArtId, EffectArtBuilder>> = {
  'slash-cross': slashCross,
  'shock-ring': shockRing,
  'flame-burst': flameBurst,
  'fire-explosion': fireExplosion,
  'ice-burst': iceBurst,
  'arcane-pop': arcanePop,
  'holy-pillar': holyPillar,
  'pierce-spark': pierceSpark,
  'dagger-slash': daggerSlash,
  'fist-star': fistStar,
  'crush-burst': crushBurst,
  'heal-sparkles': healSparkles,
  ...STEEL_IMPACT_ART,
};
