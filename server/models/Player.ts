import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerStats {
  matchweek: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating: number;
  roi: number; // Return on investment percentage
}

export interface IPlayer extends Document {
  name: string;
  team: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  currentPrice: number;
  initialPrice: number;
  imageUrl?: string;
  stats: IPlayerStats[];
  totalROI: number; // Cumulative ROI
  popularity: number; // Number of users holding this player
  priceChangePercent: number;
  lastUpdated: Date;
}

const PlayerStatsSchema = new Schema<IPlayerStats>({
  matchweek: { type: Number, required: true },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  cleanSheet: { type: Boolean, default: false },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  minutesPlayed: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  roi: { type: Number, default: 0 } // ROI for this specific matchweek
});

const PlayerSchema = new Schema<IPlayer>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  team: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    enum: ['GK', 'DEF', 'MID', 'FWD'],
    required: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  initialPrice: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  stats: [PlayerStatsSchema],
  totalROI: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  priceChangePercent: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
PlayerSchema.index({ position: 1 });
PlayerSchema.index({ team: 1 });
PlayerSchema.index({ currentPrice: 1 });
PlayerSchema.index({ totalROI: -1 });

export default mongoose.model<IPlayer>('Player', PlayerSchema);
