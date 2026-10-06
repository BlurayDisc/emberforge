import { Container, Sprite } from 'pixi.js';
import type { BuildingDefinition } from '../../content/buildings';
import { PALETTE } from '../palette';
import { addOutline, createPixelCanvas } from '../pixelCanvas';
import { createPixiTexture } from '../pixiTextures';

const ARROW_WIDTH = 11;
const ARROW_HEIGHT = 8;
const GAP_ABOVE_ROOF = 38;
const BOB_PER_SECOND = 3;
const BOB_PIXELS = 3;
const DRAW_ORDER = 150000;

function createDownArrowTexture(): ReturnType<typeof createPixiTexture> {
  const art = createPixelCanvas(ARROW_WIDTH, ARROW_HEIGHT);
  for (let y = 0; y < ARROW_HEIGHT; y++) {
    const halfWidth = ((ARROW_HEIGHT - 1 - y) / (ARROW_HEIGHT - 1)) * ((ARROW_WIDTH - 1) / 2);
    art.fill(y < 2 ? PALETTE.uiGoldLight : PALETTE.uiGold, Math.round((ARROW_WIDTH - 1) / 2 - halfWidth), y, Math.round(halfWidth * 2) + 1, 1);
  }
  addOutline(art, 'outline');
  return createPixiTexture(art.canvas);
}

export interface TownGuide {
  // Shows a bobbing arrow over a building, so a new player sees where to go. Null hides it.
  setTarget(buildingId: string | null): void;
  update(elapsedSeconds: number): void;
}

export function createTownGuide(world: Container, buildings: readonly BuildingDefinition[]): TownGuide {
  const arrow = new Sprite(createDownArrowTexture());
  arrow.zIndex = DRAW_ORDER;
  arrow.visible = false;
  world.addChild(arrow);
  let target: BuildingDefinition | undefined;

  return {
    setTarget: (buildingId) => {
      target = buildings.find((building) => building.id === buildingId);
      arrow.visible = target !== undefined;
    },
    update: (elapsedSeconds) => {
      if (!target) return;
      const bob = Math.floor(Math.abs(Math.sin(elapsedSeconds * BOB_PER_SECOND)) * BOB_PIXELS);
      arrow.position.set(Math.round(target.x - ARROW_WIDTH / 2), target.y - target.height - GAP_ABOVE_ROOF + bob);
    },
  };
}
