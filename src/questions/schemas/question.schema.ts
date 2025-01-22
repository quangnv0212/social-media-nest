import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  answer: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.Mixed }] })
  choice: {
    value: any;
    isCorrect: boolean;
    id?: string;
  }[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  })
  subjectId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Add indexes
QuestionSchema.index({ title: 'text' });
QuestionSchema.index({ type: 1 });
QuestionSchema.index({ subjectId: 1 });
