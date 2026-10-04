import { MATERIALS } from '../../../content/materials';
import { requireById } from '../../../content/lookup';
import { sellBackpackEntryCommand } from '../../../game';
import type { BackpackEntry } from '../../../model/backpack';
import { actionButton } from '../../dom';
import { itemDisplayName, materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
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
  return [
    actionButton(t('slot.menuView'), () => {
      afterAction?.();
      if (content.kind === 'item') openItemView(content.item);
      else openMaterialView(content.materialId);
    }),
    ...(content.kind === 'item' && onEquipOnHero ? [actionButton(t('slot.menuEquip'), () => {
      afterAction?.();
      openEquipHeroChoice(context, content.item, onEquipOnHero);
    }, { className: 'action-button primary' })] : []),
    actionButton(t('merchant.sell'), () => {
      const result = context.store.execute(sellBackpackEntryCommand({ column: entry.column, row: entry.row }, Date.now()));
      if (!result.accepted) context.notify(describeRejection(result.rejection));
      afterAction?.();
    }, { className: 'action-button primary' }),
  ];
}

export function backpackEntryTitle(entry: BackpackEntry): string {
  return entry.content.kind === 'item' ? itemDisplayName(entry.content.item) : materialName(entry.content.materialId);
}
