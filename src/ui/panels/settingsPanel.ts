import { currentPreferences, setPreferences } from '../../audio';
import { BUILD_LABEL } from '../../kernel/buildInfo';
import { LANGUAGES } from '../../content/translations';
import { saveAudioPreferences } from '../../game';
import type { AudioPreferences } from '../../model/audioPreferences';
import { VICTORY_DUNGEON_ID } from '../../content/balance/progression';
import { actionButton, element } from '../dom';
import { openVictoryScreen } from '../victoryScreen';
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

function updateAudio(changes: Partial<AudioPreferences>): void {
  const updated = { ...currentPreferences(), ...changes };
  setPreferences(updated);
  saveAudioPreferences(updated);
}

function createVolumeSlider(labelKey: string, value: number, onChange: (volume: number) => void): HTMLElement {
  const slider = element('input', 'volume-slider');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = String(Math.round(value * 100));
  slider.addEventListener('input', () => onChange(Number(slider.value) / 100));
  return element('label', 'card-row', element('span', 'stat-name', t(labelKey)), slider);
}

function renderSoundControls(context: PanelContext): HTMLElement {
  const preferences = currentPreferences();
  const muteButton = actionButton(preferences.muted ? t('settings.unmute') : t('settings.mute'), () => {
    updateAudio({ muted: !currentPreferences().muted });
    context.requestRender();
  });
  muteButton.classList.toggle('active', preferences.muted);
  return element(
    'div',
    'card',
    element('div', 'card-title', t('settings.sound')),
    createVolumeSlider('settings.musicVolume', preferences.musicVolume, (volume) => updateAudio({ musicVolume: volume })),
    createVolumeSlider('settings.effectsVolume', preferences.effectsVolume, (volume) => updateAudio({ effectsVolume: volume })),
    muteButton,
  );
}

function renderDangerZone(context: PanelContext): HTMLElement {
  const resetButton = isResetArmed
    ? actionButton(
        t('settings.confirmReset'),
        () => {
          isResetArmed = false;
          context.store.startNewGame();
          context.notify(t('settings.resetDone'));
        },
        { className: 'action-button danger blink' },
      )
    : actionButton(
        t('settings.resetGame'),
        () => {
          isResetArmed = true;
          context.requestRender();
        },
        { className: 'action-button danger' },
      );
  return element(
    'div',
    'danger-zone',
    element('div', 'danger-title', `! ${t('settings.dangerZone')} !`),
    element('p', 'danger-text', t('settings.resetWarning')),
    resetButton,
  );
}

function renderVersion(): HTMLElement {
  return element('div', 'card', element('div', 'card-row', element('span', 'stat-name', t('settings.version')), element('span', 'card-text small', BUILD_LABEL)));
}

// The Victory screen opens by itself once. After that, the player can watch it again here.
function renderVictoryReplay(context: PanelContext): HTMLElement | string {
  const state = context.store.getState();
  if (!state.clearedDungeonIds.includes(VICTORY_DUNGEON_ID)) return '';
  return element('div', 'card', actionButton(t('settings.watchVictory'), () => openVictoryScreen(state.company)));
}

export const renderSettingsPanel: PanelRenderer = (context) =>
  element('div', 'panel-body', renderLanguageChoice(), renderSoundControls(context), renderVictoryReplay(context), renderVersion(), element('p', 'hint', t('settings.autosave')), renderDangerZone(context));
