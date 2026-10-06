import { Container, Rectangle, type Text } from 'pixi.js';
import type { BuildingDefinition } from '../../content/buildings';
import { PALETTE } from '../palette';
import { createFlatSprite } from '../pixiTextures';
import type { UiTextFactory } from '../uiText';
import { WOOD_PANEL, createPixelPanel } from '../uiPanel';
import type { TownInput } from './townInput';

const SIGN_FONT_SIZE = 11;
const SIGN_PADDING_X = 5;
const SIGN_PADDING_Y = 2;
const SIGN_GAP_ABOVE_ROOF = 5;
const SIGN_DRAW_ORDER = 100000;
const HOVER_TEXT_COLOR = '#fff6d6';

export interface TownHooks {
  openPanel(panelId: string): void;
  enterCastle(): void;
  collectMill(): void;
  pickSpeechText(): string;
  isInputBlocked(): boolean;
}

export interface TownSigns {
  setLabels(labels: Readonly<Record<string, string>>): void;
}

interface Hotspot {
  building: BuildingDefinition;
  container: Container;
  sign: Container;
  hoverOutline: Container;
  isClickable: boolean;
  isHovered: boolean;
}

function createHoverOutline(width: number, height: number): Container {
  const outline = new Container();
  outline.addChild(
    createFlatSprite(PALETTE.uiGold, width + 4, 1),
    createFlatSprite(PALETTE.uiGold, width + 4, 1),
    createFlatSprite(PALETTE.uiGold, 1, height + 4),
    createFlatSprite(PALETTE.uiGold, 1, height + 4),
  );
  const [top, bottom, left, right] = outline.children as [Container, Container, Container, Container];
  top.position.set(-2, -2);
  bottom.position.set(-2, height + 1);
  left.position.set(-2, -2);
  right.position.set(width + 1, -2);
  outline.visible = false;
  return outline;
}

// A name sign above each named building, and a tap area over it. A tap opens the building's menu, or the castle.
export function createTownSigns(world: Container, buildings: readonly BuildingDefinition[], textFactory: UiTextFactory, hooks: TownHooks, input: TownInput): TownSigns {
  const hotspots: Hotspot[] = buildings
    .filter((building) => building.label !== null || building.panelId !== null)
    .map((building) => {
      const isClickable = building.panelId !== null || building.opens === 'castle';
      const container = new Container();
      container.position.set(Math.round(building.x - building.width / 2), building.y - building.height);
      container.zIndex = SIGN_DRAW_ORDER + building.y;
      const hoverOutline = createHoverOutline(building.width, building.height);
      const sign = new Container();
      container.addChild(hoverOutline, sign);
      const hotspot: Hotspot = { building, container, sign, hoverOutline, isClickable, isHovered: false };
      if (isClickable) {
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.hitArea = new Rectangle(0, 0, building.width, building.height);
        container.on('pointerover', () => setHovered(hotspot, true));
        container.on('pointerout', () => setHovered(hotspot, false));
        container.on('pointertap', () => {
          if (input.isDragging() || hooks.isInputBlocked()) return;
          if (building.panelId !== null) hooks.openPanel(building.panelId);
          else if (building.opens === 'castle') hooks.enterCastle();
        });
      }
      world.addChild(container);
      return hotspot;
    });

  let latestLabels: Readonly<Record<string, string>> = {};

  const drawSign = (hotspot: Hotspot): void => {
    hotspot.sign.removeChildren().forEach((child) => child.destroy({ children: true }));
    const label = latestLabels[hotspot.building.id] ?? '';
    if (label === '') return;
    const color = hotspot.isHovered ? HOVER_TEXT_COLOR : hotspot.isClickable ? PALETTE.uiGold : PALETTE.uiParchment;
    const text: Text = textFactory.create(label, { font: 'title', size: SIGN_FONT_SIZE, color, shadow: PALETTE.uiInk });
    const width = Math.ceil(text.width) + 2 * SIGN_PADDING_X;
    const height = Math.ceil(text.height) + 2 * SIGN_PADDING_Y;
    const panel = createPixelPanel(width, height, WOOD_PANEL);
    const tail = createFlatSprite(PALETTE.uiInk, 2, 3);
    tail.position.set(Math.floor(width / 2) - 1, height + 1);
    text.position.set(SIGN_PADDING_X, SIGN_PADDING_Y);
    hotspot.sign.addChild(panel, tail, text);
    hotspot.sign.alpha = hotspot.isClickable ? 1 : 0.85;
    hotspot.sign.position.set(Math.round((hotspot.building.width - width) / 2), -(height + SIGN_GAP_ABOVE_ROOF + 4));
  };

  const setHovered = (hotspot: Hotspot, isHovered: boolean): void => {
    hotspot.isHovered = isHovered;
    hotspot.hoverOutline.visible = isHovered;
    drawSign(hotspot);
  };

  return {
    setLabels: (labels) => {
      latestLabels = labels;
      hotspots.forEach(drawSign);
    },
  };
}
