import { actionButton, element } from './dom';
import { t } from './i18n';
import { openModal } from './modal';

// The opening story. It shows before the first hero is hired, then calls onFinished.
export function openPrologue(onFinished: () => void): void {
  const content = element('div', 'panel-body');
  const modal = openModal(t('lore.prologue.title'), content, onFinished);
  content.append(
    ...[1, 2, 3].map((paragraph) => element('p', 'card-text lore-text', t(`lore.prologue.${paragraph}`))),
    actionButton(t('lore.begin'), () => modal.close(), { className: 'action-button primary' }),
  );
}
