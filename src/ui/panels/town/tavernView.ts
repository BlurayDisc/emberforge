import { MAXIMUM_COMPANY_SIZE } from '../../../content/balance/economy';
import { hireHeroCommand, listTavernOffers, type TavernOffer } from '../../../game';
import type { ClassId } from '../../../model/hero';
import { actionButton, element } from '../../dom';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext, PanelRenderer } from '../panelContext';

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

export const renderTavernPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const offers = listTavernOffers(state);
  const content = element('div', 'panel-body');
  if (state.company.length === 0) {
    content.append(element('p', 'hint welcome', 'Welcome, traveller! Choose your first hero. The first hero is free. Pick a class and press Hire.'));
  }
  content.append(element('p', 'hint', `Company: ${state.company.length} / ${MAXIMUM_COMPANY_SIZE} heroes`));
  if (offers.length === 0) content.append(element('p', 'hint', 'The company is full.'));
  content.append(element('div', 'card-grid', ...offers.map((offer) => renderOffer(context, offer))));
  content.append(actionButton('Leave the tavern', context.closePanel));
  return content;
};
