import { t } from '../i18n';
import { openStoryPager } from './storyPager';

const PROLOGUE_SCENE_IDS: readonly string[] = ['coldForge', 'smithShop', 'brokenTower', 'throneHall', 'roadEast'];

export function openStoryBook(onFinished: () => void): void {
  openStoryPager({
    title: t('lore.prologue.title'),
    pages: PROLOGUE_SCENE_IDS.map((sceneId, index) => ({ sceneId, text: t(`lore.prologue.${index + 1}`) })),
    canSkip: true,
    finishLabel: t('lore.begin'),
    onFinished,
  });
}
