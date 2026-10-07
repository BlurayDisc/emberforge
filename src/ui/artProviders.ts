// The ui layer may not import render. The app layer registers the big pixel pictures here.
// Each call must return a new canvas, because one canvas cannot sit in two places in the page.
export interface ArtProviders {
  dungeonBackdrop(dungeonId: string): HTMLCanvasElement;
  monsterSprite(spriteKey: string): HTMLCanvasElement | null;
  castleFigure(look: string): HTMLCanvasElement | null;
}

let providers: ArtProviders | null = null;

// Drawing a backdrop or a monster pixel by pixel takes time. Each picture is drawn once. The caller gets a copy, so the picture can sit in many places.
const drawnCanvases = new Map<string, HTMLCanvasElement>();

function copyOfCachedCanvas(key: string, draw: () => HTMLCanvasElement | null): HTMLCanvasElement | null {
  let source = drawnCanvases.get(key);
  if (!source) {
    const drawn = draw();
    if (!drawn) return null;
    source = drawn;
    drawnCanvases.set(key, source);
  }
  const copy = document.createElement('canvas');
  copy.width = source.width;
  copy.height = source.height;
  copy.className = source.className;
  copy.getContext('2d')?.drawImage(source, 0, 0);
  return copy;
}

export function releaseDrawnArt(): void {
  drawnCanvases.clear();
}

export function registerArtProviders(registered: ArtProviders): void {
  providers = registered;
}

export function dungeonBackdropCanvas(dungeonId: string): HTMLCanvasElement | null {
  return copyOfCachedCanvas(`backdrop:${dungeonId}`, () => providers?.dungeonBackdrop(dungeonId) ?? null);
}

export function monsterSpriteCanvas(spriteKey: string): HTMLCanvasElement | null {
  return copyOfCachedCanvas(`monster:${spriteKey}`, () => providers?.monsterSprite(spriteKey) ?? null);
}

export function castleFigureCanvas(look: string): HTMLCanvasElement | null {
  return copyOfCachedCanvas(`figure:${look}`, () => providers?.castleFigure(look) ?? null);
}
