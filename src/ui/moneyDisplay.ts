import { describeMoney } from '../game';
import { element } from './dom';

function moneyUnit(amount: number, suffix: string, className: string): HTMLElement {
  return element('span', className, `${amount}${suffix}`);
}

export function createMoneyDisplay(totalCopper: number): HTMLElement {
  const { gold, silver, copper } = describeMoney(totalCopper);
  const display = element('span', 'money');
  if (gold > 0) display.append(moneyUnit(gold, 'g', 'money-gold'), ' ');
  if (gold > 0 || silver > 0) display.append(moneyUnit(silver, 's', 'money-silver'), ' ');
  display.append(moneyUnit(copper, 'c', 'money-copper'));
  return display;
}
