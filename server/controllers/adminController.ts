import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Player from '../models/Player';
import Matchweek from '../models/Matchweek';
import Portfolio from '../models/Portfolio';
import { calculateMatchweekROI, updatePlayerPrice } from '../utils/roiCalculator';

export const createPlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, team, position, price, imageUrl } = req.body;

    if (!name || !team || !position || !price) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const player = await Player.create({
      name,
      team,
      position,
      currentPrice: price,
      initialPrice: price,
      imageUrl: imageUrl || '',
      stats: [],
      totalROI: 0,
      popularity: 0,
      priceChangePercent: 0
    });

    res.status(201).json({
      message: 'Player created successfully',
      player
    });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ message: 'Failed to create player' });
  }
};

export const updatePlayerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;
    const { matchweek, goals, assists, cleanSheet, yellowCards, redCards, minutesPlayed, rating } = req.body;

    const player = await Player.findById(playerId);

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    // Calculate ROI for this matchweek
    const statsData = {
      matchweek,
      goals: goals || 0,
      assists: assists || 0,
      cleanSheet: cleanSheet || false,
      yellowCards: yellowCards || 0,
      redCards: redCards || 0,
      minutesPlayed: minutesPlayed || 0,
      rating: rating || 0,
      roi: 0
    };

    statsData.roi = calculateMatchweekROI(statsData, player.position);

    // Check if stats for this matchweek already exist
    const existingStatsIndex = player.stats.findIndex(s => s.matchweek === matchweek);

    if (existingStatsIndex !== -1) {
      // Update existing stats
      player.stats[existingStatsIndex] = statsData;
    } else {
      // Add new stats
      player.stats.push(statsData);
    }

    // Update total ROI
    player.totalROI = player.stats.reduce((sum, s) => sum + s.roi, 0);

    // Update price based on performance
    const { newPrice, priceChangePercent } = updatePlayerPrice(
      player.currentPrice,
      statsData.roi,
      player.popularity
    );

    player.currentPrice = newPrice;
    player.priceChangePercent = priceChangePercent;
    player.lastUpdated = new Date();

    await player.save();

    res.json({
      message: 'Player stats updated successfully',
      player,
      matchweekROI: statsData.roi,
      priceChange: priceChangePercent
    });
  } catch (error) {
    console.error('Update player stats error:', error);
    res.status(500).json({ message: 'Failed to update player stats' });
  }
};

export const createMatchweek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weekNumber, startDate, endDate } = req.body;

    if (!weekNumber || !startDate || !endDate) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Deactivate all other matchweeks
    await Matchweek.updateMany({}, { isActive: false });

    const matchweek = await Matchweek.create({
      weekNumber,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
      isCompleted: false
    });

    res.status(201).json({
      message: 'Matchweek created successfully',
      matchweek
    });
  } catch (error) {
    console.error('Create matchweek error:', error);
    res.status(500).json({ message: 'Failed to create matchweek' });
  }
};

export const completeMatchweek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weekNumber } = req.params;

    const matchweek = await Matchweek.findOne({ weekNumber: Number(weekNumber) });

    if (!matchweek) {
      res.status(404).json({ message: 'Matchweek not found' });
      return;
    }

    matchweek.isCompleted = true;
    matchweek.isActive = false;
    await matchweek.save();

    // Update all portfolios with new values
    await updateAllPortfolios();

    res.json({
      message: 'Matchweek completed successfully',
      matchweek
    });
  } catch (error) {
    console.error('Complete matchweek error:', error);
    res.status(500).json({ message: 'Failed to complete matchweek' });
  }
};

export const getActiveMatchweek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchweek = await Matchweek.findOne({ isActive: true });

    res.json({ matchweek });
  } catch (error) {
    console.error('Get active matchweek error:', error);
    res.status(500).json({ message: 'Failed to fetch active matchweek' });
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;
    const updates = req.body;

    const player = await Player.findByIdAndUpdate(
      playerId,
      { ...updates, lastUpdated: new Date() },
      { new: true }
    );

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    res.json({
      message: 'Player updated successfully',
      player
    });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ message: 'Failed to update player' });
  }
};

export const deletePlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;

    const player = await Player.findByIdAndDelete(playerId);

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ message: 'Failed to delete player' });
  }
};

// Helper function to update all portfolios
async function updateAllPortfolios(): Promise<void> {
  const portfolios = await Portfolio.find().populate('holdings.player');

  for (const portfolio of portfolios) {
    let totalValue = 0;

    for (const holding of portfolio.holdings as any[]) {
      const player = holding.player;
      totalValue += player.currentPrice * holding.quantity;
    }

    portfolio.totalValue = totalValue;
    portfolio.lastUpdated = new Date();
    await portfolio.save();
  }
}
