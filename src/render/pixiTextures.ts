import { Sprite, Texture } from 'pixi.js';
import { hexToNumber } from './colorMath';

export function createPixiTexture(source: HTMLCanvasElement): Texture {
  const texture = Texture.from(source);
  // Nearest-neighbour keeps the pixels hard-edged when the stage scales up.
  texture.source.scaleMode = 'nearest';
  return texture;
}

// A flat colour block is the shared white texture, tinted. It costs no texture of its own.
export function createFlatSprite(color: string, width: number, height: number): Sprite {
  const sprite = new Sprite(Texture.WHITE);
  sprite.tint = hexToNumber(color);
  sprite.width = width;
  sprite.height = height;
  return sprite;
}
