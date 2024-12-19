import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'post_interactions',
})
export class PostInteraction extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Post' })
  postId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['like', 'share', 'bookmark'] })
  type: string;
}

export const PostInteractionSchema =
  SchemaFactory.createForClass(PostInteraction);

// Compound index for efficient queries and to prevent duplicate interactions
PostInteractionSchema.index(
  { postId: 1, userId: 1, type: 1 },
  { unique: true },
);

// Index for querying user interactions
PostInteractionSchema.index({ userId: 1, type: 1 });

// Index for counting interactions by type
PostInteractionSchema.index({ postId: 1, type: 1 });
