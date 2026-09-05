// Free Fire BR Rank tier definitions and point ranges
export const BR_RANKS = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 1299,
    color: '#CD7F32',
    bgColor: 'rgba(205, 127, 50, 0.12)',
    borderColor: '#CD7F32',
  },
  {
    name: 'Silver',
    minPoints: 1300,
    maxPoints: 1599,
    color: '#8A9BA8',
    bgColor: 'rgba(138, 155, 168, 0.12)',
    borderColor: '#8A9BA8',
  },
  {
    name: 'Gold',
    minPoints: 1600,
    maxPoints: 2099,
    color: '#E5A93C',
    bgColor: 'rgba(229, 169, 60, 0.15)',
    borderColor: '#E5A93C',
  },
  {
    name: 'Platinum',
    minPoints: 2100,
    maxPoints: 2749,
    color: '#00CEC9',
    bgColor: 'rgba(0, 206, 201, 0.12)',
    borderColor: '#00CEC9',
  },
  {
    name: 'Diamond',
    minPoints: 2750,
    maxPoints: 3499,
    color: '#6C5CE7',
    bgColor: 'rgba(108, 92, 231, 0.12)',
    borderColor: '#6C5CE7',
  },
  {
    name: 'Heroic',
    minPoints: 3500,
    maxPoints: 4299,
    color: '#D63031',
    bgColor: 'rgba(214, 48, 49, 0.12)',
    borderColor: '#D63031',
  },
  {
    name: 'Elite Heroic',
    minPoints: 4300,
    maxPoints: 7099,
    color: '#E84393',
    bgColor: 'rgba(232, 67, 147, 0.12)',
    borderColor: '#E84393',
  },
  {
    name: 'Master',
    minPoints: 7100,
    maxPoints: 8999,
    color: '#6C5CE7',
    bgColor: 'rgba(108, 92, 231, 0.18)',
    borderColor: '#A29BFE',
  },
  {
    name: 'Elite Master',
    minPoints: 9000,
    maxPoints: 999999,
    color: '#FD79A8',
    bgColor: 'rgba(253, 121, 168, 0.2)',
    borderColor: '#FD79A8',
  },
];

export const RANK_NAMES = BR_RANKS.map((r) => r.name);

/**
 * Returns the matching rank object based on ranking points
 * @param {number} points 
 * @returns {object}
 */
export function getRankFromPoints(points) {
  const pts = Number(points) || 0;
  for (let i = BR_RANKS.length - 1; i >= 0; i--) {
    if (pts >= BR_RANKS[i].minPoints) {
      return BR_RANKS[i];
    }
  }
  return BR_RANKS[0];
}

/**
 * Returns the minimum points needed for a given rank name
 * @param {string} rankName 
 * @returns {number}
 */
export function getMinPointsForRank(rankName) {
  const match = BR_RANKS.find((r) => r.name.toLowerCase() === (rankName || '').toLowerCase());
  return match ? match.minPoints : 0;
}

/**
 * Checks if a player's points meet the minimum rank criteria
 * @param {number} playerPoints 
 * @param {string} requiredRankName 
 * @returns {boolean}
 */
export function isEligibleRank(playerPoints, requiredRankName) {
  if (!requiredRankName) return true;
  const requiredMinPoints = getMinPointsForRank(requiredRankName);
  return (Number(playerPoints) || 0) >= requiredMinPoints;
}
