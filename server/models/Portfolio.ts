import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolioItem {
  player: mongoose.Types.ObjectId;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  currentValue: number;
  roi: number;
}

export interface IPortfolio extends Document {
  user: mongoose.Types.ObjectId;
  holdings: IPortfolioItem[];
  totalValue: number;
  totalInvested: number;
  totalROI: number;
  lastUpdated: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>({
  player: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  currentValue: {
    type: Number,
    default: 0
  },
  roi: {
    type: Number,
    default: 0
  }
});

const PortfolioSchema = new Schema<IPortfolio>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  holdings: [PortfolioItemSchema],
  totalValue: {
    type: Number,
    default: 0
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  totalROI: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
PortfolioSchema.index({ user: 1 });
PortfolioSchema.index({ totalValue: -1 });

export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
