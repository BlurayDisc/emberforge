import { Container } from 'pixi.js';
import { PALETTE } from '../palette';
import { createFlatSprite } from '../pixiTextures';
import type { UiTextFactory } from '../uiText';
import { PARCHMENT_PANEL, createPixelPanel } from '../uiPanel';

const FONT_SIZE = 8;
const WRAP_WIDTH = 96;
const PADDING_X = 4;
const PADDING_Y = 3;
const DRAW_ORDER = 200000;

export interface TownSpeechBubble {
  // The bubble stands with its tail on this world point.
  show(point: { x: number; y: number }, words: string): void;
  hide(): void;
}

export function createTownSpeechBubble(world: Container, textFactory: UiTextFactory): TownSpeechBubble {
  const bubble = new Container();
  bubble.zIndex = DRAW_ORDER;
  bubble.visible = false;
  world.addChild(bubble);

  return {
    show: (point, words) => {
      bubble.removeChildren().forEach((child) => child.destroy({ children: true }));
      const text = textFactory.create(words, { font: 'readable', size: FONT_SIZE, color: PALETTE.uiInk, wrapWidth: WRAP_WIDTH });
      const width = Math.ceil(text.width) + 2 * PADDING_X;
      const height = Math.ceil(text.height) + 2 * PADDING_Y;
      text.position.set(PADDING_X, PADDING_Y);
      const tailRows = [createFlatSprite(PALETTE.uiInk, 5, 1), createFlatSprite(PALETTE.uiInk, 3, 1), createFlatSprite(PALETTE.uiInk, 1, 1)];
      const centerX = Math.floor(width / 2);
      tailRows.forEach((row, index) => row.position.set(centerX - Math.floor(row.width / 2), height + index));
      const tailFill = [createFlatSprite(PALETTE.uiParchment, 3, 1), createFlatSprite(PALETTE.uiParchment, 1, 1)];
      tailFill.forEach((row, index) => row.position.set(centerX - Math.floor(row.width / 2), height - 1 + index));
      bubble.addChild(createPixelPanel(width, height, PARCHMENT_PANEL), ...tailRows, ...tailFill, text);
      bubble.position.set(Math.round(point.x - width / 2), Math.round(point.y - height - 4));
      bubble.visible = true;
    },
    hide: () => {
      bubble.visible = false;
    },
  };
}
