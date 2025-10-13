import { IPlayerStats } from '../models/Player';

/**
 * Calculate ROI based on player performance
 * Formula considers goals, assists, clean sheets, cards, minutes, and rating
 */
export const calculateMatchweekROI = (stats: IPlayerStats, position: string): number => {
  let roi = 0;

  // Goals (weighted by position)
  const goalWeight = {
    'GK': 15,
    'DEF': 10,
    'MID': 7,
    'FWD': 5
  };
  roi += stats.goals * (goalWeight[position as keyof typeof goalWeight] || 5);

  // Assists
  roi += stats.assists * 5;

  // Clean sheet (mainly for defenders and goalkeepers)
  if (stats.cleanSheet) {
    if (position === 'GK' || position === 'DEF') {
      roi += 8;
    } else if (position === 'MID') {
      roi += 3;
    }
  }

  // Minutes played (participation bonus)
  if (stats.minutesPlayed >= 90) {
    roi += 3;
  } else if (stats.minutesPlayed >= 60) {
    roi += 2;
  } else if (stats.minutesPlayed >= 30) {
    roi += 1;
  }

  // Rating bonus
  if (stats.rating >= 9) {
    roi += 10;
  } else if (stats.rating >= 8) {
    roi += 7;
  } else if (stats.rating >= 7) {
    roi += 4;
  } else if (stats.rating >= 6) {
    roi += 2;
  }

  // Penalties
  roi -= stats.yellowCards * 2;
  roi -= stats.redCards * 10;

  // If player didn't play, negative ROI
  if (stats.minutesPlayed === 0) {
    roi = -5;
  }

  return Math.round(roi * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate price change based on ROI
 */
export const calculatePriceChange = (currentPrice: number, roi: number): number => {
  // Price changes by a percentage of ROI
  const priceChangePercent = roi * 0.5; // 50% of ROI affects price
  const priceChange = (currentPrice * priceChangePercent) / 100;

  // Cap price changes to prevent extreme fluctuations
  const maxChange = currentPrice * 0.25; // Max 25% change per matchweek
  const cappedChange = Math.max(-maxChange, Math.min(maxChange, priceChange));

  return Math.round(cappedChange * 100) / 100;
};

/**
 * Update player price based on matchweek performance
 */
export const updatePlayerPrice = (
  currentPrice: number,
  roi: number,
  popularity: number
): { newPrice: number; priceChangePercent: number } => {
  let priceChange = calculatePriceChange(currentPrice, roi);

  // Popularity factor (high demand increases price)
  const popularityFactor = Math.min(popularity / 100, 0.5); // Max 50% additional change
  priceChange *= (1 + popularityFactor);

  const newPrice = Math.max(50, currentPrice + priceChange); // Minimum price of 50
  const priceChangePercent = ((newPrice - currentPrice) / currentPrice) * 100;

  return {
    newPrice: Math.round(newPrice * 100) / 100,
    priceChangePercent: Math.round(priceChangePercent * 100) / 100
  };
};
