import { LANGUAGES } from '../../content/translations';
import { actionButton, element } from '../dom';
import { currentLanguageId, setLanguage, t } from '../i18n';
import type { PanelContext, PanelRenderer } from './panelContext';

let isResetArmed = false;

function renderLanguageChoice(): HTMLElement {
  const buttons = LANGUAGES.map((language) => {
    const button = actionButton(language.nativeName, () => setLanguage(language.id));
    button.classList.toggle('active', currentLanguageId() === language.id);
    return button;
  });
  return element('div', 'card', element('div', 'card-title', t('settings.language')), element('div', 'tab-row', ...buttons));
}

function renderResetButton(context: PanelContext): HTMLElement {
  if (isResetArmed) {
    return actionButton(
      t('settings.confirmNewGame'),
      () => {
        isResetArmed = false;
        context.store.startNewGame();
        context.notify(t('settings.newGameStarted'));
      },
      { className: 'action-button danger' },
    );
  }
  return actionButton(t('settings.newGame'), () => {
    isResetArmed = true;
    context.requestRender();
  });
}

export const renderSettingsPanel: PanelRenderer = (context) =>
  element('div', 'panel-body', renderLanguageChoice(), element('p', 'hint', t('settings.autosave')), renderResetButton(context));
