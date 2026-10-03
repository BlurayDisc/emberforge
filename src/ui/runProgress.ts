import { element } from './dom';
import { t } from './i18n';

// Run playback lives in the app layer and ticks every frame. It publishes progress here.
// The Dungeons panel is only redrawn when the saved state changes, so each progress bar
// updates itself from this registry.
interface RunProgress {
  fraction: number;
  remainingSeconds: number;
  elapsedSeconds: number;
}

const progressByRun = new Map<number, RunProgress>();

function paint(bar: HTMLElement, progress: RunProgress): void {
  const fill = bar.querySelector<HTMLElement>('.bar-fill');
  const label = bar.querySelector<HTMLElement>('.progress-label');
  if (fill) fill.style.width = `${Math.round(progress.fraction * 100)}%`;
  if (label) label.textContent = t('dungeons.timeLeft', { seconds: Math.max(0, Math.ceil(progress.remainingSeconds)) });
}

export function publishRunProgress(runNumber: number, fraction: number, remainingSeconds: number, elapsedSeconds: number): void {
  const progress = { fraction: Math.max(0, Math.min(1, fraction)), remainingSeconds, elapsedSeconds };
  progressByRun.set(runNumber, progress);
  document.querySelectorAll<HTMLElement>(`[data-run-progress="${runNumber}"]`).forEach((bar) => paint(bar, progress));
}

// How long the player has watched this fight. Running away uses it to work out the wounds.
export function elapsedSecondsOfRun(runNumber: number): number {
  return progressByRun.get(runNumber)?.elapsedSeconds ?? 0;
}

export function forgetRunProgress(runNumber: number): void {
  progressByRun.delete(runNumber);
}

export function createRunProgressBar(runNumber: number): HTMLElement {
  const bar = element('div', 'run-progress bar bar-experience', element('div', 'bar-fill'), element('span', 'progress-label'));
  bar.dataset.runProgress = String(runNumber);
  paint(bar, progressByRun.get(runNumber) ?? { fraction: 0, remainingSeconds: 0, elapsedSeconds: 0 });
  return bar;
}
