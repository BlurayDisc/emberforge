import { describeMoney } from '../game';
import { element } from './dom';
import { createPixelIcon, type IconName } from './pixelIcons';

function moneyPart(amount: number, className: string, coin: IconName): HTMLElement {
  return element('span', `money-part ${className}`, String(amount), createPixelIcon(coin, 2));
}

export function createMoneyDisplay(totalCopper: number): HTMLElement {
  const { gold, silver, copper } = describeMoney(totalCopper);
  const display = element('span', 'money');
  if (gold > 0) display.append(moneyPart(gold, 'money-gold', 'coin-gold'));
  if (gold > 0 || silver > 0) display.append(moneyPart(silver, 'money-silver', 'coin-silver'));
  display.append(moneyPart(copper, 'money-copper', 'coin-copper'));
  return display;
}
