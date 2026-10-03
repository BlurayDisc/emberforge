import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial, type CanvasTexture } from 'three';
import { CASTLE_SPOTS, castleWorldX as spotWorldX, type CastleSpot } from '../content/castle';
import { CASTLE_SCREEN_COUNT, CASTLE_WIDTH, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { createCastlePets } from './castlePets';
import { drawShadowOval } from './castleAmbientArt';
import { FIGURE_DRAWERS } from './castleFigureArt';
import { drawHallBackdrop } from './castleHallArt';
import { drawFrameTower, FRAME_TOWER_WIDTH } from './castleParapetArt';
import { drawRampartsBackdrop } from './castleRampartsArt';
import { castleWorldX, castleWorldY, createCastleScenery, FRAME_TOWER_DEPTH, HALL_BACKDROP_DEPTH, RAMPARTS_BACKDROP_DEPTH } from './castleScenery';
import type { PixelStage } from './pixelStage';
import { createPixelTexture } from './pixelSprites';
import { createScreenScroller } from './screenScroller';
import type { SlidingView } from './slidingView';

export type CastleView = SlidingView;

const FIRST_SCREEN = 0;
const IDLE_BOB_SECONDS = 1.4;
const SHADOW_WIDTH = 22;

function createBackdrop(canvas: HTMLCanvasElement, screenIndex: number, depth: number): Mesh {
  const backdrop = new Mesh(new PlaneGeometry(LOGICAL_WIDTH, LOGICAL_HEIGHT), new MeshBasicMaterial({ map: createPixelTexture(canvas) }));
  backdrop.position.set(castleWorldX(screenIndex * LOGICAL_WIDTH + LOGICAL_WIDTH / 2), 0, depth);
  return backdrop;
}

interface IdlingFigure {
  sprite: Sprite;
  restingY: number;
  phase: number;
}

function addFigure(root: Group, spot: CastleSpot, figureTextures: Map<string, CanvasTexture>, shadowTexture: CanvasTexture): IdlingFigure {
  const look = spot.look as string;
  let texture = figureTextures.get(look);
  const drawer = FIGURE_DRAWERS[look];
  if (!drawer) throw new Error(`Unknown castle figure look: ${look}`);
  if (!texture) {
    texture = createPixelTexture(drawer());
    figureTextures.set(look, texture);
  }
  const image = texture.image as HTMLCanvasElement;
  const depth = spot.y * 0.01 - 3;
  const feetX = castleWorldX(spotWorldX(spot));
  const feetY = castleWorldY(spot.y);

  const shadow = new Sprite(new SpriteMaterial({ map: shadowTexture, transparent: true }));
  shadow.scale.set(SHADOW_WIDTH, 6, 1);
  shadow.position.set(feetX, feetY - 1, depth - 0.001);
  root.add(shadow);

  const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(image.width, image.height, 1);
  const restingY = feetY + image.height / 2;
  sprite.position.set(feetX, restingY, depth);
  root.add(sprite);
  return { sprite, restingY, phase: (spot.x * 0.37) % IDLE_BOB_SECONDS };
}

export function createCastleView(stage: PixelStage): CastleView {
  const root = new Group();
  root.visible = false;
  stage.scene.add(root);

  root.add(createBackdrop(drawHallBackdrop(), 0, HALL_BACKDROP_DEPTH));
  root.add(createBackdrop(drawRampartsBackdrop(), 1, RAMPARTS_BACKDROP_DEPTH));
  for (const side of [-1, 1] as const) {
    const tower = new Sprite(new SpriteMaterial({ map: createPixelTexture(drawFrameTower()), transparent: true }));
    tower.scale.set(-side * (FRAME_TOWER_WIDTH + 2), LOGICAL_HEIGHT, 1);
    const edgeX = side === -1 ? LOGICAL_WIDTH : CASTLE_WIDTH;
    tower.position.set(castleWorldX(edgeX) + (side === -1 ? 13 : -13), 0, FRAME_TOWER_DEPTH);
    root.add(tower);
  }

  const figureTextures = new Map<string, CanvasTexture>();
  const shadowTexture = createPixelTexture(drawShadowOval(SHADOW_WIDTH));
  const figures = CASTLE_SPOTS.filter((spot) => spot.kind === 'person').map((spot) => addFigure(root, spot, figureTextures, shadowTexture));
  const scenery = createCastleScenery(root);
  const pets = createCastlePets(root);

  const scroller = createScreenScroller(LOGICAL_WIDTH, CASTLE_SCREEN_COUNT, FIRST_SCREEN);
  scroller.onScroll((scrollLeft) => stage.setCameraX(scrollLeft + LOGICAL_WIDTH / 2 - CASTLE_WIDTH / 2));
  let previousSeconds: number | null = null;

  stage.onFrame((elapsedSeconds) => {
    if (!root.visible) return;
    const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
    previousSeconds = elapsedSeconds;
    scroller.advance(deltaSeconds);
    scenery.update(elapsedSeconds);
    pets.update(elapsedSeconds);
    // A figure breathes: one whole pixel up for half of each cycle.
    for (const figure of figures) figure.sprite.position.y = figure.restingY + (((elapsedSeconds + figure.phase) % IDLE_BOB_SECONDS) < IDLE_BOB_SECONDS / 2 ? 0 : 1);
  });

  return {
    setVisible: (isVisible) => {
      // The slide starts at the hall each time the player walks in. The app calls this on every state change, so only a change counts.
      const isEntering = isVisible && !root.visible;
      root.visible = isVisible;
      previousSeconds = null;
      if (isEntering) scroller.snapToScreen(FIRST_SCREEN);
      if (isVisible) scroller.announce();
    },
    goToScreen: scroller.goToScreen,
    currentScreen: scroller.currentScreen,
    onScroll: scroller.onScroll,
  };
}
