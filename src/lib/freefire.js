import { getRankFromPoints } from '../utils/ranks';
import { calculateAccountAge } from '../utils/helpers';

const DEFAULT_FF_URL = 'https://siambhau69.eu.cc/freefireinfo/bhau';
const DEFAULT_KEY = 'techtrix:FFINFO:ROM';

/**
 * Fetch Free Fire player info by game UID
 * @param {string} uid 
 * @param {string} region (default IND)
 * @returns {Promise<object>}
 */
export async function fetchFreeFirePlayer(uid, region = 'IND') {
  const cleanUid = String(uid).trim();
  if (!cleanUid) {
    throw new Error('Please enter a valid Game UID');
  }

  const baseUrl = import.meta.env.VITE_FF_API_URL || DEFAULT_FF_URL;
  const key = import.meta.env.VITE_FF_API_KEY || DEFAULT_KEY;
  const url = `${baseUrl}?uid=${encodeURIComponent(cleanUid)}&region=${encodeURIComponent(region)}&key=${encodeURIComponent(key)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Player verification service returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.basicInfo) {
      throw new Error('Player not found or profile is private. Please verify the UID.');
    }

    const basic = data.basicInfo;
    const rankingPoints = Number(basic.rankingPoints) || 0;
    const rankInfo = getRankFromPoints(rankingPoints);

    return {
      accountId: basic.accountId || cleanUid,
      nickname: basic.nickname || 'Unknown Player',
      region: basic.region || region,
      level: Number(basic.level) || 1,
      rank: basic.rank || 0,
      rankingPoints: rankingPoints,
      liked: Number(basic.liked) || 0,
      lastLoginAt: basic.lastLoginAt,
      createAt: basic.createAt,
      accountAge: calculateAccountAge(basic.createAt),
      rankInfo: rankInfo,
      rankName: rankInfo.name,
      avatarId: data.profileInfo?.avatarId || null,
      raw: data,
    };
  } catch (error) {
    console.error('Free Fire player fetch failed:', error);
    throw error;
  }
}
