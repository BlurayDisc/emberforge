import { DUNGEONS } from '../content/dungeons';

// The track of the story scenes (the opening and the chapter beats). It plays over every other track while a story window is open.
export const STORY_TRACK_ID = 'story';

function fightTrackOf(dungeonId: string): string {
  return DUNGEONS.find((dungeon) => dungeon.id === dungeonId)?.bossMonsterId ? 'boss' : 'battle';
}

// A fight on the stage plays its fight track. Without a fight on the stage, the castle keeps its own track.
// In the town the music follows the oldest active run, so the player hears that the heroes are fighting. Without any run it is the town track.
export function chooseMusicTrack(watchedDungeonId: string | null, oldestActiveDungeonId: string | null, isInsideCastle: boolean): string {
  if (watchedDungeonId !== null) return fightTrackOf(watchedDungeonId);
  if (isInsideCastle) return 'castle';
  return oldestActiveDungeonId === null ? 'town' : fightTrackOf(oldestActiveDungeonId);
}
