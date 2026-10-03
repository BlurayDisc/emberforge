import { BACKPACK_COLUMNS, BACKPACK_ROWS_PER_EXPANSION } from '../../../content/balance/backpack';
import { buyStorageUpgradeCommand, describeStorage, type StorageUpgradeKind } from '../../../game';
import { actionButton, element } from '../../dom';
import { describeRejection, t } from '../../i18n';
import { createItemIcon } from '../../iconArt';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext, PanelRenderer } from '../panelContext';

function buy(context: PanelContext, kind: StorageUpgradeKind): void {
  const result = context.store.execute(buyStorageUpgradeCommand(kind));
  context.notify(result.accepted ? t('bank.bought') : describeRejection(result.rejection));
}

function renderUpgradeRow(context: PanelContext, kind: StorageUpgradeKind, art: Node, title: string, usageLine: string, costCopper: number | null, upgradeLine: string): HTMLElement {
  const state = context.store.getState();
  const actions = costCopper === null
    ? [element('span', 'hint', t('bank.soldOut'))]
    : [createMoneyDisplay(costCopper), actionButton(t('bank.buy'), () => buy(context, kind), { disabled: state.copper < costCopper })];
  return createListRow({
    art,
    title,
    lines: [element('div', 'card-text small', usageLine), element('div', 'card-text small', upgradeLine)],
    actions,
  });
}

export const renderBankPanel: PanelRenderer = (context) => {
  const storage = describeStorage(context.store.getState());
  const rows = createList(
    renderUpgradeRow(
      context,
      'backpack',
      createItemIcon('quiver', 'rawhide', 'hide', 3),
      t('bank.backpack.title'),
      t('bank.backpack.usage', { used: storage.usedCells, total: storage.totalCells }),
      storage.backpackUpgradeCostCopper,
      t('bank.backpack.upgrade', { cells: BACKPACK_COLUMNS * BACKPACK_ROWS_PER_EXPANSION }),
    ),
    renderUpgradeRow(
      context,
      'merchantSlot',
      createItemIcon('belt', 'rawhide', 'hide', 3),
      t('bank.merchant.title'),
      t('bank.merchant.usage', { slots: storage.merchantSaleSlots }),
      storage.merchantSlotCostCopper,
      t('bank.merchant.upgrade'),
    ),
  );
  return element('div', 'panel-body', element('p', 'hint', t('bank.hint')), rows, actionButton(t('bank.leave'), context.closePanel));
};
