import { describeMoney, type GameStore } from '../game';
import type { PixelStage } from '../render/pixelStage';
import { createStageHud } from '../render/hud/stageHud';
import { formatNow } from '../ui/clockText';
import { onLanguageChange } from '../ui/i18n';

const CLOCK_REFRESH_MILLISECONDS = 1000;

// Keeps the gold and the clock that Pixi draws in step with the game.
export function createStageHudPresenter(store: GameStore, stage: PixelStage): void {
  const hud = createStageHud(stage);
  let previousCopper = store.getState().copper;
  const refreshMoney = (): void => {
    const copper = store.getState().copper;
    const earned = copper - previousCopper;
    previousCopper = copper;
    hud.setMoney(describeMoney(copper), earned > 0 ? describeMoney(earned) : null);
  };
  const refreshClock = (): void => hud.setClock(formatNow());
  store.subscribe(refreshMoney);
  onLanguageChange(refreshClock);
  window.setInterval(refreshClock, CLOCK_REFRESH_MILLISECONDS);
  hud.setMoney(describeMoney(previousCopper), null);
  refreshClock();
}
