export interface Player {
  _id: string;
  name: string;
  team: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  currentPrice: number;
  initialPrice: number;
  imageUrl?: string;
  stats: PlayerStats[];
  totalROI: number;
  popularity: number;
  priceChangePercent: number;
  lastUpdated: string;
}

export interface PlayerStats {
  matchweek: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating: number;
  roi: number;
}

export interface PortfolioItem {
  player: Player;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  roi: number;
}

export interface Portfolio {
  _id: string;
  user: string;
  holdings: PortfolioItem[];
  totalValue: number;
  totalInvested: number;
  totalROI: number;
  lastUpdated: string;
}

export interface Transaction {
  _id: string;
  user: string;
  player: Player;
  type: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalWealth: number;
  portfolioValue: number;
  cashBalance: number;
  totalROI: number;
  totalInvested: number;
  holdingsCount: number;
}

export interface MarketStats {
  stats: {
    totalPlayers: number;
    totalMarketValue: number;
  };
  topPerformers: Player[];
  topGainers: Player[];
  mostPopular: Player[];
}
