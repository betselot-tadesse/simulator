
import React, { useState, useEffect } from 'react';
import { MatchHistory, Team, Player } from '../types';
import { getRatingColor } from '../services/ratingService';
import { GoogleGenAI } from "@google/genai";
import TacticalBoard from './TacticalBoard';

interface Props {
  match: MatchHistory;
  onReset: () => void;
  onRestart: () => void;
  onAdjustTactics?: () => void;
}

const PostMatch: React.FC<Props> = ({ match, onReset, onRestart, onAdjustTactics }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'ratings' | 'scout' | 'commentary' | 'tactical'>('summary');
  const [scoutReport, setScoutReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Synthesizing match data...",
    "Analyzing individual player heatmaps...",
    "Evaluating defensive efficiency...",
    "Correlating technical attributes with performance...",
    "Generating professional scout dossiers..."
  ];

  useEffect(() => {
    if (activeTab === 'scout' && !scoutReport) {
      generateAIScoutReport();
    }
  }, [activeTab]);

  useEffect(() => {
    let interval: any;
    if (isGeneratingReport) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGeneratingReport]);

  const generateAIScoutReport = async () => {
    if (!process.env.API_KEY) {
      setScoutReport("AI Scouting requires an API Key. Please check your environment configuration.");
      return;
    }
    
    setIsGeneratingReport(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const formatTeam = (team: Team) => team.starters.map(p => 
        `- ${p.name} (${p.position}): Rating ${p.matchStats.rating.toFixed(1)}, G: ${p.matchStats.goals}, A: ${p.matchStats.assists}, Tackles: ${p.matchStats.tackles}, Saves: ${p.matchStats.saves}, Errors: ${p.matchStats.errors}`
      ).join('\n');

      const prompt = `
        As a world-class football technical director, provide a detailed scouting report for this match:
        Match: ${match.teamA.name} (${match.score[0]}) vs ${match.teamB.name} (${match.score[1]})
        
        SQUAD DATA ${match.teamA.name}:
        ${formatTeam(match.teamA)}
        
        SQUAD DATA ${match.teamB.name}:
        ${formatTeam(match.teamB)}
        
        The report must include:
        1. THE STANDOUT PERFORMER: Identify the MVP and explain why their qualities stood out.
        2. TACTICAL ANALYSIS: How did the formations (${match.teamA.formation} vs ${match.teamB.formation}) influence the game?
        3. PLAYER QUALITY ASSESSMENT: Highlight 2 other players (one from each side) and discuss their technical ceiling.
        4. AREAS FOR IMPROVEMENT: Who struggled and what tactical advice would you give them?
        
        Use a professional, analytical, and slightly poetic tone (like high-end sports journalism).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          systemInstruction: "You are an elite football scout. Output beautiful, structured reports with clear headings. Do not use markdown bolding (**) for headings, use CAPS and underline style instead." 
        }
      });
      
      setScoutReport(response.text || 'Unable to generate report.');
    } catch (e) {
      console.error(e);
      setScoutReport('The scouting department is currently unavailable. Please try again later.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const goalsA = match.events.filter(e => e.type === 'GOAL' && e.teamId === match.teamA.id);
  const goalsB = match.events.filter(e => e.type === 'GOAL' && e.teamId === match.teamB.id);

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Result Header */}
      <div className="bg-[#0a0f18] rounded-[40px] p-10 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="flex w-full items-center justify-between mb-10">
          <div className="flex-1 flex flex-col items-center">
             <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl border-4 border-white/10 mb-4" style={{ backgroundColor: match.teamA.primaryColor }}>
               <span className="text-white text-5xl font-black italic">T</span>
             </div>
             <div className="text-xl font-black uppercase text-slate-300">{match.teamA.name}</div>
          </div>
          <div className="flex items-center gap-12 relative">
             <span className="text-9xl font-bold display-font text-white leading-none tracking-tighter">{match.score[0]}</span>
             <div className="flex flex-col items-center">
                <div className="bg-slate-800/80 px-4 py-1.5 rounded-lg text-slate-400 font-black text-xs mb-4">FT</div>
                <div className="w-[1px] h-16 bg-gradient-to-b from-slate-700 to-transparent"></div>
             </div>
             <span className="text-9xl font-bold display-font text-white leading-none tracking-tighter">{match.score[1]}</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
             <div className="w-24 h-24 rounded-3xl bg-red-600 flex items-center justify-center shadow-2xl border-4 border-white/10 mb-4" style={{ backgroundColor: match.teamB.primaryColor }}>
               <span className="text-white text-5xl font-black italic">T</span>
             </div>
             <div className="text-xl font-black uppercase text-slate-300">{match.teamB.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 w-full max-w-4xl px-8">
           <div className="space-y-3 text-right">
              {goalsA.map((g, i) => (
                <div key={i} className="group">
                   <div className="font-bold text-slate-200 text-sm group-hover:text-blue-400 transition-colors">{g.player} <span className="text-slate-500 font-normal ml-1">{g.minute}'</span> <i className="fa-solid fa-futbol text-[10px] ml-1"></i></div>
                   {g.assistBy && <div className="text-[10px] text-slate-500 uppercase font-black">ASSIST: {g.assistBy}</div>}
                </div>
              ))}
           </div>
           <div className="space-y-3 text-left">
              {goalsB.map((g, i) => (
                <div key={i} className="group">
                   <div className="font-bold text-slate-200 text-sm group-hover:text-red-400 transition-colors"><i className="fa-solid fa-futbol text-[10px] mr-1"></i> {g.minute}' <span className="text-slate-500 font-normal ml-1">{g.player}</span></div>
                   {g.assistBy && <div className="text-[10px] text-slate-500 uppercase font-black">ASSIST: {g.assistBy}</div>}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex justify-center border-b border-slate-800 gap-8 overflow-x-auto no-scrollbar whitespace-nowrap px-4">
        {[
          { id: 'summary', label: 'MATCH STATS' },
          { id: 'ratings', label: 'PLAYER RATINGS' },
          { id: 'scout', label: 'AI SCOUTING' },
          { id: 'tactical', label: 'SQUADS' },
          { id: 'commentary', label: 'MATCH HISTORY' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 animate-in slide-in-from-left duration-300"></div>}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-[#0a0f18] p-12 rounded-[40px] border border-slate-800">
             <div className="flex flex-col items-center">
                <PossessionGauge value={match.stats.possession[0]} color={match.teamA.primaryColor} />
                <div className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ball Possession</div>
             </div>

             <div className="space-y-6">
                <PostMatchBar label="xG" valA={(match.stats.totalShots[0] * 0.12).toFixed(2)} valB={(match.stats.totalShots[1] * 0.12).toFixed(2)} colorA={match.teamA.primaryColor} colorB={match.teamB.primaryColor} />
                <PostMatchBar label="Shots" valA={match.stats.totalShots[0]} valB={match.stats.totalShots[1]} colorA={match.teamA.primaryColor} colorB={match.teamB.primaryColor} />
                <PostMatchBar label="On Target" valA={match.stats.shotsOnTarget[0]} valB={match.stats.shotsOnTarget[1]} colorA={match.teamA.primaryColor} colorB={match.teamB.primaryColor} />
                <PostMatchBar label="Tackles" valA={match.stats.tackles[0]} valB={match.stats.tackles[1]} colorA={match.teamA.primaryColor} colorB={match.teamB.primaryColor} />
                <PostMatchBar label="Saves" valA={match.stats.saves[0]} valB={match.stats.saves[1]} colorA={match.teamA.primaryColor} colorB={match.teamB.primaryColor} />
             </div>

             <div className="flex flex-col items-center">
                <PossessionGauge value={match.stats.possession[1]} color={match.teamB.primaryColor} />
                <div className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ball Possession</div>
             </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RatingsColumn team={match.teamA} />
            <RatingsColumn team={match.teamB} />
          </div>
        )}

        {activeTab === 'scout' && (
          <div className="bg-[#0a0f18] p-10 rounded-[40px] border border-slate-800 relative min-h-[500px]">
            {isGeneratingReport ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Analyzing Performance</h3>
                  <p className="text-blue-400 font-mono text-xs">{loadingMessages[loadingStep]}</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase m-0">TECHNICAL SCOUTING REPORT</h2>
                </div>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium font-sans">
                  {scoutReport}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tactical' && (
          <div className="h-[750px] w-full bg-[#0a0f18] p-8 rounded-[40px] border border-slate-800">
            <TacticalBoard teamA={match.teamA} teamB={match.teamB} showRatings={true} events={match.events} />
          </div>
        )}

        {activeTab === 'commentary' && (
           <div className="bg-[#0a0f18] p-10 rounded-[40px] border border-slate-800 h-[600px] overflow-y-auto no-scrollbar">
              <h3 className="text-xl font-black italic text-slate-400 mb-8 border-b border-slate-800 pb-4 uppercase tracking-tighter">MATCH CHRONICLE</h3>
              <div className="space-y-6">
                 {match.events.map((e, idx) => (
                    <div key={idx} className="flex gap-6 border-b border-slate-900 pb-4 group">
                       <span className="font-mono text-sm font-bold text-slate-600 w-12 group-hover:text-blue-500 transition-colors">{e.minute}'</span>
                       <div className="flex-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mr-2 ${e.type === 'GOAL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{e.type}</span>
                          <p className="text-slate-300 text-sm mt-1">{e.description}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button onClick={onRestart} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
          <i className="fa-solid fa-rotate-right"></i> Instant Rematch
        </button>
        {onAdjustTactics && (
          <button onClick={onAdjustTactics} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
            <i className="fa-solid fa-sliders"></i> Adjust Tactics
          </button>
        )}
        <button onClick={onReset} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-4 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95">
          Return to Hub
        </button>
      </div>
    </div>
  );
};

const PossessionGauge = ({ value, color }: { value: number, color: string }) => {
    const size = 160;
    const stroke = 12;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} stroke="#1e293b" strokeWidth={stroke} fill="transparent" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold display-font">{Math.round(value)}</span>
                <span className="text-xs font-bold text-slate-600">%</span>
            </div>
        </div>
    );
};

const PostMatchBar = ({ label, valA, valB, colorA, colorB }: any) => {
    const total = Number(valA) + Number(valB);
    const percA = total === 0 ? 50 : (Number(valA) / total) * 100;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1 font-bold">
                <span className="text-sm text-slate-200">{valA}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{label}</span>
                <span className="text-sm text-slate-200">{valB}</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full flex overflow-hidden">
                <div className="h-full transition-all duration-1000" style={{ width: `${percA}%`, backgroundColor: colorA }}></div>
                <div className="h-full transition-all duration-1000" style={{ width: `${100-percA}%`, backgroundColor: colorB }}></div>
            </div>
        </div>
    );
};

const RatingsColumn = ({ team }: { team: Team }) => (
    <div className="space-y-3 bg-[#0a0f18] p-6 rounded-[40px] border border-slate-800">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2 mb-4">{team.name} Ratings</h3>
        {team.starters.map(player => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">{player.name}</span>
                    <span className="text-[9px] text-slate-500 font-black uppercase">{player.position}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {player.matchStats.goals > 0 && <span className="bg-emerald-900/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-900/50">{player.matchStats.goals}G</span>}
                        {player.matchStats.assists > 0 && <span className="bg-blue-900/30 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-900/50">{player.matchStats.assists}A</span>}
                    </div>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${getRatingColor(player.matchStats.rating)}`}>
                        {player.matchStats.rating.toFixed(1)}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default PostMatch;
