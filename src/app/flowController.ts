import type { GameStore } from '../game';
import type { PanelHost } from '../ui/panelHost';

export function startFlowController(store: GameStore, panelHost: PanelHost): void {
  let previousState = store.getState();
  if (previousState.company.length === 0) panelHost.open('tavern');

  store.subscribe(() => {
    const currentState = store.getState();
    const justHiredFirstHero = previousState.company.length === 0 && currentState.company.length > 0;
    const justStartedNewGame = previousState.company.length > 0 && currentState.company.length === 0;
    if (justHiredFirstHero) panelHost.open('dungeons');
    else if (justStartedNewGame) panelHost.open('tavern');
    previousState = currentState;
  });
}
