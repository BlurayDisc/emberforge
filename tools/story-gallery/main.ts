import '@fontsource/jacquard-12/latin-400.css';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/fusion-pixel-12px-proportional-sc/latin-400.css';
import '../../src/ui/styles/theme.css';
import '../../src/ui/styles/components.css';
import '../../src/ui/styles/stage.css';
import '../../src/ui/styles/panels.css';
import '../../src/ui/styles/story.css';
import { registerStageArtProviders } from '../../src/app/stageArtProviders';
import { CASTLE_SPOTS, castleTaleKeys } from '../../src/content/castle';
import { STORY_BEATS } from '../../src/content/storyBeats';
import { LANGUAGES, type LanguageId } from '../../src/content/translations';
import { loadAudioPreferences, loadLanguagePreference } from '../../src/game';
import { setCastleChapterOneCleared } from '../../src/ui/castleVisit';
import { openCastleStory } from '../../src/ui/castleStoryModal';
import { currentLanguageId, hasTranslation, initializeLanguage, setLanguage, t } from '../../src/ui/i18n';
import { getModalHost } from '../../src/ui/modal';
import { openStoryBook } from '../../src/ui/story/storyBook';
import { STORY_SCENES } from '../../src/ui/story/storyScenes';
import { isStoryMusicActive, onStoryMusicChange } from '../../src/ui/storyMusic';
import { drawingToImage } from '../../src/ui/pixelDraw';
import { configureAudio, playMusic } from '../../src/audio';
import { openStoryBeat } from '../../src/ui/storyBeatModal';

interface StoryEntry {
  groupTitle: string;
  title: () => string;
  paragraphs: () => Array<{ text: string; isEmber: boolean; sceneId?: string }>;
  openInGame: () => void;
}

const PROLOGUE_SCENE_IDS = ['coldForge', 'smithShop', 'brokenTower', 'throneHall', 'roadEast'];

function numberedKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}.${index + 1}`);
}

function createEntries(): StoryEntry[] {
  const prologue: StoryEntry = {
    groupTitle: 'Opening',
    title: () => t('lore.prologue.title'),
    paragraphs: () => numberedKeys('lore.prologue', PROLOGUE_SCENE_IDS.length).map((key, index) => ({ text: t(key), isEmber: false, sceneId: PROLOGUE_SCENE_IDS[index] })),
    openInGame: () => openStoryBook(() => undefined),
  };
  const beats = STORY_BEATS.map((beat): StoryEntry => ({
    groupTitle: `Chapter ${beat.chapter}: ${t(`story.chapter.${beat.chapter}.name`)}`,
    title: () => `${t(`story.${beat.id}.title`)} (${beat.trigger.kind === 'firstClear' ? `first clear: ${beat.trigger.dungeonId}` : beat.trigger.kind === 'firstHeroHired' ? 'first hero hired' : 'second hero hired'})`,
    paragraphs: () => beat.pages.map((page, index) => ({ text: t(`story.${beat.id}.${index + 1}`), isEmber: page.voice === 'ember', sceneId: page.scene })),
    openInGame: () => openStoryBeat(beat),
  }));
  const castle = CASTLE_SPOTS.map((spot): StoryEntry => ({
    groupTitle: 'Castle',
    title: () => `${t(`castle.${spot.id}.name`)} - ${t(`castle.${spot.id}.title`)}`,
    paragraphs: () => castleTaleKeys(spot, true).map((key) => ({ text: t(key), isEmber: false })),
    openInGame: () => {
      setCastleChapterOneCleared(true);
      openCastleStory(spot.id);
    },
  }));
  const allPictures: StoryEntry = {
    groupTitle: 'Pictures',
    title: () => `All pictures (${Object.keys(STORY_SCENES).length})`,
    paragraphs: () => Object.keys(STORY_SCENES).map((sceneId) => ({ text: sceneId, isEmber: false, sceneId })),
    openInGame: () => undefined,
  };
  return [prologue, ...beats, ...castle, allPictures];
}

initializeLanguage();
const languageSavedBeforeGallery = loadLanguagePreference();
registerStageArtProviders();
document.getElementById('gallery')?.append(getModalHost());
// The language switch saves a preference that the game also reads. Put the player's own choice back when the page closes.
// The story music plays while an opened story is on screen, as in the game.
configureAudio(loadAudioPreferences());
onStoryMusicChange(() => playMusic(isStoryMusicActive() ? 'story' : null));
window.addEventListener('pagehide', () => setLanguage(languageSavedBeforeGallery));

const listElement = document.getElementById('story-list') as HTMLElement;
const readerElement = document.getElementById('reader') as HTMLElement;
const entries = createEntries();
let selectedEntry: StoryEntry | null = null;

function showEntry(entry: StoryEntry): void {
  selectedEntry = entry;
  const openButton = document.createElement('button');
  openButton.id = 'open-in-game';
  openButton.textContent = 'Open as in the game';
  openButton.addEventListener('click', () => entry.openInGame());
  const heading = document.createElement('h2');
  heading.textContent = entry.title();
  const kind = document.createElement('p');
  kind.className = 'kind';
  kind.textContent = entry.groupTitle;
  const paragraphs = entry.paragraphs().map((paragraph, index) => {
    const line = document.createElement('p');
    line.className = paragraph.isEmber ? 'ember' : '';
    const number = document.createElement('span');
    number.className = 'page-number';
    number.textContent = String(index + 1);
    line.append(number, paragraph.text);
    if (paragraph.sceneId === undefined) return line;
    const picture = document.createElement('div');
    const drawScene = STORY_SCENES[paragraph.sceneId];
    if (drawScene) picture.append(drawingToImage(drawScene(), 4, 'pixel-icon'));
    picture.append(line);
    return picture;
  });
  readerElement.replaceChildren(heading, kind, openButton, ...paragraphs);
  drawList();
}

function drawList(): void {
  const languageRow = document.createElement('div');
  languageRow.id = 'language-row';
  for (const language of LANGUAGES) {
    const button = document.createElement('button');
    button.textContent = language.nativeName;
    button.classList.toggle('selected', currentLanguageId() === language.id);
    button.addEventListener('click', () => {
      setLanguage(language.id as LanguageId);
      drawList();
      if (selectedEntry) showEntry(selectedEntry);
    });
    languageRow.append(button);
  }
  listElement.replaceChildren(languageRow);
  let lastGroup = '';
  for (const entry of entries) {
    if (entry.groupTitle !== lastGroup) {
      const groupHeading = document.createElement('h3');
      groupHeading.textContent = entry.groupTitle;
      listElement.append(groupHeading);
      lastGroup = entry.groupTitle;
    }
    const button = document.createElement('button');
    button.textContent = entry.title();
    button.classList.toggle('selected', entry === selectedEntry);
    button.addEventListener('click', () => showEntry(entry));
    listElement.append(button);
  }
}

drawList();
if (!hasTranslation('story.chapterTitle')) readerElement.textContent = 'Story texts are missing.';

// A link such as story-gallery.html#scene=cellarDoor shows one picture large. The shot tool uses it to check a picture.
const sceneFromLink = /^#scene=(\w+)$/.exec(window.location.hash)?.[1];
const drawSceneFromLink = sceneFromLink ? STORY_SCENES[sceneFromLink] : undefined;
if (drawSceneFromLink) readerElement.replaceChildren(drawingToImage(drawSceneFromLink(), 8, 'pixel-icon'));
