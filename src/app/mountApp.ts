import { BUILD_LABEL } from '../kernel/buildInfo';
import { createBuildBadge } from '../ui/buildBadge';
import { CASTLE_SCREEN_COUNT, TOWN_SCREEN_COUNT } from '../kernel/stageSize';
import { BUILDINGS } from '../content/buildings';
import { playSound } from '../audio';
import type { GameStore } from '../game';
import { drawBattleBackdrop } from '../render/battleBackdrops';
import { CREATURE_DRAWERS } from '../render/creatureArt';
import { registerArtProviders } from '../ui/artProviders';
import { createBattleView } from '../render/battleView';
import { FIGURE_DRAWERS } from '../render/castleFigureArt';
import { createCastleView } from '../render/castleView';
import { createPixelStage } from '../render/pixelStage';
import { createTownView } from '../render/townView';
import { createBottomBar } from '../ui/bottomBar';
import { createCastleOverlay } from '../ui/castleOverlay';
import { element } from '../ui/dom';
import { createPanelHost } from '../ui/panelHost';
import { closeTopModal, getModalHost } from '../ui/modal';
import { createGameHud } from '../ui/gameHud';
import { createRunHud } from '../ui/runHud';
import { createTownOverlay } from '../ui/townOverlay';
import { createTownSpeech } from '../ui/townSpeech';
import { combineTownAndCastle } from './townScenes';
import { startJobTicker } from './jobTicker';
import { startFlowController } from './flowController';
import { startRunPlayback } from './runPlayback';

export function mountApp(root: HTMLElement, store: GameStore): void {
  registerArtProviders({ dungeonBackdrop: drawBattleBackdrop, monsterSprite: (spriteKey) => CREATURE_DRAWERS[spriteKey]?.() ?? null, castleFigure: (look) => FIGURE_DRAWERS[look]?.() ?? null });
  const canvasHost = element('div', 'stage-canvas-host');
  const panelHost = createPanelHost(store);
  const hud = createRunHud(store, () => panelHost.open('dungeons'));
  const stageArea = element('div', 'stage-area', hud.element, canvasHost, hud.logElement, panelHost.element, getModalHost(), createBuildBadge());
  root.replaceChildren(stageArea, createBottomBar(store, panelHost));

  document.title = `Emberforge ${BUILD_LABEL}`;
  const stage = createPixelStage(canvasHost);
  const townSpeech = createTownSpeech(store);

  const battleView = createBattleView(stage);
  const townView = createTownView(stage, BUILDINGS, townSpeech.show);
  const townOverlay = createTownOverlay(store, (panelId) => panelHost.open(panelId), {
    screenCount: TOWN_SCREEN_COUNT,
    currentScreen: townView.currentScreen,
    goToScreen: townView.goToScreen,
    onScroll: townView.onScroll,
  }, panelHost.notify);
  townOverlay.world.append(townSpeech.element);
  const castleView = createCastleView(stage);
  const castleOverlay = createCastleOverlay({
    screenCount: CASTLE_SCREEN_COUNT,
    currentScreen: castleView.currentScreen,
    goToScreen: castleView.goToScreen,
    onScroll: castleView.onScroll,
  });
  stage.overlay.append(townOverlay.element, castleOverlay, createGameHud(store));
  startRunPlayback(store, stage, { battleView, townView: combineTownAndCastle(townView, castleView) }, hud);
  startFlowController(store, panelHost);
  startJobTicker(store, panelHost);

  // Escape closes the top window first, then the open panel. Capture phase, so it runs before the castle handler.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (closeTopModal() || panelHost.closeActivePanel()) event.stopPropagation();
  }, true);

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) playSound('ui-click');
  });
}
