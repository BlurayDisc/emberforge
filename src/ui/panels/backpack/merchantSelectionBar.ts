import { saleDurationSeconds } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { element } from '../../dom';
import { createItemNameElement } from '../../itemNameElement';
import { t } from '../../i18n';
import { formatDuration } from '../../liveUpdate';
import type { PanelContext } from '../panelContext';
import { backpackEntryTitle, createBackpackEntryActions, saleValueOf } from './backpackEntryMenu';

// Same place and same height as the inventory selection bar, so the merchant grid does not jump either.
export function createMerchantSelectionBar(context: PanelContext, selected: BackpackEntry | undefined, afterAction: () => void): HTMLElement {
  if (!selected) return element('div', 'selection-bar', element('p', 'hint', t('merchant.select')));
  const saleValue = saleValueOf(selected);
  return element(
    'div',
    'selection-bar',
    element('div', 'section-title', selected.content.kind === 'item' ? createItemNameElement(selected.content.item) : backpackEntryTitle(selected)),
    element('div', 'card-text small selection-hint', t('merchant.saleTime', { time: formatDuration(saleDurationSeconds(saleValue)) })),
    element('div', 'hero-choice-row', ...createBackpackEntryActions(context, selected, { afterAction })),
  );
}
