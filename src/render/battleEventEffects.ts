import type { BattleView } from './battleView';
import type { ParticleLayer } from './battleParticles';
import { HIT_FLASH_SECONDS, type UnitVisual } from './battleUnitVisual';
import type { FloatingTextLayer } from './floatingText';
import { PALETTE } from './palette';
import type { ProjectileLayer } from './projectileLayer';
import type { SpellEffectPlayer } from './spellEffects/spellEffectPlayer';

const SPELL_HIT_SPACING_SECONDS = 0.16;
const BODY_HEIGHT_FRACTION = 0.6;

export interface BattleEventEffectsParts {
  visualsByUnitId: ReadonlyMap<string, UnitVisual>;
  projectileLayer: ProjectileLayer;
  particleLayer: ParticleLayer;
  floatingTextLayer: FloatingTextLayer;
  spellEffects: SpellEffectPlayer;
  viewSeconds: () => number;
}

function projectileAnchor(visual: UnitVisual, sideOfUnit: number): { x: number; y: number } {
  return { x: visual.centerX + sideOfUnit * visual.lungeDirection * 10, y: visual.feetY - visual.spriteHeight * BODY_HEIGHT_FRACTION };
}

// The effects of one battle event on the units: numbers, particles, projectiles, spell visuals and the death pose.
export type BattleEventEffects = Pick<BattleView, 'playDodge' | 'playAbsorb' | 'playDamageOverTime' | 'playHit' | 'playHeal' | 'markDefeated' | 'playSpellCast' | 'playSpellHit' | 'playSpellHeal' | 'playSpellStatus'>;

export function createBattleEventEffects(parts: BattleEventEffectsParts): BattleEventEffects {
  const { visualsByUnitId, projectileLayer, particleLayer, floatingTextLayer, spellEffects, viewSeconds } = parts;

  const spawnFloatingText = (visual: UnitVisual, text: string, className: string): void => {
    floatingTextLayer.spawn(visual.centerX, visual.feetY - visual.spriteHeight, text, className, viewSeconds());
  };

  const spawnParticles = (visual: UnitVisual, color: string, count: number): void => {
    particleLayer.burst(visual.centerX, visual.feetY - visual.spriteHeight * BODY_HEIGHT_FRACTION, color, count, viewSeconds());
  };

  const showHitOn = (target: UnitVisual, amount: number, isCritical: boolean): void => {
    target.flashUntilSeconds = viewSeconds() + HIT_FLASH_SECONDS;
    target.shakeStartSeconds = viewSeconds();
    spawnParticles(target, isCritical ? PALETTE.gold : '#ffffff', isCritical ? 10 : 5);
    if (amount > 0) spawnFloatingText(target, isCritical ? `${amount}!` : String(amount), isCritical ? 'critical' : 'damage');
  };

  return {
    playDodge: (targetId, text) => {
      const target = visualsByUnitId.get(targetId);
      if (target) spawnFloatingText(target, text, 'dodge');
    },
    playAbsorb: (targetId, amount) => {
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      spawnParticles(target, PALETTE.waterLight, 5);
      spawnFloatingText(target, `-${amount}`, 'absorb');
    },
    playDamageOverTime: (targetId, amount) => {
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      target.flashUntilSeconds = viewSeconds() + HIT_FLASH_SECONDS;
      spawnFloatingText(target, String(amount), 'burn');
    },
    playHit: (actorId, targetId, amount, isCritical) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      const showImpact = (): void => showHitOn(target, amount, isCritical);
      if (actor?.rangedAttackStyle) {
        // The hit shows when the projectile lands, not when the shot leaves.
        projectileLayer.launch(actor.rangedAttackStyle, projectileAnchor(actor, 1), projectileAnchor(target, -1), actor.lungeDirection, viewSeconds(), showImpact);
        return;
      }
      if (actor) actor.lungeStartSeconds = viewSeconds();
      showImpact();
    },
    playHeal: (actorId, targetId, amount) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = viewSeconds();
      if (!target) return;
      spawnParticles(target, PALETTE.goblin, 6);
      spawnFloatingText(target, `+${amount}`, 'heal');
    },
    playSpellCast: (casterId, visual) => {
      const caster = visualsByUnitId.get(casterId);
      if (caster) caster.lungeStartSeconds = viewSeconds();
      spellEffects.playCast(casterId, visual);
    },
    playSpellHit: (actorId, targetId, amount, isCritical, visual, hitIndex, debuffSeconds) => {
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      const land = (): void => {
        showHitOn(target, amount, isCritical);
        spellEffects.playImpact(targetId, visual);
        if (debuffSeconds !== null) spellEffects.playStatus(targetId, visual, 'debuff', debuffSeconds);
      };
      const delaySeconds = hitIndex * SPELL_HIT_SPACING_SECONDS;
      if (!spellEffects.playProjectile(actorId, targetId, visual, delaySeconds, land)) spellEffects.later(delaySeconds, land);
    },
    playSpellHeal: (actorId, targetId, amount, visual) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = viewSeconds();
      if (!target) return;
      spawnParticles(target, PALETTE.goblin, 6);
      spawnFloatingText(target, `+${amount}`, 'heal');
      if (visual) spellEffects.playImpact(targetId, visual);
    },
    playSpellStatus: (actorId, targetId, visual, role, durationSeconds) => {
      const applyStatus = (): void => {
        if (role === 'debuff') spellEffects.playImpact(targetId, visual);
        spellEffects.playStatus(targetId, visual, role, durationSeconds);
      };
      // A debuff with a projectile lands when the projectile arrives.
      if (role === 'debuff' && spellEffects.playProjectile(actorId, targetId, visual, 0, applyStatus)) return;
      applyStatus();
    },
    markDefeated: (unitId) => {
      const visual = visualsByUnitId.get(unitId);
      if (!visual) return;
      visual.defeatedStartSeconds = viewSeconds() + 0.001;
      visual.healthBar.setVisible(false);
      visual.shadow.alpha = 0.15;
    },
  };
}
