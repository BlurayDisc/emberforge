import type { GameStore } from '../game';
import { t } from '../ui/i18n';
import type { PanelHost } from '../ui/panelHost';

export function startFlowController(store: GameStore, panelHost: PanelHost): void {
  let previousState = store.getState();
  if (previousState.company.length === 0) panelHost.open('tavern');

  store.subscribe(() => {
    const currentState = store.getState();
    const justHiredFirstHero = previousState.company.length === 0 && currentState.company.length > 0;
    const justStartedNewGame = previousState.company.length > 0 && currentState.company.length === 0;
    const finishedRun = currentState.lastEndedRun !== previousState.lastEndedRun ? currentState.lastEndedRun : null;

    if (justHiredFirstHero) panelHost.open('dungeons');
    else if (justStartedNewGame) panelHost.open('tavern');
    else if (finishedRun) {
      // Do not pull the player out of a menu that is not about runs. Show a short note instead.
      const activePanel = panelHost.activePanelId();
      if (activePanel === null || activePanel === 'dungeons') panelHost.open('inventory');
      else panelHost.notify(t('run.finishedToast', { name: t(`dungeon.${finishedRun.dungeonId}`) }));
    }
    previousState = currentState;
  });
}
