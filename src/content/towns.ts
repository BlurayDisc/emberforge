import townsData from '../../data/towns.json';

export interface TownDefinition {
  id: string;
  name: string;
  region: string;
  firstLevel: number;
  lastLevel: number;
}

export const STARTING_TOWN_ID: string = townsData.startingTownId;

export const TOWNS = townsData.towns as readonly TownDefinition[];
