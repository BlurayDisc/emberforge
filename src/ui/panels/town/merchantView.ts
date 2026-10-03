import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { sellAllMaterialsCommand, sellBackpackEntryCommand } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { actionButton, element } from '../../dom';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext } from '../panelContext';

function describeEntry(entry: BackpackEntry): { label: HTMLElement; valueCopper: number } {
  if (entry.content.kind === 'item') {
    const { item } = entry.content;
    return { label: element('span', `quality-${item.quality}`, item.name), valueCopper: item.sellValueCopper };
  }
  const material = requireById(MATERIALS, entry.content.materialId);
  return {
    label: element('span', '', `${material.name} ×${entry.content.quantity}`),
    valueCopper: material.sellValueCopper * entry.content.quantity,
  };
}

function sell(context: PanelContext, entry: BackpackEntry): void {
  const result = context.store.execute(sellBackpackEntryCommand({ column: entry.column, row: entry.row }));
  if (!result.accepted) context.notify(result.rejectionReason ?? 'Could not sell.');
}

export function renderMerchantView(context: PanelContext, goBack: () => void): HTMLElement {
  const entries = context.store.getState().backpack;
  const sortedEntries = [...entries].sort((first, second) => Number(first.content.kind === 'material') - Number(second.content.kind === 'material'));
  const rows = sortedEntries.map((entry) => {
    const { label, valueCopper } = describeEntry(entry);
    return element('div', 'card-row merchant-row', label, createMoneyDisplay(valueCopper), actionButton('Sell', () => sell(context, entry), { className: 'action-button small-button' }));
  });
  const sellAllButton = actionButton(
    'Sell all materials',
    () => {
      const result = context.store.execute(sellAllMaterialsCommand());
      if (!result.accepted) context.notify(result.rejectionReason ?? 'Could not sell.');
    },
    { disabled: !entries.some((entry) => entry.content.kind === 'material') },
  );
  return element(
    'div',
    'panel-body',
    element('p', 'hint', 'The merchant buys everything in your backpack. Keep materials you want to craft with.'),
    sellAllButton,
    ...(rows.length > 0 ? rows : [element('p', 'hint', 'Your backpack is empty.')]),
    actionButton('Back to town square', goBack),
  );
}
