import { Color, Mesh, MeshBasicMaterial, PlaneGeometry, type Sprite } from 'three';
import { createRandom } from '../kernel/random';
import type { BattleUnit } from '../model/battle';
import { PALETTE } from './palette';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { createPixelTexture, createUnitSprite } from './pixelSprites';

const HEALTH_BAR_WIDTH = 16;
const HEALTH_BAR_HEIGHT = 2;
const HEALTH_BAR_OFFSET_Y = -11;
const UNIT_SPACING_Y = 34;
const SIDE_OFFSET_X = 110;
const FLASH_SECONDS = 0.18;

export interface BattleView {
  showUnits(units: readonly BattleUnit[]): void;
  setUnitHealth(unitId: string, hp: number, maxHp: number): void;
  flashUnit(unitId: string): void;
  markDefeated(unitId: string): void;
}

interface UnitVisual {
  sprite: Sprite;
  healthBackground: Mesh;
  healthFill: Mesh;
  baseColor: Color;
  flashUntilSeconds: number;
}

const healthBarGeometry = new PlaneGeometry(1, 1);

function drawGround(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = LOGICAL_WIDTH;
  canvas.height = LOGICAL_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');

  context.fillStyle = PALETTE.moss;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const random = createRandom(7).fork('ground');
  for (let speckle = 0; speckle < 1400; speckle++) {
    context.fillStyle = random.chance(0.5) ? PALETTE.grass : PALETTE.soil;
    context.fillRect(random.nextInt(0, LOGICAL_WIDTH - 1), random.nextInt(0, LOGICAL_HEIGHT - 1), 1, 1);
  }
  return canvas;
}

function slotPositionY(slotIndex: number, unitCount: number): number {
  const centeringOffset = ((4 - unitCount) * UNIT_SPACING_Y) / 2;
  return 50 - slotIndex * UNIT_SPACING_Y - centeringOffset;
}

function baseColorFor(unit: BattleUnit): Color {
  if (unit.rank === 'rare') return new Color(PALETTE.gold);
  return new Color('#ffffff');
}

export function createBattleView(stage: PixelStage): BattleView {
  const ground = new Mesh(
    new PlaneGeometry(LOGICAL_WIDTH, LOGICAL_HEIGHT),
    new MeshBasicMaterial({ map: createPixelTexture(drawGround()) }),
  );
  ground.position.z = -5;
  stage.scene.add(ground);

  const visualsByUnitId = new Map<string, UnitVisual>();
  const flashColor = new Color(PALETTE.blood).lerp(new Color('#ffffff'), 0.4);
  let latestElapsedSeconds = 0;

  const clearUnits = (): void => {
    visualsByUnitId.forEach((visual) => {
      visual.sprite.material.dispose();
      (visual.healthBackground.material as MeshBasicMaterial).dispose();
      (visual.healthFill.material as MeshBasicMaterial).dispose();
      stage.scene.remove(visual.sprite, visual.healthBackground, visual.healthFill);
    });
    visualsByUnitId.clear();
  };

  const createHealthBar = (color: string, x: number, y: number, width: number, z: number): Mesh => {
    const bar = new Mesh(healthBarGeometry, new MeshBasicMaterial({ color }));
    bar.scale.set(width, HEALTH_BAR_HEIGHT, 1);
    bar.position.set(x, y, z);
    return bar;
  };

  const placeHealthFill = (visual: UnitVisual, fraction: number): void => {
    const width = Math.round(HEALTH_BAR_WIDTH * Math.max(0, Math.min(1, fraction)));
    const leftEdge = visual.healthBackground.position.x - HEALTH_BAR_WIDTH / 2;
    visual.healthFill.visible = width > 0;
    visual.healthFill.scale.x = Math.max(1, width);
    visual.healthFill.position.x = leftEdge + Math.max(1, width) / 2;
  };

  stage.onFrame((elapsedSeconds) => {
    latestElapsedSeconds = elapsedSeconds;
    visualsByUnitId.forEach((visual) => {
      const isFlashing = elapsedSeconds < visual.flashUntilSeconds;
      visual.sprite.material.color.copy(isFlashing ? flashColor : visual.baseColor);
    });
  });

  return {
    showUnits: (units) => {
      clearUnits();
      (['party', 'enemy'] as const).forEach((side) => {
        const sideUnits = units.filter((unit) => unit.side === side);
        sideUnits.forEach((unit, slotIndex) => {
          const x = side === 'party' ? -SIDE_OFFSET_X : SIDE_OFFSET_X;
          const y = slotPositionY(slotIndex, sideUnits.length);
          const sprite = createUnitSprite(unit.spriteKey);
          sprite.position.set(x, y, 0);
          const baseColor = baseColorFor(unit);
          sprite.material.color.copy(baseColor);

          const barY = y + HEALTH_BAR_OFFSET_Y;
          const healthBackground = createHealthBar(PALETTE.outline, x, barY, HEALTH_BAR_WIDTH + 2, 1);
          healthBackground.scale.y = HEALTH_BAR_HEIGHT + 2;
          const healthFill = createHealthBar(side === 'party' ? PALETTE.goblin : PALETTE.blood, x, barY, HEALTH_BAR_WIDTH, 2);
          const visual: UnitVisual = { sprite, healthBackground, healthFill, baseColor, flashUntilSeconds: 0 };
          placeHealthFill(visual, unit.hp / unit.maxHp);
          visualsByUnitId.set(unit.id, visual);
          stage.scene.add(sprite, healthBackground, healthFill);
        });
      });
    },
    setUnitHealth: (unitId, hp, maxHp) => {
      const visual = visualsByUnitId.get(unitId);
      if (visual) placeHealthFill(visual, hp / maxHp);
    },
    flashUnit: (unitId) => {
      const visual = visualsByUnitId.get(unitId);
      if (visual) visual.flashUntilSeconds = latestElapsedSeconds + FLASH_SECONDS;
    },
    markDefeated: (unitId) => {
      const visual = visualsByUnitId.get(unitId);
      if (!visual) return;
      visual.sprite.material.opacity = 0.25;
      visual.healthBackground.visible = false;
      visual.healthFill.visible = false;
    },
  };
}
