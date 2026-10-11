import { ARCHER_GLYPHS } from './archerGlyphs';
import { BARBARIAN_GLYPHS } from './barbarianGlyphs';
import { FIGHTER_GLYPHS } from './fighterGlyphs';
import { MAGE_GLYPHS } from './mageGlyphs';
import { PRIEST_GLYPHS } from './priestGlyphs';
import type { SpellGlyph } from './spellGlyph';
import { THIEF_GLYPHS } from './thiefGlyphs';
import { WARRIOR_GLYPHS } from './warriorGlyphs';

export const GLYPH_BY_FAMILY_ID: Readonly<Record<string, SpellGlyph>> = {
  ...WARRIOR_GLYPHS,
  ...ARCHER_GLYPHS,
  ...MAGE_GLYPHS,
  ...PRIEST_GLYPHS,
  ...THIEF_GLYPHS,
  ...BARBARIAN_GLYPHS,
  ...FIGHTER_GLYPHS,
};
