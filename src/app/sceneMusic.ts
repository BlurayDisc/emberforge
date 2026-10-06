import { DUNGEONS } from '../content/dungeons';

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
