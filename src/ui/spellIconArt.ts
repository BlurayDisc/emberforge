import { findSpellVisual, type SpellIconMotif } from '../content/spellVisuals';
import { findSpell } from '../content/spells';
import type { ClassId } from '../model/hero';
import type { SpellDefinition } from '../model/spell';
import { drawAscii, drawingToImage } from './pixelDraw';
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
const GLYPH_SIZE = 12;
const ULTIMATE_RING_COLOR = '#f2c14e';
const imageCache = new Map<string, HTMLCanvasElement>();

// A spell with a look (data/spell-visuals.json) uses its own icon and theme. Other spells get a picture from their effect and a theme from their class.
function motifAndThemeOf(spell: SpellDefinition): { motif: SpellIconMotif; themeId: string } {
  const look = findSpellVisual(spell.id);
  const { effect } = spell;
  const fallbackMotif = effect.kind === 'status' ? (STATUS_MOTIFS[effect.status] ?? 'orb') : effect.kind === 'heal' ? 'heal' : effect.kind === 'drain' ? 'drop' : DAMAGE_MOTIF_BY_CLASS[spell.classId];
  return { motif: look?.icon ?? fallbackMotif, themeId: look?.theme ?? THEME_BY_CLASS[spell.classId] };
}

// A framed square: a dark border, the theme colour behind, and the picture in the middle. An ultimate has a gold ring.
function iconRows(motif: SpellIconMotif, isUltimate: boolean): string[] {
  const glyph = SPELL_ICON_GLYPHS[motif];
  const ring = isUltimate ? 'g' : 'b';
  const innerWidth = ICON_SIZE - 2;
  const ringRow = `o${ring.repeat(innerWidth)}o`;
  const margin = (ICON_SIZE - GLYPH_SIZE) / 2 - 1;
  const glyphRows = glyph.map((row) => row.replaceAll('.', 'b')).map((row) => `o${ring}${'b'.repeat(margin - 1)}${row}${'b'.repeat(margin - 1)}${ring}o`);
  const paddingRow = `o${ring}${'b'.repeat(innerWidth - 2)}${ring}o`;
  return [`o${'o'.repeat(innerWidth)}o`, ringRow, ...Array.from({ length: margin - 1 }, () => paddingRow), ...glyphRows, ...Array.from({ length: margin - 1 }, () => paddingRow), ringRow, `o${'o'.repeat(innerWidth)}o`];
}

export function createSpellIcon(spellId: string, scale = 3): HTMLImageElement {
  const spell = findSpell(spellId);
  if (!spell) throw new Error(`Unknown spell: ${spellId}`);
  const cached = imageCache.get(spellId);
  if (cached) return drawingToImage({ canvas: cached, fill: () => undefined }, scale);
  const { motif, themeId } = motifAndThemeOf(spell);
  const theme = ICON_THEMES[themeId] ?? ICON_THEMES.steel as IconTheme;
  const legend = { o: '#17110d', w: '#ffffff', l: theme.light, m: theme.main, d: theme.dark, b: theme.background, g: ULTIMATE_RING_COLOR };
  const canvas = drawAscii(iconRows(motif, spell.isUltimate), legend).canvas;
  imageCache.set(spellId, canvas);
  return drawingToImage({ canvas, fill: () => undefined }, scale);
}
