
import { Position } from '../types';

export interface PlayerCoord {
  x: number; // horizontal % (0-100)
  y: number; // vertical % (0-100)
}

export const getFormationCoords = (formationStr: string, isTeamA: boolean): PlayerCoord[] => {
  const parts = formationStr.split('-').map(Number);
  const coords: PlayerCoord[] = [];

  // In landscape mode: 
  // Team A (Left) Goal at x=5, attacks towards x=100
  // Team B (Right) Goal at x=95, attacks towards x=0
  
  const horizontalMargin = 6;
  const usableWidth = 42; // Width allocated for each team's field half

  // GK placement
  coords.push({
    x: isTeamA ? horizontalMargin : 100 - horizontalMargin,
    y: 50
  });

  // Rows (Defense, Midfield, Attack)
  parts.forEach((rowCount, rowIndex) => {
    // Determine the x position for this vertical row (line)
    // Row 0 is DEF, closest to goal. Row N is ATT, furthest.
    const step = usableWidth / (parts.length + 0.5);
    const lineX = isTeamA 
      ? horizontalMargin + (rowIndex + 1) * step
      : (100 - horizontalMargin) - (rowIndex + 1) * step;

    for (let i = 0; i < rowCount; i++) {
      // Determine vertical Y position for each player in the row
      const verticalY = (100 / (rowCount + 1)) * (i + 1);
      coords.push({ x: lineX, y: verticalY });
    }
  });

  return coords;
};
