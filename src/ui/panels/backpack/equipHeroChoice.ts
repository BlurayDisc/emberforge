import { listEquipOptions } from '../../../game';
import type { Item } from '../../../model/item';
import { actionButton, element } from '../../dom';
import { heroDisplayName, itemDisplayName } from '../../displayNames';
import { t } from '../../i18n';
import { openModal } from '../../modal';
import type { PanelContext } from '../panelContext';

// The player picks which hero gets the item. A hero that cannot use it shows the reason and stays disabled.
export function openEquipHeroChoice(context: PanelContext, item: Item, onHeroChosen: (heroId: string) => void): void {
  let closeChoice = (): void => undefined;
  const buttons = listEquipOptions(context.store.getState(), item).map((option) => {
    const heroName = heroDisplayName(option.heroName);
    const label = option.problem === null
      ? t('inventory.equipOn', { hero: heroName })
      : t('inventory.equipOnProblem', { hero: heroName, problem: t(option.problem.key, option.problem.params) });
    return actionButton(label, () => {
      closeChoice();
      onHeroChosen(option.heroId);
    }, { disabled: option.problem !== null });
  });
  const choice = element('div', 'slot-menu', ...(buttons.length > 0 ? buttons : [element('p', 'hint', t('inventory.noHeroes'))]));
  closeChoice = openModal(t('inventory.equipWho', { item: itemDisplayName(item) }), choice).close;
}
