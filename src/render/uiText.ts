import { Text } from 'pixi.js';

export type UiFont = 'title' | 'body' | 'readable';

export interface UiTextOptions {
  font: UiFont;
  size: number;
  color: string;
  // Lines wrap at this width, in logical pixels.
  wrapWidth?: number;
  align?: 'left' | 'center' | 'right';
  // A hard shadow one logical pixel down and right.
  shadow?: string;
}

export interface UiTextFactory {
  create(content: string, options: UiTextOptions): Text;
}

// The stacks come from the same CSS variables the menus use, so the stage and the menus show the same letters.
const FONT_VARIABLE: Readonly<Record<UiFont, string>> = { title: '--font-title', body: '--font-body', readable: '--font-readable' };
const FONT_SAMPLES = ['12px "Jacquard 12"', '12px "Pixelify Sans"', '12px "Fusion Pixel 12px Proportional SC"'];
const LINE_HEIGHT_FACTOR = 1.25;
// Display fonts such as Jacquard have glyphs that reach past the measured width. Without padding the last letter is cropped.
const GLYPH_OVERHANG_PADDING = 3;

function fontStack(font: UiFont): string {
  return getComputedStyle(document.documentElement).getPropertyValue(FONT_VARIABLE[font]).trim() || 'sans-serif';
}

// Text is drawn at screen resolution, so it stays sharp when the stage scales. The scale function says how many screen pixels one logical pixel is.
export function createUiTextFactory(renderScale: () => number, onViewResize: (listener: () => void) => void): UiTextFactory {
  const texts = new Set<Text>();
  const applyScale = (): void => texts.forEach((text) => (text.resolution = renderScale()));
  onViewResize(applyScale);

  // A web font loads on first use. Text made before that shows a fallback font, so every text is drawn again once the fonts are in.
  void Promise.all(FONT_SAMPLES.map((sample) => document.fonts.load(sample))).then(() => {
    texts.forEach((text) => {
      const content = text.text;
      text.text = `${content} `;
      text.text = content;
    });
  });

  return {
    create: (content, options) => {
      const text = new Text({
        text: content,
        resolution: renderScale(),
        roundPixels: true,
        style: {
          fontFamily: fontStack(options.font),
          fontSize: options.size,
          fill: options.color,
          lineHeight: options.size * LINE_HEIGHT_FACTOR,
          padding: GLYPH_OVERHANG_PADDING,
          align: options.align ?? 'left',
          wordWrap: options.wrapWidth !== undefined,
          wordWrapWidth: options.wrapWidth ?? 0,
          breakWords: true,
          dropShadow: options.shadow ? { color: options.shadow, alpha: 1, angle: Math.PI / 4, distance: 1, blur: 0 } : false,
        },
      });
      texts.add(text);
      text.on('destroyed', () => texts.delete(text));
      return text;
    },
  };
}
