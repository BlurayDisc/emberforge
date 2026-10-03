import { CanvasTexture, NearestFilter, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';
import type { BattleSide, UnitRank } from '../model/battle';
import type { ResourceId } from '../model/resource';
import { RESOURCE_BAR_COLORS } from './resourceColors';

const BAR_HEIGHT = 9;
const RESOURCE_STRIP_EXTRA_HEIGHT = 2;
const GHOST_HOLD_SECONDS = 0.35;
const GHOST_DRAIN_PER_SECOND = 1.2;
const TICK_UNIT_CANDIDATES = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
const MAXIMUM_TICKS = 12;
const MAJOR_TICK_EVERY = 5;

const DIGIT_PATTERNS: Readonly<Record<string, readonly string[]>> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '001', '001', '001'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

interface SideColors {
  badge: string;
  fill: string;
  fillLight: string;
}

const COLORS_BY_SIDE: Record<BattleSide, SideColors> = {
  party: { badge: '#3b6fd6', fill: '#4f9a3a', fillLight: '#8bc86f' },
  enemy: { badge: '#8a2a2a', fill: '#c0392b', fillLight: '#e8786a' },
};

export interface HealthBarOptions {
  hp: number;
  maxHp: number;
  level: number;
  side: BattleSide;
  rank: UnitRank;
  barWidth: number;
  // A strip under the health bar. Left out for a unit with no resource pool.
  resource?: { id: ResourceId; value: number; max: number };
}

export interface HealthBar {
  sprite: Sprite;
  setHealth(hp: number, nowSeconds: number): void;
  setResource(value: number): void;
  update(nowSeconds: number, deltaSeconds: number): void;
  setVisible(isVisible: boolean): void;
  dispose(): void;
}

// The smallest "nice" tick unit that keeps the bar under MAXIMUM_TICKS chunks,
// so a 52 HP hero and a 5000 HP boss both show readable lines.
function chooseTickUnit(maxHp: number): number {
  return TICK_UNIT_CANDIDATES.find((unit) => maxHp / unit <= MAXIMUM_TICKS) ?? maxHp;
}

function drawDigits(context: CanvasRenderingContext2D, text: string, left: number): void {
  context.fillStyle = '#ffffff';
  [...text].forEach((digit, index) => {
    (DIGIT_PATTERNS[digit] ?? []).forEach((row, rowIndex) => {
      [...row].forEach((cell, columnIndex) => {
        if (cell === '1') context.fillRect(left + index * 4 + columnIndex, 2 + rowIndex, 1, 1);
      });
    });
  });
}

export function createHealthBar(options: HealthBarOptions): HealthBar {
  const levelText = String(options.level);
  const badgeWidth = levelText.length * 4 + 1;
  const barLeft = badgeWidth + 1;
  const canvas = document.createElement('canvas');
  canvas.width = barLeft + options.barWidth;
  canvas.height = options.resource ? BAR_HEIGHT + RESOURCE_STRIP_EXTRA_HEIGHT : BAR_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');

  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(canvas.width, canvas.height, 1);

  const colors = COLORS_BY_SIDE[options.side];
  const innerWidth = options.barWidth - 2;
  const tickUnit = chooseTickUnit(options.maxHp);
  let hp = options.hp;
  let ghostHp = options.hp;
  let ghostHoldUntilSeconds = 0;
  let resourceValue = options.resource?.value ?? 0;

  const widthOf = (value: number): number => Math.round((Math.max(0, value) / options.maxHp) * innerWidth);

  const draw = (): void => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#17110d';
    context.fillRect(0, 0, badgeWidth, BAR_HEIGHT);
    context.fillStyle = colors.badge;
    context.fillRect(1, 1, badgeWidth - 2, BAR_HEIGHT - 2);
    drawDigits(context, levelText, 0);

    context.fillStyle = options.rank === 'rare' || options.rank === 'boss' ? '#f2c14e' : '#17110d';
    context.fillRect(barLeft, 1, options.barWidth, 7);
    context.fillStyle = '#17110d';
    context.fillRect(barLeft + 1, 2, innerWidth, 5);
    context.fillStyle = '#3a2e24';
    context.fillRect(barLeft + 1, 2, innerWidth, 5);

    context.fillStyle = '#f4ead0';
    context.fillRect(barLeft + 1, 2, widthOf(ghostHp), 5);
    context.fillStyle = colors.fill;
    context.fillRect(barLeft + 1, 2, widthOf(hp), 5);
    context.fillStyle = colors.fillLight;
    context.fillRect(barLeft + 1, 2, widthOf(hp), 2);

    context.fillStyle = '#17110d';
    for (let tick = 1; tick * tickUnit < options.maxHp; tick++) {
      const x = barLeft + 1 + Math.round((tick * tickUnit * innerWidth) / options.maxHp);
      const isMajor = tick % MAJOR_TICK_EVERY === 0;
      context.fillRect(x, isMajor ? 2 : 4, 1, isMajor ? 5 : 3);
    }
    if (options.resource) {
      context.fillStyle = '#17110d';
      context.fillRect(barLeft, 7, options.barWidth, 4);
      context.fillStyle = '#3a2e24';
      context.fillRect(barLeft + 1, 8, innerWidth, 2);
      context.fillStyle = RESOURCE_BAR_COLORS[options.resource.id];
      context.fillRect(barLeft + 1, 8, Math.round((Math.min(options.resource.max, Math.max(0, resourceValue)) / options.resource.max) * innerWidth), 2);
    }
    texture.needsUpdate = true;
  };
  draw();

  return {
    sprite,
    setHealth: (newHp, nowSeconds) => {
      if (newHp < hp) ghostHoldUntilSeconds = nowSeconds + GHOST_HOLD_SECONDS;
      else ghostHp = newHp;
      hp = newHp;
      draw();
    },
    setResource: (value) => {
      if (!options.resource || value === resourceValue) return;
      resourceValue = value;
      draw();
    },
    update: (nowSeconds, deltaSeconds) => {
      if (ghostHp <= hp || nowSeconds < ghostHoldUntilSeconds) return;
      ghostHp = Math.max(hp, ghostHp - options.maxHp * GHOST_DRAIN_PER_SECOND * deltaSeconds);
      draw();
    },
    setVisible: (isVisible) => {
      sprite.visible = isVisible;
    },
    dispose: () => {
      sprite.material.dispose();
      texture.dispose();
    },
  };
}
