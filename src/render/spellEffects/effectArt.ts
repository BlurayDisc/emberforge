import type { SpellThemeColors } from './spellThemes';
import type { EffectFrame } from './drawingTools';

// body: the middle of the unit. feet: the ground under it. above: over its head. column: stands on the ground and reaches up.
export type EffectAnchor = 'body' | 'feet' | 'above' | 'column';

// One drawn animation. The frames are drawn once for each theme and cached, so a spell never draws in the frame loop.
export interface EffectArt {
  frames: EffectFrame[];
  framesPerSecond: number;
  looping: boolean;
  anchor: EffectAnchor;
}

export type EffectArtBuilder = (colors: SpellThemeColors) => EffectArt;

export const EFFECT_FRAME_SIZE = 48;
export const EFFECT_CENTER = EFFECT_FRAME_SIZE / 2;
