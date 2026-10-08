import { MATERIALS } from '../../../content/materials';
import { requireById } from '../../../content/lookup';
import { cancelSaleCommand, sellBackpackEntryCommand } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { actionButton } from '../../dom';
import { itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createMoneyDisplay } from '../../moneyDisplay';
import { openItemView, openMaterialView } from '../../itemModals';
import type { PanelContext } from '../panelContext';
import { openEquipHeroChoice } from './equipHeroChoice';

export function saleValueOf(entry: BackpackEntry): number {
  if (entry.content.kind === 'item') return entry.content.item.sellValueCopper;
  return requireById(MATERIALS, entry.content.materialId).sellValueCopper * entry.content.quantity;
}

export interface BackpackEntryActionOptions {
  onEquipOnHero?: (heroId: string) => void;
  // Runs after View, Equip or Sell was pressed. The popup uses it to close itself.
  afterAction?: () => void;
}

// The buttons for one backpack entry: view it, equip it (items, when the caller allows), or sell it.
export function createBackpackEntryActions(context: PanelContext, entry: BackpackEntry, options: BackpackEntryActionOptions = {}): HTMLButtonElement[] {
  const { onEquipOnHero, afterAction } = options;
  const { content } = entry;
  const viewButton = actionButton(t('slot.menuView'), () => {
    afterAction?.();
    if (content.kind === 'item') openItemView(content.item);
    else openMaterialView(content.materialId);
  });
  if (entry.saleJobId !== undefined) {
    const saleJobId = entry.saleJobId;
    return [viewButton, actionButton(t('merchant.cancelSale'), () => {
      const result = context.store.execute(cancelSaleCommand(saleJobId));
      if (!result.accepted) context.notify(describeRejection(result.rejection));
      afterAction?.();
    })];
  }
  return [
    viewButton,
    ...(content.kind === 'item' && onEquipOnHero ? [actionButton(t('slot.menuEquip'), () => {
      afterAction?.();
      openEquipHeroChoice(context, content.item, onEquipOnHero);
    }, { className: 'action-button primary' })] : []),
    createSellButton(context, entry, afterAction),
  ];
}

function createSellButton(context: PanelContext, entry: BackpackEntry, afterAction?: () => void): HTMLButtonElement {
  const sellButton = actionButton(t('merchant.sell'), () => {
    const result = context.store.execute(sellBackpackEntryCommand({ column: entry.column, row: entry.row }, Date.now()));
    if (!result.accepted) context.notify(describeRejection(result.rejection));
    afterAction?.();
  }, { className: 'action-button primary sell-button' });
  sellButton.append(createMoneyDisplay(saleValueOf(entry)));
  return sellButton;
}

export function backpackEntryTitle(entry: BackpackEntry): string {
  return entry.content.kind === 'item' ? itemDisplayName(entry.content.item) : materialName(entry.content.materialId);
}
