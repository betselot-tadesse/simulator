
import { Team, MatchHistory } from '../types';
// Fix: Import STORAGE_KEY from constants instead of types
import { STORAGE_KEY } from '../constants';

interface AppData {
  savedTeams: Team[];
  matchHistory: MatchHistory[];
}

export const storageService = {
  loadData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { savedTeams: [], matchHistory: [] };
  },

  saveTeams: (teams: Team[]) => {
    const data = storageService.loadData();
    data.savedTeams = teams;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  saveMatch: (match: MatchHistory) => {
    const data = storageService.loadData();
    data.matchHistory.unshift(match);
    // Keep last 20 matches
    data.matchHistory = data.matchHistory.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadMatchHistory: (): MatchHistory[] => {
    return storageService.loadData().matchHistory;
  }
};