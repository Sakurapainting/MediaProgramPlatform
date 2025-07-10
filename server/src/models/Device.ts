import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  type: 'led_screen' | 'lcd_display' | 'projector' | 'tv' | 'mobile_app' | 'android_screen';
  location: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    region?: string;
    city?: string;
  };
  specifications: {
    resolution: string;
    size: string;
    orientation: 'horizontal' | 'vertical';
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  isActive: boolean;
  lastHeartbeat?: Date;
  currentContent?: {
    campaignId?: mongoose.Types.ObjectId;
    contentId?: mongoose.Types.ObjectId;
    playingAt?: Date;
  };
  mqtt?: {
    clientId: string;
    isConnected: boolean;
    lastConnectedAt?: Date;
    lastDisconnectedAt?: Date;
    subscriptions: string[];
    messageCount: number;
    lastMessage?: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['led_screen', 'lcd_display', 'projector', 'tv', 'mobile_app', 'android_screen'],
    required: true
  },
  location: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    region: String,
    city: String
  },
  specifications: {
    resolution: { type: String, required: true },
    size: { type: String, required: true },
    orientation: {
      type: String,
      enum: ['horizontal', 'vertical'],
      default: 'horizontal'
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance', 'error'],
    default: 'offline'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastHeartbeat: {
    type: Date
  },
  currentContent: {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    contentId: { type: Schema.Types.ObjectId, ref: 'Content' },
    playingAt: Date
  },
  mqtt: {
    clientId: { type: String, sparse: true },
    isConnected: { type: Boolean, default: false },
    lastConnectedAt: Date,
    lastDisconnectedAt: Date,
    subscriptions: [{ type: String }],
    messageCount: { type: Number, default: 0 },
    lastMessage: String
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for queries
// deviceSchema.index({ 'location.coordinates': '2dsphere' }); // 暂时禁用地理索引
deviceSchema.index({ status: 1, isActive: 1 });
deviceSchema.index({ type: 1, status: 1 });
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ 'mqtt.clientId': 1 });

// 在删除设备前，从关联的活动中移除该设备
deviceSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const device = this;
  try {
    // @ts-ignore
    const Campaign = mongoose.model('Campaign');
    await Campaign.updateMany(
      { targetDevices: device._id },
      { $pull: { targetDevices: device._id } }
    );
    next();
  } catch (error: any) { 
    next(error);
  }
});

export const Device = mongoose.model<IDevice>('Device', deviceSchema);
