
import React, { useMemo, useState } from 'react';
import { Team, Player, MatchEvent } from '../types';
import { getFormationCoords, PlayerCoord } from '../services/formationService';
import { getRatingColor } from '../services/ratingService';

interface Props {
  teamA: Team;
  teamB: Team;
  showRatings?: boolean;
  showStamina?: boolean;
  previewMode?: boolean;
  events?: MatchEvent[];
  activeHighlight?: { playerName: string, type: string } | null;
}

const BootIcon = () => (
  <svg viewBox="0 0 512 512" className="w-3 h-3 text-slate-900 fill-current">
    <path d="M416 128c.6 0 1.1 0 1.7.1c32.7 1.5 59.5 24.3 69.1 55.1c3.1 10.1 7.1 20 12.1 29.3c5.8 10.8 1.6 24.1-9.4 30c-11.2 6-25.2 1.6-31.2-9.6c-4-7.4-7.1-15.1-9.4-23.1c-1.8-6-6.1-10.8-11.8-12.8c-1.3-.5-2.6-.7-4-.8c-10.8-1-20.9 4-27.1 12.8L352 260.6V352c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V256.4L51.8 181.1C32.1 161.4 32.1 129.5 51.8 109.8L83.9 77.7C96.4 65.2 113.3 58.1 131 58.1H288c35.3 0 64 28.7 64 64v6.6l64-6.6l0 0zM128 384h32v32h-32v-32zm64 0h32v32h-32v-32zm64 0h32v32h-32v-32zm64 0h32v32h-32v-32zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/>
  </svg>
);

const RatingPlayerNode: React.FC<{
  player: Player;
  coord: PlayerCoord;
  showRatings: boolean;
  showStamina: boolean;
  index: number;
  isMOTM?: boolean;
  isHighlighted?: string | null;
  onClick: () => void;
}> = ({ player, coord, showRatings, showStamina, index, isMOTM, isHighlighted, onClick }) => {
  const initial = player.name.charAt(0).toUpperCase();
  const ratingColorClass = getRatingColor(player.matchStats.rating);
  const lastName = player.name.split(' ').pop();
  const playerNum = index + 1;

  const getStaminaColor = (val: number) => {
    if (val > 60) return '#10b981'; 
    if (val > 30) return '#f59e0b'; 
    return '#ef4444'; 
  };

  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, player.stamina)) / 100) * circumference;

  return (
    <div 
      className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 flex flex-col items-center cursor-pointer transition-all ${isHighlighted ? 'scale-125 z-50' : 'hover:scale-110 active:scale-95'}`}
      style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Highlight Pulse */}
        {isHighlighted && (
            <div className="absolute -inset-4 bg-white/40 rounded-full animate-ping z-0 pointer-events-none"></div>
        )}

        {showStamina && (
          <svg className="absolute w-16 h-16 -rotate-90 pointer-events-none -left-2 -top-2 z-0">
            <circle cx="32" cy="32" r="30" stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="transparent" />
            <circle
              cx="32" cy="32" r="30"
              stroke={getStaminaColor(player.stamina)}
              strokeWidth="3" fill="transparent"
              strokeDasharray={circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s ease' }}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* MOTM Star - Positioned near the node (top-left of portrait) */}
        {isMOTM && showRatings && (
          <div className="absolute -top-3 -left-3 z-[60] animate-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-md opacity-60 animate-pulse"></div>
              <div className="relative w-7 h-7 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-full flex items-center justify-center border-2 border-white shadow-xl">
                <i className="fa-solid fa-star text-white text-[10px]"></i>
              </div>
            </div>
          </div>
        )}

        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-xl overflow-hidden relative z-10 ${isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}>
           <span className="text-slate-800 font-black text-lg md:text-xl select-none">{initial}</span>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent"></div>
        </div>

        {/* Highlight Action Label */}
        {isHighlighted && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-3 py-1 rounded-full font-black text-[10px] shadow-2xl animate-bounce whitespace-nowrap z-50">
                {isHighlighted}
            </div>
        )}

        {showRatings && (
          <div className={`absolute -top-1 -right-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg z-30 px-2.5 transition-all min-w-[36px] ${ratingColorClass}`}>
            {player.matchStats.rating.toFixed(1)}
          </div>
        )}

        {player.matchStats.yellowCards > 0 && (
          <div className={`absolute -top-1 -left-4 w-3 h-4 bg-yellow-400 rounded-sm border border-white shadow-md z-40 ${player.matchStats.redCards > 0 ? 'opacity-30' : ''}`}></div>
        )}

        {player.matchStats.redCards > 0 && (
          <div className="absolute -top-1 -left-2 w-3 h-4 bg-red-600 rounded-sm border border-white shadow-md z-40"></div>
        )}

        <div className="absolute -bottom-1 -right-4 flex flex-row-reverse items-center z-30 pointer-events-none">
          {Array.from({ length: player.matchStats.goals }).map((_, i) => (
            <div key={i} className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-200 -ml-2 first:ml-0">
              <i className="fa-solid fa-futbol text-[9px] text-black"></i>
            </div>
          ))}
        </div>

        <div className="absolute -bottom-1 -left-4 flex flex-row items-center z-30 pointer-events-none">
          {Array.from({ length: player.matchStats.assists }).map((_, i) => (
            <div key={i} className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-200 -mr-2 first:ml-0">
              <BootIcon />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 text-center whitespace-nowrap">
        <span className={`text-xs md:text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight ${player.matchStats.redCards > 0 ? 'line-through opacity-50' : ''}`}>
          {playerNum} {lastName}
        </span>
      </div>
    </div>
  );
};

const PitchLinesLandscape = () => (
  <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
    <div className="absolute inset-0 flex">
      {Array(10).fill(0).map((_, i) => (
        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-black/5' : 'bg-transparent'}`}></div>
      ))}
    </div>
    <div className="absolute inset-4 md:inset-8 border-2 border-white/20 rounded-sm"></div>
    <div className="absolute top-0 bottom-0 left-1/2 border-l-2 border-white/20"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 border-2 border-white/20 rounded-full"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full"></div>
    <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-white/10 border-l-0"></div>
    <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-white/10 border-r-0"></div>
  </div>
);

const PlayerBioModal: React.FC<{ player: Player; onClose: () => void; teamColor: string; events?: MatchEvent[] }> = ({ player, onClose, teamColor, events = [] }) => {
  const playerEvents = events.filter(e => e.player === player.name || e.assistBy === player.name);

  const getEventIcon = (type: MatchEvent['type'], isAssister: boolean) => {
    if (isAssister) return <i className="fa-solid fa-shoe-prints text-blue-400"></i>;
    switch(type) {
      case 'GOAL': return <i className="fa-solid fa-futbol text-emerald-400"></i>;
      case 'SHOT': return <i className="fa-solid fa-crosshairs text-orange-400"></i>;
      case 'TACKLE': return <i className="fa-solid fa-shield-halved text-blue-400"></i>;
      case 'SAVE': return <i className="fa-solid fa-hands-clapping text-emerald-400"></i>;
      case 'ERROR': return <i className="fa-solid fa-triangle-exclamation text-red-500"></i>;
      case 'SKILL': return <i className="fa-solid fa-wand-sparkles text-purple-400"></i>;
      case 'YELLOW_CARD': return <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div>;
      case 'RED_CARD': return <div className="w-2.5 h-3.5 bg-red-600 rounded-sm"></div>;
      case 'KEY_PASS': return <i className="fa-solid fa-eye text-cyan-400"></i>;
      case 'INTERCEPTION': return <i className="fa-solid fa-hand-dots text-indigo-400"></i>;
      default: return <i className="fa-solid fa-circle text-slate-600"></i>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-[#0a0f18] rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-500 hover:text-white transition-colors z-10 text-xl">
          <i className="fa-solid fa-times"></i>
        </button>

        <div className="p-8 flex items-center gap-8 border-b border-slate-800/50">
           <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] flex items-center justify-center border-4 border-white/10 shadow-2xl relative shrink-0 overflow-hidden" style={{ backgroundColor: teamColor }}>
              <span className="text-white text-4xl md:text-5xl font-black italic">{player.name.charAt(0)}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
           </div>
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest text-white ${getRatingColor(player.matchStats.rating)}`}>
                    Rating {player.matchStats.rating.toFixed(1)}
                 </span>
                 {player.isCaptain && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest bg-yellow-600 text-white">Captain</span>}
                 {player.matchStats.redCards > 0 && <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest bg-red-600 text-white">Dismissed</span>}
              </div>
              <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter mb-1">{player.name}</h2>
              <div className="flex items-center gap-4 text-slate-400 font-black text-[10px] tracking-widest uppercase">
                 <span>Position: {player.position}</span>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'Goals', value: player.matchStats.goals, icon: 'fa-futbol' },
               { label: 'Assists', value: player.matchStats.assists, icon: 'fa-shoe-prints' },
               { label: 'Tackles', value: player.matchStats.tackles, icon: 'fa-shield-halved' },
               { label: 'Saves', value: player.matchStats.saves, icon: 'fa-hands-clapping' },
               { label: 'Shots', value: player.matchStats.shots, icon: 'fa-crosshairs' },
               { label: 'Key Pass', value: player.matchStats.keyPasses, icon: 'fa-eye' },
               { label: 'Interceptions', value: player.matchStats.interceptions, icon: 'fa-hand-dots' },
               { label: 'Red Cards', value: player.matchStats.redCards, icon: 'fa-square', color: 'text-red-500' }
             ].map((stat, i) => (
               <div key={i} className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center group hover:border-slate-700 transition-colors">
                  <i className={`fa-solid ${stat.icon} ${stat.color || 'text-slate-500'} mb-2 text-xs group-hover:scale-110 transition-transform`}></i>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Performance Attributes</h4>
               <div className="bg-slate-800/30 p-6 rounded-[32px] border border-slate-800/50 space-y-6">
                  {['Attack', 'Defense', 'Passing'].map((attr) => (
                    <div key={attr}>
                      <div className="flex justify-between text-xs font-black text-slate-400 uppercase mb-2">
                        <span>{attr}</span>
                        <span>{player[attr.toLowerCase() as keyof Player] as number}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${attr === 'Attack' ? 'bg-blue-500' : attr === 'Defense' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${player[attr.toLowerCase() as keyof Player] as number}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Match Activity Log</h4>
              <div className="bg-slate-800/30 rounded-[32px] border border-slate-800/50 overflow-hidden">
                <div className="max-h-[220px] overflow-y-auto no-scrollbar p-6 space-y-4">
                  {playerEvents.length > 0 ? (
                    playerEvents.map((e, idx) => (
                      <div key={idx} className="flex gap-4 items-start group border-b border-slate-800/50 pb-4 last:border-0">
                        <div className="font-mono text-[10px] font-bold text-slate-500 pt-0.5 w-6">{e.minute}'</div>
                        <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {getEventIcon(e.type, e.assistBy === player.name && e.player !== player.name)}
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-black uppercase text-slate-400 mb-0.5">
                            {e.assistBy === player.name && e.player !== player.name ? 'ASSIST' : e.type}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-tight whitespace-pre-line">{e.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-600 text-[10px] font-black uppercase">No significant touches</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TacticalBoard: React.FC<Props> = ({ teamA, teamB, showRatings = false, showStamina = false, previewMode = false, events = [], activeHighlight = null }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<{ player: Player; teamColor: string } | null>(null);
  const coordsA = getFormationCoords(teamA.formation, true);
  const coordsB = getFormationCoords(teamB.formation, false);

  const motmId = useMemo(() => {
    if (!showRatings) return null;
    const allPlayers = [...teamA.starters, ...teamB.starters];
    let topPlayer = allPlayers[0];
    for (const p of allPlayers) {
      if (p.matchStats.rating > topPlayer.matchStats.rating) {
        topPlayer = p;
      }
    }
    // Only return if rating is meaningfully above base or game is concluded/in-progress
    return topPlayer.matchStats.rating > 6.8 ? topPlayer.id : null;
  }, [teamA, teamB, showRatings]);

  return (
    <div className="flex flex-col h-full bg-[#1c844c] rounded-[40px] overflow-hidden border-[10px] border-[#0a4d29] shadow-2xl relative select-none animate-in fade-in duration-700">
      {selectedPlayer && (
        <PlayerBioModal 
          player={selectedPlayer.player} 
          teamColor={selectedPlayer.teamColor} 
          events={events}
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
      <div className="bg-[#0c5c31]/95 backdrop-blur-md px-8 py-5 flex justify-between items-center z-20 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
           <div className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl" style={{ backgroundColor: teamA.primaryColor }}><span className="text-white font-black text-2xl italic">T</span></div>
           <div>
             <div className="text-white font-black text-xl uppercase tracking-tighter leading-none">{teamA.name}</div>
             <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">{teamA.formation}</div>
           </div>
        </div>
        <div className="flex items-center gap-4 text-right">
           <div>
             <div className="text-white font-black text-xl uppercase tracking-tighter leading-none">{teamB.name}</div>
             <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">{teamB.formation}</div>
           </div>
           <div className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl" style={{ backgroundColor: teamB.primaryColor }}><span className="text-white font-black text-2xl italic">T</span></div>
        </div>
      </div>
      <div className="relative flex-1 bg-[#1c844c]">
        <PitchLinesLandscape />
        {teamA.starters.map((player, idx) => (
          <RatingPlayerNode 
            key={player.id} 
            player={player} 
            coord={coordsA[idx]} 
            showRatings={showRatings} 
            showStamina={!previewMode && showStamina} 
            index={idx} 
            isMOTM={player.id === motmId}
            isHighlighted={activeHighlight?.playerName === player.name ? activeHighlight.type : null}
            onClick={() => setSelectedPlayer({ player, teamColor: teamA.primaryColor })} 
          />
        ))}
        {teamB.starters.map((player, idx) => (
          <RatingPlayerNode 
            key={player.id} 
            player={player} 
            coord={coordsB[idx]} 
            showRatings={showRatings} 
            showStamina={!previewMode && showStamina} 
            index={idx} 
            isMOTM={player.id === motmId}
            isHighlighted={activeHighlight?.playerName === player.name ? activeHighlight.type : null}
            onClick={() => setSelectedPlayer({ player, teamColor: teamB.primaryColor })} 
          />
        ))}
      </div>
    </div>
  );
};

export default TacticalBoard;
