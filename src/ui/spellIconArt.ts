import { findSpellVisual, type SpellIconMotif } from '../content/spellVisuals';
import { familyIdOf, findSpell } from '../content/spells';
import type { ClassId } from '../model/hero';
import type { SpellDefinition } from '../model/spell';
import { drawAscii, drawingToImage } from './pixelDraw';
import { GLYPH_BY_FAMILY_ID } from './spellGlyphs/allGlyphs';
import { SPELL_ICON_GLYPHS } from './spellIconGlyphs';

interface IconTheme {
  light: string;
  main: string;
  dark: string;
  background: string;
}

const ICON_THEMES: Readonly<Record<string, IconTheme>> = {
  steel: { light: '#f4f8ff', main: '#c0c8d0', dark: '#6f7a8c', background: '#2a2e38' },
  nature: { light: '#c4ec90', main: '#6aa84f', dark: '#2d6a4f', background: '#1f3a24' },
  fire: { light: '#ffe680', main: '#ff9a30', dark: '#e2641f', background: '#3a1f14' },
  ice: { light: '#d8f4ff', main: '#5ab4e8', dark: '#3f6fb0', background: '#16283a' },
  arcane: { light: '#d2b0ff', main: '#7b4bb7', dark: '#4a2264', background: '#241638' },
  holy: { light: '#fff2b0', main: '#ffd75e', dark: '#d9a441', background: '#3a3018' },
  shadow: { light: '#b49ad8', main: '#5b4a7a', dark: '#14111f', background: '#1c1828' },
  rage: { light: '#ff9a30', main: '#c0392b', dark: '#6f3d2a', background: '#3a1618' },
  ki: { light: '#c8ffe8', main: '#4fd0a0', dark: '#2d6a4f', background: '#16322a' },
  guard: { light: '#f4f8ff', main: '#7fb0e0', dark: '#3f70d6', background: '#182640' },
};

const THEME_BY_CLASS: Readonly<Record<ClassId, string>> = { warrior: 'steel', archer: 'nature', mage: 'arcane', priest: 'holy', thief: 'shadow', barbarian: 'rage', fighter: 'ki' };
const DAMAGE_MOTIF_BY_CLASS: Readonly<Record<ClassId, SpellIconMotif>> = { warrior: 'slash', archer: 'arrow', mage: 'orb', priest: 'holy', thief: 'dagger', barbarian: 'skull', fighter: 'fist' };
const STATUS_MOTIFS: Readonly<Record<string, SpellIconMotif>> = { guard: 'shield', haste: 'wind', weaken: 'weaken', slow: 'snow', wound: 'drop' };

const ICON_SIZE = 16;
const ULTIMATE_RING_COLOR = '#f2c14e';
const imageCache = new Map<string, HTMLCanvasElement>();

// A spell with a look (data/spell-visuals.json) uses its own icon and theme. Other spells get a picture from their effect and a theme from their class.
function motifAndThemeOf(spell: SpellDefinition): { motif: SpellIconMotif; themeId: string } {
  const look = findSpellVisual(spell.id);
  const { effect } = spell;
  const fallbackMotif = effect.kind === 'status' ? (STATUS_MOTIFS[effect.status] ?? 'orb') : effect.kind === 'heal' ? 'heal' : effect.kind === 'drain' ? 'drop' : DAMAGE_MOTIF_BY_CLASS[spell.classId];
  return { motif: look?.icon ?? fallbackMotif, themeId: look?.theme ?? THEME_BY_CLASS[spell.classId] };
}

// A framed square: a dark outline, the theme colour behind, and a 14 by 14 picture inside. An ultimate has a gold outline.
function iconRows(glyphRows: readonly string[], isUltimate: boolean): string[] {
  const outline = isUltimate ? 'g' : 'o';
  const edge = outline.repeat(ICON_SIZE);
  return [edge, ...glyphRows.map((row) => `${outline}${row.replaceAll('.', 'b')}${outline}`), edge];
}

export function createSpellIcon(spellId: string, scale = 3): HTMLImageElement {
  return drawingToImage({ canvas: drawSpellIcon(spellId), fill: () => undefined }, scale);
}

function paddedMotifRows(motif: SpellIconMotif): string[] {
  const blankRow = '.'.repeat(ICON_SIZE - 2);
  return [blankRow, ...SPELL_ICON_GLYPHS[motif].map((row) => `.${row}.`), blankRow];
}

// Ranks of one family share one picture.
export function drawSpellIcon(spellId: string): HTMLCanvasElement {
  const spell = findSpell(spellId);
  if (!spell) throw new Error(`Unknown spell: ${spellId}`);
  const cacheKey = `${familyIdOf(spell)}:${spell.isUltimate}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;
  const { motif, themeId: classThemeId } = motifAndThemeOf(spell);
  const glyph = GLYPH_BY_FAMILY_ID[familyIdOf(spell)];
  const themeId = glyph?.theme ?? findSpellVisual(familyIdOf(spell))?.theme ?? classThemeId;
  const theme = ICON_THEMES[themeId] ?? (ICON_THEMES.steel as IconTheme);
  const legend = { o: '#17110d', k: '#000000', w: '#ffffff', l: theme.light, m: theme.main, d: theme.dark, b: theme.background, g: ULTIMATE_RING_COLOR, r: '#c0392b' };
  const canvas = drawAscii(iconRows(glyph?.rows ?? paddedMotifRows(motif), spell.isUltimate), legend).canvas;
  imageCache.set(cacheKey, canvas);
  return canvas;
}
