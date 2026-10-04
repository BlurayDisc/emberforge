import { playSound } from '../audio';
import type { GameStore } from '../game';
import type { PanelHost } from '../ui/panelHost';
import { openPrologue } from '../ui/prologue';
import { focusedRunNumber, onRunFocusChange } from '../ui/runFocus';
import { openRunReport } from '../ui/runReportModal';

// A run ends while the player watches it: the report opens at once, so the player reads the stats before the next action.
// A run in the background keeps its report. The dungeon row shows "Results ready" until the player opens it.
function startReportFlow(store: GameStore, notify: (message: string) => void): void {
  const announced = new Set<number>(store.getState().reports.map((report) => report.runNumber));
  let watchedRunNumber: number | null = null;

  onRunFocusChange(() => {
    const focused = focusedRunNumber();
    if (focused !== null) watchedRunNumber = focused;
    else if (store.getState().dungeonRuns.some((run) => run.runNumber === watchedRunNumber)) watchedRunNumber = null;
  });

  store.subscribe(() => {
    for (const report of store.getState().reports) {
      if (announced.has(report.runNumber)) continue;
      announced.add(report.runNumber);
      playSound(report.result.won ? 'victory' : 'defeat-hero');
      if (report.result.heroes.some((hero) => hero.reachedLevel !== null)) playSound('level-up', 0.4);
      if (report.runNumber === watchedRunNumber) {
        watchedRunNumber = null;
        openRunReport(store, report, notify);
      }
    }
  });
}

export function startFlowController(store: GameStore, panelHost: PanelHost): void {
  let previousState = store.getState();
  const startStory = (): void => openPrologue(() => panelHost.open('tavern'));
  if (previousState.company.length === 0) startStory();
  startReportFlow(store, panelHost.notify);

  store.subscribe(() => {
    const currentState = store.getState();
    const justHiredFirstHero = previousState.company.length === 0 && currentState.company.length > 0;
    const justStartedNewGame = previousState.company.length > 0 && currentState.company.length === 0;
    if (justHiredFirstHero) panelHost.open('dungeons');
    else if (justStartedNewGame) startStory();
    previousState = currentState;
  });
}
