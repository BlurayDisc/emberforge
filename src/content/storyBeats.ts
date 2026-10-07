import storyBeatsData from '../../data/story-beats.json';

export interface StoryBeatPage {
  // Id of the picture in `ui/story/storyScenes.ts`.
  scene: string;
  // An ember page is the voice of Elowen in the dwarf hearth.
  voice?: 'ember';
}

export type StoryBeatTrigger = { kind: 'firstClear'; dungeonId: string } | { kind: 'firstHeroHired' } | { kind: 'secondHeroHired' };

export interface StoryBeat {
  id: string;
  chapter: number;
  trigger: StoryBeatTrigger;
  pages: readonly StoryBeatPage[];
}

export const STORY_BEATS = storyBeatsData.beats as unknown as readonly StoryBeat[];

export function storyBeatForFirstClear(dungeonId: string): StoryBeat | null {
  return STORY_BEATS.find((beat) => beat.trigger.kind === 'firstClear' && beat.trigger.dungeonId === dungeonId) ?? null;
}

export function storyBeatForFirstHeroHired(): StoryBeat | null {
  return STORY_BEATS.find((beat) => beat.trigger.kind === 'firstHeroHired') ?? null;
}

export function storyBeatForSecondHeroHired(): StoryBeat | null {
  return STORY_BEATS.find((beat) => beat.trigger.kind === 'secondHeroHired') ?? null;
}
