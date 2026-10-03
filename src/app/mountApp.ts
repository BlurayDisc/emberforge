import { BUILDINGS } from '../content/buildings';
import { playSound } from '../audio';
import type { GameStore } from '../game';
import { createBattleView } from '../render/battleView';
import { createPixelStage } from '../render/pixelStage';
import { createTownView } from '../render/townView';
import { createBottomBar } from '../ui/bottomBar';
import { element } from '../ui/dom';
import { createPanelHost } from '../ui/panelHost';
import { createRunHud } from '../ui/runHud';
import { createTownOverlay } from '../ui/townOverlay';
import { startFlowController } from './flowController';
import { startRunPlayback } from './runPlayback';

export function mountApp(root: HTMLElement, store: GameStore): void {
  const canvasHost = element('div', 'stage-canvas-host');
  const panelHost = createPanelHost(store);
  const stageArea = element('div', 'stage-area', canvasHost, panelHost.element);
  root.replaceChildren(stageArea, createBottomBar(store, panelHost));

  const stage = createPixelStage(canvasHost);
  const hud = createRunHud(store);
  stage.overlay.append(createTownOverlay(store, (panelId) => panelHost.open(panelId)), hud.element);

  const battleView = createBattleView(stage);
  const townView = createTownView(stage, BUILDINGS);
  startRunPlayback(store, stage, { battleView, townView }, hud);
  startFlowController(store, panelHost);

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) playSound('ui-click');
  });
}
