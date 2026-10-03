import { TOWNS } from '../../content/towns';
import { requireById } from '../../content/lookup';
import { MAXIMUM_COMPANY_SIZE } from '../../content/balance/economy';
import { hireHeroCommand, listTavernOffers, type TavernOffer } from '../../game';
import type { ClassId } from '../../model/hero';
import { actionButton, element } from '../dom';
import { createMoneyDisplay } from '../moneyDisplay';
import type { PanelContext, PanelRenderer } from './panelContext';

type TownLocation = 'square' | 'tavern';

let currentLocation: TownLocation = 'square';

function goTo(context: PanelContext, location: TownLocation): void {
  currentLocation = location;
  context.requestRender();
}

function hire(context: PanelContext, classId: ClassId): void {
  const result = context.store.execute(hireHeroCommand(classId));
  context.notify(result.accepted ? 'A new hero joins your company.' : (result.rejectionReason ?? 'Hiring failed.'));
}

function renderOffer(context: PanelContext, offer: TavernOffer): HTMLElement {
  const price = offer.cost === 0 ? element('span', 'money-free', 'Free') : createMoneyDisplay(offer.cost);
  return element(
    'div',
    'card',
    element('div', 'card-title', offer.className),
    element('div', 'card-text', offer.roleDescription),
    element('div', 'card-row', price, actionButton('Hire', () => hire(context, offer.classId), { disabled: !offer.isAffordable })),
  );
}

function renderTavern(context: PanelContext): HTMLElement {
  const state = context.store.getState();
  const offers = listTavernOffers(state);
  const companyLine = `Company: ${state.company.length} / ${MAXIMUM_COMPANY_SIZE} heroes`;
  const content = element('div', 'panel-body', element('p', 'hint', companyLine));
  if (state.company.length === 0) content.append(element('p', 'hint', 'Your first hero is free.'));
  if (offers.length === 0) content.append(element('p', 'hint', 'The company is full.'));
  content.append(element('div', 'card-grid', ...offers.map((offer) => renderOffer(context, offer))));
  content.append(actionButton('Back to town square', () => goTo(context, 'square')));
  return content;
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
      element('div', 'card', element('div', 'card-title', 'Tavern'), element('div', 'card-text', 'Hire heroes.'), actionButton('Enter', () => goTo(context, 'tavern'))),
      element('div', 'card disabled', element('div', 'card-title', 'Workshop'), element('div', 'card-text', 'Craft gear. Coming soon.')),
      element('div', 'card disabled', element('div', 'card-title', 'Merchant'), element('div', 'card-text', 'Sell loot. Coming soon.')),
    ),
    element('p', 'hint', 'Open the Dungeons menu in the bottom bar to fight monsters.'),
  );
}

export const renderTownPanel: PanelRenderer = (context) =>
  currentLocation === 'tavern' ? renderTavern(context) : renderSquare(context);
