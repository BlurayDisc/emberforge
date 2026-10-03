import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial } from 'three';
import type { BuildingDefinition } from '../content/buildings';
import type { BattleUnit } from '../model/battle';
import { drawBuildingArt } from './buildingArt';
import { createPixelTexture, createUnitSprite } from './pixelSprites';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { drawTownGroundArt } from './townGroundArt';

const PARTY_FEET_Y = 188;
const PARTY_CENTER_X = 240;
const PARTY_SPACING = 34;

export interface TownView {
  setVisible(isVisible: boolean): void;
  showParty(units: readonly BattleUnit[]): void;
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
  sprite.position.set(toWorldX(building.x), toWorldY(building.y) + art.height / 2, -1);
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

  let partySprites: Sprite[] = [];

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
    },
    showParty: (units) => {
      partySprites.forEach((sprite) => {
        sprite.material.dispose();
        root.remove(sprite);
      });
      partySprites = units.map((unit, index) => {
        const sprite = createUnitSprite(unit.spriteKey);
        const x = PARTY_CENTER_X + (index - (units.length - 1) / 2) * PARTY_SPACING;
        sprite.position.set(toWorldX(x), toWorldY(PARTY_FEET_Y) + 8, 1);
        root.add(sprite);
        return sprite;
      });
    },
  };
}
