
import { Team, MatchEvent, MatchStats, MatchHistory } from '../types';
import React, { useState, useEffect, useRef } from 'react';
import { runSimulationStep } from '../services/simulationEngine';
import { calculateTeamRatings } from '../services/ratingService';
import { commentaryEngine } from '../services/commentaryService';
import TacticalBoard from './TacticalBoard';

interface Props {
  teamA: Team;
  teamB: Team;
  onComplete: (match: MatchHistory) => void;
}

interface GoalPopupState {
  scorer: string;
  teamName: string;
  color: string;
}

const MatchSimulation: React.FC<Props> = ({ teamA, teamB, onComplete }) => {
  const [minute, setMinute] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [stats, setStats] = useState<MatchStats>({
    possession: [50, 50],
    totalShots: [0, 0],
    shotsOnTarget: [0, 0],
    tackles: [0, 0],
    interceptions: [0, 0],
    saves: [0, 0],
    errors: [0, 0],
    substitutions: [0, 0]
  });
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(100); 
  const [goalPopup, setGoalPopup] = useState<GoalPopupState | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<{playerName: string, type: string} | null>(null);

  const timerRef = useRef<any>(null);
  const eventListRef = useRef<HTMLDivElement>(null);
  const lastGoalCountRef = useRef(0);

  const goalsA = events.filter(e => e.type === 'GOAL' && e.teamId === teamA.id);
  const goalsB = events.filter(e => e.type === 'GOAL' && e.teamId === teamB.id);
  const scoreA = goalsA.length;
  const scoreB = goalsB.length;

  useEffect(() => {
    commentaryEngine.reset();
  }, []);

  useEffect(() => {
    if (minute >= 90) {
      handleMatchEnd();
      return;
    }

    if (!isPaused) {
      timerRef.current = setTimeout(() => {
        setMinute(prev => prev + 1);
        runSimulationStep(minute, teamA, teamB, stats, events);
        
        const lastEvent = events[events.length - 1];
        if (lastEvent) {
            if (['GOAL', 'SAVE', 'RED_CARD', 'YELLOW_CARD', 'SKILL'].includes(lastEvent.type)) {
                setActiveHighlight({ playerName: lastEvent.player, type: lastEvent.type });
                setTimeout(() => setActiveHighlight(null), 2500);
            }

            const currentGoals = events.filter(e => e.type === 'GOAL').length;
            if (currentGoals > lastGoalCountRef.current) {
              const lastGoal = events.filter(e => e.type === 'GOAL').pop();
              if (lastGoal) {
                setIsShaking(true);
                setGoalPopup({
                  scorer: lastGoal.player,
                  teamName: lastGoal.teamId === teamA.id ? teamA.name : teamB.name,
                  color: lastGoal.teamId === teamA.id ? teamA.primaryColor : teamB.primaryColor
                });
                
                setTimeout(() => {
                  setGoalPopup(null);
                  setIsShaking(false);
                }, 1500);
              }
              lastGoalCountRef.current = currentGoals;
            }
        }

        setStats({ ...stats });
        setEvents([...events]);
      }, simSpeed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [minute, isPaused, simSpeed, teamA, teamB, stats, events]);

  useEffect(() => {
    if (eventListRef.current) {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight;
    }
  }, [events]);

  const handleMatchEnd = () => {
    // Inject conceded goals count to defensive players for accurate rating
    teamA.starters.forEach(p => p.matchStats.concededGoals = scoreB);
    teamB.starters.forEach(p => p.matchStats.concededGoals = scoreA);

    calculateTeamRatings(teamA.starters, scoreA > scoreB, scoreB > scoreA);
    calculateTeamRatings(teamB.starters, scoreB > scoreA, scoreA > scoreB);

    const matchHistoryItem: MatchHistory = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      teamA: JSON.parse(JSON.stringify(teamA)),
      teamB: JSON.parse(JSON.stringify(teamB)),
      score: [scoreA, scoreB],
      events: [...events],
      stats: { ...stats }
    };

    onComplete(matchHistoryItem);
  };

  return (
    <div className={`space-y-6 relative max-w-6xl mx-auto transition-transform duration-300 ${isShaking ? 'animate-goal-shake' : ''}`}>
      {goalPopup && (
        <>
          <div 
            className="fixed inset-0 z-[90] celebration-flash pointer-events-none" 
            style={{ background: `radial-gradient(circle, ${goalPopup.color}55 0%, transparent 70%)` }}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="confetti" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  backgroundColor: i % 2 === 0 ? goalPopup.color : '#ffffff',
                  animationDelay: `${Math.random() * 0.5}s`,
                  borderRadius: i % 3 === 0 ? '50%' : '0%'
                }} 
              />
            ))}
            
            <div className="animate-in fade-in zoom-in slide-in-from-bottom-20 duration-500 flex flex-col items-center">
               <div className="bg-[#0a0f18]/90 backdrop-blur-3xl px-16 py-12 rounded-[60px] border-4 border-white/20 shadow-[0_0_150px_rgba(0,0,0,0.8)] flex flex-col items-center">
                  <div className="text-7xl md:text-9xl font-black display-font italic text-white drop-shadow-[0_10px_30px_rgba(0,0,0,1)] tracking-tighter uppercase mb-4 text-center animate-pulse">
                    GOAL!
                  </div>
                  <div 
                    className="px-8 py-3 rounded-2xl text-white font-black text-2xl md:text-4xl uppercase tracking-[0.15em] shadow-2xl border-b-4 border-black/30 transform -rotate-1 mb-6" 
                    style={{ backgroundColor: goalPopup.color }}
                  >
                    {goalPopup.teamName}
                  </div>
                  <div className="text-white font-black text-3xl md:text-5xl drop-shadow-2xl flex items-center gap-6 text-center animate-bounce">
                    <i className="fa-solid fa-futbol text-white/90"></i>
                    {goalPopup.scorer}
                  </div>
               </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-[#0a0f18] border border-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="flex w-full items-center justify-between mb-8">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-4 border-2 border-white/10" style={{ backgroundColor: teamA.primaryColor }}>
              <span className="text-white font-black text-4xl">T</span>
            </div>
            <div className="text-lg font-black uppercase tracking-widest text-slate-300">{teamA.name}</div>
          </div>

          <div className="flex flex-col items-center px-4 md:px-12 relative">
            <div className="flex items-end gap-6 md:gap-10">
              <span className="text-7xl md:text-9xl font-bold display-font text-white leading-none">{scoreA}</span>
              <div className="flex flex-col items-center mb-4">
                 <div className="bg-slate-800 text-[10px] px-3 py-1 rounded text-slate-400 font-bold mb-2">LIVE</div>
                 <div className="w-0.5 h-12 bg-slate-800"></div>
              </div>
              <span className="text-7xl md:text-9xl font-bold display-font text-white leading-none">{scoreB}</span>
            </div>
            <div className="mt-4 bg-slate-800/50 px-4 py-1 rounded-full text-xs font-black tracking-widest text-blue-400">
               {minute}'
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-4 border-2 border-white/10" style={{ backgroundColor: teamB.primaryColor }}>
              <span className="text-white font-black text-4xl">T</span>
            </div>
            <div className="text-lg font-black uppercase tracking-widest text-slate-300">{teamB.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 w-full px-4 border-t border-slate-800/50 pt-6">
           <div className="space-y-2 text-right">
              {goalsA.map((g, i) => (
                <div key={i} className="text-xs">
                   <div className="font-bold text-slate-200">{g.player} <span className="text-slate-500 font-normal">{g.minute}'</span> <i className="fa-solid fa-futbol text-[10px] ml-1"></i></div>
                   {g.assistBy && <div className="text-[10px] text-slate-500 uppercase font-black">ASSIST: {g.assistBy}</div>}
                </div>
              ))}
           </div>
           <div className="space-y-2 text-left">
              {goalsB.map((g, i) => (
                <div key={i} className="text-xs">
                   <div className="font-bold text-slate-200"><i className="fa-solid fa-futbol text-[10px] mr-1"></i> {g.minute}' <span className="text-slate-500 font-normal">{g.player}</span></div>
                   {g.assistBy && <div className="text-[10px] text-slate-500 uppercase font-black">ASSIST: {g.assistBy}</div>}
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] lg:h-[750px]">
          <TacticalBoard 
            teamA={teamA} 
            teamB={teamB} 
            showStamina={true} 
            events={events} 
            activeHighlight={activeHighlight} 
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest mb-6 border-b border-slate-800 pb-2">Match Stats</h3>
            <div className="space-y-6">
               <StatBar label="Possession" valA={Math.round(stats.possession[0])} valB={Math.round(stats.possession[1])} suffix="%" colorA="#3b82f6" colorB="#ef4444" />
               <StatRow label="Shots" valA={stats.totalShots[0]} valB={stats.totalShots[1]} />
               <StatRow label="Saves" valA={stats.saves[0]} valB={stats.saves[1]} />
               <StatRow label="Errors" valA={stats.errors[0]} valB={stats.errors[1]} />
            </div>
            
            <div className="mt-8 flex flex-col gap-2">
              <div className="flex gap-2">
                {[300, 100, 30].map((s, i) => (
                  <button key={s} onClick={() => setSimSpeed(s)} className={`flex-1 text-[10px] py-2 rounded-lg font-black transition-all ${simSpeed === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{i+1}X</button>
                ))}
              </div>
              <button onClick={() => setIsPaused(!isPaused)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
                  {isPaused ? <><i className="fa-solid fa-play"></i> Resume</> : <><i className="fa-solid fa-pause"></i> Pause</>}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col h-[350px]">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Commentary</h3>
            </div>
            <div ref={eventListRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
              {events.slice().reverse().map((e, idx) => (
                <div key={idx} className="flex gap-2 border-b border-slate-800/30 pb-3 last:border-0">
                  <div className="font-mono text-slate-500 font-bold shrink-0">{e.minute}'</div>
                  <div className={`flex-1 leading-tight whitespace-pre-line ${e.type === 'GOAL' ? 'text-emerald-400 font-bold italic' : 'text-slate-300'}`}>
                    {e.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, valA, valB, suffix = "", colorA, colorB }: any) => {
    const total = (valA + valB) || 1;
    return (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>{valA}{suffix}</span>
            <span>{label}</span>
            <span>{valB}{suffix}</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${(valA / total) * 100}%`, backgroundColor: colorA }}></div>
            <div className="h-full transition-all duration-500" style={{ width: `${(valB / total) * 100}%`, backgroundColor: colorB }}></div>
        </div>
    </div>
    );
};

const StatRow = ({ label, valA, valB }: any) => (
    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/30 last:border-0">
        <div className="font-bold text-blue-400">{valA}</div>
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</div>
        <div className="font-bold text-red-400">{valB}</div>
    </div>
);

export default MatchSimulation;
