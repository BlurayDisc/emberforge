import { createRandom, type Random } from '../kernel/random';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';
import { LOGICAL_HEIGHT as HEIGHT, LOGICAL_WIDTH as WIDTH } from './pixelStage';

type Hex = `#${string}`;

function verticalGradient(art: PixelCanvas, top: number, bottom: number, from: [number, number, number], to: [number, number, number], bandHeight = 6): void {
  for (let y = top; y < bottom; y += bandHeight) {
    const mix = (y - top) / Math.max(1, bottom - top);
    const channel = (index: 0 | 1 | 2): number => Math.round(from[index] + (to[index] - from[index]) * mix);
    art.context.fillStyle = `rgb(${channel(0)},${channel(1)},${channel(2)})`;
    art.context.fillRect(0, y, WIDTH, bandHeight);
  }
}

function glow(art: PixelCanvas, centerX: number, centerY: number, radius: number, rgb: string): void {
  for (let ring = radius; ring > 0; ring -= 6) {
    art.context.fillStyle = `rgba(${rgb},${0.05 + (1 - ring / radius) * 0.14})`;
    art.context.fillRect(centerX - ring, centerY - ring * 0.7, ring * 2, ring * 1.4);
  }
}

function bricks(art: PixelCanvas, x: number, y: number, width: number, height: number, light: Hex, dark: Hex): void {
  art.fill(light, x, y, width, height);
  for (let row = 0; row < height; row += 6) {
    art.fill(dark, x, y + row, width, 1);
    for (let column = (row / 6) % 2 === 0 ? 0 : 7; column < width; column += 14) art.fill(dark, x + column, y + row, 1, 6);
  }
}

function tree(art: PixelCanvas, centerX: number, baseY: number, height: number, leaf: Hex, leafLight: Hex, trunk: Hex): void {
  art.fill(trunk, centerX - 3, baseY - height * 0.4, 6, height * 0.4);
  for (let layer = 0; layer < 4; layer++) {
    const width = 26 - layer * 5;
    art.fill(leaf, centerX - width / 2, baseY - height * 0.35 - layer * height * 0.18, width, height * 0.2);
    art.fill(leafLight, centerX - width / 2 + 2, baseY - height * 0.35 - layer * height * 0.18, width / 3, 2);
  }
}

function stars(art: PixelCanvas, random: Random, count: number, maxY: number): void {
  for (let star = 0; star < count; star++) art.fill(random.chance(0.3) ? 'gold' : 'parchment', random.nextInt(0, WIDTH - 1), random.nextInt(0, maxY), 1, 1);
}

function torch(art: PixelCanvas, x: number, y: number): void {
  glow(art, x, y, 46, '255,170,70');
  art.fill('timber', x - 1, y, 3, 12);
  art.fill('lamp', x - 2, y - 5, 5, 6);
  art.fill('blood', x - 1, y - 3, 3, 3);
}

function stoneFloor(art: PixelCanvas, top: number, light: Hex, dark: Hex): void {
  art.fill(light, 0, top, WIDTH, HEIGHT - top);
  for (let y = top, rowHeight = 8; y < HEIGHT; y += rowHeight, rowHeight += 2) {
    art.fill(dark, 0, y, WIDTH, 1);
    for (let x = (y / 2) % 2 === 0 ? 0 : rowHeight * 2; x < WIDTH; x += rowHeight * 4) art.fill(dark, x, y, 1, rowHeight);
  }
}

function drawCellar(art: PixelCanvas, random: Random): void {
  bricks(art, 0, 0, WIDTH, 120, '#3b2f3f', '#251d2b');
  for (const x of [70, 240, 410]) {
    art.fill('void', x - 22, 40, 44, 80);
    art.fill('void', x - 16, 28, 32, 14);
    art.fill('stoneDark', x - 24, 38, 2, 82);
    art.fill('stoneDark', x + 22, 38, 2, 82);
  }
  art.fill('timber', 0, 0, WIDTH, 10);
  stoneFloor(art, 120, '#4a4254', '#2f2a38');
  for (const x of [150, 330]) torch(art, x, 56);
  for (const [x, y] of [[24, 150], [436, 160], [452, 200]] as const) {
    art.fill('timber', x, y, 22, 24);
    art.fill('brickDark', x + 2, y + 2, 18, 20);
    art.fill('gold', x, y + 6, 22, 2);
    art.fill('gold', x, y + 16, 22, 2);
  }
  for (let web = 0; web < 14; web++) art.fill('ash', web, web, 1, 1), art.fill('ash', WIDTH - 1 - web, web, 1, 1);
  for (let crack = 0; crack < 40; crack++) art.fill('stoneDark', random.nextInt(0, WIDTH), random.nextInt(130, HEIGHT), 3, 1);
}

function drawTrail(art: PixelCanvas, random: Random): void {
  verticalGradient(art, 0, 100, [38, 48, 110], [214, 130, 90]);
  stars(art, random, 30, 50);
  art.fill('parchment', 380, 24, 18, 18);
  art.fill('#d8c8a0', 384, 28, 10, 10);
  art.fill('#1f3a3a', 0, 92, WIDTH, 20);
  for (let hill = 0; hill < WIDTH; hill += 40) art.fill('#1f3a3a', hill, 84 + ((hill / 40) % 3) * 4, 40, 14);
  for (let x = 6; x < WIDTH; x += 26) tree(art, x, 118, 46, '#1f4a3a', '#2f6a4a', '#3a2a1e');
  art.fill('#3a5f35', 0, 112, WIDTH, HEIGHT - 112);
  for (let y = 112; y < HEIGHT; y += 6) {
    const half = 30 + (y - 112) * 1.1;
    art.fill('pathDark', WIDTH / 2 - half, y, half * 2, 6);
    art.fill('pathLight', WIDTH / 2 - half + 4, y, half * 2 - 8, 6);
  }
  for (let blade = 0; blade < 320; blade++) art.fill(random.chance(0.5) ? '#4f7a3a' : '#2f4a2a', random.nextInt(0, WIDTH - 1), random.nextInt(114, HEIGHT - 1), 1, 2);
  tree(art, 30, 250, 150, '#1f4a3a', '#2f6a4a', '#3a2a1e');
  tree(art, 452, 258, 160, '#1f4a3a', '#2f6a4a', '#3a2a1e');
}

function drawField(art: PixelCanvas, random: Random): void {
  verticalGradient(art, 0, 100, [70, 90, 150], [230, 190, 120]);
  art.fill('gold', 60, 30, 16, 16);
  art.fill('#f2e0a0', 64, 34, 8, 8);
  art.fill('#3a5a3a', 0, 92, WIDTH, 20);
  for (let hill = 0; hill < WIDTH; hill += 48) art.fill('#3a5a3a', hill, 84 + ((hill / 48) % 3) * 4, 48, 14);
  art.fill('#b89a4a', 0, 112, WIDTH, HEIGHT - 112);
  for (let y = 116; y < HEIGHT; y += 8) art.fill('#8a7236', 0, y, WIDTH, 1);
  for (let stalk = 0; stalk < 360; stalk++) art.fill(random.chance(0.5) ? '#d9b84a' : '#8a7236', random.nextInt(0, WIDTH - 1), random.nextInt(114, HEIGHT - 1), 1, 3);
  for (let x = 10; x < WIDTH; x += 44) {
    art.fill('timber', x, 100, 3, 24);
    art.fill('timber', 0, 106, WIDTH, 2);
  }
  for (const x of [120, 360]) {
    art.fill('timber', x, 92, 3, 30);
    art.fill('timber', x - 10, 98, 23, 2);
    art.fill('#c9b07a', x - 3, 86, 9, 8);
    art.fill('#4a3322', x - 5, 84, 13, 2);
  }
  for (const [x, y] of [[200, 60], [214, 52], [300, 66]] as const) art.fill('#17110d', x, y, 5, 1), art.fill('#17110d', x + 1, y - 1, 1, 1), art.fill('#17110d', x + 3, y - 1, 1, 1);
}

function drawCamp(art: PixelCanvas, random: Random): void {
  verticalGradient(art, 0, 110, [10, 10, 28], [40, 30, 50]);
  stars(art, random, 60, 80);
  art.fill('#1b1a2a', 0, 96, WIDTH, 22);
  for (const [x, hue] of [[70, '#7a5a3a'], [400, '#6a4a3a'], [170, '#6a5a3a']] as const) {
    for (let row = 0; row < 36; row++) art.fill(hue, x - row * 0.9, 100 + row, row * 1.8, 1);
    art.fill('void', x - 6, 118, 12, 18);
    art.fill('blood', x - 1, 90, 2, 10);
  }
  art.fill('#4a3a2a', 0, 128, WIDTH, HEIGHT - 128);
  for (let dust = 0; dust < 300; dust++) art.fill(random.chance(0.5) ? '#5a4a36' : '#3a2c20', random.nextInt(0, WIDTH - 1), random.nextInt(130, HEIGHT - 1), 2, 1);
  for (let spike = 4; spike < WIDTH; spike += 12) {
    art.fill('timber', spike, 122, 4, 16);
    art.fill('#6a4a2a', spike + 1, 118, 2, 6);
  }
  glow(art, 240, 150, 90, '255,150,60');
  art.fill('timber', 224, 152, 32, 5);
  art.fill('timber', 228, 148, 24, 4);
  art.fill('lamp', 232, 136, 16, 14);
  art.fill('blood', 236, 140, 8, 10);
  art.fill('#ffffff', 239, 143, 2, 4);
}

function drawHollow(art: PixelCanvas, random: Random): void {
  verticalGradient(art, 0, HEIGHT, [14, 28, 24], [28, 44, 30]);
  for (let trunk = 0; trunk < 9; trunk++) {
    const x = 20 + trunk * 56 + random.nextInt(-10, 10);
    art.fill('#2a1d14', x, 0, 14, 150);
    for (let bark = 0; bark < 150; bark += 6) art.fill('#1b130e', x + random.nextInt(0, 10), bark, 2, 4);
  }
  art.fill('#1f4a3a', 0, 0, WIDTH, 28);
  for (let leaf = 0; leaf < 90; leaf++) art.fill('#2f6a4a', random.nextInt(0, WIDTH), random.nextInt(0, 30), 6, 3);
  art.context.fillStyle = 'rgba(200,230,210,0.10)';
  for (let band = 100; band < 160; band += 14) art.context.fillRect(0, band, WIDTH, 6);
  art.fill('#2e4a2a', 0, 128, WIDTH, HEIGHT - 128);
  art.fill('#2a1d14', 190, 40, 100, 100);
  art.fill('void', 218, 74, 44, 66);
  art.fill('void', 226, 62, 28, 14);
  glow(art, 240, 110, 40, '120,255,160');
  for (let mushroom = 0; mushroom < 22; mushroom++) {
    const x = random.nextInt(4, WIDTH - 8);
    const y = random.nextInt(140, HEIGHT - 6);
    art.fill('bone', x + 1, y + 2, 2, 3);
    art.fill(random.chance(0.5) ? 'blood' : 'violet', x - 1, y, 6, 3);
  }
  for (let root = 0; root < 60; root++) art.fill('#3a2a1e', random.nextInt(0, WIDTH), random.nextInt(130, HEIGHT), 5, 2);
}

function drawMill(art: PixelCanvas, random: Random): void {
  verticalGradient(art, 0, 128, [74, 104, 112], [158, 176, 150]);
  art.fill('#2f4a3a', 0, 112, WIDTH, 18);
  art.fill('#7a6a58', 60, 36, 52, 84);
  art.fill('#5a4c3e', 60, 36, 8, 84);
  art.fill('#58607a', 54, 24, 64, 14);
  art.fill('#3b4258', 54, 36, 64, 2);
  art.fill('#17110d', 80, 92, 12, 28);
  for (const [bladeX, bladeY, bladeWidth, bladeHeight] of [[30, 56, 28, 3], [114, 56, 28, 3], [84, 6, 3, 18], [84, 70, 3, 18]] as const) art.fill('timber', bladeX, bladeY, bladeWidth, bladeHeight);
  art.fill('#2d4f5f', 0, 128, WIDTH, HEIGHT - 128);
  for (let ripple = 0; ripple < 70; ripple++) art.fill(random.chance(0.5) ? '#3f6f80' : '#1f3a46', random.nextInt(0, WIDTH), random.nextInt(130, HEIGHT), 8, 1);
  for (let reed = 0; reed < 26; reed++) {
    const x = random.nextInt(0, WIDTH);
    art.fill('#4a6a2a', x, 100 + random.nextInt(0, 24), 2, 22);
    art.fill('timber', x, 98, 2, 6);
  }
  for (let pad = 0; pad < 14; pad++) art.fill('#4f7a3a', random.nextInt(0, WIDTH), random.nextInt(150, HEIGHT - 4), 9, 3);
}

function tatteredBanner(art: PixelCanvas, x: number, top: number): void {
  art.fill('timber', x - 2, top - 2, 12, 2);
  art.fill('carpetDark', x, top, 8, 40);
  art.fill('carpet', x + 1, top, 6, 38);
  for (const [notchX, notchHeight] of [[x, 4], [x + 3, 7], [x + 6, 3]] as const) art.fill('#2a1d2a', notchX, top + 40 - notchHeight, 2, notchHeight);
  art.fill('bone', x + 3, top + 10, 2, 2);
  art.fill('bone', x + 2, top + 13, 4, 1);
}

function chiefThrone(art: PixelCanvas, centerX: number, floorY: number): void {
  art.fill('leatherDark', centerX - 20, floorY - 44, 40, 44);
  for (let plank = centerX - 18; plank < centerX + 18; plank += 6) art.fill('timber', plank, floorY - 42, 5, 42);
  art.fill('leatherDark', centerX - 26, floorY - 16, 52, 16);
  art.fill('leather', centerX - 24, floorY - 16, 48, 4);
  art.fill('uiWood600', centerX - 24, floorY - 12, 48, 1);
  for (const side of [-1, 1] as const) {
    const tuskX = centerX + side * 22;
    for (let step = 0; step < 6; step++) art.fill(step < 4 ? 'bone' : 'parchment', tuskX + side * (step < 3 ? 0 : step - 2) - 1, floorY - 46 - step * 3, 3, 3);
  }
  art.fill('bone', centerX - 7, floorY - 58, 14, 10);
  art.fill('#c9c5b0', centerX + 4, floorY - 57, 3, 9);
  art.fill('#c9c5b0', centerX - 5, floorY - 48, 10, 3);
  art.fill('void', centerX - 5, floorY - 54, 4, 3);
  art.fill('void', centerX + 1, floorY - 54, 4, 3);
  art.fill('blood', centerX - 4, floorY - 53, 1, 1);
  art.fill('blood', centerX + 3, floorY - 53, 1, 1);
  art.fill('void', centerX - 1, floorY - 50, 2, 2);
  for (let tooth = centerX - 4; tooth < centerX + 5; tooth += 2) art.fill('void', tooth, floorY - 47, 1, 2);
  art.fill('gold', centerX - 7, floorY - 60, 14, 2);
  for (const spikeX of [centerX - 7, centerX - 1, centerX + 5]) art.fill('gold', spikeX, floorY - 63, 2, 3);
  art.fill('uiGoldDark', centerX - 7, floorY - 59, 14, 1);
}

function drawLair(art: PixelCanvas, random: Random): void {
  verticalGradient(art, 0, HEIGHT, [24, 14, 26], [44, 28, 36]);
  for (let spike = 0; spike < WIDTH; spike += 16) {
    const length = 18 + random.nextInt(0, 22);
    for (let row = 0; row < length; row += 2) art.fill('#3a2c3a', spike + row / 4, row, 16 - row / 2, 2);
  }
  art.fill('#2a1d2a', 0, 110, WIDTH, HEIGHT - 110);
  for (let rock = 0; rock < 160; rock++) art.fill(random.chance(0.5) ? '#4a3a4a' : '#1f1520', random.nextInt(0, WIDTH), random.nextInt(112, HEIGHT), 4, 2);
  for (const x of [90, 390]) {
    glow(art, x, 60, 60, '255,80,40');
    art.fill('timber', x - 1, 60, 3, 16);
    art.fill('blood', x - 3, 52, 7, 9);
    art.fill('lamp', x - 1, 54, 3, 4);
  }
  for (const x of [176, 296]) tatteredBanner(art, x, 22);
  chiefThrone(art, 240, 110);
  for (let pile = 0; pile < 16; pile++) {
    const x = random.nextInt(10, WIDTH - 20);
    const y = random.nextInt(150, HEIGHT - 10);
    art.fill('bone', x, y, 8, 2);
    art.fill('#c9c5b0', x + 2, y - 2, 3, 3);
  }
}

const DRAWERS: Readonly<Record<string, (art: PixelCanvas, random: Random) => void>> = {
  'rat-cellar': drawCellar,
  'scarecrow-field': drawField,
  'wolf-trail': drawTrail,
  'sunken-mill': drawMill,
  'goblin-camp': drawCamp,
  'old-wood-hollow': drawHollow,
  'goblin-chief-lair': drawLair,
};

export function drawBattleBackdrop(dungeonId: string): HTMLCanvasElement {
  const art = createPixelCanvas(WIDTH, HEIGHT);
  const random = createRandom(31).fork(`backdrop-${dungeonId}`);
  (DRAWERS[dungeonId] ?? drawTrail)(art, random);
  return art.canvas;
}
