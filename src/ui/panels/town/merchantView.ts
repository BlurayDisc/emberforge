import { sellAllMaterialsCommand, sellBackpackEntryCommand } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { actionButton, element } from '../../dom';
import { itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext, PanelRenderer } from '../panelContext';

function describeEntry(entry: BackpackEntry): { label: HTMLElement; valueCopper: number } {
  if (entry.content.kind === 'item') {
    const { item } = entry.content;
    return { label: element('span', `quality-${item.quality}`, itemDisplayName(item)), valueCopper: item.sellValueCopper };
  }
  const material = requireById(MATERIALS, entry.content.materialId);
  return {
    label: element('span', '', `${materialName(material.id)} x${entry.content.quantity}`),
    valueCopper: material.sellValueCopper * entry.content.quantity,
  };
}

function sell(context: PanelContext, entry: BackpackEntry): void {
  const result = context.store.execute(sellBackpackEntryCommand({ column: entry.column, row: entry.row }));
  if (!result.accepted) context.notify(describeRejection(result.rejection));
}

export const renderMerchantPanel: PanelRenderer = (context) => {
  const entries = context.store.getState().backpack;
  const sortedEntries = [...entries].sort((first, second) => Number(first.content.kind === 'material') - Number(second.content.kind === 'material'));
  const rows = sortedEntries.map((entry) => {
    const { label, valueCopper } = describeEntry(entry);
    const sellButton = actionButton(t('merchant.sell'), () => sell(context, entry), { className: 'action-button small-button' });
    return element('div', 'card-row merchant-row', label, createMoneyDisplay(valueCopper), sellButton);
  });
  const sellAllButton = actionButton(
    t('merchant.sellAll'),
    () => {
      const result = context.store.execute(sellAllMaterialsCommand());
      if (!result.accepted) context.notify(describeRejection(result.rejection));
    },
    { disabled: !entries.some((entry) => entry.content.kind === 'material') },
  );
  return element(
    'div',
    'panel-body',
    element('p', 'hint', t('merchant.hint')),
    sellAllButton,
    ...(rows.length > 0 ? rows : [element('p', 'hint', t('merchant.empty'))]),
    actionButton(t('merchant.leave'), context.closePanel),
  );
};
