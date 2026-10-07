import { Container } from 'pixi.js';
import type { BuildingDefinition } from '../../content/buildings';
import { PALETTE } from '../palette';
import type { UiTextFactory } from '../uiText';
import { GOLD_PANEL, WOOD_PANEL, createPixelPanel } from '../uiPanel';
import type { TownInput } from './townInput';

const FONT_SIZE = 9;
const PADDING_X = 4;
const PADDING_Y = 2;
const GAP = 2;
// Above every building sign (100000 + y), so a sign of a nearby building never hides the timer.
const DRAW_ORDER = 110000;
const DISTANCE_ABOVE_MILL_BASE = 34;

export interface MillStatusText {
  timer: string;
  // The label of the Collect button, or null when no material waits.
  collectLabel: string | null;
}

export interface TownMillStatus {
  set(status: MillStatusText): void;
}

// Sits on the Mill body, clear of the signs of the buildings below it. The timer stays where it is. The Collect button shows under it when materials wait.
export function createTownMillStatus(world: Container, mill: BuildingDefinition, textFactory: UiTextFactory, input: TownInput, onCollect: () => void): TownMillStatus {
  const root = new Container();
  root.zIndex = DRAW_ORDER;
  world.addChild(root);
  let latest: MillStatusText = { timer: '', collectLabel: null };

  const draw = (): void => {
    root.removeChildren().forEach((child) => child.destroy({ children: true }));
    if (latest.timer === '') return;
    const timer = textFactory.create(latest.timer, { font: 'title', size: FONT_SIZE, color: PALETTE.uiGold, shadow: PALETTE.uiInk });
    const timerWidth = Math.ceil(timer.width) + 2 * PADDING_X;
    const timerHeight = Math.ceil(timer.height) + 2 * PADDING_Y;
    const timerBox = new Container();
    timerBox.addChild(createPixelPanel(timerWidth, timerHeight, WOOD_PANEL), timer);
    timer.position.set(PADDING_X, PADDING_Y);
    timerBox.position.set(Math.round(mill.x - timerWidth / 2), mill.y - DISTANCE_ABOVE_MILL_BASE);
    root.addChild(timerBox);
    if (latest.collectLabel === null) return;
    const label = textFactory.create(latest.collectLabel, { font: 'title', size: FONT_SIZE, color: PALETTE.uiInk });
    const buttonWidth = Math.ceil(label.width) + 2 * PADDING_X;
    const buttonHeight = Math.ceil(label.height) + 2 * PADDING_Y;
    const button = new Container();
    button.addChild(createPixelPanel(buttonWidth, buttonHeight, GOLD_PANEL), label);
    label.position.set(PADDING_X, PADDING_Y);
    button.position.set(Math.round(mill.x - buttonWidth / 2), mill.y - DISTANCE_ABOVE_MILL_BASE + timerHeight + GAP);
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointertap', () => {
      if (!input.isDragging()) onCollect();
    });
    root.addChild(button);
  };

  return {
    set: (status) => {
      if (status.timer === latest.timer && status.collectLabel === latest.collectLabel) return;
      latest = status;
      draw();
    },
  };
}
