// Vite replaces these two at build time (see vite.config.ts). Tools run without Vite, so they get "dev".
declare const __BUILD_LABEL__: string | undefined;
declare const __APP_VERSION__: string | undefined;

export const BUILD_LABEL: string = typeof __BUILD_LABEL__ === 'string' ? __BUILD_LABEL__ : 'dev';
// The package version without the build number. The changelog notice is silent once the player has seen this version's notice.
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';
