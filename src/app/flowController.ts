import type { GameStore } from '../game';
import type { PanelHost } from '../ui/panelHost';
import { openPrologue } from '../ui/prologue';

export function startFlowController(store: GameStore, panelHost: PanelHost): void {
  let previousState = store.getState();
  const startStory = (): void => openPrologue(() => panelHost.open('tavern'));
  if (previousState.company.length === 0) startStory();

  store.subscribe(() => {
    const currentState = store.getState();
    const justHiredFirstHero = previousState.company.length === 0 && currentState.company.length > 0;
    const justStartedNewGame = previousState.company.length > 0 && currentState.company.length === 0;
    if (justHiredFirstHero) panelHost.open('dungeons');
    else if (justStartedNewGame) startStory();
    previousState = currentState;
  });
}
