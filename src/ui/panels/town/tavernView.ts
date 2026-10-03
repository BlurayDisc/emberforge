import { MAXIMUM_COMPANY_SIZE } from '../../../content/balance/economy';
import { hireHeroCommand, listTavernOffers, type TavernOffer } from '../../../game';
import type { ClassId } from '../../../model/hero';
import { actionButton, element } from '../../dom';
import { className } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createMoneyDisplay } from '../../moneyDisplay';
import type { PanelContext, PanelRenderer } from '../panelContext';

function hire(context: PanelContext, classId: ClassId): void {
  const result = context.store.execute(hireHeroCommand(classId));
  context.notify(result.accepted ? t('tavern.hired') : describeRejection(result.rejection));
}

function renderOffer(context: PanelContext, offer: TavernOffer): HTMLElement {
  const price = offer.cost === 0 ? element('span', 'money-free', t('tavern.free')) : createMoneyDisplay(offer.cost);
  return element(
    'div',
    'card',
    element('div', 'card-title', className(offer.classId)),
    element('div', 'card-text', t(`class.${offer.classId}.role`)),
    element('div', 'card-row', price, actionButton(t('tavern.hire'), () => hire(context, offer.classId), { disabled: !offer.isAffordable })),
  );
}

export const renderTavernPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const offers = listTavernOffers(state);
  const content = element('div', 'panel-body');
  if (state.company.length === 0) content.append(element('p', 'hint welcome', t('tavern.welcome')));
  content.append(element('p', 'hint', t('tavern.company', { count: state.company.length, max: MAXIMUM_COMPANY_SIZE })));
  if (offers.length === 0) content.append(element('p', 'hint', t('tavern.full')));
  content.append(element('div', 'card-grid', ...offers.map((offer) => renderOffer(context, offer))));
  content.append(actionButton(t('tavern.leave'), context.closePanel));
  return content;
};
