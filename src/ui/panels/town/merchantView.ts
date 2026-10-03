import { BASE_ITEMS } from '../../../content/baseItems';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { cancelSaleCommand, listSaleJobs, merchantSaleSlotsOf } from '../../../game';
import type { SaleJob } from '../../../model/timedJob';
import { createJobBar } from '../../liveBars';
import { actionButton, element } from '../../dom';
import { materialName } from '../../displayNames';
import { createItemNameElement } from '../../itemNameElement';
import { describeRejection, t } from '../../i18n';
import { createItemIcon, createMaterialIcon } from '../../iconArt';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import { openBackpackEntryMenu } from '../backpack/backpackEntryMenu';
import { createBackpackGrid } from '../backpack/backpackGrid';
import type { PanelContext, PanelRenderer } from '../panelContext';

// A material in the backpack is one unit. A sale from an old save can hold a few units.
function quantityTitle(name: string, quantity: number): string {
  return quantity === 1 ? name : `${name} x${quantity}`;
}

function renderSaleJob(context: PanelContext, job: SaleJob): HTMLElement {
  const cancelButton = actionButton(t('merchant.cancelSale'), () => {
    const result = context.store.execute(cancelSaleCommand(job.id));
    if (!result.accepted) context.notify(describeRejection(result.rejection));
  }, { className: 'action-button small-button' });
  if (job.content.kind === 'item') {
    const { item } = job.content;
    const base = requireById(BASE_ITEMS, item.baseId);
    return createListRow({
      art: createItemIcon(item.baseId, item.materialId, base.mainCategory, 3),
      title: createItemNameElement(item),
      lines: [createJobBar(job, t('job.paying'))],
      actions: [createMoneyDisplay(job.copper), cancelButton],
      className: 'fighting',
    });
  }
  const material = requireById(MATERIALS, job.content.materialId);
  return createListRow({
    art: createMaterialIcon(material.id, material.category, 3),
    title: quantityTitle(materialName(material.id), job.content.quantity),
    lines: [createJobBar(job, t('job.paying'))],
    actions: [createMoneyDisplay(job.copper), cancelButton],
    className: 'fighting',
  });
}

function renderSellTab(context: PanelContext): HTMLElement {
  const state = context.store.getState();
  const saleJobs = listSaleJobs(state);
  return element(
    'div',
    'panel-body',
    element('p', 'hint', t('merchant.hint')),
    element('div', 'section-title', t('merchant.salesInProgress', { used: saleJobs.length, slots: merchantSaleSlotsOf(state) })),
    saleJobs.length > 0 ? createList(...saleJobs.map((job) => renderSaleJob(context, job))) : element('p', 'hint', t('merchant.noSales')),
    element('div', 'section-title', t('merchant.backpackGoods')),
    state.backpack.length > 0
      ? createBackpackGrid(context.store, { onEntryClick: (entry, clickPoint) => openBackpackEntryMenu(context, entry, clickPoint) })
      : element('p', 'hint', t('merchant.empty')),
  );
}

export const renderMerchantPanel: PanelRenderer = (context) =>
  element('div', 'panel-body', renderSellTab(context), actionButton(t('merchant.leave'), context.closePanel));
