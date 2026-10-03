export function outlineOpaquePixels(canvas: HTMLCanvasElement, color: string): void {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');
  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  const isOpaque = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < width && y < height && (data[(y * width + x) * 4 + 3] ?? 0) > 0;
  context.fillStyle = color;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isOpaque(x, y)) continue;
      if (isOpaque(x - 1, y) || isOpaque(x + 1, y) || isOpaque(x, y - 1) || isOpaque(x, y + 1)) context.fillRect(x, y, 1, 1);
    }
  }
}
