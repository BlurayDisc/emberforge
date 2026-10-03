export const PALETTE = {
  night: '#14111f',
  outline: '#1b1626',
  soil: '#3a2e3f',
  moss: '#2f5233',
  grass: '#4f7a3a',
  steel: '#c0c8d0',
  skin: '#f2c9a0',
  cobalt: '#3b6fd6',
  goblin: '#6aa84f',
  gold: '#ffd75e',
  blood: '#c0392b',
  parchment: '#e8d9b0',
  forest: '#2d6a4f',
  violet: '#7b4bb7',
  shadow: '#3d3a4f',
  bone: '#e8e4d4',
  ash: '#8a8a9a',
  fur: '#8b6f55',
} as const;

export type PaletteColor = keyof typeof PALETTE;
