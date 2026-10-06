import { playSound } from '../audio';
import type { GameStore } from '../game';
import type { RunReport } from '../model/gameState';
import { heroDisplayName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import type { PanelHost } from '../ui/panelHost';
import { openPrologue } from '../ui/prologue';
import { focusedRunNumber, onRunFocusChange } from '../ui/runFocus';
import { openRunReport } from '../ui/runReportModal';

// A small notice for each hero that gained a level, also when the report opens at once or waits in the background.
function announceLevelUps(store: GameStore, report: RunReport, notify: (message: string) => void): void {
  const leveledResults = report.result.heroes.filter((heroResult) => heroResult.reachedLevel !== null);
  if (leveledResults.length > 0) playSound('level-up', 0.4);
  for (const heroResult of leveledResults) {
    const hero = store.getState().company.find((candidate) => candidate.id === heroResult.heroId);
    if (hero) notify(t('notice.heroLevelUp', { hero: heroDisplayName(hero.name), level: heroResult.reachedLevel! }));
  }
}

// A run ends while the player watches the battle screen (the stage, with no panel open): the report opens at once.
// Everywhere else the report waits, so nothing pops up over what the player is doing. The Dungeons button counts it,
// and the dungeon row shows "Results ready" until the player opens it.
function startReportFlow(store: GameStore, notify: (message: string) => void, isBattleScreenShown: () => boolean): void {
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
      announceLevelUps(store, report, notify);
      if (report.runNumber === watchedRunNumber) {
        watchedRunNumber = null;
        if (isBattleScreenShown()) openRunReport(store, report, notify);
      }
    }
  });
}

export function startFlowController(store: GameStore, panelHost: PanelHost): void {
  let previousState = store.getState();
  const startStory = (): void => openPrologue(() => panelHost.open('tavern'));
  if (previousState.company.length === 0) startStory();
  startReportFlow(store, panelHost.notify, () => panelHost.activePanelId() === null);

  store.subscribe(() => {
    const currentState = store.getState();
    const justHiredFirstHero = previousState.company.length === 0 && currentState.company.length > 0;
    const justStartedNewGame = previousState.company.length > 0 && currentState.company.length === 0;
    if (justHiredFirstHero) panelHost.open('dungeons');
    else if (justStartedNewGame) startStory();
    previousState = currentState;
  });
}
