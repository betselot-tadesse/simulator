
import { Player, PlayerMatchStats } from '../types';

/**
 * Calculates a raw performance score based on the updated formula.
 * Base rating = 6.8
 */
export const calculateIndividualRawRating = (player: Player, isWinner: boolean, isLoser: boolean): number => {
  const stats = player.matchStats;
  let rating = 6.8; // Base Rating

  // 1. Core Stat Impacts (Updated Weights)
  rating += stats.goals * 2.0;
  rating += stats.assists * 1.5;
  rating += stats.shotsOnTarget * 0.35;
  rating += stats.tackles * 0.20;
  rating += stats.interceptions * 0.20;
  rating += stats.saves * 0.15;

  // 2. Performance Variance Amplifier
  const performanceScore = (stats.goals * 3) + (stats.assists * 2) + (stats.shotsOnTarget) + (stats.tackles * 0.5);
  rating += performanceScore * 0.05;

  // 3. Role-based Expectation Adjustments
  // Defenders and CDMs with low activity
  const defensiveRoles = ['LB', 'CB', 'RB', 'CDM'];
  if (defensiveRoles.includes(player.position)) {
    if ((stats.tackles + stats.interceptions) < 2) {
      rating -= 0.3;
    }
  }

  // Offensive roles with no threat
  const offensiveRoles = ['ST', 'LW', 'RW', 'CAM'];
  if (offensiveRoles.includes(player.position)) {
    if (stats.shots === 0) {
      rating -= 0.3;
    }
  }

  // 4. Standard Penalties
  rating -= stats.errors * 1.5; // Heavy penalty for major errors
  rating -= stats.yellowCards * 0.3;
  
  // Defensive Conceded Goal Penalty
  const backlinePositions = ['GK', 'LB', 'CB', 'RB'];
  if (backlinePositions.includes(player.position)) {
    rating -= stats.concededGoals * 0.15;
  }

  // 5. Result Modifiers
  if (isWinner) rating += 0.5;
  if (isLoser) rating -= 0.2;

  return rating;
};

/**
 * Finalizes team ratings.
 * If team average falls below 6.6, it normalizes up to ~6.8.
 * Clamps all ratings between 4.0 and 10.0.
 */
export const calculateTeamRatings = (
  players: Player[], 
  isWinner: boolean, 
  isLoser: boolean
): void => {
  if (players.length === 0) return;

  // 1. Calculate raw individual ratings
  const rawRatings = players.map(p => calculateIndividualRawRating(p, isWinner, isLoser));
  
  // 2. Calculate current team average
  const currentAvg = rawRatings.reduce((a, b) => a + b, 0) / players.length;
  
  // 3. Normalization logic: Only if team average < 6.6, adjust to ~6.8
  let offset = 0;
  if (currentAvg < 6.6) {
    offset = 6.8 - currentAvg;
  }

  // 4. Apply final scores and clamp 4.0 - 10.0
  players.forEach((p, i) => {
    let finalRating = rawRatings[i] + offset;
    p.matchStats.rating = Math.min(10.0, Math.max(4.0, finalRating));
  });
};

/**
 * Returns CSS classes for player rating backgrounds based on FotMob style.
 * Thresholds (rounded to 1 decimal place):
 * < 6.2 -> Red
 * 6.2 - 6.9 -> Orange
 * 7.0 - 8.2 -> Green
 * 8.3 - 8.9 -> Blue
 * 9.0+ -> Bold Blue
 */
export const getRatingColor = (rating: number): string => {
  // Round to match the displayed value in the UI (toFixed(1))
  const r = Math.round(rating * 10) / 10;

  if (r >= 9.0) {
    return 'bg-blue-800 text-white font-black';
  }
  if (r >= 8.3) {
    return 'bg-blue-600 text-white font-bold';
  }
  if (r >= 7.0) {
    return 'bg-[#43a047] text-white font-bold';
  }
  if (r >= 6.2) {
    return 'bg-[#fb8c00] text-white font-bold';
  }
  return 'bg-[#e53935] text-white font-bold';
};
