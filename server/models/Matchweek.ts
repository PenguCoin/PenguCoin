import mongoose, { Document, Schema } from 'mongoose';

export interface IMatchweek extends Document {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: Date;
}

const MatchweekSchema = new Schema<IMatchweek>({
  weekNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
MatchweekSchema.index({ weekNumber: 1 });
MatchweekSchema.index({ isActive: 1 });

export default mongoose.model<IMatchweek>('Matchweek', MatchweekSchema);
