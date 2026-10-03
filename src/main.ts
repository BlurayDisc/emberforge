import '@fontsource/jacquard-12/latin-400.css';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/fusion-pixel-12px-proportional-sc/latin-400.css';
import './ui/styles/theme.css';
import './ui/styles/components.css';
import './ui/styles/stage.css';
import './ui/styles/panels.css';
import { mountApp } from './app/mountApp';
import { createBrowserSaveStorage, createGameStore } from './game';
import { initializeLanguage } from './ui/i18n';

const gameRoot = document.getElementById('game-root');
if (!gameRoot) throw new Error('Missing #game-root element');

initializeLanguage();
mountApp(gameRoot, createGameStore(createBrowserSaveStorage()));
