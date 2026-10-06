const DIGIT_ROWS: Readonly<Record<string, readonly string[]>> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

export const LABEL_GLYPH_WIDTH = 3;
export const LABEL_GLYPH_HEIGHT = 5;

export function paintNumberLabel(
  pixels: Uint8ClampedArray,
  sheetWidth: number,
  value: number,
  left: number,
  top: number,
  pixelSize: number,
): void {
  const text = String(value);
  const labelWidth = (text.length * (LABEL_GLYPH_WIDTH + 1) + 1) * pixelSize;
  const labelHeight = (LABEL_GLYPH_HEIGHT + 2) * pixelSize;
  const setBlock = (x: number, y: number, width: number, height: number, shade: number): void => {
    for (let row = y; row < y + height; row++) {
      for (let column = x; column < x + width; column++) {
        const index = (row * sheetWidth + column) * 4;
        pixels.set([shade, shade, shade, 255], index);
      }
    }
  };
  setBlock(left, top, labelWidth, labelHeight, 0);
  [...text].forEach((digit, digitIndex) => {
    (DIGIT_ROWS[digit] ?? []).forEach((rowBits, rowIndex) => {
      [...rowBits].forEach((bit, columnIndex) => {
        if (bit !== '1') return;
        const x = left + (1 + digitIndex * (LABEL_GLYPH_WIDTH + 1) + columnIndex) * pixelSize;
        setBlock(x, top + (1 + rowIndex) * pixelSize, pixelSize, pixelSize, 255);
      });
    });
  });
}
