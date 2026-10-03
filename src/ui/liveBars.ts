import { describeHero, type GameStore } from '../game';
import type { TimedJob } from '../model/timedJob';
import { element } from './dom';
import { t } from './i18n';
import { addLiveUpdate, formatDuration } from './liveUpdate';

function createBar(className: string): { bar: HTMLElement; fill: HTMLElement; label: HTMLElement } {
  const fill = element('div', 'bar-fill');
  const label = element('span', 'progress-label');
  return { bar: element('div', `bar run-progress ${className}`, fill, label), fill, label };
}

// Health bar that follows regeneration. A downed hero shows the time until the hero returns.
export function createLiveHealthBar(store: GameStore, heroId: string): HTMLElement {
  const { bar, fill, label } = createBar('bar-health');
  addLiveUpdate(bar, () => {
    const state = store.getState();
    const hero = state.company.find((candidate) => candidate.id === heroId);
    if (!hero) return;
    const view = describeHero(state, hero, Date.now());
    fill.style.width = `${Math.round(view.healthFraction * 100)}%`;
    bar.classList.toggle('downed', view.isDowned);
    if (view.isDowned) label.textContent = t('heroes.downed', { time: formatDuration(view.secondsToRevive) });
    else label.textContent = view.secondsToFullHealth > 0 ? t('heroes.rested', { time: formatDuration(view.secondsToFullHealth) }) : '';
  });
  return bar;
}

export function createExperienceBar(current: number, next: number): HTMLElement {
  const { bar, fill, label } = createBar('bar-experience');
  fill.style.width = `${Math.round(Math.min(1, current / next) * 100)}%`;
  label.textContent = `${current} / ${next}`;
  return bar;
}

// Progress bar of a sale or craft job.
export function createJobBar(job: TimedJob, waitingText: string): HTMLElement {
  const { bar, fill, label } = createBar('bar-experience');
  addLiveUpdate(bar, () => {
    const nowMs = Date.now();
    const remainingSeconds = (job.finishesAtMs - nowMs) / 1000;
    fill.style.width = `${Math.round(Math.max(0, Math.min(1, (nowMs - job.startedAtMs) / (job.finishesAtMs - job.startedAtMs))) * 100)}%`;
    label.textContent = remainingSeconds > 0 ? t('job.timeLeft', { time: formatDuration(remainingSeconds) }) : waitingText;
  });
  return bar;
}
