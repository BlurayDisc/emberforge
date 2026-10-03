import { TOWNS } from '../../content/towns';
import { element } from '../dom';
import { t } from '../i18n';
import { createTownIcon } from '../iconArt';
import { createList, createListRow } from '../listRow';
import type { PanelRenderer } from './panelContext';

export const renderWorldPanel: PanelRenderer = (context) => {
  const currentTownId = context.store.getState().townId;
  const rows = TOWNS.map((town) => {
    const isCurrent = town.id === currentTownId;
    return createListRow({
      art: createTownIcon(3),
      title: t('world.levels', { name: t(`town.${town.id}`), first: town.firstLevel, last: town.lastLevel }),
      lines: [element('div', 'card-text', t(`town.${town.id}.region`)), element('div', 'card-text small', isCurrent ? t('world.here') : t('world.locked'))],
      className: isCurrent ? 'current' : 'disabled',
    });
  });
  return element('div', 'panel-body', element('p', 'hint', t('world.hint')), createList(...rows));
};
