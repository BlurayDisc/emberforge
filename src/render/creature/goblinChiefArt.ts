import { addOutline, createPixelCanvas } from '../pixelCanvas';
import { drawBeltAndTrophies, drawCape, drawLegsAndBoots, drawLeftArm, drawPauldrons, drawRightArm, drawTorso } from './goblinChiefBody';
import { drawChiefCrown, drawChiefHead, drawEars } from './goblinChiefHead';
import { drawMaulHaft, drawMaulHead } from './goblinChiefMaul';

export function drawGoblinChief(): HTMLCanvasElement {
  const art = createPixelCanvas(80, 68);
  drawCape(art);
  drawLegsAndBoots(art);
  drawMaulHaft(art);
  drawTorso(art);
  drawBeltAndTrophies(art);
  drawLeftArm(art);
  drawChiefHead(art);
  drawRightArm(art);
  drawMaulHead(art);
  drawPauldrons(art);
  drawEars(art);
  drawChiefCrown(art);
  addOutline(art, 'outline');
  return art.canvas;
}
