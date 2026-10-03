import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial } from 'three';
import type { BuildingDefinition } from '../content/buildings';
import { drawBuildingArt } from './buildingArt';
import { createPixelTexture } from './pixelSprites';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, TOWN_SCREEN_COUNT, TOWN_WIDTH } from '../kernel/stageSize';
import type { PixelStage } from './pixelStage';
import { createBystanders, depthFor, type BystanderSpeech, type VisibleRange } from './bystanders';
import { drawTownGroundArt } from './townGroundArt';
import { TOWN_ROADS } from './townLayout';

export interface TownView {
  setVisible(isVisible: boolean): void;
  goToScreen(screenIndex: number): void;
  currentScreen(): number;
  // Called with the world pixel at the left edge of the view, whenever the view moves.
  onScroll(listener: (scrollLeft: number) => void): void;
}

const SCROLL_EASING_PER_SECOND = 9;

function toWorldX(logicalX: number): number {
  return logicalX - TOWN_WIDTH / 2;
}

function toWorldY(logicalY: number): number {
  return LOGICAL_HEIGHT / 2 - logicalY;
}

function createBuildingSprite(building: BuildingDefinition): Sprite {
  const art = drawBuildingArt(building.style, building.width, building.height);
  const sprite = new Sprite(new SpriteMaterial({ map: createPixelTexture(art), transparent: true }));
  sprite.scale.set(art.width, art.height, 1);
  sprite.position.set(toWorldX(building.x), toWorldY(building.y) + art.height / 2, depthFor(building.y));
  return sprite;
}

export function createTownView(stage: PixelStage, buildings: readonly BuildingDefinition[], onSpeech: (speech: BystanderSpeech | null) => void): TownView {
  const root = new Group();
  stage.scene.add(root);

  const ground = new Mesh(
    new PlaneGeometry(TOWN_WIDTH, LOGICAL_HEIGHT),
    new MeshBasicMaterial({ map: createPixelTexture(drawTownGroundArt()) }),
  );
  ground.position.z = -5;
  root.add(ground);
  buildings.forEach((building) => root.add(createBuildingSprite(building)));

  let targetScreen = 1;
  let scrollLeft = targetScreen * LOGICAL_WIDTH;
  let previousSeconds: number | null = null;
  const scrollListeners: Array<(scrollLeft: number) => void> = [];
  const applyScroll = (): void => {
    stage.setCameraX(scrollLeft + LOGICAL_WIDTH / 2 - TOWN_WIDTH / 2);
    scrollListeners.forEach((listener) => listener(scrollLeft));
  };
  const visibleRange = (): VisibleRange => ({ from: scrollLeft, to: scrollLeft + LOGICAL_WIDTH });

  const bystanders = createBystanders(root, TOWN_ROADS, 5, onSpeech, visibleRange);
  stage.onFrame((elapsedSeconds) => {
    if (!root.visible) return;
    const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
    previousSeconds = elapsedSeconds;
    const targetLeft = targetScreen * LOGICAL_WIDTH;
    if (scrollLeft !== targetLeft) {
      const remaining = targetLeft - scrollLeft;
      // Each frame moves at least one whole pixel, so the slide always ends and the camera stays on whole pixels.
      const step = Math.max(1, Math.round(Math.abs(remaining) * Math.min(1, deltaSeconds * SCROLL_EASING_PER_SECOND)));
      scrollLeft = Math.abs(remaining) <= step ? targetLeft : scrollLeft + Math.sign(remaining) * step;
      applyScroll();
    }
    bystanders.update(elapsedSeconds);
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
      previousSeconds = null;
      // Battle scenes are drawn around x = 0, so the camera goes back there when the town hides.
      if (isVisible) applyScroll();
      else stage.setCameraX(0);
    },
    goToScreen: (screenIndex) => {
      targetScreen = Math.max(0, Math.min(TOWN_SCREEN_COUNT - 1, screenIndex));
    },
    currentScreen: () => targetScreen,
    onScroll: (listener) => {
      scrollListeners.push(listener);
    },
  };
}
