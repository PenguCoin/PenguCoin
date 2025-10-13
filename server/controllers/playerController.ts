import { Request, Response } from 'express';
import Player from '../models/Player';
import Portfolio from '../models/Portfolio';

export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position, team, sort = '-totalROI' } = req.query;

    const filter: any = {};
    if (position) filter.position = position;
    if (team) filter.team = team;

    const players = await Player.find(filter).sort(sort as string);

    res.json({ players });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ message: 'Failed to fetch players' });
  }
};

export const getPlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const player = await Player.findById(id);

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    res.json({ player });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ message: 'Failed to fetch player' });
  }
};

export const getMarketStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalPlayers = await Player.countDocuments();
    const totalValue = await Player.aggregate([
      { $group: { _id: null, total: { $sum: '$currentPrice' } } }
    ]);

    const topPerformers = await Player.find()
      .sort('-totalROI')
      .limit(5)
      .select('name team position currentPrice totalROI imageUrl');

    const topGainers = await Player.find()
      .sort('-priceChangePercent')
      .limit(5)
      .select('name team position currentPrice priceChangePercent imageUrl');

    const mostPopular = await Player.find()
      .sort('-popularity')
      .limit(5)
      .select('name team position currentPrice popularity imageUrl');

    res.json({
      stats: {
        totalPlayers,
        totalMarketValue: totalValue[0]?.total || 0
      },
      topPerformers,
      topGainers,
      mostPopular
    });
  } catch (error) {
    console.error('Get market stats error:', error);
    res.status(500).json({ message: 'Failed to fetch market stats' });
  }
};

export const searchPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ message: 'Search query required' });
      return;
    }

    const players = await Player.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { team: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json({ players });
  } catch (error) {
    console.error('Search players error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
