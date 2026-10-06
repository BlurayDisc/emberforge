import { findSpellVisual, SPELL_VISUALS } from '../../src/content/spellVisuals';
import { CAST_ART } from '../../src/render/spellEffects/castArt';
import type { EffectArt, EffectArtBuilder } from '../../src/render/spellEffects/effectArt';
import { IMPACT_ART } from '../../src/render/spellEffects/impactArt';
import { PROJECTILE_ART } from '../../src/render/spellEffects/projectileArt';
import { SPELL_THEMES } from '../../src/render/spellEffects/spellThemes';
import { BUFF_ART, DEBUFF_ART } from '../../src/render/spellEffects/statusArt';
import type { SheetEntry } from './contactSheet';
import { headlessCanvasOf, installHeadlessCanvas } from './installHeadlessCanvas';
import { writeContactSheet } from './writeSheet';

const SHEET_SCALE = 4;
const MAX_FRAMES_PER_ROW = 12;

const BUILDERS_BY_PHASE: Readonly<Record<string, Readonly<Record<string, EffectArtBuilder>>>> = {
  cast: CAST_ART,
  projectile: PROJECTILE_ART,
  impact: IMPACT_ART,
  buff: BUFF_ART,
  debuff: DEBUFF_ART,
};

function describeTiming(phase: string, art: EffectArt): string {
  const seconds = (art.frames.length / art.framesPerSecond).toFixed(2);
  const loop = art.looping ? 'looping' : 'plays once';
  return `${phase}: ${art.frames.length} frames at ${art.framesPerSecond} fps = ${seconds} s, ${loop}, anchor ${art.anchor}`;
}

function phasesOfSpell(spellId: string): Array<{ phase: string; artId: string; themeId: string }> {
  const visual = findSpellVisual(spellId);
  if (!visual) throw new Error(`No spell look for "${spellId}". Known: ${Object.keys(SPELL_VISUALS).join(', ')}`);
  return Object.keys(BUILDERS_BY_PHASE).flatMap((phase) => {
    const artId = visual[phase as keyof typeof visual];
    return typeof artId === 'string' ? [{ phase, artId, themeId: visual.theme }] : [];
  });
}

// An argument is a spell id (warrior.cleave) or one effect: phase:artId:themeId (impact:fire-explosion:fire).
function parseRequest(argument: string): Array<{ phase: string; artId: string; themeId: string }> {
  const parts = argument.split(':');
  if (parts.length === 3) return [{ phase: parts[0] as string, artId: parts[1] as string, themeId: parts[2] as string }];
  return phasesOfSpell(argument);
}

const argument = process.argv[2];
if (!argument) {
  console.error('Usage: npm run animation -- <spellId | phase:artId:themeId>');
  process.exit(1);
}

installHeadlessCanvas();
const entries: SheetEntry[] = [];
for (const { phase, artId, themeId } of parseRequest(argument)) {
  const builder = BUILDERS_BY_PHASE[phase]?.[artId];
  const colors = SPELL_THEMES[themeId];
  if (!builder || !colors) throw new Error(`Unknown effect ${phase}:${artId}:${themeId}`);
  const art = builder(colors);
  console.log(describeTiming(`${phase} ${artId}`, art));
  art.frames.forEach((frame, index) => entries.push({ label: `${phase} ${artId} frame ${index + 1}`, canvas: headlessCanvasOf(frame) }));
}
writeContactSheet(`animation-${argument.replace(/[^a-z0-9.-]+/gi, '_')}`, entries, { scale: SHEET_SCALE, columns: MAX_FRAMES_PER_ROW });
