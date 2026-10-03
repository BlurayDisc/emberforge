import { CanvasTexture, NearestFilter, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';
import { PALETTE } from './palette';
import { SPRITE_ART, type SpriteArt } from './spriteArt';

const textureBySpriteKey = new Map<string, CanvasTexture>();

function drawSpriteArt(art: SpriteArt): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = art.rows[0]?.length ?? 0;
  canvas.height = art.rows.length;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');

  art.rows.forEach((row, rowIndex) => {
    [...row].forEach((symbol, columnIndex) => {
      const colorName = art.legend[symbol];
      if (colorName === undefined) return;
      context.fillStyle = PALETTE[colorName];
      context.fillRect(columnIndex, rowIndex, 1, 1);
    });
  });
  return canvas;
}

export function createPixelTexture(source: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(source);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function textureForSpriteKey(spriteKey: string): CanvasTexture {
  const cachedTexture = textureBySpriteKey.get(spriteKey);
  if (cachedTexture) return cachedTexture;
  const art = SPRITE_ART[spriteKey];
  if (!art) throw new Error(`Unknown sprite key: ${spriteKey}`);
  const texture = createPixelTexture(drawSpriteArt(art));
  textureBySpriteKey.set(spriteKey, texture);
  return texture;
}

export function createUnitSprite(spriteKey: string): Sprite {
  const texture = textureForSpriteKey(spriteKey);
  const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true }));
  const { width, height } = texture.image as HTMLCanvasElement;
  sprite.scale.set(width, height, 1);
  return sprite;
}
