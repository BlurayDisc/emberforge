import { LANGUAGES } from '../../content/translations';
import { actionButton, element } from '../dom';
import { currentLanguageId, setLanguage } from '../i18n';
import { openModal } from '../modal';
import { drawingToImage } from '../pixelDraw';
import { drawColdForge } from './sceneColdForge';

// The first screen of a fresh game. The names are in their own language, so no translation key is needed.
// Closing the window keeps the current language.
export function openLanguageChoice(onChosen: () => void): void {
  const content = element('div', 'panel-body');
  const modal = openModal('Emberforge', content, onChosen);
  const buttons = LANGUAGES.map((language) => {
    const button = actionButton(language.nativeName, () => {
      setLanguage(language.id);
      modal.close();
    }, { className: 'action-button language-choice-button' });
    button.classList.toggle('active', currentLanguageId() === language.id);
    return button;
  });
  content.append(element('div', 'story-picture-frame', drawingToImage(drawColdForge(), 1, 'pixel-icon story-picture')), element('div', 'language-choice', ...buttons));
}
