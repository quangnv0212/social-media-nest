import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Post extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop([
    {
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], required: true },
    },
  ])
  media: { url: string; type: string }[];

  // Using counter cache pattern for better performance with large numbers
  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ default: 0 })
  bookmarksCount: number;

  // Store recent interactions for quick access
  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
    select: false, // Don't include by default in queries
  })
  recentLikes: { userId: Types.ObjectId; createdAt: Date }[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
    select: false,
  })
  recentShares: { userId: Types.ObjectId; createdAt: Date }[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
    select: false,
  })
  recentBookmarks: { userId: Types.ObjectId; createdAt: Date }[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Add indexes for better query performance
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ likesCount: -1 });
PostSchema.index({ sharesCount: -1 });
PostSchema.index({ bookmarksCount: -1 });
