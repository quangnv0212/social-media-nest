import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
