import type { GameStore } from '../game';
import { element } from './dom';
import { currentLanguageId, onLanguageChange } from './i18n';
import { addLiveUpdate } from './liveUpdate';
import { createMoneyDisplay } from './moneyDisplay';

const LOCALE_BY_LANGUAGE: Readonly<Record<string, string>> = { en: 'en-AU', zh: 'zh-CN' };

function formatNow(): string {
  return new Date().toLocaleString(LOCALE_BY_LANGUAGE[currentLanguageId()] ?? 'en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Drawn on the stage: gold in the top left corner, the player's own date and time in the top right corner.
// A panel covers the stage, so the panels that deal with gold show it again.
export function createGameHud(store: GameStore): HTMLElement {
  const moneySlot = element('div', 'game-hud-money');
  const clock = element('div', 'game-hud-clock');
  const refreshMoney = (): void => moneySlot.replaceChildren(createMoneyDisplay(store.getState().copper));
  store.subscribe(refreshMoney);
  refreshMoney();
  // The clock updates with the shared live timer. The text changes only when the minute changes.
  addLiveUpdate(clock, () => {
    const text = formatNow();
    if (clock.textContent !== text) clock.textContent = text;
  });
  onLanguageChange(() => {
    clock.textContent = formatNow();
  });
  return element('div', 'game-hud', moneySlot, clock);
}
