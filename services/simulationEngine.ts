
import { Team, Player, MatchEvent, MatchStats } from '../types';
import { commentaryEngine } from './commentaryService';

const SCORER_ROLE_FACTORS: Record<string, number> = {
  ST: 1.5,
  LW: 1.3,
  RW: 1.3,
  CAM: 1.2,
  CM: 1.0,
  CDM: 0.6,
  LB: 0.3,
  RB: 0.3,
  CB: 0.1,
  GK: 0
};

const ASSIST_ROLE_FACTORS: Record<string, number> = {
  CAM: 1.5,
  CM: 1.3,
  LW: 1.2,
  RW: 1.2,
  CDM: 1.1,
  ST: 0.6,
  LB: 0.7,
  RB: 0.7,
  CB: 0.2,
  GK: 0
};

export const runSimulationStep = (
  minute: number,
  teamA: Team,
  teamB: Team,
  stats: MatchStats,
  events: MatchEvent[]
) => {
  const getPassingPower = (team: Team) => team.starters.reduce((a, p) => a + Math.pow(p.passing, 3), 0);
  const passA = getPassingPower(teamA);
  const passB = getPassingPower(teamB);
  
  const possessionProbA = passA / (passA + passB || 1);
  stats.possession[0] = (stats.possession[0] * minute + possessionProbA * 100) / (minute + 1);
  stats.possession[1] = 100 - stats.possession[0];

  const attackingTeam = Math.random() < possessionProbA ? teamA : teamB;
  const defendingTeam = attackingTeam === teamA ? teamB : teamA;
  const attackingIdx = attackingTeam === teamA ? 0 : 1;
  const defendingIdx = attackingTeam === teamA ? 1 : 0;

  const goalsA = events.filter(e => e.type === 'GOAL' && e.teamId === teamA.id).length;
  const goalsB = events.filter(e => e.type === 'GOAL' && e.teamId === teamB.id).length;
  const totalGoals = goalsA + goalsB;
  const currentScore: [number, number] = [goalsA, goalsB];

  // --- 1. Base Chance Logic ---
  let baseChancePerMinute = 0.12;
  if (minute > 70) baseChancePerMinute += 0.03;

  // --- 2. Discipline & General Defensive Events ---
  const rollMisc = Math.random();
  
  // Occasional Defensive Interventions (Tackles/Interceptions)
  if (rollMisc < 0.15) {
    const defender = defendingTeam.starters[Math.floor(Math.random() * 11)];
    const defActionRoll = Math.random();
    
    if (defActionRoll < 0.4) {
      // Tackle
      defender.matchStats.tackles++;
      stats.tackles[defendingIdx]++;
      const tackleType = Math.random() < 0.4 ? 'TACKLE_SLIDING' : 'TACKLE_STANDING';
      events.push({
        minute, type: 'TACKLE', player: defender.name, teamId: defendingTeam.id,
        description: commentaryEngine.generateMiscCommentary(tackleType, defender)
      });
    } else if (defActionRoll < 0.8) {
      // Interception
      defender.matchStats.interceptions++;
      stats.interceptions[defendingIdx]++;
      const interceptType = Math.random() < 0.5 ? 'INTERCEPTION_CLEARED' : 'INTERCEPTION_READ';
      events.push({
        minute, type: 'INTERCEPTION', player: defender.name, teamId: defendingTeam.id,
        description: commentaryEngine.generateMiscCommentary(interceptType, defender)
      });
    }
  }

  // Cards & Discipline
  if (rollMisc < 0.01) { 
    const player = defendingTeam.starters[Math.floor(Math.random() * 11)];
    if (player.position !== 'GK') {
      if (player.matchStats.yellowCards > 0 && Math.random() < 0.1) {
          player.matchStats.redCards++;
          events.push({
            minute, type: 'RED_CARD', player: player.name, teamId: defendingTeam.id,
            description: commentaryEngine.generateMiscCommentary('RED_CARD', player)
          });
      } else if (player.matchStats.yellowCards === 0) {
          player.matchStats.yellowCards++;
          events.push({
            minute, type: 'YELLOW_CARD', player: player.name, teamId: defendingTeam.id,
            description: commentaryEngine.generateMiscCommentary('YELLOW_CARD', player)
          });
      }
    }
  }

  // --- 3. Main Chance/Shot Logic ---
  if (Math.random() < baseChancePerMinute) {
    stats.totalShots[attackingIdx]++;
    
    // Scorer Selection Weighting
    const shooterPool = attackingTeam.starters.map(p => {
      const baseWeight = p.attack * 1.2 + p.passing * 0.3;
      const roleFactor = SCORER_ROLE_FACTORS[p.position] || 0;
      return { player: p, weight: Math.pow(baseWeight, 3) * roleFactor };
    }).filter(item => item.weight > 0);

    if (shooterPool.length === 0) return;

    const totalShooterWeight = shooterPool.reduce((acc, item) => acc + item.weight, 0);
    let sr = Math.random() * totalShooterWeight;
    let shooter = shooterPool[0].player;
    for (const item of shooterPool) {
      sr -= item.weight;
      if (sr <= 0) {
        shooter = item.player;
        break;
      }
    }
    shooter.matchStats.shots++;

    // Scoring Quality Logic
    const teamAttack = attackingTeam.starters.reduce((a, p) => a + p.attack, 0);
    const opponentDefense = defendingTeam.starters.reduce((a, p) => a + p.defense, 0);
    
    let chanceQuality = teamAttack / (teamAttack + opponentDefense);
    let goalProb = Math.min(0.30, chanceQuality * 0.35);

    if (totalGoals >= 4) goalProb *= 0.60;
    const attackingLead = currentScore[attackingIdx] - currentScore[defendingIdx];
    if (attackingLead >= 2) goalProb *= 0.70;

    if (Math.random() < goalProb) {
      // Goal logic
      shooter.matchStats.goals++;
      stats.shotsOnTarget[attackingIdx]++;
      
      let helper: Player | undefined;
      const assistPool = attackingTeam.starters
        .filter(p => p.id !== shooter.id)
        .map(p => {
          const roleAssistFactor = ASSIST_ROLE_FACTORS[p.position] || 0;
          return { player: p, weight: Math.pow(p.passing, 3) * roleAssistFactor };
        })
        .filter(item => item.weight > 0);

      if (assistPool.length > 0 && Math.random() < 0.8) {
        const totalAssistWeight = assistPool.reduce((acc, item) => acc + item.weight, 0);
        let ar = Math.random() * totalAssistWeight;
        for (const item of assistPool) {
          ar -= item.weight;
          if (ar <= 0) {
            helper = item.player;
            break;
          }
        }
        if (helper) helper.matchStats.assists++;
      }
      
      const newScore: [number, number] = [...currentScore];
      newScore[attackingIdx]++;

      const goalTypeRoll = Math.random();
      let gType: 'HEADER' | 'LONG_RANGE' | 'SOLO' | 'SET_PIECE' | 'TAPPED' = 'TAPPED';
      if (goalTypeRoll < 0.15) gType = 'HEADER';
      else if (goalTypeRoll < 0.3) gType = 'LONG_RANGE';
      else if (goalTypeRoll < 0.45) gType = 'SOLO';
      else if (goalTypeRoll < 0.6) gType = 'SET_PIECE';

      events.push({
        minute, type: 'GOAL', player: shooter.name, teamId: attackingTeam.id,
        description: commentaryEngine.generateGoalCommentary(shooter, attackingTeam, minute, newScore, stats, gType, helper?.name),
        assistBy: helper?.name
      });
    } else {
      // Save / Block / Miss logic
      const gk = defendingTeam.starters.find(p => p.position === 'GK') || defendingTeam.starters[0];
      const outcomeRoll = Math.random();
      
      if (outcomeRoll < 0.5) {
        // SAVED
        stats.shotsOnTarget[attackingIdx]++;
        gk.matchStats.saves++;
        stats.saves[defendingIdx]++;
        const saveType = Math.random() < 0.3 ? 'FEET' : 'CRUCIAL';
        events.push({ 
          minute, type: 'SAVE', player: gk.name, teamId: defendingTeam.id, 
          description: commentaryEngine.generateSaveCommentary(gk, saveType) 
        });
      } else if (outcomeRoll < 0.75) {
        // BLOCKED by a defender
        const blockDefender = defendingTeam.starters[Math.floor(Math.random() * 11)];
        blockDefender.matchStats.blocks++;
        events.push({ 
          minute, type: 'TACKLE', player: blockDefender.name, teamId: defendingTeam.id, 
          description: commentaryEngine.generateMiscCommentary('BLOCKED', shooter) 
        });
      } else {
        // MISSED (NARROW, SKYED, etc.)
        const missTypes = ['NARROW', 'SKYED', 'WOODWORK'];
        const missType = missTypes[Math.floor(Math.random() * missTypes.length)];
        events.push({ 
          minute, type: 'SHOT', player: shooter.name, teamId: attackingTeam.id, 
          description: commentaryEngine.generateMiscCommentary(missType, shooter) 
        });
      }
    }
  }

  // Passive stamina drain
  [teamA, teamB].forEach(team => team.starters.forEach(p => { p.stamina -= 0.4; }));
};
