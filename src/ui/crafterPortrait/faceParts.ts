import type { PortraitPainter, Swatch } from './portraitPainter';

export const INK = '#17110d';
const EYE_WHITE = '#f4efe6';

export interface FaceSpec {
  skin: Swatch;
  eye: string;
  brow: string;
  lip: string;
  mouth: 'smile' | 'flat' | 'none';
  browDrop?: number;
  wrinkles?: boolean;
}

export const HEAD_CENTER_X = 32;
export const HEAD_CENTER_Y = 28;
const HEAD_RADIUS_X = 11;
const HEAD_RADIUS_Y = 13;

export function paintNeckAndHead(painter: PortraitPainter, skin: Swatch): void {
  painter.shadedRect(skin, 28, 38, 8, 10);
  painter.rect(skin.shade, 28, 41, 8, 3);
  painter.shadedRect(skin, 21, 27, 2, 5);
  painter.shadedRect(skin, 41, 27, 2, 5);
  painter.shadedEllipse(skin, HEAD_CENTER_X, HEAD_CENTER_Y, HEAD_RADIUS_X, HEAD_RADIUS_Y);
  painter.rect(skin.base, 24, 36, 16, 4);
}

export function paintFeatures(painter: PortraitPainter, face: FaceSpec): void {
  const browY = 23 + (face.browDrop ?? 0);
  painter.rect(face.brow, 25, browY, 5, 1);
  painter.rect(face.brow, 34, browY, 5, 1);
  painter.rect(face.skin.shade, 25, browY + 1, 5, 1);
  painter.rect(face.skin.shade, 34, browY + 1, 5, 1);
  painter.rect(EYE_WHITE, 26, 27, 4, 2);
  painter.rect(EYE_WHITE, 34, 27, 4, 2);
  painter.rect(face.eye, 27, 27, 2, 2);
  painter.rect(face.eye, 35, 27, 2, 2);
  painter.dot(INK, 28, 28);
  painter.dot(INK, 36, 28);
  painter.rect(INK, 26, 26, 4, 1);
  painter.rect(INK, 34, 26, 4, 1);
  painter.rect(face.skin.shade, 31, 28, 2, 5);
  painter.rect(face.skin.light, 31, 32, 2, 1);
  painter.rect(face.skin.shade, 30, 33, 4, 1);
  if (face.wrinkles) {
    painter.rect(face.skin.shade, 23, 29, 2, 1);
    painter.rect(face.skin.shade, 39, 29, 2, 1);
    painter.rect(face.skin.shade, 28, 22, 8, 1);
  }
  if (face.mouth === 'flat') painter.rect(face.lip, 29, 36, 6, 1);
  if (face.mouth === 'smile') {
    painter.rect(face.lip, 29, 36, 6, 1);
    painter.dot(face.lip, 28, 35);
    painter.dot(face.lip, 35, 35);
    painter.rect(face.skin.light, 30, 37, 4, 1);
  }
}

export function paintMouthInBeard(painter: PortraitPainter, lip: string): void {
  painter.rect(INK, 29, 35, 6, 1);
  painter.rect(lip, 30, 36, 4, 1);
}
