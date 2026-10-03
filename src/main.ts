import './ui/base.css';
import { mountApp } from './app/mountApp';
import { createBrowserSaveStorage, createGameStore } from './game';

const gameRoot = document.getElementById('game-root');
if (!gameRoot) throw new Error('Missing #game-root element');

mountApp(gameRoot, createGameStore(createBrowserSaveStorage()));
