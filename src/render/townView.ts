import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial } from 'three';
import type { BuildingDefinition } from '../content/buildings';
import { drawBuildingArt } from './buildingArt';
import { createPixelTexture } from './pixelSprites';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { createBystanders, depthFor } from './bystanders';
import { drawTownGroundArt } from './townGroundArt';
import { TOWN_ROADS } from './townLayout';

export interface TownView {
  setVisible(isVisible: boolean): void;
}

function toWorldX(logicalX: number): number {
  return logicalX - LOGICAL_WIDTH / 2;
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

export function createTownView(stage: PixelStage, buildings: readonly BuildingDefinition[]): TownView {
  const root = new Group();
  stage.scene.add(root);

  const ground = new Mesh(
    new PlaneGeometry(LOGICAL_WIDTH, LOGICAL_HEIGHT),
    new MeshBasicMaterial({ map: createPixelTexture(drawTownGroundArt()) }),
  );
  ground.position.z = -5;
  root.add(ground);
  buildings.forEach((building) => root.add(createBuildingSprite(building)));

  const bystanders = createBystanders(root, TOWN_ROADS, 5);
  stage.onFrame((elapsedSeconds) => {
    if (root.visible) bystanders.update(elapsedSeconds);
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
    },
  };
}
