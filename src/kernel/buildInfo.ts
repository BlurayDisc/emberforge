// Vite replaces __BUILD_LABEL__ at build time (see vite.config.ts). Tools run without Vite, so they get "dev".
declare const __BUILD_LABEL__: string | undefined;

export const BUILD_LABEL: string = typeof __BUILD_LABEL__ === 'string' ? __BUILD_LABEL__ : 'dev';
