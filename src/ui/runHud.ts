import { findActiveRun, stopDungeonRunCommand, type GameStore } from '../game';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { focusRun, focusedRunNumber, onRunFocusChange } from './runFocus';

const MAXIMUM_LOG_LINES = 6;

// The run bar goes above the battlefield and the log below it, so nothing covers the picture on a small screen.
export interface RunHud {
  element: HTMLElement;
  logElement: HTMLElement;
  appendLogLine(text: string): void;
  clearLog(): void;
}

export function createRunHud(store: GameStore): RunHud {
  const bar = element('div', 'run-bar');
  const title = element('div', 'hud-title');
  const log = element('div', 'battle-log');
  const stopButton = actionButton('', () => {
    const runNumber = focusedRunNumber();
    if (runNumber !== null) store.execute(stopDungeonRunCommand(runNumber));
  }, { className: 'action-button danger' });
  const townButton = actionButton('', () => focusRun(null));
  bar.append(title, element('div', 'hud-controls', townButton, stopButton));

  const refresh = (): void => {
    const runNumber = focusedRunNumber();
    const run = runNumber === null ? undefined : findActiveRun(store.getState(), runNumber);
    bar.style.display = run ? 'flex' : 'none';
    log.style.display = run ? 'block' : 'none';
    if (!run) return;
    title.textContent = t(`dungeon.${run.dungeonId}`);
    stopButton.textContent = t('dungeons.stop');
    townButton.textContent = t('hud.backToTown');
  };

  store.subscribe(refresh);
  onRunFocusChange(refresh);
  onLanguageChange(refresh);
  refresh();

  return {
    element: bar,
    logElement: log,
    appendLogLine: (text) => {
      log.append(element('div', 'log-line', text));
      while (log.childElementCount > MAXIMUM_LOG_LINES) log.firstElementChild?.remove();
    },
    clearLog: () => log.replaceChildren(),
  };
}
