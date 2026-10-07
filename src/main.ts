import '@fontsource/jacquard-12/latin-400.css';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/fusion-pixel-12px-proportional-sc/latin-400.css';
import './ui/styles/theme.css';
import './ui/styles/components.css';
import './ui/styles/stage.css';
import './ui/styles/panels.css';
import './ui/styles/story.css';
import { mountApp } from './app/mountApp';
import { registerStageArtProviders } from './app/stageArtProviders';
import { preloadTownArt } from './app/townArtPreloader';
import { configureAudio } from './audio';
import { createBrowserSaveStorage, createGameStore, loadAudioPreferences } from './game';
import { initializeLanguage } from './ui/i18n';
import { createLoadingScreen } from './ui/loadingScreen';

const gameRoot = document.getElementById('game-root');
if (!gameRoot) throw new Error('Missing #game-root element');

initializeLanguage();
configureAudio(loadAudioPreferences());
const store = createGameStore(createBrowserSaveStorage());
const loadingScreen = createLoadingScreen();
gameRoot.replaceChildren(loadingScreen.element);
registerStageArtProviders();
preloadTownArt(store, store.getState().townId, loadingScreen.showProgress).then(() => mountApp(gameRoot, store));
