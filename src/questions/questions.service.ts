import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './schemas/question.schema';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = await this.questionModel.create(createQuestionDto);
    return question;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    subjectId?: string,
    search?: string,
  ) {
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.questionModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('subjectId', 'name')
        .exec(),
      this.questionModel.countDocuments(query),
    ]);

    return {
      data: questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const question = await this.questionModel
      .findById(id)
      .populate('subjectId', 'name');

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionModel
      .findByIdAndUpdate(id, updateQuestionDto, { new: true })
      .populate('subjectId', 'name');

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async remove(id: string) {
    const question = await this.questionModel.findByIdAndDelete(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return { message: 'Question deleted successfully' };
  }
}
