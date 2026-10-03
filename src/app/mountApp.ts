import type { GameStore } from '../game';
import { createBattleView } from '../render/battleView';
import { createPixelStage } from '../render/pixelStage';
import { createBottomBar } from '../ui/bottomBar';
import { element } from '../ui/dom';
import { createPanelHost } from '../ui/panelHost';
import { createRunHud } from '../ui/runHud';
import { startRunPlayback } from './runPlayback';

export function mountApp(root: HTMLElement, store: GameStore): void {
  const canvasHost = element('div', 'stage-canvas-host');
  const panelHost = createPanelHost(store);
  const hud = createRunHud(store);
  const stageArea = element('div', 'stage-area', canvasHost, hud.element, panelHost.element);
  root.replaceChildren(stageArea, createBottomBar(store, panelHost));

  const stage = createPixelStage(canvasHost);
  const view = createBattleView(stage);
  startRunPlayback(store, stage, view, hud);

  if (store.getState().company.length === 0) panelHost.open('town');
}
