import { LANGUAGES } from '../../content/translations';
import { actionButton, element } from '../dom';
import { currentLanguageId, setLanguage } from '../i18n';
import { openModal } from '../modal';
import { drawingToImage } from '../pixelDraw';
import { drawColdForge } from './sceneColdForge';

// The first screen of a fresh game. The names are in their own language, so no translation key is needed.
// The player must press a language button, so a stray click or Escape cannot skip the choice.
export function openLanguageChoice(onChosen: () => void): void {
  const content = element('div', 'panel-body');
  const modal = openModal('Emberforge', content, onChosen, undefined, true);
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
