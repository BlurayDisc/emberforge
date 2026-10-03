import { activeRunOf, stopDungeonRunCommand, type GameStore } from '../game';
import type { EncounterResult } from '../model/gameState';
import { actionButton, element } from './dom';
import { createEncounterResultCard } from './encounterResultCard';
import { onLanguageChange, t } from './i18n';

const MAXIMUM_LOG_LINES = 6;
const PLAYBACK_SPEEDS = [1, 2, 4] as const;

export interface RunHud {
  element: HTMLElement;
  appendLogLine(text: string): void;
  clearLog(): void;
  playbackSpeed(): number;
  showResult(result: EncounterResult): void;
  hideResult(): void;
}

export function createRunHud(store: GameStore): RunHud {
  const root = element('div', 'hud-root');
  const container = element('div', 'run-hud');
  const resultSlot = element('div', 'result-slot');
  const title = element('div', 'hud-title');
  const log = element('div', 'hud-log');
  const stopButton = actionButton('', () => store.execute(stopDungeonRunCommand()));
  let speed: number = PLAYBACK_SPEEDS[0];
  let shownResult: EncounterResult | null = null;

  const speedButtons = PLAYBACK_SPEEDS.map((candidate) =>
    actionButton(
      `${candidate}x`,
      () => {
        speed = candidate;
        refreshSpeedButtons();
      },
      { className: 'action-button small-button' },
    ),
  );
  const refreshSpeedButtons = (): void => {
    speedButtons.forEach((button, index) => button.classList.toggle('active', PLAYBACK_SPEEDS[index] === speed));
  };

  container.append(title, log, element('div', 'hud-controls', ...speedButtons, stopButton));
  root.append(container, resultSlot);

  const renderResult = (): void => {
    resultSlot.replaceChildren();
    if (shownResult) resultSlot.append(createEncounterResultCard(shownResult, store.getState().company));
  };

  const refresh = (): void => {
    const state = store.getState();
    const run = activeRunOf(state);
    root.style.display = run === null ? 'none' : 'block';
    if (run === null) {
      shownResult = null;
      resultSlot.replaceChildren();
      return;
    }
    title.textContent = t('hud.title', { name: t(`dungeon.${run.dungeonId}`), count: run.encountersWon });
    stopButton.textContent = t('dungeons.stop');
  };

  store.subscribe(refresh);
  onLanguageChange(() => {
    refresh();
    renderResult();
  });
  refresh();
  refreshSpeedButtons();

  return {
    element: root,
    appendLogLine: (text) => {
      log.append(element('div', 'log-line', text));
      while (log.childElementCount > MAXIMUM_LOG_LINES) log.firstElementChild?.remove();
    },
    clearLog: () => log.replaceChildren(),
    playbackSpeed: () => speed,
    showResult: (result) => {
      shownResult = result;
      renderResult();
    },
    hideResult: () => {
      shownResult = null;
      resultSlot.replaceChildren();
    },
  };
}
