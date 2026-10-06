import { Container } from 'pixi.js';
import { PALETTE } from './palette';
import { createFlatSprite } from './pixiTextures';

export interface PanelColors {
  fill: string;
  light: string;
  shade: string;
}

export const WOOD_PANEL: PanelColors = { fill: PALETTE.uiWood700, light: PALETTE.uiWood500, shade: PALETTE.uiWood900 };
export const GOLD_PANEL: PanelColors = { fill: PALETTE.uiGold, light: PALETTE.uiGoldLight, shade: PALETTE.uiGoldDark };
export const PARCHMENT_PANEL: PanelColors = { fill: PALETTE.uiParchment, light: '#f6ecc8', shade: PALETTE.uiParchmentDim };

// A pixel panel: a one pixel ink outline around a fill, with a light top left edge and a dark bottom right edge.
// The panel covers (0, 0) to (width, height). The outline is drawn one pixel outside.
export function createPixelPanel(width: number, height: number, colors: PanelColors): Container {
  const panel = new Container();
  const outline = createFlatSprite(PALETTE.uiInk, width + 2, height + 2);
  outline.position.set(-1, -1);
  const fill = createFlatSprite(colors.fill, width, height);
  const lightTop = createFlatSprite(colors.light, width, 1);
  const lightLeft = createFlatSprite(colors.light, 1, height);
  const shadeBottom = createFlatSprite(colors.shade, width, 1);
  shadeBottom.position.set(0, height - 1);
  const shadeRight = createFlatSprite(colors.shade, 1, height);
  shadeRight.position.set(width - 1, 0);
  panel.addChild(outline, fill, lightTop, lightLeft, shadeBottom, shadeRight);
  return panel;
}
