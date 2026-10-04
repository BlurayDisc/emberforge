import { NORMAL_SPELL_SLOT_COUNT } from '../../../content/balance/spells';
import { findSpell } from '../../../content/spells';
import { equipSpellCommand, unequipSpellCommand } from '../../../game';
import type { Hero } from '../../../model/hero';
import type { SpellDefinition } from '../../../model/spell';
import { actionButton, element } from '../../dom';
import { describeRejection, t } from '../../i18n';
import { openModal, type ModalHandle } from '../../modal';
import { createSpellIcon } from '../../spellIconArt';
import { describeSpell, describeSpellCosts, spellName } from '../../spellText';
import type { PanelContext } from '../panelContext';

// A null slot index stands for the ultimate slot.
type SlotIndex = number | null;

function learnedSpellsFor(hero: Hero, slotIndex: SlotIndex): SpellDefinition[] {
  return hero.learnedSpellIds
    .flatMap((id) => findSpell(id) ?? [])
    .filter((spell) => spell.isUltimate === (slotIndex === null))
    .sort((first, second) => first.unlockLevel - second.unlockLevel);
}

function equipInSlot(context: PanelContext, hero: Hero, spell: SpellDefinition, slotIndex: SlotIndex, modal: ModalHandle): void {
  const result = context.store.execute(equipSpellCommand(hero.id, spell.id, slotIndex ?? 0));
  if (result.accepted) modal.close();
  else context.notify(describeRejection(result.rejection));
}

function openSpellChooser(context: PanelContext, hero: Hero, slotIndex: SlotIndex, currentSpellId: string | null): void {
  const content = element('div', 'spell-chooser');
  const modal = openModal(slotIndex === null ? t('spells.chooseUltimate') : t('spells.chooseSpell', { slot: slotIndex + 1 }), content);
  const candidates = learnedSpellsFor(hero, slotIndex);
  if (candidates.length === 0) content.append(element('p', 'hint', t('spells.noneLearned')));
  for (const spell of candidates) {
    const isCurrent = spell.id === currentSpellId;
    content.append(
      element(
        'div',
        `chooser-row spell-choice${isCurrent ? ' selected' : ''}`,
        createSpellIcon(spell.id, 3),
        element('div', 'spell-choice-text', element('div', 'card-title', spellName(spell.id)), element('div', 'card-text small', describeSpell(spell)), element('div', 'card-text small', describeSpellCosts(spell))),
        actionButton(t('spells.equip'), () => equipInSlot(context, hero, spell, slotIndex, modal), { disabled: isCurrent }),
      ),
    );
  }
  if (currentSpellId !== null) {
    content.append(actionButton(t('spells.remove'), () => {
      const result = context.store.execute(unequipSpellCommand(hero.id, currentSpellId));
      if (result.accepted) modal.close();
      else context.notify(describeRejection(result.rejection));
    }));
  }
}

function renderSlot(context: PanelContext, hero: Hero, slotIndex: SlotIndex): HTMLElement {
  const spellId = slotIndex === null ? hero.equippedUltimateId : (hero.equippedSpellIds[slotIndex] ?? null);
  const spell = spellId === null ? undefined : findSpell(spellId);
  const label = slotIndex === null ? t('spells.ultimateSlot') : t('spells.slot', { slot: slotIndex + 1 });
  const box = element(
    'button',
    `spell-slot${slotIndex === null ? ' ultimate' : ''}${spell ? ' filled' : ''}`,
    element('span', 'spell-slot-label', label),
    spell ? createSpellIcon(spell.id, 3) : element('span', 'spell-slot-icon-empty', ''),
    spell ? element('span', 'spell-slot-name', spellName(spell.id)) : element('span', 'spell-slot-empty', t('spells.empty')),
    spell ? element('span', 'card-text small', describeSpellCosts(spell)) : '',
  );
  box.type = 'button';
  box.addEventListener('click', () => openSpellChooser(context, hero, slotIndex, spellId));
  return box;
}

export function renderSpellsScreen(context: PanelContext, hero: Hero): HTMLElement {
  const normalSlots = Array.from({ length: NORMAL_SPELL_SLOT_COUNT }, (_, index) => renderSlot(context, hero, index));
  return element(
    'div',
    'hero-detail',
    element('div', 'section-title', t('spells.title')),
    element('p', 'hint', t('spells.hint')),
    element('div', 'spell-slots', ...normalSlots, renderSlot(context, hero, null)),
    element('p', 'hint', t('spells.learnedCount', { count: hero.learnedSpellIds.length })),
  );
}
