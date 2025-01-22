import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Schema({ timestamps: true })
export class QuizAttempt {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  correctAnswers: number;

  @Prop({
    type: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        userAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        points: Number,
      },
    ],
  })
  answers: {
    questionId: string;
    userAnswer: any;
    isCorrect: boolean;
    points: number;
  }[];

  @Prop({ required: true })
  completed: boolean;

  @Prop()
  completedAt: Date;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

// Add indexes
QuizAttemptSchema.index({ quizId: 1, userId: 1 });
QuizAttemptSchema.index({ userId: 1 });
QuizAttemptSchema.index({ completed: 1 });
