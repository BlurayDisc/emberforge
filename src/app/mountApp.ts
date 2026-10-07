import { BUILD_LABEL } from '../kernel/buildInfo';
import { createBuildBadge } from '../ui/buildBadge';
import { CASTLE_SCREEN_COUNT } from '../kernel/stageSize';
import { playSound } from '../audio';
import { loadWideTownView, type GameStore } from '../game';
import { setWideTownView } from '../kernel/wideTownView';
import { createBattleView } from '../render/battleView';
import { playAnimalVoice } from './animalVoice';
import { createCastleView } from '../render/castleView';
import { createPixelStage } from '../render/pixelStage';
import { createTownPresenter } from './townPresenter';
import { createStageHudPresenter } from './stageHudPresenter';
import { createBottomBar } from '../ui/bottomBar';
import { createCastleOverlay } from '../ui/castleOverlay';
import { element } from '../ui/dom';
import { createPanelHost } from '../ui/panelHost';
import { closeTopModal, getModalHost } from '../ui/modal';
import { createRunHud } from '../ui/runHud';
import { combineTownAndCastle } from './townScenes';
import { startJobTicker } from './jobTicker';
import { startFlowController } from './flowController';
import { startRunPlayback } from './runPlayback';
import { preloadTownArt } from './townArtPreloader';

export function mountApp(root: HTMLElement, store: GameStore): void {
  const canvasHost = element('div', 'stage-canvas-host');
  const panelHost = createPanelHost(store);
  const hud = createRunHud(store, () => panelHost.open('dungeons'));
  const stageArea = element('div', 'stage-area', hud.element, canvasHost, hud.logElement, panelHost.element, panelHost.notificationsElement, getModalHost(), createBuildBadge());
  root.replaceChildren(stageArea, createBottomBar(store, panelHost));

  document.title = `Emberforge ${BUILD_LABEL}`;
  setWideTownView(loadWideTownView());
  const stage = createPixelStage(canvasHost);

  const battleView = createBattleView(stage);
  const townView = createTownPresenter(store, stage, panelHost);
  createStageHudPresenter(store, stage);
  const castleView = createCastleView(stage, playAnimalVoice);
  const castleOverlay = createCastleOverlay({
    screenCount: CASTLE_SCREEN_COUNT,
    currentScreen: castleView.currentScreen,
    goToScreen: castleView.goToScreen,
    onScroll: castleView.onScroll,
  });
  stage.overlay.append(castleOverlay);
  startRunPlayback(store, stage, { battleView, townView: combineTownAndCastle(townView, castleView) }, hud);
  startFlowController(store, panelHost);
  startJobTicker(store, panelHost);

  let loadedTownId = store.getState().townId;
  store.subscribe(() => {
    const { townId } = store.getState();
    if (townId === loadedTownId) return;
    loadedTownId = townId;
    void preloadTownArt(store, townId);
  });

  // Escape closes the top window first, then the open panel. Capture phase, so it runs before the castle handler.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (closeTopModal() || panelHost.closeActivePanel()) event.stopPropagation();
  }, true);

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) playSound('ui-click');
  });
}
