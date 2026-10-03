import { TOWNS } from '../../content/towns';
import { element } from '../dom';
import { t } from '../i18n';
import type { PanelRenderer } from './panelContext';

export const renderWorldPanel: PanelRenderer = (context) => {
  const currentTownId = context.store.getState().townId;
  const cards = TOWNS.map((town) => {
    const isCurrent = town.id === currentTownId;
    return element(
      'div',
      isCurrent ? 'card in-party' : 'card disabled',
      element('div', 'card-title', t('world.levels', { name: t(`town.${town.id}`), first: town.firstLevel, last: town.lastLevel })),
      element('div', 'card-text', t(`town.${town.id}.region`)),
      element('div', 'card-text small', isCurrent ? t('world.here') : t('world.locked')),
    );
  });
  return element('div', 'panel-body', element('p', 'hint', t('world.hint')), element('div', 'card-grid', ...cards));
};
