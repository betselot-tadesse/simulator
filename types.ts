
export type Position = 'GK' | 'LB' | 'CB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export interface Player {
  id: string;
  name: string;
  position: Position;
  attack: number;
  defense: number;
  passing: number;
  stamina: number;
  isCaptain?: boolean;
  matchStats: PlayerMatchStats;
}

export interface PlayerMatchStats {
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  keyPasses: number;
  bigChanceCreated: number;
  bigChanceMissed: number;
  tackles: number;
  interceptions: number;
  blocks: number;
  clearances: number;
  saves: number;
  bigSaves: number;
  concededGoals: number;
  errors: number;
  errorLeadingToGoal: number;
  yellowCards: number;
  redCards: number;
  rating: number;
}

export interface Team {
  id: string;
  name: string;
  formation: string;
  primaryColor: string;
  starters: Player[];
  bench: Player[];
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'SHOT' | 'TACKLE' | 'SAVE' | 'INTERCEPTION' | 'SUB' | 'ERROR' | 'BIG_CHANCE' | 'SKILL' | 'FREE_KICK' | 'CORNER' | 'YELLOW_CARD' | 'KEY_PASS' | 'RED_CARD';
  player: string;
  teamId: string;
  description: string;
  assistBy?: string;
}

export interface MatchStats {
  possession: [number, number]; // [TeamA, TeamB]
  totalShots: [number, number];
  shotsOnTarget: [number, number];
  tackles: [number, number];
  interceptions: [number, number];
  saves: [number, number];
  errors: [number, number];
  substitutions: [number, number];
}

export interface MatchHistory {
  id: string;
  date: string;
  teamA: Team;
  teamB: Team;
  score: [number, number];
  events: MatchEvent[];
  stats: MatchStats;
}

export enum AppState {
  LANDING,
  SETUP,
  PREVIEW,
  SIMULATION,
  POST_MATCH
}
