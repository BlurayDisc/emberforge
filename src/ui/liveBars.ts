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
  // A hero at the level cap has no next level.
  const isMaxLevel = next <= 0;
  fill.style.width = isMaxLevel ? '100%' : `${Math.round(Math.min(1, current / next) * 100)}%`;
  label.textContent = isMaxLevel ? t('heroes.maxLevel') : `${current} / ${next}`;
  return bar;
}

// Experience after a fight: blue is what the hero had, gold is what the fight gave. A level up leaves only the gold part.
export function createExperienceGainBar(experienceBefore: number, experienceGained: number, experienceToNext: number): HTMLElement {
  const toFraction = (experience: number): number => (experienceToNext > 0 ? Math.max(0, Math.min(1, experience / experienceToNext)) : 0);
  const gainStart = toFraction(experienceBefore);
  const gainEnd = toFraction(experienceBefore + experienceGained);
  const base = element('div', 'bar-fill');
  base.style.width = `${Math.round(gainStart * 100)}%`;
  const gain = element('div', 'bar-fill bar-gain');
  gain.style.left = `${Math.round(gainStart * 100)}%`;
  gain.style.width = `${Math.round((gainEnd - gainStart) * 100)}%`;
  return element('div', 'bar run-progress bar-experience', base, gain);
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
