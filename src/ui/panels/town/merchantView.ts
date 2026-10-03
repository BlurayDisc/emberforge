import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { BASE_ITEMS } from '../../../content/baseItems';
import { sellAllMaterialsCommand, sellBackpackEntryCommand } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { actionButton, element } from '../../dom';
import { itemBaseDisplayName, itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createItemIcon, createMaterialIcon } from '../../iconArt';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext, PanelRenderer } from '../panelContext';

function sell(context: PanelContext, entry: BackpackEntry): void {
  const result = context.store.execute(sellBackpackEntryCommand({ column: entry.column, row: entry.row }));
  if (!result.accepted) context.notify(describeRejection(result.rejection));
}

function renderEntryRow(context: PanelContext, entry: BackpackEntry): HTMLElement {
  const sellButton = actionButton(t('merchant.sell'), () => sell(context, entry), { className: 'action-button small-button' });
  if (entry.content.kind === 'item') {
    const { item } = entry.content;
    const base = requireById(BASE_ITEMS, item.baseId);
    const material = requireById(MATERIALS, item.materialId);
    return createListRow({
      art: createItemIcon(item.baseId, item.materialId, base.mainCategory, 3),
      title: element('span', `quality-${item.quality}`, itemDisplayName(item)),
      lines: [element('div', 'card-text small', itemBaseDisplayName(item) || material.id)],
      actions: [createMoneyDisplay(item.sellValueCopper), sellButton],
    });
  }
  const material = requireById(MATERIALS, entry.content.materialId);
  return createListRow({
    art: createMaterialIcon(material.id, material.category, 3),
    title: `${materialName(material.id)} x${entry.content.quantity}`,
    actions: [createMoneyDisplay(material.sellValueCopper * entry.content.quantity), sellButton],
  });
}

export const renderMerchantPanel: PanelRenderer = (context) => {
  const entries = context.store.getState().backpack;
  const sortedEntries = [...entries].sort((first, second) => Number(first.content.kind === 'material') - Number(second.content.kind === 'material'));
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
    entries.length > 0 ? createList(...sortedEntries.map((entry) => renderEntryRow(context, entry))) : element('p', 'hint', t('merchant.empty')),
    actionButton(t('merchant.leave'), context.closePanel),
  );
};
