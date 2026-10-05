import { openLanguageChoice } from './story/languageChoice';
import { openStoryBook } from './story/storyBook';

// The opening of a fresh game: the player picks a language, then reads the story in that language, then calls onFinished.
export function openPrologue(onFinished: () => void): void {
  openLanguageChoice(() => openStoryBook(onFinished));
}
