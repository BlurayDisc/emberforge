import type { CastArtId } from '../../content/spellVisuals';
import { buildFrames, plotBlock, plotDisc, plotRing, plotStar, scatterOffset } from './drawingTools';
import { EFFECT_CENTER, EFFECT_FRAME_SIZE, type EffectArtBuilder } from './effectArt';

const SIZE = EFFECT_FRAME_SIZE;
const CENTER = EFFECT_CENTER;

// A rune circle opens on the ground under the caster, and four runes turn around it.
const runeCircle: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'feet',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(7, SIZE, SIZE, (frame, progress) => {
    const radiusX = 6 + Math.round(progress * 16);
    const radiusY = Math.max(2, Math.round(radiusX * 0.4));
    plotRing(frame, dark, CENTER, CENTER + 1, radiusX, radiusY);
    plotRing(frame, main, CENTER, CENTER, radiusX, radiusY);
    plotRing(frame, light, CENTER, CENTER, Math.round(radiusX * 0.6), Math.max(1, Math.round(radiusY * 0.6)));
    for (let rune = 0; rune < 4; rune++) {
      const angle = progress * 2 + (rune * Math.PI) / 2;
      plotBlock(frame, light, CENTER + Math.round(Math.cos(angle) * radiusX), CENTER + Math.round(Math.sin(angle) * radiusY), 2, 2);
    }
  }),
});

const powerFlash: EffectArtBuilder = ({ main, light }) => ({
  anchor: 'body',
  framesPerSecond: 18,
  looping: false,
  frames: buildFrames(5, SIZE, SIZE, (frame, progress) => {
    plotStar(frame, main, CENTER, CENTER, 3 + progress * 3, 6 + progress * 14, 8, progress * 0.4);
    plotStar(frame, light, CENTER, CENTER, 2, 4 + progress * 8, 8, progress * 0.4);
    plotDisc(frame, light, CENTER, CENTER, Math.max(1, Math.round(4 * (1 - progress))));
  }),
});

const dustRing: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'feet',
  framesPerSecond: 14,
  looping: false,
  frames: buildFrames(6, SIZE, SIZE, (frame, progress) => {
    const radiusX = 4 + Math.round(progress * 18);
    const radiusY = Math.max(1, Math.round(radiusX * 0.35));
    plotRing(frame, light, CENTER, CENTER, radiusX, radiusY);
    plotRing(frame, dark, CENTER, CENTER + 1, radiusX, radiusY);
    for (let puff = 0; puff < 6; puff++) {
      const angle = (puff / 6) * Math.PI * 2;
      plotDisc(frame, main, CENTER + Math.round(Math.cos(angle) * radiusX), CENTER + Math.round(Math.sin(angle) * radiusY) - Math.round(progress * 6), progress > 0.6 ? 1 : 2);
    }
  }),
});

const shadowPuff: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 12,
  looping: false,
  frames: buildFrames(6, SIZE, SIZE, (frame, progress, index) => {
    for (let cloud = 0; cloud < 7; cloud++) {
      const offset = scatterOffset(cloud, 4 + progress * 10);
      const radius = Math.max(1, Math.round(5 - progress * 4));
      plotDisc(frame, cloud % 2 === 0 ? dark : main, CENTER + offset.x, CENTER + offset.y - Math.round(progress * 4), radius);
    }
    if (index < 3) plotDisc(frame, light, CENTER, CENTER, 2);
  }),
});

const roarRing: EffectArtBuilder = ({ main, light, dark }) => ({
  anchor: 'body',
  framesPerSecond: 16,
  looping: false,
  frames: buildFrames(6, SIZE, SIZE, (frame, progress) => {
    const radius = 4 + Math.round(progress * 18);
    plotRing(frame, dark, CENTER, CENTER, radius);
    plotRing(frame, main, CENTER, CENTER, Math.max(1, radius - 2));
    plotRing(frame, light, CENTER, CENTER, Math.max(1, radius - 4));
  }),
});

export const CAST_ART: Readonly<Record<CastArtId, EffectArtBuilder>> = {
  'rune-circle': runeCircle,
  'power-flash': powerFlash,
  'dust-ring': dustRing,
  'shadow-puff': shadowPuff,
  'roar-ring': roarRing,
};
