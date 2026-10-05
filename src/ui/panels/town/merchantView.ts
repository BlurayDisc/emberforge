import { listSaleJobs, merchantSaleSlotsOf } from '../../../game';
import type { GameState } from '../../../model/gameState';
import { actionButton, element } from '../../dom';
import { t } from '../../i18n';
import { createMoneyDisplay } from '../../moneyDisplay';
import { createBackpackGrid } from '../backpack/backpackGrid';
import { createMerchantSelectionBar } from '../backpack/merchantSelectionBar';
import type { PanelContext, PanelRenderer } from '../panelContext';

interface SelectedPosition {
  column: number;
  row: number;
}

let selectedPosition: SelectedPosition | null = null;

export function resetMerchantSelection(): void {
  selectedPosition = null;
}

// The goods on sale show their timer in their own backpack cell. This line has one fixed height, so a new sale moves nothing.
function renderSaleStatus(state: GameState): HTMLElement {
  const used = listSaleJobs(state).length;
  const slots = merchantSaleSlotsOf(state);
  return element('div', `section-title${used >= slots ? ' danger-text' : ''}`, t('merchant.salesInProgress', { used, slots }));
}

function renderSellSections(context: PanelContext): HTMLElement[] {
  const state = context.store.getState();
  const selected = state.backpack.find((entry) => entry.column === selectedPosition?.column && entry.row === selectedPosition?.row);
  if (!selected) selectedPosition = null;
  // The grid and the selection bar always show, even for an empty backpack, so the panel keeps its size.
  const backpackSection = [
    createBackpackGrid(context.store, {
      isSelected: (entry) => entry === selected,
      onEntryClick: (entry) => {
        selectedPosition = entry === selected ? null : { column: entry.column, row: entry.row };
        context.requestRender();
      },
    }),
    createMerchantSelectionBar(context, selected, () => {
      selectedPosition = null;
      context.requestRender();
    }),
  ];
  return [renderSaleStatus(state), ...backpackSection];
}

// The gold is an info line at the top. The buttons are the footer row: always last, and sticky, so a short desktop window never hides them.
export const renderMerchantPanel: PanelRenderer = (context) =>
  element(
    'div',
    'panel-body',
    element('div', 'merchant-gold-line', createMoneyDisplay(context.store.getState().copper)),
    ...renderSellSections(context),
    element('div', 'panel-footer', actionButton(t('merchant.upgradeShop'), () => context.openPanel('bank')), actionButton(t('merchant.leave'), context.closePanel)),
  );
