import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  description?: string;
  type: 'video' | 'image' | 'audio' | 'text' | 'slideshow';
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  fileSize: number; // in bytes
  format: string;
  resolution?: string;
  tags: string[];
  category: string;
  status: 'draft' | 'approved' | 'rejected' | 'archived';
  uploadedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['video', 'image', 'audio', 'text', 'slideshow'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    min: 0
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  format: {
    type: String,
    required: true
  },
  resolution: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  uploadedBy: {
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
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ status: 1, type: 1 });
contentSchema.index({ category: 1, status: 1 });
contentSchema.index({ uploadedBy: 1 });
contentSchema.index({ tags: 1 });

export const Content = mongoose.model<IContent>('Content', contentSchema);
