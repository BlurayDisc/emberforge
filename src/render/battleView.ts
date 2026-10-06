import { Container, Sprite, type Texture } from 'pixi.js';
import type { BattleUnit } from '../model/battle';
import { drawBattleBackdrop } from './battleBackdrops';
import { PALETTE } from './palette';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { healthBarLength, type HealthBarLengthScale } from '../kernel/healthBarLength';
import { createHealthBar, type HealthBar } from './healthBarArt';
import { BATTLE_Z } from './battleLayers';
import { createBattleSprite } from './battleSprites';
import { hexToNumber, mixHex } from './colorMath';
import { createFlatSprite, createPixiTexture } from './pixiTextures';
import { createProjectileLayer } from './projectileLayer';
import { RANGED_ATTACK_STYLE_BY_SPRITE_KEY, type RangedAttackStyle } from './rangedAttackStyles';
import type { SpellVisualSpec } from '../content/spellVisuals';
import { createSpellEffectPlayer } from './spellEffects/spellEffectPlayer';

const HEALTH_BAR_GAP_ABOVE_HEAD = 6;
const STAGE_HEALTH_BAR_SCALE: HealthBarLengthScale = { lengthPerRootPoint: 4, minimum: 28, maximum: 56 };
const SIDE_OFFSET_X = 105;
const FLASH_TINT = mixHex(PALETTE.blood, '#ffffff', 0.4);
const WHITE_TINT = 0xffffff;
const PARTICLE_SIZE = 2;
const PARTICLE_GRAVITY = 220;
const FLASH_SECONDS = 0.18;
const LUNGE_SECONDS = 0.28;
const LUNGE_DISTANCE = 16;
const SHAKE_SECONDS = 0.22;
const DEFEAT_SECONDS = 0.6;
const PARTICLE_LIFE_SECONDS = 0.45;
const FLOATING_TEXT_MILLISECONDS = 1100;
const SPELL_HIT_SPACING_SECONDS = 0.16;

export interface BattleView {
  setVisible(isVisible: boolean): void;
  setBackdrop(dungeonId: string): void;
  showUnits(units: readonly BattleUnit[]): void;
  setUnitHealth(unitId: string, hp: number): void;
  setUnitResource(unitId: string, value: number): void;
  // durationSeconds is set on the event that makes a shield. Later hits on the shield leave it out.
  setUnitShield(unitId: string, value: number, durationSeconds?: number): void;
  playDodge(targetId: string, text: string): void;
  playAbsorb(targetId: string, amount: number): void;
  playDamageOverTime(targetId: string, amount: number): void;
  playHit(actorId: string, targetId: string, amount: number, isCritical: boolean): void;
  playHeal(actorId: string, targetId: string, amount: number): void;
  markDefeated(unitId: string): void;
  playSpellCast(casterId: string, visual: SpellVisualSpec): void;
  // hitIndex counts the hits of one cast. debuffSeconds is set on the first hit at an enemy that gets a status.
  playSpellHit(actorId: string, targetId: string, amount: number, isCritical: boolean, visual: SpellVisualSpec, hitIndex: number, debuffSeconds: number | null): void;
  playSpellHeal(actorId: string, targetId: string, amount: number, visual: SpellVisualSpec | undefined): void;
  playSpellStatus(actorId: string, targetId: string, visual: SpellVisualSpec, role: 'buff' | 'debuff', durationSeconds: number): void;
}

interface UnitVisual {
  sprite: Sprite;
  shadow: Sprite;
  healthBar: HealthBar;
  baseTint: number;
  spriteHeight: number;
  centerX: number;
  feetY: number;
  side: BattleUnit['side'];
  rangedAttackStyle: RangedAttackStyle | null;
  bobPhase: number;
  flashUntilSeconds: number;
  lungeStartSeconds: number;
  lungeDirection: number;
  shakeStartSeconds: number;
  defeatedStartSeconds: number;
}

interface Particle {
  sprite: Sprite;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  bornSeconds: number;
}

function feetLogicalY(slotIndex: number, unitCount: number): number {
  return 205 - ((unitCount - 1) * 44) / 2 + slotIndex * 44;
}

function projectileAnchor(visual: UnitVisual, sideOfUnit: number): { x: number; y: number } {
  return { x: visual.centerX + sideOfUnit * visual.lungeDirection * 10, y: visual.feetY - visual.spriteHeight * 0.6 };
}

export function createBattleView(stage: PixelStage): BattleView {
  const root = new Container();
  root.sortableChildren = true;
  root.visible = false;
  stage.pixi.views.addChild(root);

  const ground = new Sprite();
  ground.zIndex = BATTLE_Z.ground;
  root.addChild(ground);
  const backdropTextures = new Map<string, Texture>();

  const projectileLayer = createProjectileLayer(root);
  const spellEffects = createSpellEffectPlayer(root, (unitId) => {
    const visual = visualsByUnitId.get(unitId);
    return visual && { x: visual.centerX, feetY: visual.feetY, height: visual.spriteHeight, facing: visual.lungeDirection };
  });
  const visualsByUnitId = new Map<string, UnitVisual>();
  const particles: Particle[] = [];
  const rareTint = hexToNumber(PALETTE.gold);
  let latestElapsedSeconds = 0;

  const clearUnits = (): void => {
    projectileLayer.clear();
    spellEffects.clear();
    visualsByUnitId.forEach((visual) => {
      visual.sprite.destroy();
      visual.shadow.destroy();
      visual.healthBar.dispose();
    });
    visualsByUnitId.clear();
  };

  const spawnFloatingText = (visual: UnitVisual, text: string, className: string): void => {
    const label = document.createElement('div');
    label.className = `floating-text ${className}`;
    label.textContent = text;
    label.style.left = `${(visual.centerX / LOGICAL_WIDTH) * 100}%`;
    label.style.top = `${((visual.feetY - visual.spriteHeight) / LOGICAL_HEIGHT) * 100}%`;
    stage.overlay.append(label);
    window.setTimeout(() => label.remove(), FLOATING_TEXT_MILLISECONDS);
  };

  const spawnParticles = (visual: UnitVisual, color: string, count: number): void => {
    for (let index = 0; index < count; index++) {
      const sprite = createFlatSprite(color, PARTICLE_SIZE, PARTICLE_SIZE);
      sprite.zIndex = BATTLE_Z.particle;
      root.addChild(sprite);
      const angle = (index / count) * Math.PI * 2 + visual.centerX;
      // The y axis points down, so an upward speed is negative.
      particles.push({ sprite, x: visual.centerX, y: visual.feetY - visual.spriteHeight * 0.6, velocityX: Math.cos(angle) * 60, velocityY: -(Math.sin(angle) * 60 + 30), bornSeconds: latestElapsedSeconds });
    }
  };

  const showHitOn = (target: UnitVisual, amount: number, isCritical: boolean): void => {
    target.flashUntilSeconds = latestElapsedSeconds + FLASH_SECONDS;
    target.shakeStartSeconds = latestElapsedSeconds;
    spawnParticles(target, isCritical ? PALETTE.gold : '#ffffff', isCritical ? 10 : 5);
    if (amount > 0) spawnFloatingText(target, isCritical ? `${amount}!` : String(amount), isCritical ? 'critical' : 'damage');
  };

  const applyAnimation = (visual: UnitVisual, elapsedSeconds: number): void => {
    let offsetX = 0;
    const offsetY = visual.defeatedStartSeconds > 0 ? 0 : Math.round(Math.sin(elapsedSeconds * 3 + visual.bobPhase));
    const lungeProgress = (elapsedSeconds - visual.lungeStartSeconds) / LUNGE_SECONDS;
    if (visual.lungeStartSeconds > 0 && lungeProgress < 1) offsetX += Math.sin(Math.PI * lungeProgress) * LUNGE_DISTANCE * visual.lungeDirection;
    const shakeProgress = (elapsedSeconds - visual.shakeStartSeconds) / SHAKE_SECONDS;
    if (visual.shakeStartSeconds > 0 && shakeProgress < 1) offsetX += Math.round(Math.sin(shakeProgress * 40) * 3 * (1 - shakeProgress));

    const sprite = visual.sprite;
    sprite.tint = elapsedSeconds < visual.flashUntilSeconds ? FLASH_TINT : visual.baseTint;
    let height = visual.spriteHeight;
    if (visual.defeatedStartSeconds > 0) {
      const collapse = Math.min(1, (elapsedSeconds - visual.defeatedStartSeconds) / DEFEAT_SECONDS);
      height = Math.max(2, visual.spriteHeight * (1 - 0.7 * collapse));
      sprite.alpha = 1 - 0.65 * collapse;
    }
    sprite.height = height;
    // The sprite stands on its feet, so a collapse shrinks it toward the ground. The left edge is rounded so the pixels stay on the grid.
    sprite.position.set(Math.round(visual.centerX + offsetX - sprite.width / 2), Math.round(visual.feetY + offsetY - height));
  };

  stage.onFrame((elapsedSeconds) => {
    const deltaSeconds = Math.min(0.1, elapsedSeconds - latestElapsedSeconds);
    latestElapsedSeconds = elapsedSeconds;
    if (!root.visible) return;
    projectileLayer.update(elapsedSeconds);
    spellEffects.update(elapsedSeconds);
    visualsByUnitId.forEach((visual) => {
      applyAnimation(visual, elapsedSeconds);
      visual.healthBar.update(elapsedSeconds, deltaSeconds);
    });
    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index] as Particle;
      const age = elapsedSeconds - particle.bornSeconds;
      if (age > PARTICLE_LIFE_SECONDS) {
        particle.sprite.destroy();
        particles.splice(index, 1);
        continue;
      }
      particle.velocityY += PARTICLE_GRAVITY * deltaSeconds;
      particle.x += particle.velocityX * deltaSeconds;
      particle.y += particle.velocityY * deltaSeconds;
      particle.sprite.position.set(Math.round(particle.x - PARTICLE_SIZE / 2), Math.round(particle.y - PARTICLE_SIZE / 2));
      particle.sprite.alpha = 1 - age / PARTICLE_LIFE_SECONDS;
    }
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
      if (isVisible) stage.setLayout('fixed');
    },
    setBackdrop: (dungeonId) => {
      let texture = backdropTextures.get(dungeonId);
      if (!texture) {
        texture = createPixiTexture(drawBattleBackdrop(dungeonId));
        backdropTextures.set(dungeonId, texture);
      }
      ground.texture = texture;
      ground.width = LOGICAL_WIDTH;
      ground.height = LOGICAL_HEIGHT;
    },
    showUnits: (units) => {
      clearUnits();
      (['party', 'enemy'] as const).forEach((side) => {
        const sideUnits = units.filter((unit) => unit.side === side);
        sideUnits.forEach((unit, slotIndex) => {
          const sprite = createBattleSprite(unit);
          sprite.zIndex = BATTLE_Z.unit;
          const spriteHeight = sprite.height;
          const centerX = LOGICAL_WIDTH / 2 + (side === 'party' ? -SIDE_OFFSET_X : SIDE_OFFSET_X) - (unit.rank === 'boss' ? 6 : 0);
          const feetY = feetLogicalY(slotIndex, sideUnits.length);
          const shadowWidth = Math.round(sprite.width * 0.9);
          const shadow = createFlatSprite('#000000', shadowWidth, 6);
          shadow.zIndex = BATTLE_Z.shadow;
          shadow.alpha = 0.35;
          shadow.position.set(Math.round(centerX - shadowWidth / 2), feetY - 4);
          const barWidth = healthBarLength(unit.maxHp, STAGE_HEALTH_BAR_SCALE);
          const healthBar = createHealthBar({ hp: unit.hp, maxHp: unit.maxHp, level: unit.level, side, rank: unit.rank, barWidth, resource: side === 'party' && unit.maxResource > 0 ? { id: unit.resourceId, value: unit.resource, max: unit.maxResource } : undefined });
          healthBar.sprite.zIndex = BATTLE_Z.healthBar;
          healthBar.sprite.position.set(Math.round(centerX - healthBar.sprite.width / 2), Math.round(feetY - spriteHeight - HEALTH_BAR_GAP_ABOVE_HEAD - healthBar.sprite.height / 2));
          const visual: UnitVisual = {
            sprite, shadow, healthBar, baseTint: unit.rank === 'rare' ? rareTint : WHITE_TINT, spriteHeight, centerX, feetY, side,
            rangedAttackStyle: RANGED_ATTACK_STYLE_BY_SPRITE_KEY[unit.spriteKey] ?? null,
            bobPhase: slotIndex * 1.7 + (side === 'party' ? 0 : 0.9),
            flashUntilSeconds: 0, lungeStartSeconds: 0, lungeDirection: side === 'party' ? 1 : -1, shakeStartSeconds: 0, defeatedStartSeconds: 0,
          };
          visualsByUnitId.set(unit.id, visual);
          root.addChild(shadow, sprite, healthBar.sprite);
          applyAnimation(visual, latestElapsedSeconds);
        });
      });
    },
    setUnitHealth: (unitId, hp) => {
      const visual = visualsByUnitId.get(unitId);
      if (visual) visual.healthBar.setHealth(hp, latestElapsedSeconds);
    },
    setUnitResource: (unitId, value) => {
      visualsByUnitId.get(unitId)?.healthBar.setResource(value);
    },
    setUnitShield: (unitId, value, durationSeconds) => {
      visualsByUnitId.get(unitId)?.healthBar.setShield(value, latestElapsedSeconds, durationSeconds);
    },
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
      target.flashUntilSeconds = latestElapsedSeconds + FLASH_SECONDS;
      spawnFloatingText(target, String(amount), 'burn');
    },
    playHit: (actorId, targetId, amount, isCritical) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      const showImpact = (): void => showHitOn(target, amount, isCritical);
      if (actor?.rangedAttackStyle) {
        // The hit shows when the projectile lands, not when the shot leaves.
        projectileLayer.launch(actor.rangedAttackStyle, projectileAnchor(actor, 1), projectileAnchor(target, -1), actor.lungeDirection, latestElapsedSeconds, showImpact);
        return;
      }
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      showImpact();
    },
    playHeal: (actorId, targetId, amount) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      if (!target) return;
      spawnParticles(target, PALETTE.goblin, 6);
      spawnFloatingText(target, `+${amount}`, 'heal');
    },
    playSpellCast: (casterId, visual) => {
      const caster = visualsByUnitId.get(casterId);
      if (caster) caster.lungeStartSeconds = latestElapsedSeconds;
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
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
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
      visual.defeatedStartSeconds = latestElapsedSeconds + 0.001;
      visual.healthBar.setVisible(false);
      visual.shadow.alpha = 0.15;
    },
  };
}
