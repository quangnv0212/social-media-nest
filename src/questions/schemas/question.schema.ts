import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export enum QuestionType {
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  MULTIPLE_CHOICE = 'multiple_choice',
  SINGLE_CHOICE = 'single_choice',
}

interface Option {
  title: string;
  content: string;
}

@Schema({
  timestamps: true,
})
export class Question extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    required: function (this: Question) {
      return (
        this.type === QuestionType.MULTIPLE_CHOICE ||
        this.type === QuestionType.SINGLE_CHOICE
      );
    },
    validate: {
      validator: function (options: Option[]) {
        if (
          this.type !== QuestionType.MULTIPLE_CHOICE &&
          this.type !== QuestionType.SINGLE_CHOICE
        ) {
          return true;
        }
        return options && options.length > 0;
      },
      message: 'Options are required for multiple/single choice questions',
    },
  })
  options: Option[];

  @Prop({
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (value: string | string[]) {
        if (this.type === QuestionType.MULTIPLE_CHOICE) {
          return Array.isArray(value);
        }
        return true;
      },
      message:
        'Multiple choice questions must have an array of correct answers',
    },
  })
  correctAnswer: string | string[];

  @Prop()
  hint: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Add indexes
QuestionSchema.index({ title: 'text' });
QuestionSchema.index({ type: 1 });
QuestionSchema.index({ subjectId: 1 });
