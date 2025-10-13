import { Request, Response } from 'express';
import Portfolio from '../models/Portfolio';
import User from '../models/User';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100 } = req.query;

    // Get all portfolios with user info and calculate total value
    const portfolios = await Portfolio.find()
      .populate({
        path: 'user',
        select: 'username email balance createdAt'
      })
      .populate({
        path: 'holdings.player',
        select: 'name currentPrice'
      })
      .lean();

    // Calculate total wealth (portfolio value + cash balance) for each user
    const leaderboardData = portfolios.map((portfolio: any) => {
      const user = portfolio.user;

      // Calculate current portfolio value
      let portfolioValue = 0;
      if (portfolio.holdings && portfolio.holdings.length > 0) {
        portfolioValue = portfolio.holdings.reduce((sum: number, holding: any) => {
          return sum + (holding.player.currentPrice * holding.quantity);
        }, 0);
      }

      const totalWealth = portfolioValue + user.balance;
      const totalROI = portfolio.totalInvested > 0
        ? ((portfolioValue - portfolio.totalInvested) / portfolio.totalInvested) * 100
        : 0;

      return {
        userId: user._id,
        username: user.username,
        totalWealth,
        portfolioValue,
        cashBalance: user.balance,
        totalROI,
        totalInvested: portfolio.totalInvested,
        holdingsCount: portfolio.holdings ? portfolio.holdings.length : 0
      };
    });

    // Sort by total wealth (descending)
    leaderboardData.sort((a, b) => b.totalWealth - a.totalWealth);

    // Add rank
    const rankedLeaderboard = leaderboardData.slice(0, Number(limit)).map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json({
      leaderboard: rankedLeaderboard,
      total: portfolios.length
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get all users and their total wealth
    const portfolios = await Portfolio.find()
      .populate({
        path: 'user',
        select: 'balance'
      })
      .populate({
        path: 'holdings.player',
        select: 'currentPrice'
      })
      .lean();

    const wealthData = portfolios.map((portfolio: any) => {
      const portfolioValue = portfolio.holdings.reduce((sum: number, holding: any) => {
        return sum + (holding.player.currentPrice * holding.quantity);
      }, 0);

      return {
        userId: portfolio.user._id.toString(),
        totalWealth: portfolioValue + portfolio.user.balance
      };
    });

    // Sort by total wealth
    wealthData.sort((a, b) => b.totalWealth - a.totalWealth);

    // Find user's rank
    const userRankData = wealthData.find(data => data.userId === userId);
    const rank = userRankData ? wealthData.indexOf(userRankData) + 1 : null;

    res.json({
      rank,
      totalUsers: wealthData.length,
      totalWealth: userRankData?.totalWealth || 0
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ message: 'Failed to fetch user rank' });
  }
};
