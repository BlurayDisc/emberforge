import { LEVEL_CAP } from '../../../content/balance/progression';
import { learnSpellCommand, listSpellOffers, type SpellOffer } from '../../../game';
import type { Hero } from '../../../model/hero';
import { actionButton, element } from '../../dom';
import { className, heroDisplayName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import { createPortrait } from '../../portraitArt';
import { createSpellIcon } from '../../spellIconArt';
import { describeSpell, describeSpellCosts, spellName } from '../../spellText';
import type { PanelContext, PanelRenderer } from '../panelContext';

let selectedHeroId: string | null = null;

function learn(context: PanelContext, hero: Hero, offer: SpellOffer): void {
  const result = context.store.execute(learnSpellCommand(hero.id, offer.spell.id));
  context.notify(result.accepted ? t('academy.learned', { hero: heroDisplayName(hero.name), spell: spellName(offer.spell.id) }) : describeRejection(result.rejection));
}

function renderStatusLine(offer: SpellOffer): HTMLElement {
  if (offer.isLearned) return element('div', 'card-text small spell-learned', offer.isEquipped ? t('academy.learnedEquipped') : t('academy.learnedKnown'));
  if (offer.problem) return element('div', 'card-text small danger-text', t(offer.problem.key, offer.problem.params));
  return element('div', 'card-text small', '');
}

function renderOffer(context: PanelContext, hero: Hero, offer: SpellOffer): HTMLElement {
  const { spell } = offer;
  const canLearn = !offer.isLearned && offer.problem === null && offer.isAffordable;
  return createListRow({
    art: element('div', 'spell-art', createSpellIcon(spell.id, 3), element('div', `spell-badge${spell.isUltimate ? ' ultimate' : ''}`, t('spell.levelBadge', { level: spell.unlockLevel }))),
    title: spell.isUltimate ? `${spellName(spell.id)} (${t('spell.ultimate')})` : spellName(spell.id),
    lines: [
      element('div', 'card-text small', describeSpell(spell)),
      element('div', 'card-text small', describeSpellCosts(spell)),
      renderStatusLine(offer),
    ],
    actions: offer.isLearned ? [] : [createMoneyDisplay(offer.costCopper), actionButton(t('academy.learn'), () => learn(context, hero, offer), { disabled: !canLearn })],
  });
}

function renderHeroChoice(context: PanelContext, heroes: readonly Hero[], selected: Hero): HTMLElement {
  return element(
    'div',
    'tab-row',
    ...heroes.map((hero) => {
      const button = actionButton(`${heroDisplayName(hero.name)} (${t('academy.heroLevel', { level: hero.level })})`, () => {
        selectedHeroId = hero.id;
        context.requestRender();
      });
      button.classList.toggle('active', hero.id === selected.id);
      return button;
    }),
  );
}

export const renderAcademyPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  const selectedHero = state.company.find((hero) => hero.id === selectedHeroId) ?? state.company[0];
  if (!selectedHero) {
    body.append(element('p', 'hint', t('academy.noHeroes')), actionButton(t('academy.leave'), context.closePanel));
    return body;
  }
  selectedHeroId = selectedHero.id;
  // A spell above the level cap can never be learned, so the Academy does not list it or count it.
  const offers = listSpellOffers(state, selectedHero.id).filter((offer) => offer.spell.unlockLevel <= LEVEL_CAP);
  const learnedCount = offers.filter((offer) => offer.isLearned).length;
  // A spell above the hero's level stays hidden. A note tells when the next one appears.
  const nextHiddenLevel = offers.filter((offer) => !offer.isInReach).reduce((lowest, offer) => Math.min(lowest, offer.spell.unlockLevel), Infinity);
  body.append(
    element('p', 'hint', t('academy.intro')),
    renderHeroChoice(context, state.company, selectedHero),
    element(
      'div',
      'trainer-header',
      createPortrait(selectedHero.classId, className(selectedHero.classId), 3),
      element(
        'div',
        'trainer-text',
        element('div', 'section-title', t('academy.trainer', { className: className(selectedHero.classId) })),
        element('div', 'card-text small', t('academy.learnedCount', { count: learnedCount, total: offers.length })),
      ),
    ),
    createList(...offers.filter((offer) => offer.isInReach).map((offer) => renderOffer(context, selectedHero, offer))),
    nextHiddenLevel === Infinity ? element('span', '') : element('p', 'hint', t('academy.nextSpellAt', { level: nextHiddenLevel })),
    actionButton(t('academy.leave'), context.closePanel),
  );
  return body;
};
