import type { DungeonDefinition } from '../../content/dungeons';
import { describeHero, runOfHero } from '../../game';
import type { Hero } from '../../model/hero';
import { actionButton, element } from '../dom';
import { className, heroDisplayName } from '../displayNames';
import { t } from '../i18n';
import { createExperienceBar, createLiveHealthBar } from '../liveBars';
import { createList, createListRow } from '../listRow';
import { openModal, type ModalHandle } from '../modal';
import { createPortrait } from '../portraitArt';
import type { PanelContext } from './panelContext';

// A boss dungeon takes a full party. The player taps heroes to select them, and Fight! starts the run.
// Only one hero must reach the dungeon level, so a weaker partner can join the fight.
export function openPartyChooser(context: PanelContext, dungeon: DungeonDefinition, startRun: (heroIds: string[], chooser: ModalHandle) => void): void {
  const selectedHeroIds: string[] = [];
  const list = element('div', 'chooser-list');
  const selectionHint = element('p', 'hint');
  const fightButton = actionButton(t('dungeons.startParty'), () => startRun([...selectedHeroIds], handle), { disabled: true });
  const handle: ModalHandle = openModal(
    t('dungeons.chooseParty', { count: dungeon.minimumPartySize, dungeon: t(`dungeon.${dungeon.id}`) }),
    element('div', 'panel-body', selectionHint, list, fightButton),
  );

  const refreshSelection = (): void => {
    selectionHint.textContent = t('dungeons.partySelected', { selected: selectedHeroIds.length, count: dungeon.minimumPartySize });
    fightButton.disabled = selectedHeroIds.length < dungeon.minimumPartySize;
    list.querySelectorAll<HTMLElement>('.hero-choice').forEach((row) => row.classList.toggle('selected', selectedHeroIds.includes(row.dataset.heroId ?? '')));
  };

  const toggleHero = (hero: Hero): void => {
    const position = selectedHeroIds.indexOf(hero.id);
    if (position >= 0) selectedHeroIds.splice(position, 1);
    else if (selectedHeroIds.length < dungeon.maxPartySize) selectedHeroIds.push(hero.id);
    refreshSelection();
  };

  const renderChoice = (hero: Hero): HTMLElement => {
    const isAway = runOfHero(context.store.getState(), hero.id) !== undefined;
    const row = createListRow({
      art: createPortrait(hero.classId, hero.name, 2),
      title: heroDisplayName(hero.name),
      lines: [
        element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })),
        isAway
          ? element('div', 'card-text small busy-note', t('heroes.awayIn', { dungeon: t(`dungeon.${runOfHero(context.store.getState(), hero.id)?.dungeonId}`) }))
          : createLiveHealthBar(context.store, hero.id),
        createExperienceBar(hero.experience, describeHero(context.store.getState(), hero, Date.now()).experienceToNextLevel),
      ],
      className: `hero-choice${isAway ? ' busy' : ''}`,
    });
    row.dataset.heroId = hero.id;
    if (!isAway) row.addEventListener('click', () => toggleHero(hero));
    return row;
  };

  list.append(createList(...context.store.getState().company.map(renderChoice)));
  refreshSelection();
}
