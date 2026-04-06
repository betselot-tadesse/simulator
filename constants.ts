
import { Position } from './types';

export const FORMATIONS = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-4-1", "4-1-4-1"];

export const DEFAULT_FORMATION_POSITIONS: Record<string, Position[]> = {
  "4-4-2": ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST', 'ST'],
  "4-3-3": ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CDM', 'CM', 'LW', 'RW', 'ST'],
  "4-2-3-1": ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'LW', 'RW', 'ST'],
  "3-5-2": ['GK', 'CB', 'CB', 'CB', 'CDM', 'CM', 'CDM', 'LW', 'RW', 'ST', 'ST'],
  "5-4-1": ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST'],
  "4-1-4-1": ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'LW', 'CM', 'CM', 'RW', 'ST']
};

export const DEFAULT_PLAYER_NAMES = [
  "Rashford", "Fernandes", "Mainoo", "Garnacho", "Højlund", "Casemiro", "Onana", "Martinez",
  "Dalot", "Shaw", "Maguire", "Mount", "Amad", "Antony", "Wan-Bissaka", 
  "McTominay", "Eriksen", "Lindelöf", "Evans", "Bayindir"
];

export const POSITIONS: Position[] = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

export const STORAGE_KEY = "mufc_football_play_v1";

export const COLORS = {
  HOME: '#DA291C', // United Red
  AWAY: '#FFFFFF', // Clean White
};

export const INITIAL_TEAM_A_NAME = "Manchester United";
export const INITIAL_TEAM_B_NAME = "Opponent XI";
