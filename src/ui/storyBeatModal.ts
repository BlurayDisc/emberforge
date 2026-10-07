import type { StoryBeat } from '../content/storyBeats';
import { t } from './i18n';
import { openStoryPager } from './story/storyPager';

// A short story scene after a story event. Each page has its own picture.
export function openStoryBeat(beat: StoryBeat, onFinished?: () => void): void {
  openStoryPager({
    title: t('story.chapterTitle', { number: beat.chapter, name: t(`story.chapter.${beat.chapter}.name`) }),
    heading: t(`story.${beat.id}.title`),
    pages: beat.pages.map((page, index) => ({ sceneId: page.scene, text: t(`story.${beat.id}.${index + 1}`), isEmber: page.voice === 'ember' })),
    canSkip: false,
    onFinished,
  });
}
