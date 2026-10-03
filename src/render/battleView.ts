import { Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Sprite } from 'three';
import type { BattleUnit } from '../model/battle';
import { drawBattleBackdrop } from './battleBackdrops';
import { PALETTE } from './palette';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { createPixelTexture, createBattleSprite } from './pixelSprites';

const HEALTH_BAR_WIDTH = 24;
const HEALTH_BAR_HEIGHT = 3;
const SIDE_OFFSET_X = 105;
const FLASH_SECONDS = 0.18;
const LUNGE_SECONDS = 0.28;
const LUNGE_DISTANCE = 16;
const SHAKE_SECONDS = 0.22;
const DEFEAT_SECONDS = 0.6;
const PARTICLE_LIFE_SECONDS = 0.45;
const FLOATING_TEXT_MILLISECONDS = 1100;

export interface BattleView {
  setVisible(isVisible: boolean): void;
  setBackdrop(dungeonId: string): void;
  showUnits(units: readonly BattleUnit[]): void;
  setUnitHealth(unitId: string, hp: number, maxHp: number): void;
  playHit(actorId: string, targetId: string, amount: number, isCritical: boolean): void;
  playHeal(actorId: string, targetId: string, amount: number): void;
  markDefeated(unitId: string): void;
}

interface UnitVisual {
  sprite: Sprite;
  shadow: Mesh;
  healthBackground: Mesh;
  healthFill: Mesh;
  baseColor: Color;
  spriteHeight: number;
  worldX: number;
  feetWorldY: number;
  side: BattleUnit['side'];
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

export function createBattleView(stage: PixelStage): BattleView {
  const root = new Group();
  stage.scene.add(root);

  const ground = new Mesh(new PlaneGeometry(LOGICAL_WIDTH, LOGICAL_HEIGHT), new MeshBasicMaterial());
  ground.position.z = -5;
  root.add(ground);
  const backdropTextures = new Map<string, MeshBasicMaterial['map']>();

  const visualsByUnitId = new Map<string, UnitVisual>();
  const particles: Particle[] = [];
  const flashColor = new Color(PALETTE.blood).lerp(new Color('#ffffff'), 0.4);
  const rareColor = new Color(PALETTE.gold);
  let latestElapsedSeconds = 0;

  const clearUnits = (): void => {
    visualsByUnitId.forEach((visual) => {
      visual.sprite.material.dispose();
      for (const part of [visual.shadow, visual.healthBackground, visual.healthFill]) {
        (part.material as MeshBasicMaterial).dispose();
        root.remove(part);
      }
      root.remove(visual.sprite);
    });
    visualsByUnitId.clear();
  };

  const placeHealthFill = (visual: UnitVisual, fraction: number): void => {
    const width = Math.round(HEALTH_BAR_WIDTH * Math.max(0, Math.min(1, fraction)));
    visual.healthFill.visible = width > 0;
    visual.healthFill.scale.x = Math.max(1, width);
    visual.healthFill.position.x = visual.worldX - HEALTH_BAR_WIDTH / 2 + Math.max(1, width) / 2;
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
    visualsByUnitId.forEach((visual) => applyAnimation(visual, elapsedSeconds));
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
          const barY = feetWorldY - 6;
          const healthBackground = createFlatMesh(PALETTE.outline, HEALTH_BAR_WIDTH + 2, HEALTH_BAR_HEIGHT + 2, 1);
          healthBackground.position.set(worldX, barY, 1);
          const healthFill = createFlatMesh(side === 'party' ? PALETTE.goblin : PALETTE.blood, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, 2);
          healthFill.position.set(worldX, barY, 2);
          const visual: UnitVisual = {
            sprite, shadow, healthBackground, healthFill, baseColor, spriteHeight: sprite.scale.y, worldX, feetWorldY, side,
            bobPhase: slotIndex * 1.7 + (side === 'party' ? 0 : 0.9),
            flashUntilSeconds: 0, lungeStartSeconds: 0, lungeDirection: side === 'party' ? 1 : -1, shakeStartSeconds: 0, defeatedStartSeconds: 0,
          };
          placeHealthFill(visual, unit.hp / unit.maxHp);
          visualsByUnitId.set(unit.id, visual);
          root.add(shadow, sprite, healthBackground, healthFill);
          applyAnimation(visual, latestElapsedSeconds);
        });
      });
    },
    setUnitHealth: (unitId, hp, maxHp) => {
      const visual = visualsByUnitId.get(unitId);
      if (visual) placeHealthFill(visual, hp / maxHp);
    },
    playHit: (actorId, targetId, amount, isCritical) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      if (!target) return;
      target.flashUntilSeconds = latestElapsedSeconds + FLASH_SECONDS;
      target.shakeStartSeconds = latestElapsedSeconds;
      spawnParticles(target, isCritical ? PALETTE.gold : '#ffffff', isCritical ? 10 : 5);
      spawnFloatingText(target, isCritical ? `${amount}!` : String(amount), isCritical ? 'critical' : 'damage');
    },
    playHeal: (actorId, targetId, amount) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      if (!target) return;
      spawnParticles(target, PALETTE.goblin, 6);
      spawnFloatingText(target, `+${amount}`, 'heal');
    },
    markDefeated: (unitId) => {
      const visual = visualsByUnitId.get(unitId);
      if (!visual) return;
      visual.defeatedStartSeconds = latestElapsedSeconds + 0.001;
      visual.healthBackground.visible = false;
      visual.healthFill.visible = false;
      (visual.shadow.material as MeshBasicMaterial).opacity = 0.15;
    },
  };
}
