export interface RgbaColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const FUNCTION_COLOR = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

export function parseCssColor(cssColor: string): RgbaColor {
  const hexMatch = HEX_COLOR.exec(cssColor);
  if (hexMatch) {
    const digits = hexMatch[1] as string;
    const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
    return {
      red: parseInt(full.slice(0, 2), 16),
      green: parseInt(full.slice(2, 4), 16),
      blue: parseInt(full.slice(4, 6), 16),
      alpha: 1,
    };
  }
  const functionMatch = FUNCTION_COLOR.exec(cssColor);
  if (functionMatch) {
    return {
      red: Number(functionMatch[1]),
      green: Number(functionMatch[2]),
      blue: Number(functionMatch[3]),
      alpha: functionMatch[4] === undefined ? 1 : Number(functionMatch[4]),
    };
  }
  throw new Error(`Headless canvas cannot read this color: ${cssColor}`);
}
