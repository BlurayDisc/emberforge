// The ui layer may not import render. The app layer registers the big pixel pictures here.
// Each call must return a new canvas, because one canvas cannot sit in two places in the page.
export interface ArtProviders {
  dungeonBackdrop(dungeonId: string): HTMLCanvasElement;
  monsterSprite(spriteKey: string): HTMLCanvasElement | null;
}

let providers: ArtProviders | null = null;

export function registerArtProviders(registered: ArtProviders): void {
  providers = registered;
}

export function dungeonBackdropCanvas(dungeonId: string): HTMLCanvasElement | null {
  return providers?.dungeonBackdrop(dungeonId) ?? null;
}

export function monsterSpriteCanvas(spriteKey: string): HTMLCanvasElement | null {
  return providers?.monsterSprite(spriteKey) ?? null;
}
