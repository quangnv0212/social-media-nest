import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './schemas/quiz.schema';
import { QuizAttempt } from './schemas/quiz-attempt.schema';
import { Question } from '../questions/schemas/question.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttempt>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    // Verify all questions exist
    const questions = await this.questionModel.find({
      _id: { $in: createQuizDto.questions },
    });

    if (questions.length !== createQuizDto.questions.length) {
      throw new BadRequestException('Some questions do not exist');
    }

    const quiz = await this.quizModel.create(createQuizDto);
    return quiz.populate(['createdBy', 'subjectId']);
  }

  async startQuiz(quizId: string, userId: string) {
    const quiz = await this.quizModel.findById(quizId).populate('questions');

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if there's an incomplete attempt
    const existingAttempt = await this.quizAttemptModel.findOne({
      quizId,
      userId,
      completed: false,
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create new attempt
    const attempt = await this.quizAttemptModel.create({
      quizId,
      userId,
      score: 0,
      totalQuestions: quiz.questions.length,
      correctAnswers: 0,
      answers: [],
      completed: false,
    });

    return attempt;
  }

  //   async submitQuiz(
  //     attemptId: string,
  //     answers: { questionId: string; answer: any }[],
  //   ) {
  //     const attempt = await this.quizAttemptModel.findById(attemptId);
  //     if (!attempt || attempt.completed) {
  //       throw new BadRequestException('Invalid or completed attempt');
  //     }

  //     const quiz = await this.quizModel
  //       .findById(attempt.quizId)
  //       .populate('questions');

  //     let correctAnswers = 0;
  //     let totalScore = 0;
  //     const scoredAnswers = [];

  //     // Score each answer
  //     for (const answer of answers) {
  //       const question = quiz.questions.find(
  //         (q) => q._id.toString() === answer.questionId,
  //       );
  //       const isCorrect = this.checkAnswer(question, answer.answer);

  //       scoredAnswers.push({
  //         questionId: answer.questionId,
  //         userAnswer: answer.answer,
  //         isCorrect,
  //         points: isCorrect ? question.points || 1 : 0,
  //       });

  //       if (isCorrect) {
  //         correctAnswers++;
  //         totalScore += question.points || 1;
  //       }
  //     }

  //     // Update attempt
  //     attempt.answers = scoredAnswers;
  //     attempt.score = totalScore;
  //     attempt.correctAnswers = correctAnswers;
  //     attempt.completed = true;
  //     attempt.completedAt = new Date();
  //     await attempt.save();

  //     return {
  //       score: totalScore,
  //       totalQuestions: quiz.questions.length,
  //       correctAnswers,
  //       passed: totalScore >= quiz.passingScore,
  //       answers: scoredAnswers,
  //     };
  //   }

  private checkAnswer(question: Question, userAnswer: any): boolean {
    switch (question.type) {
      case 'multiple-choice':
        return question.choice.find((c) => c.isCorrect)?.id === userAnswer;
      case 'true-false':
        return question.answer === userAnswer;
      // Add more question types as needed
      default:
        return false;
    }
  }
}
