import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  duration: number; // in minutes

  @Prop({ required: true })
  totalPoints: number;

  @Prop({ required: true })
  passingScore: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questions: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  })
  subjectId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// Add indexes
QuizSchema.index({ title: 'text' });
QuizSchema.index({ subjectId: 1 });
QuizSchema.index({ createdBy: 1 });
