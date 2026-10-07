import { addOutline, createPixelCanvas } from '../pixelCanvas';
import type { Hex } from './creatureShading';

const RAT_COLORS: Record<string, Hex> = {
  D: '#4a3a2c',
  B: '#7d6248',
  L: '#a98a68',
  H: '#c9ab88',
  P: '#e0a3a0',
  p: '#a8625f',
  E: '#d8322a',
  K: '#1a1210',
  W: '#f4efe0',
  C: '#e6d6a8',
  S: '#5f4a37',
};

const RAT_PIXELS = [
  '',
  '.........DDDDD',
  '........DPPPPPD..DDDD',
  '........DPPpPPDDDDPPPD',
  '........DPPPPPDHLDPPpD',
  '.........DPPPDHHLLDDDD',
  '..........DDDHHHLLLBBBDDD',
  '......DDDDHHHHLLLLLBLBBBBDDD',
  '....DDHHHHLLLLLLLLBLBBBBBBBDDD',
  '...DHHLLLLLLLLLLLBBBLBBBBBBBDD',
  '..DHLLLLLLLLLLLBBBLBBBBBBBBBDD',
  '.DHLLLLLEEELLLBBBBBLBBBBBBBBDD',
  '.DLLLLLLEKELLBBBBBBBBBBBBBBSDD',
  '.KPLLLLLLLLLBBBBBBBBBBBBBBBBSD',
  '.KPPLLLLLLBBBBBBBBBBBBBBBBBBSD',
  '..pPPDDDDDBBBBBBBBBBBBBBBBSSDD',
  '...DWWDSSBBBBBBBBBBBBBBBBBBSSD',
  '...DWWDDSSBBBBBBBBBBBBBBBBSSSD',
  '....DDDDDSSBBBBBBBBBBBBBBBSSSD',
  '.....DBBDSSSSBBBBBBBBBBBBBSSSD',
  '....DPPPCDDSSSSSSSSSSSSSSSSDPPPPPC',
  '....CCCCC.DDDDDDDDDDDDDDDDD.CCCCC',
]

const TAIL_PATH: Array<[number, number]> = [
  [29, 14], [30, 14], [31, 14], [32, 13], [32, 12], [32, 11], [31, 10], [31, 9], [32, 8], [33, 7], [33, 6],
];

const FUR_OVERLAYS: Array<[string, Array<[number, number]>]> = [
  ['S', [[13, 7], [13, 8], [12, 9], [12, 10], [12, 11], [11, 12], [11, 13], [11, 14], [10, 15]]],
  ['D', [[8, 10], [9, 10], [10, 10], [11, 10]]],
  ['W', [[10, 11]]],
  ['H', [[19, 8], [20, 8], [18, 9], [21, 9], [22, 10], [23, 10], [24, 11]]],
  ['L', [[20, 12], [21, 12], [22, 12], [23, 13], [20, 13], [21, 14]]],
  ['S', [[19, 15], [20, 16], [21, 17], [22, 18], [24, 14], [25, 15], [26, 16], [27, 17]]],
  ['S', [[24, 9], [27, 10], [29, 12], [18, 12], [16, 14], [17, 16], [14, 17], [15, 13]]],
  ['.', [[22, 7], [25, 8], [28, 9], [30, 11]]],
  ['D', [[15, 17], [16, 18], [17, 19]]],
  ['.', [[29, 18], [30, 18], [30, 17], [29, 19]]],
  ['H', [[21, 11], [22, 11], [23, 11], [25, 12], [26, 12]]],
  ['L', [[24, 13], [25, 13], [26, 14]]],
];

export function drawRat(): HTMLCanvasElement {
  const art = createPixelCanvas(34, 24);
  const paint = (symbol: string, x: number, y: number): void => {
    const color = RAT_COLORS[symbol];
    if (color) art.fill(color, x, y, 1, 1);
    else art.context.clearRect(x, y, 1, 1);
  };
  RAT_PIXELS.forEach((row, y) => [...row].forEach((symbol, x) => symbol !== '.' && paint(symbol, x, y)));
  FUR_OVERLAYS.forEach(([symbol, points]) => points.forEach(([x, y]) => paint(symbol, x, y)));
  TAIL_PATH.forEach(([x, y], index) => paint(index % 3 === 2 ? 'p' : 'P', x, y));
  addOutline(art, 'outline');
  return art.canvas;
}
