import { describeHero, type GameStore } from '../game';
import type { TimedJob } from '../model/timedJob';
import { healthBarLength, type HealthBarLengthScale } from '../kernel/healthBarLength';
import { element } from './dom';
import { t } from './i18n';
import { addLiveUpdate, formatDuration } from './liveUpdate';

function createBar(className: string): { bar: HTMLElement; fill: HTMLElement; label: HTMLElement } {
  const fill = element('div', 'bar-fill');
  const label = element('span', 'progress-label');
  return { bar: element('div', `bar run-progress ${className}`, fill, label), fill, label };
}

const MENU_HEALTH_BAR_SCALE: HealthBarLengthScale = { lengthPerRootPoint: 11, minimum: 64, maximum: 160 };

export function menuHealthBarWidthPixels(maximumHealth: number): number {
  return healthBarLength(maximumHealth, MENU_HEALTH_BAR_SCALE);
}

// Health bar that follows regeneration. Its length follows the hero maximum health, like the bars on the stage.
// The bar shows the health numbers. The time until the hero is full or back stands beside it, unless the row is too small for it.
export function createLiveHealthBar(store: GameStore, heroId: string, options: { showsTimeNote: boolean } = { showsTimeNote: true }): HTMLElement {
  const { bar, fill, label } = createBar('bar-health');
  const timeNote = element('span', 'card-text small health-time-note');
  addLiveUpdate(bar, () => {
    const state = store.getState();
    const hero = state.company.find((candidate) => candidate.id === heroId);
    if (!hero) return;
    const view = describeHero(state, hero, Date.now());
    bar.style.width = `${menuHealthBarWidthPixels(view.sheet.health)}px`;
    fill.style.width = `${Math.round(view.healthFraction * 100)}%`;
    bar.classList.toggle('downed', view.isDowned);
    label.textContent = view.isDowned ? t('party.downed') : `${Math.ceil(view.healthFraction * view.sheet.health)} / ${view.sheet.health}`;
    if (view.isDowned) timeNote.textContent = t('heroes.downed', { time: formatDuration(view.secondsToRevive) });
    else timeNote.textContent = view.secondsToFullHealth > 0 ? t('heroes.rested', { time: formatDuration(view.secondsToFullHealth) }) : '';
  });
  return element('div', 'health-line', bar, ...(options.showsTimeNote ? [timeNote] : []));
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
export function createExperienceGainBar(experienceBefore: number, experienceGained: number, experienceToNext: number, labelText = ''): HTMLElement {
  const toFraction = (experience: number): number => (experienceToNext > 0 ? Math.max(0, Math.min(1, experience / experienceToNext)) : 0);
  const gainStart = toFraction(experienceBefore);
  const gainEnd = toFraction(experienceBefore + experienceGained);
  const base = element('div', 'bar-fill');
  base.style.width = `${Math.round(gainStart * 100)}%`;
  const gain = element('div', 'bar-fill bar-gain');
  gain.style.left = `${Math.round(gainStart * 100)}%`;
  gain.style.width = `${Math.round((gainEnd - gainStart) * 100)}%`;
  return element('div', 'bar run-progress bar-experience', base, gain, element('span', 'progress-label', labelText));
}

// The reverse of the experience bar: green is the health the hero had, and the red part grows from its right end to the left, as the fight takes health.
// The red part covers the green one, so a wounded hero shows an empty part after the green.
export function createHealthLossBar(healthBefore: number, healthLost: number, maximumHealth: number, labelText: string): HTMLElement {
  const toFraction = (health: number): number => Math.max(0, Math.min(1, health / maximumHealth));
  const beforeFraction = toFraction(healthBefore);
  const remainingFraction = toFraction(healthBefore - healthLost);
  const before = element('div', 'bar-fill');
  before.style.width = `${Math.round(beforeFraction * 100)}%`;
  const loss = element('div', 'bar-fill bar-loss');
  loss.style.left = `${Math.round(remainingFraction * 100)}%`;
  loss.style.width = `${Math.round((beforeFraction - remainingFraction) * 100)}%`;
  return element('div', 'bar run-progress bar-health', before, loss, element('span', 'progress-label', labelText));
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
