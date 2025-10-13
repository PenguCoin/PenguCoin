import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Portfolio from '../models/Portfolio';
import Player from '../models/Player';
import User from '../models/User';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user?.id }).populate({
      path: 'holdings.player',
      select: 'name team position currentPrice imageUrl totalROI'
    });

    if (!portfolio) {
      res.status(404).json({ message: 'Portfolio not found' });
      return;
    }

    // Calculate current values and ROI
    let totalValue = 0;
    const updatedHoldings = portfolio.holdings.map((holding: any) => {
      const player = holding.player;
      const currentValue = player.currentPrice * holding.quantity;
      const invested = holding.purchasePrice * holding.quantity;
      const roi = ((currentValue - invested) / invested) * 100;

      totalValue += currentValue;

      return {
        ...holding.toObject(),
        currentValue,
        roi
      };
    });

    const totalROI = portfolio.totalInvested > 0
      ? ((totalValue - portfolio.totalInvested) / portfolio.totalInvested) * 100
      : 0;

    res.json({
      portfolio: {
        ...portfolio.toObject(),
        holdings: updatedHoldings,
        totalValue,
        totalROI
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};

export const buyPlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { playerId, quantity } = req.body;

    if (!playerId || !quantity || quantity < 1) {
      await session.abortTransaction();
      res.status(400).json({ message: 'Invalid request' });
      return;
    }

    // Get user, player, and portfolio
    const [user, player, portfolio] = await Promise.all([
      User.findById(req.user?.id).session(session),
      Player.findById(playerId).session(session),
      Portfolio.findOne({ user: req.user?.id }).session(session)
    ]);

    if (!user || !player || !portfolio) {
      await session.abortTransaction();
      res.status(404).json({ message: 'User, player, or portfolio not found' });
      return;
    }

    const totalCost = player.currentPrice * quantity;

    // Check if user has enough balance
    if (user.balance < totalCost) {
      await session.abortTransaction();
      res.status(400).json({ message: 'Insufficient balance' });
      return;
    }

    // Update user balance
    const balanceBefore = user.balance;
    user.balance -= totalCost;
    await user.save({ session });

    // Check if player already in portfolio
    const existingHolding = portfolio.holdings.find(
      (h: any) => h.player.toString() === playerId
    );

    if (existingHolding) {
      // Update existing holding (weighted average price)
      const totalQuantity = existingHolding.quantity + quantity;
      const totalInvestment = (existingHolding.purchasePrice * existingHolding.quantity) + totalCost;
      existingHolding.purchasePrice = totalInvestment / totalQuantity;
      existingHolding.quantity = totalQuantity;
      existingHolding.purchaseDate = new Date();
    } else {
      // Add new holding
      portfolio.holdings.push({
        player: player._id,
        quantity,
        purchasePrice: player.currentPrice,
        purchaseDate: new Date(),
        currentValue: totalCost,
        roi: 0
      } as any);
    }

    portfolio.totalInvested += totalCost;
    portfolio.lastUpdated = new Date();
    await portfolio.save({ session });

    // Update player popularity
    player.popularity = await Portfolio.countDocuments({
      'holdings.player': playerId
    }).session(session);
    await player.save({ session });

    // Create transaction record
    await Transaction.create([{
      user: user._id,
      player: player._id,
      type: 'BUY',
      quantity,
      pricePerUnit: player.currentPrice,
      totalAmount: totalCost,
      balanceBefore,
      balanceAfter: user.balance
    }], { session });

    await session.commitTransaction();

    res.json({
      message: 'Player purchased successfully',
      balance: user.balance,
      transaction: {
        type: 'BUY',
        player: player.name,
        quantity,
        totalCost
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Buy player error:', error);
    res.status(500).json({ message: 'Failed to purchase player' });
  } finally {
    session.endSession();
  }
};

export const sellPlayer = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { playerId, quantity } = req.body;

    if (!playerId || !quantity || quantity < 1) {
      await session.abortTransaction();
      res.status(400).json({ message: 'Invalid request' });
      return;
    }

    // Get user, player, and portfolio
    const [user, player, portfolio] = await Promise.all([
      User.findById(req.user?.id).session(session),
      Player.findById(playerId).session(session),
      Portfolio.findOne({ user: req.user?.id }).session(session)
    ]);

    if (!user || !player || !portfolio) {
      await session.abortTransaction();
      res.status(404).json({ message: 'User, player, or portfolio not found' });
      return;
    }

    // Find holding
    const holdingIndex = portfolio.holdings.findIndex(
      (h: any) => h.player.toString() === playerId
    );

    if (holdingIndex === -1) {
      await session.abortTransaction();
      res.status(400).json({ message: 'Player not in portfolio' });
      return;
    }

    const holding = portfolio.holdings[holdingIndex];

    if (holding.quantity < quantity) {
      await session.abortTransaction();
      res.status(400).json({ message: 'Insufficient quantity to sell' });
      return;
    }

    const totalRevenue = player.currentPrice * quantity;
    const investedAmount = holding.purchasePrice * quantity;

    // Update user balance
    const balanceBefore = user.balance;
    user.balance += totalRevenue;
    await user.save({ session });

    // Update portfolio
    if (holding.quantity === quantity) {
      // Remove holding completely
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      // Reduce quantity
      holding.quantity -= quantity;
    }

    portfolio.totalInvested -= investedAmount;
    portfolio.lastUpdated = new Date();
    await portfolio.save({ session });

    // Update player popularity
    player.popularity = await Portfolio.countDocuments({
      'holdings.player': playerId
    }).session(session);
    await player.save({ session });

    // Create transaction record
    await Transaction.create([{
      user: user._id,
      player: player._id,
      type: 'SELL',
      quantity,
      pricePerUnit: player.currentPrice,
      totalAmount: totalRevenue,
      balanceBefore,
      balanceAfter: user.balance
    }], { session });

    await session.commitTransaction();

    const profit = totalRevenue - investedAmount;
    const profitPercent = (profit / investedAmount) * 100;

    res.json({
      message: 'Player sold successfully',
      balance: user.balance,
      transaction: {
        type: 'SELL',
        player: player.name,
        quantity,
        totalRevenue,
        profit,
        profitPercent
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Sell player error:', error);
    res.status(500).json({ message: 'Failed to sell player' });
  } finally {
    session.endSession();
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 50 } = req.query;

    const transactions = await Transaction.find({ user: req.user?.id })
      .populate('player', 'name team position imageUrl')
      .sort('-createdAt')
      .limit(Number(limit));

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};
