
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Team, Player, MatchHistory, MatchEvent, MatchStats } from './types';
import { INITIAL_TEAM_A_NAME, INITIAL_TEAM_B_NAME, COLORS, FORMATIONS, POSITIONS, DEFAULT_FORMATION_POSITIONS } from './constants';
import { storageService } from './services/storageService';
import SetupTeam from './components/SetupTeam';
import TacticalBoard from './components/TacticalBoard';
import MatchSimulation from './components/MatchSimulation';
import PostMatch from './components/PostMatch';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [matchResult, setMatchResult] = useState<MatchHistory | null>(null);
  const [history, setHistory] = useState<MatchHistory[]>([]);

  useEffect(() => {
    setHistory(storageService.loadMatchHistory());
  }, []);

  const createDefaultPlayer = (index: number, pos: any): Player => ({
    id: Math.random().toString(36).substr(2, 9),
    name: `Player ${index + 1}`,
    position: pos,
    attack: 70 + Math.floor(Math.random() * 20),
    defense: 70 + Math.floor(Math.random() * 20),
    passing: 70 + Math.floor(Math.random() * 20),
    stamina: 100,
    matchStats: { 
      goals: 0, 
      assists: 0, 
      shots: 0, 
      shotsOnTarget: 0, 
      keyPasses: 0,
      bigChanceCreated: 0,
      bigChanceMissed: 0,
      tackles: 0, 
      interceptions: 0, 
      blocks: 0,
      clearances: 0,
      saves: 0, 
      bigSaves: 0,
      concededGoals: 0,
      errors: 0,
      errorLeadingToGoal: 0,
      yellowCards: 0,
      redCards: 0,
      rating: 6.5 
    }
  });

  const initTeams = () => {
    const formationA = '4-3-3';
    const formationB = '4-4-2';
    const positionsA = DEFAULT_FORMATION_POSITIONS[formationA];
    const positionsB = DEFAULT_FORMATION_POSITIONS[formationB];

    const defaultA: Team = {
      id: 'team-a',
      name: 'Manchester United',
      formation: formationA,
      primaryColor: '#DA291C', 
      starters: positionsA.map((pos, i) => createDefaultPlayer(i, pos)),
      bench: Array(4).fill(0).map((_, i) => createDefaultPlayer(i + 11, 'CM'))
    };
    const defaultB: Team = {
      id: 'team-b',
      name: 'Opponent XI',
      formation: formationB,
      primaryColor: COLORS.AWAY,
      starters: positionsB.map((pos, i) => createDefaultPlayer(i, pos)),
      bench: Array(4).fill(0).map((_, i) => createDefaultPlayer(i + 11, 'CM'))
    };
    setTeamA(defaultA);
    setTeamB(defaultB);
    setAppState(AppState.SETUP);
  };

  const resetTeamStats = (team: Team): Team => {
    const resetPlayers = (players: Player[]) => players.map(p => ({
      ...p,
      stamina: 100,
      matchStats: {
        goals: 0, assists: 0, shots: 0, shotsOnTarget: 0, keyPasses: 0,
        bigChanceCreated: 0, bigChanceMissed: 0, tackles: 0, interceptions: 0,
        blocks: 0, clearances: 0, saves: 0, bigSaves: 0, concededGoals: 0,
        errors: 0, errorLeadingToGoal: 0, yellowCards: 0, redCards: 0, rating: 6.5
      }
    }));

    return {
      ...team,
      starters: resetPlayers(team.starters),
      bench: resetPlayers(team.bench)
    };
  };

  const handleRestartMatch = () => {
    if (teamA && teamB) {
      setTeamA(resetTeamStats(teamA));
      setTeamB(resetTeamStats(teamB));
      setAppState(AppState.SIMULATION);
    }
  };

  const handleAdjustTactics = () => {
    if (teamA && teamB) {
      setTeamA(resetTeamStats(teamA));
      setTeamB(resetTeamStats(teamB));
      setAppState(AppState.SETUP);
    }
  };

  const handleMatchComplete = (historyItem: MatchHistory) => {
    storageService.saveMatch(historyItem);
    setMatchResult(historyItem);
    setHistory(storageService.loadMatchHistory());
    setAppState(AppState.POST_MATCH);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {appState === AppState.LANDING && (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative mb-8 group">
             <img 
               src="https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png" 
               alt="Manchester United Crest" 
               className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_35px_rgba(218,41,28,0.4)] transition-transform duration-700 group-hover:scale-105"
             />
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="display-font text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
              Manchester United <span className="text-red-600">Fans</span> Football Play.
            </h1>
            <p className="text-sm md:text-base font-black text-slate-500 uppercase tracking-[0.4em]">
              Developed by <span className="text-slate-300">INVISIBLE SHADOW</span>
            </p>
          </div>
          
          <div className="mt-12 relative z-10">
            <button 
              onClick={initTeams}
              className="bg-[#DA291C] hover:bg-[#b52217] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-red-900/40 hover:scale-105 active:scale-95 flex items-center gap-4"
            >
              Enter Simulation <i className="fa-solid fa-futbol animate-spin-slow"></i>
            </button>
          </div>

          {history.length > 0 && (
            <div className="mt-16 w-full max-w-3xl relative z-10">
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 text-left border-b border-slate-800 pb-2">Archived Match Data</h2>
              <div className="space-y-3">
                {history.map(m => (
                  <div key={m.id} className="bg-slate-900/30 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-slate-800/50 hover:border-red-600/30 transition-colors">
                    <div className="flex items-center gap-6 flex-1 justify-center">
                      <div className="text-right flex-1 font-bold text-sm text-slate-300">{m.teamA.name}</div>
                      <div className="bg-slate-800/80 px-4 py-1.5 rounded-lg text-xl font-mono font-bold tracking-widest text-white border border-slate-700">
                        {m.score[0]} - {m.score[1]}
                      </div>
                      <div className="text-left flex-1 font-bold text-sm text-slate-300">{m.teamB.name}</div>
                    </div>
                    <span className="text-[9px] font-black text-slate-600 ml-4 uppercase tracking-tighter">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {appState === AppState.SETUP && teamA && teamB && (
        <SetupTeam 
          teamA={teamA} 
          teamB={teamB} 
          onUpdateA={setTeamA} 
          onUpdateB={setTeamB} 
          onNext={() => setAppState(AppState.PREVIEW)} 
        />
      )}

      {appState === AppState.PREVIEW && teamA && teamB && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-3xl font-bold">{teamA.name} <span className="text-red-500 text-sm align-middle ml-2">{teamA.formation}</span></h2>
            </div>
            <div className="text-slate-500 text-xl font-bold uppercase tracking-widest">Tactical Preview</div>
            <div className="text-right">
              <h2 className="text-3xl font-bold"><span className="text-slate-500 text-sm align-middle mr-2">{teamB.formation}</span> {teamB.name}</h2>
            </div>
          </div>

          <div className="w-full max-w-6xl mx-auto min-h-[600px]">
            <TacticalBoard teamA={teamA} teamB={teamB} previewMode={true} />
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={() => setAppState(AppState.SETUP)} className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl font-bold transition-colors">Adjust Tactics</button>
            <button onClick={() => setAppState(AppState.SIMULATION)} className="bg-red-600 hover:bg-red-500 px-12 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all">Start Simulation</button>
          </div>
        </div>
      )}

      {appState === AppState.SIMULATION && teamA && teamB && (
        <MatchSimulation teamA={teamA} teamB={teamB} onComplete={handleMatchComplete} />
      )}

      {appState === AppState.POST_MATCH && matchResult && (
        <PostMatch 
          match={matchResult} 
          onReset={() => setAppState(AppState.LANDING)} 
          onRestart={handleRestartMatch}
          onAdjustTactics={handleAdjustTactics}
        />
      )}
    </div>
  );
};

export default App;
