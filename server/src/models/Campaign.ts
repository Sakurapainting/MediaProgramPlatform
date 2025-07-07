import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description?: string;
  type: 'advertisement' | 'program' | 'emergency' | 'announcement';
  content: mongoose.Types.ObjectId[];
  targetDevices: mongoose.Types.ObjectId[];
  schedule: {
    startDate: Date;
    endDate: Date;
    timeSlots: {
      startTime: string; // HH:mm format
      endTime: string;   // HH:mm format
      daysOfWeek: number[]; // 0-6 (Sunday to Saturday)
    }[];
    timezone: string;
  };
  priority: number; // 1-10, higher number = higher priority
  frequency: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number; // For custom frequency
  };
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  targeting: {
    regions?: string[];
    cities?: string[];
    deviceTypes?: string[];
    tags?: string[];
  };
  analytics: {
    impressions: number;
    playCount: number;
    totalDuration: number; // in seconds
    deviceReach: number;
  };
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['advertisement', 'program', 'emergency', 'announcement'],
    required: true
  },
  content: [{
    type: Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  }],
  targetDevices: [{
    type: Schema.Types.ObjectId,
    ref: 'Device'
  }],
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timeSlots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }]
    }],
    timezone: { type: String, default: 'Asia/Shanghai' }
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  frequency: {
    type: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'once'
    },
    interval: Number
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  budget: {
    total: { type: Number, min: 0 },
    spent: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'CNY' }
  },
  targeting: {
    regions: [String],
    cities: [String],
    deviceTypes: [String],
    tags: [String]
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    playCount: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    deviceReach: { type: Number, default: 0 }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ status: 1, 'schedule.startDate': 1 });
campaignSchema.index({ type: 1, status: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ priority: -1, 'schedule.startDate': 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
