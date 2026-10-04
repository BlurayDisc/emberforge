import { createPixelCanvas, type PixelCanvas } from '../pixelCanvas';

export type EffectFrame = HTMLCanvasElement;

export function createEffectFrame(width: number, height: number = width): PixelCanvas {
  return createPixelCanvas(width, height);
}

export function plotPixel(frame: PixelCanvas, color: string, x: number, y: number): void {
  frame.fill(color as `#${string}`, x, y, 1, 1);
}

export function plotBlock(frame: PixelCanvas, color: string, centerX: number, centerY: number, width: number, height: number): void {
  frame.fill(color as `#${string}`, centerX - Math.floor(width / 2), centerY - Math.floor(height / 2), width, height);
}

// A thick line is 2 pixels wide, so it stays readable on the small stage.
export function plotLine(frame: PixelCanvas, color: string, fromX: number, fromY: number, toX: number, toY: number, thickness = 1): void {
  const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY), 1);
  for (let step = 0; step <= steps; step++) {
    const x = Math.round(fromX + ((toX - fromX) * step) / steps);
    const y = Math.round(fromY + ((toY - fromY) * step) / steps);
    frame.fill(color as `#${string}`, x, y, thickness, thickness);
  }
}

export function plotDisc(frame: PixelCanvas, color: string, centerX: number, centerY: number, radius: number): void {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius + radius * 0.5) plotPixel(frame, color, centerX + x, centerY + y);
    }
  }
}

// A ring is an ellipse outline. A flat ring (radiusY below radiusX) lies on the ground. A big ring is 2 pixels wide.
export function plotRing(frame: PixelCanvas, color: string, centerX: number, centerY: number, radiusX: number, radiusY: number = radiusX): void {
  const steps = Math.max(16, Math.round((radiusX + radiusY) * 4));
  for (let step = 0; step < steps; step++) {
    const angle = (step / steps) * Math.PI * 2;
    const thickness = radiusX >= 8 ? 2 : 1;
    frame.fill(color as `#${string}`, centerX + Math.round(Math.cos(angle) * radiusX), centerY + Math.round(Math.sin(angle) * radiusY), thickness, thickness);
  }
}

// Rays leave the centre at even angles. The turn rotates the whole star from frame to frame.
export function plotStar(frame: PixelCanvas, color: string, centerX: number, centerY: number, innerRadius: number, outerRadius: number, rayCount: number, turn = 0, thickness = 2): void {
  for (let ray = 0; ray < rayCount; ray++) {
    const angle = turn + (ray / rayCount) * Math.PI * 2;
    plotLine(frame, color, centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius, centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius, thickness);
  }
}

export function plotDiamond(frame: PixelCanvas, color: string, centerX: number, centerY: number, radius: number): void {
  for (let y = -radius; y <= radius; y++) {
    const halfWidth = radius - Math.abs(y);
    frame.fill(color as `#${string}`, centerX - halfWidth, centerY + y, halfWidth * 2 + 1, 1);
  }
}

// A fixed list of offsets that looks random. Effects must look the same every time, so they never call Math.random().
export function scatterOffset(index: number, spread: number): { x: number; y: number } {
  return { x: Math.round(Math.sin(index * 12.9898) * spread), y: Math.round(Math.cos(index * 78.233) * spread) };
}

export function buildFrames(frameCount: number, width: number, height: number, drawFrame: (frame: PixelCanvas, progress: number, index: number) => void): EffectFrame[] {
  return Array.from({ length: frameCount }, (_, index) => {
    const frame = createEffectFrame(width, height);
    drawFrame(frame, frameCount === 1 ? 0 : index / (frameCount - 1), index);
    return frame.canvas;
  });
}
