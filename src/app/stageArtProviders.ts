import { drawBattleBackdrop } from '../render/battleBackdrops';
import { CREATURE_DRAWERS } from '../render/creatureArt';
import { FIGURE_DRAWERS } from '../render/castleFigureArt';
import { registerArtProviders } from '../ui/artProviders';

export function registerStageArtProviders(): void {
  registerArtProviders({ dungeonBackdrop: drawBattleBackdrop, monsterSprite: (spriteKey) => CREATURE_DRAWERS[spriteKey]?.() ?? null, castleFigure: (look) => FIGURE_DRAWERS[look]?.() ?? null });
}

export const CASTLE_FIGURE_LOOKS: readonly string[] = Object.keys(FIGURE_DRAWERS);
