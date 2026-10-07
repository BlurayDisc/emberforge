import { BUILDINGS } from '../content/buildings';
import { collectMillMaterialsCommand, describeMill, type GameStore } from '../game';
import { TOWN_SCREEN_COUNT } from '../kernel/stageSize';
import type { PixelStage } from '../render/pixelStage';
import { playAnimalVoice } from './animalVoice';
import { createTownView, type TownView } from '../render/townView';
import { setInCastle } from '../ui/castleVisit';
import { describeRejection, onLanguageChange, t } from '../ui/i18n';
import { formatDuration } from '../ui/liveUpdate';
import type { PanelHost } from '../ui/panelHost';
import { pickTownTalk } from '../ui/townTalk';

const MILL_REFRESH_MILLISECONDS = 500;

function isMenuOpen(): boolean {
  return document.querySelector('.panel, .modal') !== null;
}

// Builds the town scene and keeps its words in step with the game: the sign names, the hint, the mill timer.
export function createTownPresenter(store: GameStore, stage: PixelStage, panelHost: PanelHost): TownView {
  const town = createTownView(stage, BUILDINGS, {
    openPanel: (panelId) => panelHost.open(panelId),
    enterCastle: () => setInCastle(true),
    collectMill: () => {
      const result = store.execute(collectMillMaterialsCommand());
      if (!result.accepted) panelHost.notify(describeRejection(result.rejection));
    },
    animalVoice: playAnimalVoice,
    pickSpeechText: () => pickTownTalk(store.getState()),
    isInputBlocked: isMenuOpen,
  });

  const refreshTexts = (): void => {
    const state = store.getState();
    const hasNoHeroes = state.company.length === 0;
    const isReadyForFirstRun = !hasNoHeroes && state.runsStarted === 0;
    town.setTexts({
      buildingLabels: Object.fromEntries(BUILDINGS.filter((building) => building.label !== null).map((building) => [building.id, t(`building.${building.id}`)])),
      screenTitles: Array.from({ length: TOWN_SCREEN_COUNT }, (_, index) => t(`town.screen.${index}`)),
      hint: hasNoHeroes ? t('hint.noHeroes') : isReadyForFirstRun ? t('hint.heroReady') : null,
    });
    // A new player sees an arrow over the place to go: the Tavern to hire, then the Dungeons gate.
    town.setGuide(hasNoHeroes ? 'tavern' : isReadyForFirstRun ? 'dungeon-gate' : null);
  };

  const refreshMill = (): void => {
    const mill = describeMill(store.getState());
    const timer = mill.isFull ? t('mill.fullShort') : mill.nextProductionAtMs === null ? t('mill.startingShort') : formatDuration((mill.nextProductionAtMs - Date.now()) / 1000);
    town.setMillStatus({ timer, collectLabel: mill.storedCount > 0 ? t('mill.collectCount', { count: mill.storedCount }) : null });
  };

  store.subscribe(() => {
    refreshTexts();
    refreshMill();
  });
  onLanguageChange(() => {
    refreshTexts();
    refreshMill();
  });
  window.setInterval(refreshMill, MILL_REFRESH_MILLISECONDS);
  refreshTexts();
  refreshMill();
  return town;
}
