import '../../src/ui/styles/theme.css';
import '../../src/ui/styles/components.css';
import '../../src/ui/styles/stage.css';
import type { BattleUnit } from '../../src/model/battle';
import { playSpellSounds } from '../../src/app/spellSounds';
import { configureAudio } from '../../src/audio';
import { SPELL_SOUNDS } from '../../src/content/audio';
import { loadAudioPreferences, type SpellPresentation, type SpellRole } from '../../src/game';
import type { SpellDefinition } from '../../src/model/spell';
import { SPELLS } from '../../src/content/spells';
import { SPELL_VISUALS, type SpellVisualSpec } from '../../src/content/spellVisuals';
import { createBattleView } from '../../src/render/battleView';
import { createPixelStage } from '../../src/render/pixelStage';

const DEMO_DAMAGE = 42;
const DEMO_SHIELD = 40;
const DEMO_STATUS_SECONDS = 6;
const SECONDS_BETWEEN_SPELLS_IN_PLAY_ALL = 4000;

function createDemoUnit(id: string, side: BattleUnit['side'], definitionId: string, name: string, spriteKey: string): BattleUnit {
  return {
    id, definitionId, name, side, rank: side === 'party' ? 'hero' : 'normal', spriteKey, level: 10,
    maxHp: 100, hp: 100, attack: 1, attackKind: 'physical', defence: 0, resistance: 0, baseAttackSeconds: 1.65, attackSpeedBonus: 0, critChance: 0, damageVarianceFraction: 0,
    criticalDamageMultiplier: 1.5, mainAttributeValue: 0, lifeSteal: 0, behavior: 'fighter', resourceId: 'rage', maxResource: 0, resource: 0, spells: [],
  };
}

const caster = createDemoUnit('caster', 'party', 'warrior', 'Ayla', '');
const ally = createDemoUnit('ally', 'party', 'archer', 'Bram', '');
const enemy = createDemoUnit('enemy', 'enemy', 'goblin', 'Goblin', 'monster-goblin');

// The browser keeps audio locked until the first click. Every spell button is a click, so sound works from the first spell.
configureAudio(loadAudioPreferences());

const stage = createPixelStage(document.getElementById('stage-host') as HTMLElement);
const view = createBattleView(stage);
view.setBackdrop('goblin-camp');
view.setVisible(true);

function resetUnits(): void {
  view.showUnits([caster, ally, enemy]);
}

function describeVisual(visual: SpellVisualSpec): string {
  return (['theme', 'cast', 'projectile', 'impact', 'buff', 'debuff'] as const)
    .filter((part) => visual[part] !== undefined)
    .map((part) => `${part}: ${visual[part]}`)
    .join(' | ');
}

function playSoundsOfHit(spell: SpellDefinition, visual: SpellVisualSpec, role: SpellRole, hitIndex: number, statusDurationSeconds: number | null): void {
  const presentation: SpellPresentation = { spellId: spell.id, role, visual, sounds: SPELL_SOUNDS[spell.id], startsCast: hitIndex === 0, hitIndex, isFirstHitOnTarget: hitIndex === 0, statusDurationSeconds, selfStatusDurationSeconds: null };
  playSpellSounds(presentation);
}

function playSpell(spell: SpellDefinition, visual: SpellVisualSpec): void {
  resetUnits();
  const effect = spell.effect;
  view.playSpellCast(caster.id, visual);
  if (effect.kind === 'damage' && effect.alsoOnSelf && visual.buff) view.playSpellStatus(caster.id, caster.id, visual, 'buff', effect.alsoOnSelf.durationSeconds);
  if (effect.kind === 'damage' || effect.kind === 'drain') {
    const inflictedSeconds = effect.kind === 'damage' ? effect.inflicts?.durationSeconds ?? null : null;
    const hitCount = Math.min(effect.hits, 5);
    for (let hitIndex = 0; hitIndex < hitCount; hitIndex++) {
      const statusSeconds = inflictedSeconds ?? (visual.debuff ? DEMO_STATUS_SECONDS : null);
      view.playSpellHit(caster.id, enemy.id, DEMO_DAMAGE, false, visual, hitIndex, statusSeconds);
      playSoundsOfHit(spell, visual, 'damage', hitIndex, statusSeconds);
    }
  } else if (effect.kind === 'heal') {
    view.playSpellHeal(caster.id, ally.id, DEMO_DAMAGE, visual);
    playSoundsOfHit(spell, visual, 'heal', 0, null);
  } else if (effect.target === 'enemy' || effect.target === 'allEnemies') {
    view.playSpellStatus(caster.id, enemy.id, visual, 'debuff', DEMO_STATUS_SECONDS);
    playSoundsOfHit(spell, visual, 'debuff', 0, DEMO_STATUS_SECONDS);
  } else {
    if (effect.kind === 'shield') view.setUnitShield(caster.id, DEMO_SHIELD, effect.durationSeconds);
    view.playSpellStatus(caster.id, effect.target === 'allAllies' ? ally.id : caster.id, visual, 'buff', DEMO_STATUS_SECONDS);
    if (effect.target === 'allAllies') view.playSpellStatus(caster.id, caster.id, visual, 'buff', DEMO_STATUS_SECONDS);
    playSoundsOfHit(spell, visual, 'buff', 0, DEMO_STATUS_SECONDS);
  }
  const caption = document.getElementById('caption') as HTMLElement;
  caption.innerHTML = `<b>${spell.id}</b> (${effect.kind}, target ${'target' in effect ? effect.target : ''})<br>${describeVisual(visual)}`;
}

const spellsWithVisuals = SPELLS.filter((spell) => SPELL_VISUALS[spell.id] !== undefined);
const spellList = document.getElementById('spell-list') as HTMLElement;
const buttonsBySpellId = new Map<string, HTMLButtonElement>();
let playAllTimer: number | undefined;

function stopPlayAll(): void {
  window.clearTimeout(playAllTimer);
  playAllTimer = undefined;
}

function select(spell: SpellDefinition): void {
  buttonsBySpellId.forEach((button) => button.classList.remove('playing'));
  buttonsBySpellId.get(spell.id)?.classList.add('playing');
  playSpell(spell, SPELL_VISUALS[spell.id] as SpellVisualSpec);
}

const playAllButton = document.createElement('button');
playAllButton.textContent = 'Play all (loops)';
playAllButton.onclick = () => {
  stopPlayAll();
  let index = 0;
  const step = (): void => {
    select(spellsWithVisuals[index % spellsWithVisuals.length] as SpellDefinition);
    index += 1;
    playAllTimer = window.setTimeout(step, SECONDS_BETWEEN_SPELLS_IN_PLAY_ALL);
  };
  step();
};
spellList.append(playAllButton);

let currentClassId = '';
for (const spell of spellsWithVisuals) {
  if (spell.classId !== currentClassId) {
    currentClassId = spell.classId;
    const heading = document.createElement('h3');
    heading.textContent = currentClassId;
    spellList.append(heading);
  }
  const button = document.createElement('button');
  button.textContent = spell.id.split('.')[1] ?? spell.id;
  button.onclick = () => {
    stopPlayAll();
    select(spell);
  };
  buttonsBySpellId.set(spell.id, button);
  spellList.append(button);
}

resetUnits();
