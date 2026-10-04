import { playSound } from '../audio';
import type { SpellPresentation } from '../game';

// The spell sounds follow the stage: hits of one cast come 0.16 s apart, and a projectile takes about 0.3 s to cross the stage.
const SPELL_HIT_SPACING_SECONDS = 0.16;
const SPELL_PROJECTILE_FLIGHT_SECONDS = 0.3;

export function playSpellSounds(spell: SpellPresentation): void {
  const { sounds, visual } = spell;
  if (!sounds) return;
  if (spell.startsCast && sounds.cast) playSound(sounds.cast);
  if (spell.role === 'damage') {
    const hitDelaySeconds = spell.hitIndex * SPELL_HIT_SPACING_SECONDS;
    if (sounds.projectile) playSound(sounds.projectile, hitDelaySeconds);
    if (sounds.impact) playSound(sounds.impact, hitDelaySeconds + (visual?.projectile ? SPELL_PROJECTILE_FLIGHT_SECONDS : 0));
    if (sounds.debuff && spell.statusDurationSeconds !== null && spell.hitIndex === 0) playSound(sounds.debuff, SPELL_PROJECTILE_FLIGHT_SECONDS);
  } else if (spell.role === 'heal') {
    if (sounds.impact) playSound(sounds.impact, 0.1);
  } else {
    const statusSound = spell.role === 'buff' ? sounds.buff : sounds.debuff;
    if (statusSound) playSound(statusSound, 0.1 + (spell.role === 'debuff' && visual?.projectile ? SPELL_PROJECTILE_FLIGHT_SECONDS : 0));
  }
}
