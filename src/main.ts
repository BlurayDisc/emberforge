import '@fontsource/jacquard-12/latin-400.css';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import './ui/styles/theme.css';
import './ui/styles/components.css';
import './ui/styles/stage.css';
import './ui/styles/panels.css';
import { mountApp } from './app/mountApp';
import { createBrowserSaveStorage, createGameStore } from './game';

const gameRoot = document.getElementById('game-root');
if (!gameRoot) throw new Error('Missing #game-root element');

mountApp(gameRoot, createGameStore(createBrowserSaveStorage()));
