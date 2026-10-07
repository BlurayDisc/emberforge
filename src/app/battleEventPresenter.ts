import { playSound } from '../audio';
import { ARMOUR_HIT_SOUNDS, CLASS_ATTACK_SOUNDS, MONSTER_ATTACK_SOUNDS, MONSTER_HURT_SOUNDS } from '../content/audio';
import { CLASSES } from '../content/classes';
import { requireById } from '../content/lookup';
import { describeSpellEvent, type SpellPresentation } from '../game';
import type { BattleEvent, BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { ArmourWeight } from '../model/item';
import type { BattleView } from '../render/battleView';
import { t } from '../ui/i18n';
import { playSpellSounds } from './spellSounds';

// A hero attack sounds as the weapon plus the monster's cry. A monster attack sounds as its own
// strike plus the hit on the armour type of the hero. A spell with its own sounds plays them instead of the weapon.
function playEventSounds(event: BattleEvent, unitsById: ReadonlyMap<string, BattleUnit>, spell: SpellPresentation | null): void {
  const actor = unitsById.get(event.actorId);
  const target = unitsById.get(event.targetId);
  if (!actor || !target) return;
  if (event.isDamageOverTime) return;
  if (spell) playSpellSounds(spell);
  if (event.isDodge) return;
  if (event.kind === 'heal' || event.kind === 'effect') {
    if (!spell) playSound('heal-chime');
    return;
  }
  if (actor.rank === 'hero') {
    if (!spell) playSound(CLASS_ATTACK_SOUNDS[actor.definitionId as ClassId]);
    playSound(MONSTER_HURT_SOUNDS[target.spriteKey] ?? '', 0.05);
  } else {
    playSound(MONSTER_ATTACK_SOUNDS[actor.spriteKey] ?? '');
    playSound(ARMOUR_HIT_SOUNDS[requireById(CLASSES, target.definitionId).armourWeights[0] as ArmourWeight], 0.04);
  }
  if (event.isCritical) playSound('critical-ping', 0.05);
  if (event.targetHpAfter === 0) playSound(target.rank === 'hero' ? 'defeat-hero' : 'defeat-monster', 0.12);
}

// A spell with a look (data/spell-visuals.json) shows its own effects. Any other event keeps the plain hit and heal look.
function showSpellOnView(view: BattleView, event: BattleEvent, spell: SpellPresentation & { visual: NonNullable<SpellPresentation['visual']> }): void {
  if (spell.startsCast) {
    view.playSpellCast(event.actorId, spell.visual);
    if (spell.selfStatusDurationSeconds !== null && spell.visual.buff) view.playSpellStatus(event.actorId, event.actorId, spell.visual, 'buff', spell.selfStatusDurationSeconds);
  }
  if (spell.role === 'damage') view.playSpellHit(event.actorId, event.targetId, event.amount, event.isCritical, spell.visual, spell.hitIndex, spell.isFirstHitOnTarget ? spell.statusDurationSeconds : null);
  else if (spell.role === 'heal') view.playSpellHeal(event.actorId, event.targetId, event.amount, spell.visual);
  else if (spell.statusDurationSeconds !== null) view.playSpellStatus(event.actorId, event.targetId, spell.visual, spell.role, spell.statusDurationSeconds);
}

// Shows one battle event on the stage and plays its sounds: health, resources, hit or heal looks, spell effects, shield, defeat.
// The battle screen and the battle sim page both use it.
export function presentBattleEvent(view: BattleView, event: BattleEvent, events: readonly BattleEvent[], eventIndex: number, unitsById: ReadonlyMap<string, BattleUnit>): void {
  const target = unitsById.get(event.targetId);
  if (target) view.setUnitHealth(target.id, event.targetHpAfter);
  const spell = describeSpellEvent(events, eventIndex, unitsById);
  if (target && event.targetShieldAfter !== undefined) view.setUnitShield(target.id, event.targetShieldAfter, event.kind === 'effect' ? spell?.statusDurationSeconds ?? undefined : undefined);
  view.setUnitResource(event.actorId, event.actorResourceAfter);
  view.setUnitResource(event.targetId, event.targetResourceAfter);
  const spellWithLook = spell?.visual ? { ...spell, visual: spell.visual } : null;
  const absorbed = event.absorbed ?? 0;
  if (event.isDamageOverTime) {
    view.playDamageOverTime(event.targetId, event.amount - absorbed);
    if (absorbed > 0) view.playAbsorb(event.targetId, absorbed);
  } else if (event.isDodge) {
    if (spellWithLook?.startsCast) view.playSpellCast(event.actorId, spellWithLook.visual);
    view.playDodge(event.targetId, t('battle.dodge'));
  } else {
    if (spellWithLook) showSpellOnView(view, { ...event, amount: event.amount - absorbed }, spellWithLook);
    else if (event.kind === 'attack') view.playHit(event.actorId, event.targetId, event.amount - absorbed, event.isCritical);
    else if (event.kind === 'heal') view.playHeal(event.actorId, event.targetId, event.amount);
    if (absorbed > 0) view.playAbsorb(event.targetId, absorbed);
  }
  playEventSounds(event, unitsById, spellWithLook);
  if (target && event.targetHpAfter === 0) view.markDefeated(target.id);
}
