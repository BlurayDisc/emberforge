import { Container, Rectangle, Sprite, type Text } from 'pixi.js';
import { LOGICAL_HEIGHT } from '../../kernel/stageSize';
import { PALETTE } from '../palette';
import { addOutline, createPixelCanvas } from '../pixelCanvas';
import { createPixiTexture } from '../pixiTextures';
import type { UiTextFactory } from '../uiText';
import { WOOD_PANEL, createPixelPanel } from '../uiPanel';
import type { TownInput } from './townInput';
import type { TownScroll } from './townScroll';

const ARROW_WIDTH = 12;
const ARROW_HEIGHT = 20;
const ARROW_STRIP_WIDTH = 26;
const ARROW_EDGE_GAP = 3;
const ARROW_SLIDE_FRACTION = 0.7;
const ARROW_BOB_PER_SECOND = 2.5;
const TITLE_FONT_SIZE = 10;
const TITLE_MARGIN = 5;
const MINIMUM_VIEW_WIDTH_FOR_TITLE = 250;
const HINT_FONT_SIZE = 8;
const HINT_MARGIN_BOTTOM = 14;
const HINT_SIDE_MARGIN = 14;
const MAXIMUM_HINT_WIDTH = 240;

function createArrowTexture(direction: -1 | 1): ReturnType<typeof createPixiTexture> {
  const art = createPixelCanvas(ARROW_WIDTH, ARROW_HEIGHT);
  const middleRow = (ARROW_HEIGHT - 1) / 2;
  for (let x = 0; x < ARROW_WIDTH; x++) {
    const depth = direction < 0 ? x : ARROW_WIDTH - 1 - x;
    const halfHeight = ((depth + 1) / ARROW_WIDTH) * (ARROW_HEIGHT / 2);
    for (let y = 0; y < ARROW_HEIGHT; y++) {
      if (Math.abs(y - middleRow) <= halfHeight) art.fill(depth < 2 ? PALETTE.uiGoldLight : PALETTE.uiGold, x, y, 1, 1);
    }
  }
  addOutline(art, 'outline');
  return createPixiTexture(art.canvas);
}

export interface TownInterface {
  root: Container;
  setTexts(screenTitles: readonly string[], hint: string | null): void;
  // Places everything again. The view got a new width.
  layout(): void;
  update(elapsedSeconds: number): void;
}

interface ArrowButton {
  strip: Container;
  sprite: Sprite;
  direction: -1 | 1;
}

// The parts of the town screen that stay fixed on the glass while the town scrolls: the two arrows, the name of the area and the hint.
export function createTownInterface(textFactory: UiTextFactory, scroll: TownScroll, input: TownInput, viewWidth: () => number, screenWidth: number): TownInterface {
  const root = new Container();
  const titleSlot = new Container();
  const hintSlot = new Container();
  root.addChild(titleSlot, hintSlot);

  const arrows: ArrowButton[] = ([-1, 1] as const).map((direction) => {
    const strip = new Container();
    strip.hitArea = new Rectangle(0, 0, ARROW_STRIP_WIDTH, LOGICAL_HEIGHT);
    strip.cursor = 'pointer';
    const sprite = new Sprite(createArrowTexture(direction));
    sprite.alpha = 0.85;
    strip.addChild(sprite);
    strip.on('pointertap', () => {
      if (!input.isDragging()) scroll.slideBy(direction * viewWidth() * ARROW_SLIDE_FRACTION);
    });
    root.addChild(strip);
    return { strip, sprite, direction };
  });

  let screenTitles: readonly string[] = [];
  let hint: string | null = null;
  let shownTitleIndex = -1;
  let hintText: Text | null = null;

  const drawTitle = (index: number): void => {
    shownTitleIndex = index;
    titleSlot.removeChildren().forEach((child) => child.destroy({ children: true }));
    const title = screenTitles[index];
    if (title === undefined || viewWidth() < MINIMUM_VIEW_WIDTH_FOR_TITLE) return;
    const text = textFactory.create(title, { font: 'title', size: TITLE_FONT_SIZE, color: PALETTE.uiGold, shadow: PALETTE.uiInk });
    const width = Math.ceil(text.width) + 12;
    const height = Math.ceil(text.height) + 4;
    text.position.set(6, 2);
    titleSlot.addChild(createPixelPanel(width, height, WOOD_PANEL), text);
    titleSlot.position.set(TITLE_MARGIN, TITLE_MARGIN);
  };

  const drawHint = (): void => {
    hintSlot.removeChildren().forEach((child) => child.destroy({ children: true }));
    hintText = null;
    if (hint === null) return;
    const wrapWidth = Math.min(MAXIMUM_HINT_WIDTH, viewWidth() - 2 * HINT_SIDE_MARGIN);
    const text = textFactory.create(hint, { font: 'readable', size: HINT_FONT_SIZE, color: PALETTE.uiParchment, wrapWidth, align: 'center', shadow: PALETTE.uiInk });
    const width = Math.ceil(text.width) + 14;
    const height = Math.ceil(text.height) + 8;
    text.position.set(7, 4);
    hintSlot.addChild(createPixelPanel(width, height, WOOD_PANEL), text);
    hintSlot.position.set(Math.round((viewWidth() - width) / 2), LOGICAL_HEIGHT - height - HINT_MARGIN_BOTTOM);
    hintText = text;
  };

  const layout = (): void => {
    arrows[0]?.strip.position.set(0, 0);
    arrows[1]?.strip.position.set(viewWidth() - ARROW_STRIP_WIDTH, 0);
    shownTitleIndex = -1;
    drawHint();
  };

  return {
    root,
    setTexts: (newTitles, newHint) => {
      screenTitles = newTitles;
      hint = newHint;
      shownTitleIndex = -1;
      drawHint();
    },
    layout,
    update: (elapsedSeconds) => {
      const centerIndex = Math.max(0, Math.min(screenTitles.length - 1, Math.floor((scroll.scrollLeft() + viewWidth() / 2) / screenWidth)));
      if (centerIndex !== shownTitleIndex) drawTitle(centerIndex);
      const bob = Math.floor(elapsedSeconds * ARROW_BOB_PER_SECOND) % 2;
      for (const arrow of arrows) {
        const isUsable = scroll.canMove(arrow.direction);
        arrow.strip.visible = isUsable;
        arrow.strip.eventMode = isUsable ? 'static' : 'none';
        arrow.sprite.position.set(arrow.direction < 0 ? ARROW_EDGE_GAP + bob * -1 : ARROW_STRIP_WIDTH - ARROW_WIDTH - ARROW_EDGE_GAP + bob, Math.round((LOGICAL_HEIGHT - ARROW_HEIGHT) / 2));
      }
      if (hintText) hintSlot.alpha = 1;
    },
  };
}
