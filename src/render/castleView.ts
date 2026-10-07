import { Container, Sprite, type Texture } from 'pixi.js';
import { CASTLE_SPOTS, castleWorldX as spotWorldX, type CastleSpot } from '../content/castle';
import { CASTLE_SCREEN_COUNT, CASTLE_WIDTH, LOGICAL_WIDTH } from '../kernel/stageSize';
import { createAnimalChatter } from './animalChatter';
import { createAnimalPetting, type AnimalVoice } from './animalPetting';
import { createRandom } from '../kernel/random';
import { createCastlePets } from './castlePets';
import { drawShadowOval } from './castleAmbientArt';
import { FIGURE_DRAWERS } from './castleFigureArt';
import { drawHallBackdrop } from './castleHallArt';
import { drawFrameTower } from './castleParapetArt';
import { drawRampartsBackdrop } from './castleRampartsArt';
import { createCastleScenery, FRAME_TOWER_DEPTH, HALL_BACKDROP_DEPTH, RAMPARTS_BACKDROP_DEPTH } from './castleScenery';
import type { PixelStage } from './pixelStage';
import { createPixiTexture } from './pixiTextures';
import { createScreenScroller } from './screenScroller';
import type { SlidingView } from './slidingView';

export type CastleView = SlidingView;

const FIRST_SCREEN = 0;
const IDLE_BOB_SECONDS = 1.4;
const SHADOW_WIDTH = 22;
const ANIMAL_HEART_DEPTH = 100;

function createBackdrop(canvas: HTMLCanvasElement, screenIndex: number, depth: number): Sprite {
  const backdrop = new Sprite(createPixiTexture(canvas));
  backdrop.position.set(screenIndex * LOGICAL_WIDTH, 0);
  backdrop.zIndex = depth;
  return backdrop;
}

interface IdlingFigure {
  sprite: Sprite;
  restingY: number;
  phase: number;
}

function addFigure(root: Container, spot: CastleSpot, figureTextures: Map<string, Texture>, shadowTexture: Texture): IdlingFigure {
  const look = spot.look as string;
  let texture = figureTextures.get(look);
  const drawer = FIGURE_DRAWERS[look];
  if (!drawer) throw new Error(`Unknown castle figure look: ${look}`);
  if (!texture) {
    texture = createPixiTexture(drawer());
    figureTextures.set(look, texture);
  }
  const depth = spot.y * 0.01 - 3;
  const feetX = spotWorldX(spot);
  const feetY = spot.y;

  const shadow = new Sprite(shadowTexture);
  shadow.anchor.set(0.5);
  shadow.width = SHADOW_WIDTH;
  shadow.height = 6;
  shadow.position.set(feetX, feetY + 1);
  shadow.zIndex = depth - 0.001;
  root.addChild(shadow);

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, 1);
  sprite.position.set(feetX, feetY);
  sprite.zIndex = depth;
  root.addChild(sprite);
  return { sprite, restingY: feetY, phase: (spot.x * 0.37) % IDLE_BOB_SECONDS };
}

export function createCastleView(stage: PixelStage, animalVoice: AnimalVoice): CastleView {
  // The root holds the whole castle world. It moves left to scroll, and its children sort by zIndex.
  const root = new Container();
  root.visible = false;
  root.sortableChildren = true;
  stage.pixi.views.addChild(root);

  root.addChild(createBackdrop(drawHallBackdrop(), 0, HALL_BACKDROP_DEPTH));
  root.addChild(createBackdrop(drawRampartsBackdrop(), 1, RAMPARTS_BACKDROP_DEPTH));
  const frameTowerTexture = createPixiTexture(drawFrameTower());
  for (const side of [-1, 1] as const) {
    const tower = new Sprite(frameTowerTexture);
    tower.anchor.set(0.5, 0);
    // The right tower is the left one mirrored.
    tower.scale.x = -side;
    const edgeX = side === -1 ? LOGICAL_WIDTH : CASTLE_WIDTH;
    tower.position.set(edgeX + (side === -1 ? 13 : -13), 0);
    tower.zIndex = FRAME_TOWER_DEPTH;
    root.addChild(tower);
  }

  const figureTextures = new Map<string, Texture>();
  const shadowTexture = createPixiTexture(drawShadowOval(SHADOW_WIDTH));
  const figures = CASTLE_SPOTS.filter((spot) => spot.kind === 'person').map((spot) => addFigure(root, spot, figureTextures, shadowTexture));
  const scenery = createCastleScenery(root);
  const petting = createAnimalPetting(root, animalVoice, () => root.visible, ANIMAL_HEART_DEPTH);
  const pets = createCastlePets(root, petting);

  const scroller = createScreenScroller(LOGICAL_WIDTH, CASTLE_SCREEN_COUNT, FIRST_SCREEN);
  const animalChatter = createAnimalChatter(createRandom(7).fork('animal-chatter'), animalVoice, () => pets.kindsOnScreen(scroller.currentScreen()), () => false);
  scroller.onScroll((scrollLeft) => {
    root.x = -Math.round(scrollLeft);
  });
  let previousSeconds: number | null = null;

  stage.onFrame((elapsedSeconds) => {
    if (!root.visible) return;
    const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
    previousSeconds = elapsedSeconds;
    scroller.advance(deltaSeconds);
    scenery.update(elapsedSeconds);
    pets.update(elapsedSeconds);
    petting.update(elapsedSeconds);
    animalChatter.update(elapsedSeconds);
    // A figure breathes: one whole pixel up for half of each cycle.
    for (const figure of figures) figure.sprite.position.y = figure.restingY - (((elapsedSeconds + figure.phase) % IDLE_BOB_SECONDS) < IDLE_BOB_SECONDS / 2 ? 0 : 1);
  });

  return {
    setVisible: (isVisible) => {
      // The slide starts at the hall each time the player walks in. The app calls this on every state change, so only a change counts.
      const isEntering = isVisible && !root.visible;
      root.visible = isVisible;
      previousSeconds = null;
      if (isEntering) scroller.snapToScreen(FIRST_SCREEN);
      if (isVisible) {
        stage.setLayout('fixed');
        scroller.announce();
      }
    },
    goToScreen: scroller.goToScreen,
    currentScreen: scroller.currentScreen,
    onScroll: scroller.onScroll,
  };
}
