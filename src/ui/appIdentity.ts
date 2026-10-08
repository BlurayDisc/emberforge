import { BUILD_LABEL } from '../kernel/buildInfo';
import { onLanguageChange, t } from './i18n';

const THEME_COLOR = '#14111f';
const BACKGROUND_COLOR = '#241912';

let manifestObjectUrl: string | null = null;

// A manifest has one name, so the name in the player's language needs its own manifest.
// The page builds it as a blob. Its URLs must be absolute, because a blob has no base path to resolve them against.
function buildLocalizedManifest(): string {
  const base = new URL('./', document.baseURI).href;
  const manifest = {
    name: t('app.name'),
    short_name: t('app.name'),
    description: t('app.description'),
    lang: document.documentElement.lang,
    start_url: base,
    scope: base,
    display: 'standalone',
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  return URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
}

function applyAppIdentity(): void {
  document.title = `${t('app.name')} ${BUILD_LABEL}`;
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', t('app.name'));
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) return;
  const previousObjectUrl = manifestObjectUrl;
  manifestObjectUrl = buildLocalizedManifest();
  manifestLink.setAttribute('href', manifestObjectUrl);
  if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
}

// The tab title, the home-screen name and the installed app name follow the game language. An app that is already installed keeps its name until it is installed again.
export function startAppIdentity(): void {
  applyAppIdentity();
  onLanguageChange(applyAppIdentity);
}
