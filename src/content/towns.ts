import townsData from '../../data/towns.json';

export interface TownDefinition {
  id: string;
  name: string;
  region: string;
  firstLevel: number;
  lastLevel: number;
  // Place on the world map, in percent of the map width and height.
  mapX: number;
  mapY: number;
  biome: string;
}

export const STARTING_TOWN_ID: string = townsData.startingTownId;

export const TOWNS = townsData.towns as readonly TownDefinition[];
