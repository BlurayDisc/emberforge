import { findActiveRun, runAwayCommand, type GameStore } from '../game';
import { createLogLine, type LogEntry } from './battleLogLines';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { focusRun, focusedRunNumber, onRunFocusChange } from './runFocus';
import { elapsedSecondsOfRun } from './runProgress';

const MAXIMUM_LOG_LINES = 80;

// The run bar goes above the battlefield and the log below it, so nothing covers the picture on a small screen.
export interface RunHud {
  element: HTMLElement;
  logElement: HTMLElement;
  appendLogEntry(entry: LogEntry): void;
  clearLog(): void;
}

export function createRunHud(store: GameStore, openDungeonList: () => void): RunHud {
  const bar = element('div', 'run-bar');
  const title = element('div', 'hud-title');
  const logTitle = element('div', 'log-title');
  const logLines = element('div', 'log-lines');
  const log = element('div', 'battle-log', logTitle, logLines);
  const stopButton = actionButton('', () => {
    const runNumber = focusedRunNumber();
    if (runNumber !== null) store.execute(runAwayCommand(runNumber, elapsedSecondsOfRun(runNumber), Date.now()));
  }, { className: 'action-button danger' });
  const townButton = actionButton('', () => {
    focusRun(null);
    openDungeonList();
  });
  bar.append(title, element('div', 'hud-controls', townButton, stopButton));

  const refresh = (): void => {
    const runNumber = focusedRunNumber();
    const run = runNumber === null ? undefined : findActiveRun(store.getState(), runNumber);
    bar.style.display = run ? 'flex' : 'none';
    log.style.display = run ? 'flex' : 'none';
    bar.parentElement?.classList.toggle('run-active', run !== undefined);
    if (!run) return;
    title.textContent = t(`dungeon.${run.dungeonId}`);
    stopButton.textContent = t('dungeons.runAway');
    townButton.textContent = t('hud.backToTown');
    logTitle.textContent = t('log.title');
  };

  store.subscribe(refresh);
  onRunFocusChange(refresh);
  onLanguageChange(refresh);
  refresh();

  return {
    element: bar,
    logElement: log,
    appendLogEntry: (entry) => {
      logLines.append(createLogLine(entry));
      while (logLines.childElementCount > MAXIMUM_LOG_LINES) logLines.firstElementChild?.remove();
      logLines.scrollTop = logLines.scrollHeight;
    },
    clearLog: () => logLines.replaceChildren(),
  };
}
