import { TOWNS } from '../../content/towns';
import { element } from '../dom';
import type { PanelRenderer } from './panelContext';

export const renderWorldPanel: PanelRenderer = (context) => {
  const currentTownId = context.store.getState().townId;
  const cards = TOWNS.map((town) => {
    const isCurrent = town.id === currentTownId;
    const status = isCurrent ? 'You are here' : 'Locked. Defeat the boss of the previous town.';
    return element(
      'div',
      isCurrent ? 'card in-party' : 'card disabled',
      element('div', 'card-title', `${town.name} — Lv ${town.firstLevel}–${town.lastLevel}`),
      element('div', 'card-text', town.region),
      element('div', 'card-text small', status),
    );
  });
  return element(
    'div',
    'panel-body',
    element('p', 'hint', 'Travel between towns will come in a later version.'),
    element('div', 'card-grid', ...cards),
  );
};
