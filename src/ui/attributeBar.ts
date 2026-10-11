import { element } from './dom';

// The total view is one fill in the colour of the attribute. The split view keeps the same total length, with the part from items in green.
export function attributeBar(total: number, itemBonus: number, maximum: number, className: string, isItemBonusSplit: boolean): HTMLElement {
  const bonusFraction = isItemBonusSplit ? Math.max(0, Math.min(1, itemBonus / maximum)) : 0;
  const baseFraction = Math.max(0, Math.min(1 - bonusFraction, (total - (isItemBonusSplit ? itemBonus : 0)) / maximum));
  const baseFill = element('div', 'bar-fill');
  baseFill.style.width = `${Math.round(baseFraction * 100)}%`;
  const bonusFill = element('div', 'bar-fill bar-fill-item-bonus');
  bonusFill.style.width = `${Math.round(bonusFraction * 100)}%`;
  return element('div', `bar bar-segmented ${className}`, baseFill, ...(bonusFraction > 0 ? [bonusFill] : []));
}
