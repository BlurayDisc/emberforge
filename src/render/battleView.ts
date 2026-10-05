import { Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Sprite } from 'three';
import type { BattleUnit } from '../model/battle';
import { drawBattleBackdrop } from './battleBackdrops';
import { PALETTE } from './palette';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { healthBarLength, type HealthBarLengthScale } from '../kernel/healthBarLength';
import { createHealthBar, type HealthBar } from './healthBarArt';
import { createPixelTexture, createBattleSprite } from './pixelSprites';
import { createProjectileLayer } from './projectileLayer';
import { RANGED_ATTACK_STYLE_BY_SPRITE_KEY, type RangedAttackStyle } from './rangedAttackStyles';
import type { SpellVisualSpec } from '../content/spellVisuals';
import { createSpellEffectPlayer } from './spellEffects/spellEffectPlayer';

const HEALTH_BAR_GAP_ABOVE_HEAD = 6;
const STAGE_HEALTH_BAR_SCALE: HealthBarLengthScale = { lengthPerRootPoint: 4, minimum: 28, maximum: 56 };
const SIDE_OFFSET_X = 105;
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
  shadow: Mesh;
  healthBar: HealthBar;
  baseColor: Color;
  spriteHeight: number;
  worldX: number;
  feetWorldY: number;
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
  mesh: Mesh;
  velocityX: number;
  velocityY: number;
  bornSeconds: number;
}

const unitSquareGeometry = new PlaneGeometry(1, 1);

function feetLogicalY(slotIndex: number, unitCount: number): number {
  return 205 - ((unitCount - 1) * 44) / 2 + slotIndex * 44;
}

function createFlatMesh(color: string, width: number, height: number, z: number): Mesh {
  const mesh = new Mesh(unitSquareGeometry, new MeshBasicMaterial({ color, transparent: true }));
  mesh.scale.set(width, height, 1);
  mesh.position.z = z;
  return mesh;
}

function projectileAnchor(visual: UnitVisual, sideOfUnit: number): { x: number; y: number } {
  return { x: visual.worldX + sideOfUnit * visual.lungeDirection * 10, y: visual.feetWorldY + visual.spriteHeight * 0.6 };
}

export function createBattleView(stage: PixelStage): BattleView {
  const root = new Group();
  stage.scene.add(root);

  const ground = new Mesh(new PlaneGeometry(LOGICAL_WIDTH, LOGICAL_HEIGHT), new MeshBasicMaterial());
  ground.position.z = -5;
  root.add(ground);
  const backdropTextures = new Map<string, MeshBasicMaterial['map']>();

  const projectileLayer = createProjectileLayer(root);
  const spellEffects = createSpellEffectPlayer(root, (unitId) => {
    const visual = visualsByUnitId.get(unitId);
    return visual && { x: visual.worldX, feetY: visual.feetWorldY, height: visual.spriteHeight, facing: visual.lungeDirection };
  });
  const visualsByUnitId = new Map<string, UnitVisual>();
  const particles: Particle[] = [];
  const flashColor = new Color(PALETTE.blood).lerp(new Color('#ffffff'), 0.4);
  const rareColor = new Color(PALETTE.gold);
  let latestElapsedSeconds = 0;

  const clearUnits = (): void => {
    projectileLayer.clear();
    spellEffects.clear();
    visualsByUnitId.forEach((visual) => {
      visual.sprite.material.dispose();
      (visual.shadow.material as MeshBasicMaterial).dispose();
      visual.healthBar.dispose();
      root.remove(visual.shadow, visual.healthBar.sprite, visual.sprite);
    });
    visualsByUnitId.clear();
  };

  const spawnFloatingText = (visual: UnitVisual, text: string, className: string): void => {
    const label = document.createElement('div');
    label.className = `floating-text ${className}`;
    label.textContent = text;
    label.style.left = `${((visual.worldX + LOGICAL_WIDTH / 2) / LOGICAL_WIDTH) * 100}%`;
    label.style.top = `${((LOGICAL_HEIGHT / 2 - (visual.feetWorldY + visual.spriteHeight)) / LOGICAL_HEIGHT) * 100}%`;
    stage.overlay.append(label);
    window.setTimeout(() => label.remove(), FLOATING_TEXT_MILLISECONDS);
  };

  const spawnParticles = (visual: UnitVisual, color: string, count: number): void => {
    for (let index = 0; index < count; index++) {
      const mesh = createFlatMesh(color, 2, 2, 2);
      mesh.position.set(visual.worldX, visual.feetWorldY + visual.spriteHeight * 0.6, 2);
      root.add(mesh);
      const angle = (index / count) * Math.PI * 2 + visual.worldX;
      particles.push({ mesh, velocityX: Math.cos(angle) * 60, velocityY: Math.sin(angle) * 60 + 30, bornSeconds: latestElapsedSeconds });
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
    let offsetY = visual.defeatedStartSeconds > 0 ? 0 : Math.round(Math.sin(elapsedSeconds * 3 + visual.bobPhase));
    const lungeProgress = (elapsedSeconds - visual.lungeStartSeconds) / LUNGE_SECONDS;
    if (visual.lungeStartSeconds > 0 && lungeProgress < 1) offsetX += Math.sin(Math.PI * lungeProgress) * LUNGE_DISTANCE * visual.lungeDirection;
    const shakeProgress = (elapsedSeconds - visual.shakeStartSeconds) / SHAKE_SECONDS;
    if (visual.shakeStartSeconds > 0 && shakeProgress < 1) offsetX += Math.round(Math.sin(shakeProgress * 40) * 3 * (1 - shakeProgress));

    const sprite = visual.sprite;
    sprite.material.color.copy(elapsedSeconds < visual.flashUntilSeconds ? flashColor : visual.baseColor);
    if (visual.defeatedStartSeconds > 0) {
      const collapse = Math.min(1, (elapsedSeconds - visual.defeatedStartSeconds) / DEFEAT_SECONDS);
      sprite.scale.y = Math.max(2, visual.spriteHeight * (1 - 0.7 * collapse));
      sprite.material.opacity = 1 - 0.65 * collapse;
      offsetY -= 0;
    }
    sprite.position.set(Math.round(visual.worldX + offsetX), Math.round(visual.feetWorldY + sprite.scale.y / 2 + offsetY), 0.5);
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
        (particle.mesh.material as MeshBasicMaterial).dispose();
        root.remove(particle.mesh);
        particles.splice(index, 1);
        continue;
      }
      particle.velocityY -= 220 * deltaSeconds;
      particle.mesh.position.x = Math.round(particle.mesh.position.x + particle.velocityX * deltaSeconds);
      particle.mesh.position.y = Math.round(particle.mesh.position.y + particle.velocityY * deltaSeconds);
      (particle.mesh.material as MeshBasicMaterial).opacity = 1 - age / PARTICLE_LIFE_SECONDS;
    }
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
    },
    setBackdrop: (dungeonId) => {
      let texture = backdropTextures.get(dungeonId);
      if (!texture) {
        texture = createPixelTexture(drawBattleBackdrop(dungeonId));
        backdropTextures.set(dungeonId, texture);
      }
      (ground.material as MeshBasicMaterial).map = texture;
      (ground.material as MeshBasicMaterial).needsUpdate = true;
    },
    showUnits: (units) => {
      clearUnits();
      (['party', 'enemy'] as const).forEach((side) => {
        const sideUnits = units.filter((unit) => unit.side === side);
        sideUnits.forEach((unit, slotIndex) => {
          const sprite = createBattleSprite(unit);
          const worldX = (side === 'party' ? -SIDE_OFFSET_X : SIDE_OFFSET_X) - (unit.rank === 'boss' ? 6 : 0);
          const feetWorldY = LOGICAL_HEIGHT / 2 - feetLogicalY(slotIndex, sideUnits.length);
          const baseColor = unit.rank === 'rare' ? rareColor.clone() : new Color('#ffffff');
          const shadowWidth = Math.round(sprite.scale.x * 0.9);
          const shadow = createFlatMesh('#000000', shadowWidth, 6, -0.5);
          shadow.position.set(worldX, feetWorldY + 1, -0.5);
          (shadow.material as MeshBasicMaterial).opacity = 0.35;
          const barWidth = healthBarLength(unit.maxHp, STAGE_HEALTH_BAR_SCALE);
          const healthBar = createHealthBar({ hp: unit.hp, maxHp: unit.maxHp, level: unit.level, side, rank: unit.rank, barWidth, resource: side === 'party' && unit.maxResource > 0 ? { id: unit.resourceId, value: unit.resource, max: unit.maxResource } : undefined });
          healthBar.sprite.position.set(worldX, Math.round(feetWorldY + sprite.scale.y + HEALTH_BAR_GAP_ABOVE_HEAD), 3);
          const visual: UnitVisual = {
            sprite, shadow, healthBar, baseColor, spriteHeight: sprite.scale.y, worldX, feetWorldY, side,
            rangedAttackStyle: RANGED_ATTACK_STYLE_BY_SPRITE_KEY[unit.spriteKey] ?? null,
            bobPhase: slotIndex * 1.7 + (side === 'party' ? 0 : 0.9),
            flashUntilSeconds: 0, lungeStartSeconds: 0, lungeDirection: side === 'party' ? 1 : -1, shakeStartSeconds: 0, defeatedStartSeconds: 0,
          };
          visualsByUnitId.set(unit.id, visual);
          root.add(shadow, sprite, healthBar.sprite);
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
      (visual.shadow.material as MeshBasicMaterial).opacity = 0.15;
    },
  };
}
