import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial } from 'three';
import type { BuildingDefinition } from '../content/buildings';
import { drawBuildingArt } from './buildingArt';
import { createPixelTexture } from './pixelSprites';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, TOWN_SCREEN_COUNT, TOWN_WIDTH } from '../kernel/stageSize';
import type { PixelStage } from './pixelStage';
import { createScreenScroller } from './screenScroller';
import type { SlidingView } from './slidingView';
import { createBystanders, depthFor, type BystanderSpeech, type VisibleRange } from './bystanders';
import { createTownAnimals } from './townAnimals';
import { drawTownGroundArt } from './townGroundArt';
import { TREE_SPRITE_HEIGHT, TREE_SPRITE_WIDTH, drawTreeSprite } from './townTreeArt';
import { TOWN_ROADS, type Point } from './townLayout';

export type TownView = SlidingView;

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

function createTreeSprites(treePositions: readonly Point[]): Sprite[] {
  const material = new SpriteMaterial({ map: createPixelTexture(drawTreeSprite()), transparent: true });
  return treePositions.map((tree) => {
    const sprite = new Sprite(material);
    sprite.scale.set(TREE_SPRITE_WIDTH, TREE_SPRITE_HEIGHT, 1);
    // Same depth rule as buildings and walkers: the lower on the screen, the nearer.
    sprite.position.set(toWorldX(tree.x), toWorldY(tree.y) + TREE_SPRITE_HEIGHT / 2, depthFor(tree.y));
    return sprite;
  });
}

export function createTownView(stage: PixelStage, buildings: readonly BuildingDefinition[], onSpeech: (speech: BystanderSpeech | null) => void): TownView {
  const root = new Group();
  stage.scene.add(root);

  const groundArt = drawTownGroundArt();
  const ground = new Mesh(
    new PlaneGeometry(TOWN_WIDTH, LOGICAL_HEIGHT),
    new MeshBasicMaterial({ map: createPixelTexture(groundArt.canvas) }),
  );
  ground.position.z = -5;
  root.add(ground);
  buildings.forEach((building) => root.add(createBuildingSprite(building)));
  createTreeSprites(groundArt.treePositions).forEach((tree) => root.add(tree));

  const scroller = createScreenScroller(LOGICAL_WIDTH, TOWN_SCREEN_COUNT, 1);
  scroller.onScroll((scrollLeft) => stage.setCameraX(scrollLeft + LOGICAL_WIDTH / 2 - TOWN_WIDTH / 2));
  const visibleRange = (): VisibleRange => ({ from: scroller.scrollLeft(), to: scroller.scrollLeft() + LOGICAL_WIDTH });
  let previousSeconds: number | null = null;

  const bystanders = createBystanders(root, TOWN_ROADS, 5, onSpeech, visibleRange);
  const animals = createTownAnimals(root, TOWN_ROADS, 5);
  stage.onFrame((elapsedSeconds) => {
    if (!root.visible) return;
    const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
    previousSeconds = elapsedSeconds;
    scroller.advance(deltaSeconds);
    bystanders.update(elapsedSeconds);
    animals.update(elapsedSeconds);
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
      previousSeconds = null;
      // Battle scenes are drawn around x = 0, so the camera goes back there when the town hides.
      if (isVisible) scroller.announce();
      else stage.setCameraX(0);
    },
    goToScreen: scroller.goToScreen,
    currentScreen: scroller.currentScreen,
    onScroll: scroller.onScroll,
  };
}
