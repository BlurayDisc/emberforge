import { Container, type Sprite } from 'pixi.js';
import { COIN_SIZE, createCoinSprite, type CoinKind } from '../coinArt';
import { PALETTE } from '../palette';
import { createFlatSprite } from '../pixiTextures';
import type { PixelStage } from '../pixelStage';
import { createUiTextFactory } from '../uiText';

export interface MoneyParts {
  gold: number;
  silver: number;
  copper: number;
}

export interface StageHud {
  // gain is what the player just earned. It floats up from the panel for a moment. Null shows nothing.
  setMoney(total: MoneyParts, gain: MoneyParts | null): void;
  setClock(text: string): void;
}

const MARGIN = 5;
const PANEL_PADDING_X = 6;
const PANEL_PADDING_Y = 4;
const MONEY_FONT_SIZE = 13;
const CLOCK_FONT_SIZE = 8;
const PART_GAP = 7;
const COIN_GAP = 4;
const SHADOW_WIDTH = 1;
const BUMP_SECONDS = 0.35;
const GAIN_RISE_SECONDS = 1.6;
const GAIN_RISE_PIXELS = 12;
const GAIN_START_Y = 4;
const GAIN_GAP_LEFT_OF_PANEL = 6;
const GLINT_PERIOD_SECONDS = 3.2;
const CLOCK_PLATE_ALPHA = 0.6;
const CLOCK_PLATE_PADDING_X = 3;

const PART_COLORS: Readonly<Record<CoinKind, string>> = { gold: PALETTE.uiGold, silver: PALETTE.uiSilver, copper: PALETTE.uiCopper };

function visibleParts(money: MoneyParts): Array<{ kind: CoinKind; amount: number }> {
  const parts: Array<{ kind: CoinKind; amount: number }> = [];
  if (money.gold > 0) parts.push({ kind: 'gold', amount: money.gold });
  if (money.gold > 0 || money.silver > 0) parts.push({ kind: 'silver', amount: money.silver });
  parts.push({ kind: 'copper', amount: money.copper });
  return parts;
}

// The gold sits in the top right corner of every Pixi scene, over the picture, in a dark panel with a gold edge.
// A bump and a rising "+" show when gold comes in, so the player notices it at once.
export function createStageHud(stage: PixelStage): StageHud {
  const { pixi } = stage;
  const textFactory = createUiTextFactory(pixi.renderScale, pixi.onViewResize);
  const root = new Container();
  const moneyPanel = new Container();
  const gainLayer = new Container();
  const clockSlot = new Container();
  root.addChild(moneyPanel, clockSlot, gainLayer);
  pixi.hud.addChild(root);

  let bumpStartSeconds = -10;
  let glintCoin: Sprite | null = null;
  let panelWidth = 0;
  let latestSeconds = 0;
  const gains: Array<{ container: Container; bornSeconds: number }> = [];

  const placeRoot = (): void => {
    root.position.set(Math.round(pixi.viewWidth() - MARGIN - panelWidth), MARGIN);
  };
  pixi.onViewResize(placeRoot);

  const buildPartRow = (money: MoneyParts, fontSize: number): Container => {
    const row = new Container();
    let cursorX = 0;
    visibleParts(money).forEach(({ kind, amount }, index) => {
      if (index > 0) cursorX += PART_GAP;
      const label = textFactory.create(String(amount), { font: 'title', size: fontSize, color: PART_COLORS[kind], shadow: PALETTE.uiInk });
      label.position.set(cursorX, 0);
      cursorX += Math.ceil(label.width) + SHADOW_WIDTH + COIN_GAP;
      const coin = createCoinSprite(kind);
      coin.position.set(cursorX, Math.round((label.height - COIN_SIZE) / 2));
      cursorX += COIN_SIZE;
      row.addChild(label, coin);
      if (kind === 'gold' || (kind === 'copper' && index === 0)) glintCoin = coin;
    });
    return row;
  };

  const drawPanel = (money: MoneyParts): void => {
    moneyPanel.removeChildren().forEach((child) => child.destroy({ children: true }));
    glintCoin = null;
    const row = buildPartRow(money, MONEY_FONT_SIZE);
    const innerWidth = Math.ceil(row.width);
    const innerHeight = Math.ceil(row.height);
    panelWidth = innerWidth + 2 * PANEL_PADDING_X + 2;
    const panelHeight = innerHeight + 2 * PANEL_PADDING_Y + 2;
    const edge = createFlatSprite(PALETTE.uiGoldDark, panelWidth, panelHeight);
    const outline = createFlatSprite(PALETTE.uiInk, panelWidth + 2, panelHeight + 2);
    outline.position.set(-1, -1);
    const fill = createFlatSprite(PALETTE.uiWood900, panelWidth - 2, panelHeight - 2);
    fill.position.set(1, 1);
    fill.alpha = 0.92;
    const topShine = createFlatSprite(PALETTE.uiWood600, panelWidth - 2, 1);
    topShine.position.set(1, 1);
    row.position.set(PANEL_PADDING_X + 1, PANEL_PADDING_Y + 1);
    moneyPanel.addChild(outline, edge, fill, topShine, row);
    clockSlot.position.set(0, panelHeight + 3);
    placeRoot();
  };

  let latestMoney: MoneyParts = { gold: 0, silver: 0, copper: 0 };
  drawPanel(latestMoney);

  const clockText = textFactory.create('', { font: 'readable', size: CLOCK_FONT_SIZE, color: PALETTE.uiParchment, shadow: PALETTE.uiInk, align: 'right' });
  const clockPlate = createFlatSprite(PALETTE.uiInk, 1, 1);
  clockPlate.alpha = CLOCK_PLATE_ALPHA;
  clockSlot.addChild(clockPlate, clockText);

  stage.onFrame((elapsedSeconds) => {
    latestSeconds = elapsedSeconds;
    const bump = elapsedSeconds - bumpStartSeconds;
    // The panel grows by one pixel for a moment: whole pixels only.
    const isBumping = bump < BUMP_SECONDS && Math.floor(bump * 14) % 2 === 0;
    moneyPanel.scale.set(1);
    moneyPanel.position.set(isBumping ? -1 : 0, isBumping ? -1 : 0);
    if (glintCoin) glintCoin.tint = elapsedSeconds % GLINT_PERIOD_SECONDS < 0.12 ? 0xffffff : 0xdddddd;
    for (let index = gains.length - 1; index >= 0; index--) {
      const gain = gains[index] as { container: Container; bornSeconds: number };
      const age = (elapsedSeconds - gain.bornSeconds) / GAIN_RISE_SECONDS;
      if (age >= 1) {
        gain.container.destroy({ children: true });
        gains.splice(index, 1);
        continue;
      }
      gain.container.alpha = age < 0.7 ? 1 : 1 - (age - 0.7) / 0.3;
      gain.container.position.y = Math.round(GAIN_START_Y - age * GAIN_RISE_PIXELS);
    }
  });

  return {
    setMoney: (total, gain) => {
      const changed = total.gold !== latestMoney.gold || total.silver !== latestMoney.silver || total.copper !== latestMoney.copper;
      latestMoney = total;
      if (!changed) return;
      drawPanel(total);
      if (!gain) return;
      bumpStartSeconds = latestSeconds;
      const container = new Container();
      const plus = textFactory.create('+', { font: 'title', size: 12, color: PALETTE.uiGoldLight, shadow: PALETTE.uiInk });
      const row = buildPartRow(gain, 12);
      row.position.set(Math.ceil(plus.width) + 1, 0);
      container.addChild(plus, row);
      container.position.set(Math.round(-container.width - GAIN_GAP_LEFT_OF_PANEL), GAIN_START_Y);
      gainLayer.addChild(container);
      gains.push({ container, bornSeconds: latestSeconds });
    },
    setClock: (text) => {
      if (clockText.text === text) return;
      clockText.text = text;
      clockPlate.width = Math.ceil(clockText.width) + 2 * CLOCK_PLATE_PADDING_X;
      clockPlate.height = Math.ceil(clockText.height) + 2;
      clockPlate.position.set(Math.round(panelWidth - clockPlate.width), 0);
      clockText.position.set(clockPlate.x + CLOCK_PLATE_PADDING_X, 1);
    },
  };
}

