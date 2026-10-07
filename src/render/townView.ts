import { Container } from 'pixi.js';
import type { BuildingDefinition } from '../content/buildings';
import { TOWN_SCREEN_COUNT, TOWN_WIDTH } from '../kernel/stageSize';
import { createAnimalChatter } from './animalChatter';
import { createAnimalPetting } from './animalPetting';
import { createBystanders, type BystanderSpeech, type VisibleRange } from './bystanders';
import type { PixelStage } from './pixelStage';
import { createTownAnimals } from './townAnimals';
import { TOWN_ROADS } from './townLayout';
import { attachTownInput } from './town/townInput';
import { createTownInterface } from './town/townInterface';
import { createTownAmbience } from './town/townAmbience';
import { createTownGuide } from './town/townGuide';
import { createTownMillStatus, type MillStatusText } from './town/townMillStatus';
import { createTownScroll } from './town/townScroll';
import { createTownSigns, type TownHooks } from './town/townSigns';
import { createTownSpeechBubble } from './town/townSpeechBubble';
import { createTownWorld } from './town/townWorld';
import { createUiTextFactory } from './uiText';
import { createRandom } from '../kernel/random';

export type { TownHooks };

export interface TownTexts {
  // The name of each building that has a sign, by building id.
  buildingLabels: Readonly<Record<string, string>>;
  // The name of each screen of the town, from the west to the east.
  screenTitles: readonly string[];
  hint: string | null;
}

export interface TownView {
  setVisible(isVisible: boolean): void;
  setTexts(texts: TownTexts): void;
  setMillStatus(status: MillStatusText): void;
  // A bobbing arrow over this building, for a new player. Null hides it.
  setGuide(buildingId: string | null): void;
}

const START_PAGE = 1;
const ANIMAL_HEART_DRAW_ORDER = 95000;

export function createTownView(stage: PixelStage, buildings: readonly BuildingDefinition[], hooks: TownHooks): TownView {
  const { pixi } = stage;
  const root = new Container();
  root.visible = false;
  pixi.views.addChild(root);

  const textFactory = createUiTextFactory(pixi.renderScale, pixi.onViewResize);
  const scroll = createTownScroll(TOWN_WIDTH, TOWN_SCREEN_COUNT, pixi.viewWidth());
  const world = createTownWorld(buildings);
  root.addChild(world.container);

  const input = attachTownInput(stage.frame, scroll, pixi.viewWidth, () => !root.visible || hooks.isInputBlocked());
  const signs = createTownSigns(world.container, buildings, textFactory, hooks, input);
  const speechBubble = createTownSpeechBubble(world.container, textFactory);
  const mill = buildings.find((building) => building.id === 'mill');
  const millStatus = mill ? createTownMillStatus(world.container, mill, textFactory, input, hooks.collectMill) : null;
  const townInterface = createTownInterface(textFactory, scroll, input, pixi.viewWidth);
  root.addChild(townInterface.root);

  const visibleRange = (): VisibleRange => ({ from: scroll.scrollLeft(), to: scroll.scrollLeft() + pixi.viewWidth() });
  const showSpeech = (speech: BystanderSpeech | null): void => {
    if (speech === null) speechBubble.hide();
    else speechBubble.show(speech, hooks.pickSpeechText());
  };
  const bystanders = createBystanders(world.container, TOWN_ROADS, 5, showSpeech, visibleRange);
  const canTouchAnimals = (): boolean => !input.isDragging() && !hooks.isInputBlocked();
  const petting = createAnimalPetting(world.container, hooks.animalVoice, canTouchAnimals, ANIMAL_HEART_DRAW_ORDER);
  const animals = createTownAnimals(world.container, TOWN_ROADS, 5, petting, visibleRange);
  const animalChatter = createAnimalChatter(createRandom(5).fork('animal-chatter'), hooks.animalVoice, animals.visibleKinds, hooks.isInputBlocked);
  const ambience = createTownAmbience(world.container, buildings, world.buildingSprites);
  const guide = createTownGuide(world.container, buildings);

  let hasBeenShown = false;
  let previousSeconds: number | null = null;
  pixi.onViewResize(() => {
    scroll.setViewWidth(pixi.viewWidth());
    townInterface.layout();
  });

  stage.onFrame((elapsedSeconds) => {
    if (!root.visible) return;
    const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
    previousSeconds = elapsedSeconds;
    scroll.advance(deltaSeconds);
    world.container.position.x = -scroll.scrollLeft();
    bystanders.update(elapsedSeconds);
    animals.update(elapsedSeconds);
    petting.update(elapsedSeconds);
    animalChatter.update(elapsedSeconds);
    ambience.update(elapsedSeconds, deltaSeconds);
    guide.update(elapsedSeconds);
    townInterface.update(elapsedSeconds);
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
      previousSeconds = null;
      if (!isVisible) {
        speechBubble.hide();
        return;
      }
      stage.setLayout('fill');
      scroll.setViewWidth(pixi.viewWidth());
      // The first time, the town opens with the castle gate in the middle.
      if (!hasBeenShown) scroll.jumpToPage(START_PAGE);
      hasBeenShown = true;
      townInterface.layout();
    },
    setTexts: (texts) => {
      signs.setLabels(texts.buildingLabels);
      townInterface.setTexts(texts.screenTitles, texts.hint);
    },
    setMillStatus: (status) => millStatus?.set(status),
    setGuide: guide.setTarget,
  };
}

