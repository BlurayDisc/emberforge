import type { Item } from '../model/item';
import { element } from './dom';
import { itemNameWithoutUpgrade } from './displayNames';

// The name in its quality colour. The upgrade suffix ("+1" to "+7") comes last and has its own colour for each level.
export function createItemNameElement(item: Item, extraClassName = ''): HTMLElement {
  const name = element('span', `quality-${item.quality}${extraClassName ? ` ${extraClassName}` : ''}`, itemNameWithoutUpgrade(item));
  if (item.upgradeLevel > 0) name.append(element('span', `upgrade-suffix upgrade-${item.upgradeLevel}`, ` +${item.upgradeLevel}`));
  return name;
}
