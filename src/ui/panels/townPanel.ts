import { requireById } from '../../content/lookup';
import { TOWNS } from '../../content/towns';
import { actionButton, element } from '../dom';
import type { PanelContext, PanelRenderer } from './panelContext';
import { renderMerchantView } from './town/merchantView';
import { renderTavernView } from './town/tavernView';
import { renderWorkshopView } from './town/workshopView';

type TownLocation = 'square' | 'tavern' | 'workshop' | 'merchant';

let currentLocation: TownLocation = 'square';

function goTo(context: PanelContext, location: TownLocation): void {
  currentLocation = location;
  context.requestRender();
}

function renderBuilding(context: PanelContext, location: TownLocation, title: string, description: string): HTMLElement {
  return element(
    'div',
    'card',
    element('div', 'card-title', title),
    element('div', 'card-text', description),
    actionButton('Enter', () => goTo(context, location)),
  );
}

function renderSquare(context: PanelContext): HTMLElement {
  const town = requireById(TOWNS, context.store.getState().townId);
  return element(
    'div',
    'panel-body',
    element('p', 'hint', `${town.name} — ${town.region} (levels ${town.firstLevel}–${town.lastLevel})`),
    element(
      'div',
      'card-grid',
      renderBuilding(context, 'tavern', 'Tavern', 'Hire heroes.'),
      renderBuilding(context, 'workshop', 'Workshop', 'Craft weapons, armour and jewellery.'),
      renderBuilding(context, 'merchant', 'Merchant', 'Sell items and materials for gold.'),
    ),
    element('p', 'hint', 'Open the Dungeons menu in the bottom bar to fight monsters.'),
  );
}

export const renderTownPanel: PanelRenderer = (context) => {
  const goBack = (): void => goTo(context, 'square');
  switch (currentLocation) {
    case 'tavern':
      return renderTavernView(context, goBack);
    case 'workshop':
      return renderWorkshopView(context, goBack);
    case 'merchant':
      return renderMerchantView(context, goBack);
    default:
      return renderSquare(context);
  }
};
