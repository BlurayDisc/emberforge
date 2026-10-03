import type { ClassId } from '../model/hero';
import { element } from './dom';
import { className } from './displayNames';
import { t } from './i18n';

// Shows who can use an item, so the player does not craft gear that no hero can wear.
export function createClassTags(classIds: readonly ClassId[]): HTMLElement {
  return element('div', 'class-tags', element('span', 'card-text small', t('workshop.usableBy')), ...classIds.map((classId) => element('span', `class-tag class-tag-${classId}`, className(classId))));
}
