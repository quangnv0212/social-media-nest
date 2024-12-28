import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './schemas/subjects.schema';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectModel.create(createSubjectDto);
    return subject.populate('userId', 'name email avatar');
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    name?: string,
    minPrice?: number,
    maxPrice?: number,
    isActive?: boolean,
    sortBy?: string,
    sortOrder?: string,
  ) {
    const query: any = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (minPrice !== undefined) {
      query.price = { $gte: minPrice };
    }
    if (maxPrice !== undefined) {
      query.price = { ...query.price, $lte: maxPrice };
    }
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      query[field] = { $sort: order === 'asc' ? 1 : -1 };
    }
    if (sortOrder) {
      query[sortBy] = { $sort: sortOrder === 'asc' ? 1 : -1 };
    }

    const skip = (page - 1) * limit;

    const subjects = await this.subjectModel
      .find(query)
      .populate('userId', 'name email avatar')
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.subjectModel.countDocuments(query);
    return {
      data: subjects,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const subject = await this.subjectModel
      .findById(id)
      .populate('userId', 'name email avatar');
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.subjectModel
      .findByIdAndUpdate(id, updateSubjectDto, { new: true })
      .populate('userId', 'name email avatar');
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async remove(id: string) {
    const subject = await this.subjectModel.findByIdAndDelete(id);
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return { message: 'Subject deleted successfully' };
  }
}
