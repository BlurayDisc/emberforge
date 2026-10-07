import { listEquipOptions } from '../../../game';
import type { Item } from '../../../model/item';
import { element } from '../../dom';
import { heroDisplayName } from '../../displayNames';
import { t } from '../../i18n';
import { openModal } from '../../modal';
import { equipIntoEmptySlot, renderEquipComparison } from '../heroes/equipComparison';
import type { PanelContext } from '../panelContext';

export function openEquipPreview(context: PanelContext, heroId: string, item: Item, onEquipped?: () => void): void {
  const hero = context.store.getState().company.find((candidate) => candidate.id === heroId);
  if (!hero) return;
  const problem = listEquipOptions(context.store.getState(), item).find((option) => option.heroId === heroId)?.problem ?? null;
  if (equipIntoEmptySlot(context, hero, undefined, item, problem)) {
    onEquipped?.();
    return;
  }
  const area = element('div', 'chooser-compare');
  const modal = openModal(t('equip.previewTitle', { hero: heroDisplayName(hero.name) }), area);
  renderEquipComparison(context, hero, undefined, item, problem, area, () => {
    modal.close();
    onEquipped?.();
  }, () => modal.close());
}
