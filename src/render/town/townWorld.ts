import { Container, Sprite } from 'pixi.js';
import type { BuildingDefinition } from '../../content/buildings';
import { TOWN_WIDTH } from '../../kernel/stageSize';
import { drawBuildingArt } from '../buildingArt';
import { createPixiTexture } from '../pixiTextures';
import { TREE_SPRITE_HEIGHT, TREE_SPRITE_WIDTH, drawTreeSprite } from '../townTreeArt';
import { drawTownGroundArt } from '../townGroundArt';

const GROUND_DRAW_ORDER = -1000;

export interface TownWorld {
  // Everything that scrolls with the town. Children sort by the y of their feet, so a lower thing draws over a higher one.
  container: Container;
  buildingSprites: ReadonlyMap<string, Sprite>;
  treeSprites: readonly Sprite[];
}

export function createTownWorld(buildings: readonly BuildingDefinition[]): TownWorld {
  const container = new Container();
  container.sortableChildren = true;

  const groundArt = drawTownGroundArt();
  const ground = new Sprite(createPixiTexture(groundArt.canvas));
  ground.width = TOWN_WIDTH;
  ground.zIndex = GROUND_DRAW_ORDER;
  container.addChild(ground);

  const buildingSprites = new Map<string, Sprite>();
  for (const building of buildings) {
    const art = drawBuildingArt(building.style, building.width, building.height);
    const sprite = new Sprite(createPixiTexture(art));
    sprite.position.set(Math.round(building.x - art.width / 2), building.y - art.height);
    sprite.zIndex = building.y;
    container.addChild(sprite);
    buildingSprites.set(building.id, sprite);
  }

  const treeTexture = createPixiTexture(drawTreeSprite());
  const treeSprites = groundArt.treePositions.map((tree) => {
    const sprite = new Sprite(treeTexture);
    sprite.position.set(Math.round(tree.x - TREE_SPRITE_WIDTH / 2), tree.y - TREE_SPRITE_HEIGHT);
    sprite.zIndex = tree.y;
    container.addChild(sprite);
    return sprite;
  });

  return { container, buildingSprites, treeSprites };
}
