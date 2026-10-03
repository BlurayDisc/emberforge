import { BUILD_LABEL } from '../kernel/buildInfo';
import { BUILDINGS } from '../content/buildings';
import { playSound } from '../audio';
import type { GameStore } from '../game';
import { drawBattleBackdrop } from '../render/battleBackdrops';
import { CREATURE_DRAWERS } from '../render/creatureArt';
import { registerArtProviders } from '../ui/artProviders';
import { createBattleView } from '../render/battleView';
import { createPixelStage } from '../render/pixelStage';
import { createTownView } from '../render/townView';
import { createBottomBar } from '../ui/bottomBar';
import { element } from '../ui/dom';
import { createPanelHost } from '../ui/panelHost';
import { getModalHost } from '../ui/modal';
import { createNotificationCenter } from '../ui/notifications';
import { createRunHud } from '../ui/runHud';
import { createTownOverlay } from '../ui/townOverlay';
import { startFlowController } from './flowController';
import { startRunPlayback } from './runPlayback';

export function mountApp(root: HTMLElement, store: GameStore): void {
  registerArtProviders({ dungeonBackdrop: drawBattleBackdrop, monsterSprite: (spriteKey) => CREATURE_DRAWERS[spriteKey]?.() ?? null });
  const canvasHost = element('div', 'stage-canvas-host');
  const panelHost = createPanelHost(store);
  const hud = createRunHud(store);
  const stageArea = element('div', 'stage-area', hud.element, canvasHost, hud.logElement, panelHost.element, getModalHost(), createNotificationCenter(store), element('div', 'build-badge', BUILD_LABEL));
  root.replaceChildren(stageArea, createBottomBar(store, panelHost));

  document.title = `Emberforge ${BUILD_LABEL}`;
  const stage = createPixelStage(canvasHost);
  stage.overlay.append(createTownOverlay(store, (panelId) => panelHost.open(panelId)));

  const battleView = createBattleView(stage);
  const townView = createTownView(stage, BUILDINGS);
  startRunPlayback(store, stage, { battleView, townView }, hud);
  startFlowController(store, panelHost);

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) playSound('ui-click');
  });
}
