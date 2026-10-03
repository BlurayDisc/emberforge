import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { activeRunOf, stopDungeonRunCommand, type GameStore } from '../game';
import { actionButton, element } from './dom';

const MAXIMUM_LOG_LINES = 7;
const PLAYBACK_SPEEDS = [1, 2, 4] as const;

export interface RunHud {
  element: HTMLElement;
  appendLogLine(text: string): void;
  clearLog(): void;
  playbackSpeed(): number;
}

export function createRunHud(store: GameStore): RunHud {
  const container = element('div', 'run-hud');
  const title = element('div', 'hud-title');
  const log = element('div', 'hud-log');
  const stopButton = actionButton('Stop run', () => store.execute(stopDungeonRunCommand()));
  let speed: number = PLAYBACK_SPEEDS[0];

  const speedButtons = PLAYBACK_SPEEDS.map((candidate) =>
    actionButton(
      `${candidate}×`,
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

  const refresh = (): void => {
    const run = store.getState().dungeonRun;
    container.style.display = run === null ? 'none' : 'block';
    if (run === null) return;
    const dungeon = requireById(DUNGEONS, run.dungeonId);
    const isActive = activeRunOf(store.getState()) !== null;
    title.textContent = `${dungeon.name} - fights won: ${run.encountersWon}${isActive ? '' : ' (run ended)'}`;
    stopButton.style.display = isActive ? '' : 'none';
  };

  store.subscribe(refresh);
  refresh();
  refreshSpeedButtons();

  return {
    element: container,
    appendLogLine: (text) => {
      log.append(element('div', 'log-line', text));
      while (log.childElementCount > MAXIMUM_LOG_LINES) log.firstElementChild?.remove();
    },
    clearLog: () => log.replaceChildren(),
    playbackSpeed: () => speed,
  };
}
