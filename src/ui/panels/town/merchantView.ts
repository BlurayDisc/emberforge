import { BASE_ITEMS } from '../../../content/baseItems';
import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { buyMaterialCommand, listMaterialOffers, listSaleJobs, saleDurationSeconds, sellBackpackEntryCommand } from '../../../game';
import { MERCHANT_SALE_SLOTS } from '../../../content/balance/economy';
import type { SaleJob } from '../../../model/timedJob';
import { formatDuration } from '../../liveUpdate';
import { createJobBar } from '../../liveBars';
import type { BackpackEntry } from '../../../model/backpack';
import { actionButton, element } from '../../dom';
import { itemBaseDisplayName, itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createItemIcon, createMaterialIcon } from '../../iconArt';
import { openItemView, openMaterialView } from '../../itemModals';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext, PanelRenderer } from '../panelContext';

type MerchantTab = 'sell' | 'buy';

let activeTab: MerchantTab = 'sell';

function sell(context: PanelContext, entry: BackpackEntry): void {
  const result = context.store.execute(sellBackpackEntryCommand({ column: entry.column, row: entry.row }, Date.now()));
  if (!result.accepted) context.notify(describeRejection(result.rejection));
}

function makeClickable(row: HTMLElement, open: () => void): HTMLElement {
  row.classList.add('clickable');
  row.querySelector('.row-art')?.addEventListener('click', open);
  row.querySelector('.row-body')?.addEventListener('click', open);
  return row;
}

function saleTimeLine(valueCopper: number): HTMLElement {
  return element('div', 'card-text small', t('merchant.saleTime', { time: formatDuration(saleDurationSeconds(valueCopper)) }));
}

function renderEntryRow(context: PanelContext, entry: BackpackEntry): HTMLElement {
  const sellButton = actionButton(t('merchant.sell'), () => sell(context, entry), { className: 'action-button small-button' });
  if (entry.content.kind === 'item') {
    const { item } = entry.content;
    const base = requireById(BASE_ITEMS, item.baseId);
    return makeClickable(
      createListRow({
        art: createItemIcon(item.baseId, item.materialId, base.mainCategory, 3),
        title: element('span', `quality-${item.quality}`, itemDisplayName(item)),
        lines: [element('div', 'card-text small', itemBaseDisplayName(item)), saleTimeLine(item.sellValueCopper)],
        actions: [createMoneyDisplay(item.sellValueCopper), sellButton],
      }),
      () => openItemView(item),
    );
  }
  const material = requireById(MATERIALS, entry.content.materialId);
  return makeClickable(
    createListRow({
      art: createMaterialIcon(material.id, material.category, 3),
      title: `${materialName(material.id)} x${entry.content.quantity}`,
      lines: [saleTimeLine(material.sellValueCopper * entry.content.quantity)],
      actions: [createMoneyDisplay(material.sellValueCopper * entry.content.quantity), sellButton],
    }),
    () => openMaterialView(material.id),
  );
}

function renderSaleJob(job: SaleJob): HTMLElement {
  if (job.content.kind === 'item') {
    const { item } = job.content;
    const base = requireById(BASE_ITEMS, item.baseId);
    return createListRow({
      art: createItemIcon(item.baseId, item.materialId, base.mainCategory, 3),
      title: element('span', `quality-${item.quality}`, itemDisplayName(item)),
      lines: [createJobBar(job, t('job.paying'))],
      actions: [createMoneyDisplay(job.copper)],
      className: 'fighting',
    });
  }
  const material = requireById(MATERIALS, job.content.materialId);
  return createListRow({
    art: createMaterialIcon(material.id, material.category, 3),
    title: `${materialName(material.id)} x${job.content.quantity}`,
    lines: [createJobBar(job, t('job.paying'))],
    actions: [createMoneyDisplay(job.copper)],
    className: 'fighting',
  });
}

function renderSellTab(context: PanelContext): HTMLElement {
  const state = context.store.getState();
  const saleJobs = listSaleJobs(state);
  const sortedEntries = [...state.backpack].sort((first, second) => Number(first.content.kind === 'material') - Number(second.content.kind === 'material'));
  return element(
    'div',
    'panel-body',
    element('p', 'hint', t('merchant.hint')),
    element('div', 'section-title', t('merchant.salesInProgress', { used: saleJobs.length, slots: MERCHANT_SALE_SLOTS })),
    saleJobs.length > 0 ? createList(...saleJobs.map(renderSaleJob)) : element('p', 'hint', t('merchant.noSales')),
    element('div', 'section-title', t('merchant.backpackGoods')),
    sortedEntries.length > 0 ? createList(...sortedEntries.map((entry) => renderEntryRow(context, entry))) : element('p', 'hint', t('merchant.empty')),
  );
}

function buy(context: PanelContext, materialId: string, quantity: number): void {
  const result = context.store.execute(buyMaterialCommand(materialId, quantity));
  context.notify(result.accepted ? t('merchant.bought', { name: materialName(materialId), count: quantity }) : describeRejection(result.rejection));
}

function renderBuyTab(context: PanelContext): HTMLElement {
  const rows = listMaterialOffers(context.store.getState()).map((offer) => {
    const material = requireById(MATERIALS, offer.materialId);
    return makeClickable(
      createListRow({
        art: createMaterialIcon(material.id, material.category, 3),
        title: materialName(material.id),
        lines: [element('div', 'card-row', createMoneyDisplay(offer.unitPrice), element('span', 'card-text small', t('merchant.each')))],
        actions: [
          actionButton(t('merchant.buyOne'), () => buy(context, material.id, 1), { className: 'action-button small-button' }),
          actionButton(t('merchant.buyFive'), () => buy(context, material.id, 5), { className: 'action-button small-button' }),
        ],
      }),
      () => openMaterialView(material.id),
    );
  });
  return element('div', 'panel-body', element('p', 'hint', t('merchant.buyHint')), createList(...rows));
}

export const renderMerchantPanel: PanelRenderer = (context) => {
  const tab = (id: MerchantTab, label: string): HTMLElement => {
    const button = actionButton(label, () => {
      activeTab = id;
      context.requestRender();
    });
    button.classList.toggle('active', activeTab === id);
    return button;
  };
  return element(
    'div',
    'panel-body',
    element('div', 'tab-row', tab('sell', t('merchant.tabSell')), tab('buy', t('merchant.tabBuy'))),
    activeTab === 'sell' ? renderSellTab(context) : renderBuyTab(context),
    actionButton(t('merchant.leave'), context.closePanel),
  );
};
