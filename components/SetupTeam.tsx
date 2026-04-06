
import React from 'react';
import { Team, Player, Position } from '../types';
import { FORMATIONS, POSITIONS, DEFAULT_FORMATION_POSITIONS } from '../constants';

interface Props {
  teamA: Team;
  teamB: Team;
  onUpdateA: (t: Team) => void;
  onUpdateB: (t: Team) => void;
  onNext: () => void;
}

const SetupTeam: React.FC<Props> = ({ teamA, teamB, onUpdateA, onUpdateB, onNext }) => {
  
  const updatePlayer = (team: 'A' | 'B', index: number, field: keyof Player, value: any) => {
    const targetTeam = team === 'A' ? teamA : teamB;
    const setter = team === 'A' ? onUpdateA : onUpdateB;
    
    const newStarters = [...targetTeam.starters];
    newStarters[index] = { ...newStarters[index], [field]: value };
    setter({ ...targetTeam, starters: newStarters });
  };

  const handleFormationChange = (type: 'A' | 'B', formation: string) => {
    const team = type === 'A' ? teamA : teamB;
    const setter = type === 'A' ? onUpdateA : onUpdateB;
    
    const newPositions = DEFAULT_FORMATION_POSITIONS[formation];
    const newStarters = team.starters.map((player, idx) => ({
      ...player,
      position: newPositions[idx] || 'CM'
    }));

    setter({ ...team, formation, starters: newStarters });
  };

  const handleSaveTeam = (type: 'A' | 'B') => {
    const team = type === 'A' ? teamA : teamB;
    const storageKey = `pitchmaster_saved_team_${type}`;
    localStorage.setItem(storageKey, JSON.stringify(team));
    alert(`${team.name} configuration saved successfully!`);
  };

  const handleLoadTeam = (type: 'A' | 'B') => {
    const storageKey = `pitchmaster_saved_team_${type}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsedTeam: Team = JSON.parse(savedData);
      if (type === 'A') onUpdateA(parsedTeam);
      else onUpdateB(parsedTeam);
    } else {
      alert(`No saved configuration found for Team ${type}.`);
    }
  };

  const handleDeleteSavedTeam = (type: 'A' | 'B') => {
    const storageKey = `pitchmaster_saved_team_${type}`;
    if (localStorage.getItem(storageKey)) {
      if (confirm(`Are you sure you want to delete the saved configuration for Team ${type}?`)) {
        localStorage.removeItem(storageKey);
        alert(`Saved configuration for Team ${type} has been deleted.`);
      }
    } else {
      alert(`No saved configuration found to delete for Team ${type}.`);
    }
  };

  const renderTeamForm = (team: Team, type: 'A' | 'B') => (
    <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-xl">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <input 
            value={team.name}
            onChange={(e) => (type === 'A' ? onUpdateA : onUpdateB)({ ...team, name: e.target.value })}
            className="bg-transparent text-3xl font-black border-b-2 border-slate-800 focus:border-blue-500 outline-none pb-2 flex-1 mr-4 transition-colors"
            placeholder="Team Name"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => handleSaveTeam(type)}
              title={`Save ${team.name}`}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg"
            >
              <i className="fa-solid fa-floppy-disk"></i>
            </button>
            <button 
              onClick={() => handleLoadTeam(type)}
              title={`Load Saved Team ${type}`}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg"
            >
              <i className="fa-solid fa-folder-open"></i>
            </button>
            <button 
              onClick={() => handleDeleteSavedTeam(type)}
              title={`Delete Saved Team ${type}`}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-500 hover:text-red-400 flex items-center justify-center transition-all"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-2xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Formation</label>
            <select 
              value={team.formation}
              onChange={(e) => handleFormationChange(type, e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            >
              {FORMATIONS.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-2xl">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kit Color</label>
            <input 
              type="color" 
              value={team.primaryColor}
              onChange={(e) => (type === 'A' ? onUpdateA : onUpdateB)({ ...team, primaryColor: e.target.value })}
              className="w-6 h-6 rounded-md cursor-pointer bg-transparent border-none p-0 overflow-hidden"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 mb-2">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Player Name</div>
          <div className="col-span-2">Pos</div>
          <div className="col-span-1 text-center">Atk</div>
          <div className="col-span-1 text-center">Def</div>
          <div className="col-span-1 text-center">Pas</div>
          <div className="col-span-2 text-center">Cpt</div>
        </div>
        
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
          {team.starters.map((player, idx) => (
            <div key={player.id} className="grid grid-cols-12 gap-2 items-center bg-slate-800/30 hover:bg-slate-800/50 p-3 rounded-2xl border border-slate-800/50 transition-colors">
              <div className="col-span-1 text-[10px] text-slate-500 font-black">{idx + 1}</div>
              <div className="col-span-4">
                <input 
                  value={player.name}
                  onChange={(e) => updatePlayer(type, idx, 'name', e.target.value)}
                  className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 text-xs font-bold outline-none transition-colors"
                />
              </div>
              <div className="col-span-2">
                <select 
                  value={player.position}
                  onChange={(e) => updatePlayer(type, idx, 'position', e.target.value)}
                  className="w-full bg-slate-900 text-[10px] font-black py-1 rounded-lg border border-slate-700"
                >
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <input 
                  type="number"
                  min="0" max="100"
                  value={player.attack}
                  onChange={(e) => updatePlayer(type, idx, 'attack', parseInt(e.target.value))}
                  className="w-full bg-transparent text-center text-xs font-bold outline-none"
                />
              </div>
              <div className="col-span-1">
                <input 
                  type="number"
                  min="0" max="100"
                  value={player.defense}
                  onChange={(e) => updatePlayer(type, idx, 'defense', parseInt(e.target.value))}
                  className="w-full bg-transparent text-center text-xs font-bold outline-none"
                />
              </div>
              <div className="col-span-1">
                <input 
                  type="number"
                  min="0" max="100"
                  value={player.passing}
                  onChange={(e) => updatePlayer(type, idx, 'passing', parseInt(e.target.value))}
                  className="w-full bg-transparent text-center text-xs font-bold outline-none"
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <input 
                  type="checkbox"
                  checked={player.isCaptain}
                  onChange={(e) => updatePlayer(type, idx, 'isCaptain', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-tight text-white">Match Config</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Trial Squad Selection & Tactical Setup</p>
        </div>
        <button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-[20px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95 group"
        >
          Preview Squads <i className="fa-solid fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4">Home Side Configuration</h2>
            {renderTeamForm(teamA, 'A')}
        </div>
        <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4">Away Side Configuration</h2>
            {renderTeamForm(teamB, 'B')}
        </div>
      </div>
    </div>
  );
};

export default SetupTeam;
