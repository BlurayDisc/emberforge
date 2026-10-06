import type { Texture } from 'pixi.js';
import { createPixiTexture } from '../pixiTextures';
import { CAST_ART } from './castArt';
import type { EffectArt, EffectArtBuilder } from './effectArt';
import { IMPACT_ART } from './impactArt';
import { PROJECTILE_ART, trailSparkArt } from './projectileArt';
import { SPELL_THEMES } from './spellThemes';
import { BUFF_ART, DEBUFF_ART } from './statusArt';

export type EffectPhase = 'cast' | 'projectile' | 'impact' | 'buff' | 'debuff';

export interface CachedEffect {
  art: EffectArt;
  textures: Texture[];
  width: number;
  height: number;
}

const BUILDERS_BY_PHASE: Readonly<Record<EffectPhase, Readonly<Record<string, EffectArtBuilder>>>> = {
  cast: CAST_ART,
  projectile: PROJECTILE_ART,
  impact: IMPACT_ART,
  buff: BUFF_ART,
  debuff: DEBUFF_ART,
};

const cachedEffectsByKey = new Map<string, CachedEffect>();

function cacheEffect(key: string, build: EffectArtBuilder, themeId: string): CachedEffect {
  const cached = cachedEffectsByKey.get(key);
  if (cached) return cached;
  const colors = SPELL_THEMES[themeId];
  if (!colors) throw new Error(`Unknown spell theme: ${themeId}`);
  const art = build(colors);
  const firstFrame = art.frames[0];
  if (!firstFrame) throw new Error(`Spell effect has no frames: ${key}`);
  const created: CachedEffect = { art, textures: art.frames.map(createPixiTexture), width: firstFrame.width, height: firstFrame.height };
  cachedEffectsByKey.set(key, created);
  return created;
}

// The frames of an effect are drawn the first time a spell needs them, and then they stay cached.
export function cachedEffectArt(phase: EffectPhase, artId: string, themeId: string): CachedEffect {
  const build = BUILDERS_BY_PHASE[phase][artId];
  if (!build) throw new Error(`Unknown ${phase} effect: ${artId}`);
  return cacheEffect(`${phase}:${artId}:${themeId}`, build, themeId);
}

export function cachedTrailSpark(themeId: string): CachedEffect {
  return cacheEffect(`trail:${themeId}`, trailSparkArt, themeId);
}
