import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './schemas/subjects.schema';
import { User } from '../users/schemas/user.schema';
import { Role } from '../auth/enums/role.enum';
import { EnrollSubjectDto } from './dto/enroll-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  async update(updateSubjectDto: UpdateSubjectDto) {
    const { id, ...rest } = updateSubjectDto;
    const subject = await this.subjectModel.findByIdAndUpdate(id, rest, {
      new: true,
    });
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

  async enrollUsers(subjectId: string, userIds: Types.ObjectId[]) {
    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const users = await this.userModel.find({
      _id: { $in: userIds },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('Some users were not found');
    }

    const students = [];
    const teachers = [];

    users.forEach((user) => {
      const isStudentEnrolled = subject.enrolledStudents.some(
        (student) => student._id.toString() === user._id.toString(),
      );
      const isTeacherEnrolled = subject.enrolledTeachers.some(
        (teacher) => teacher._id.toString() === user._id.toString(),
      );
      if (user.role === Role.STUDENT) {
        if (isStudentEnrolled) {
        } else {
          students.push({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          });
        }
      } else if (user.role === Role.TEACHER) {
        if (isTeacherEnrolled) {
        } else {
          teachers.push({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          });
        }
      }
    });

    const updatedSubject = await this.subjectModel
      .findByIdAndUpdate(
        subjectId,
        {
          $addToSet: {
            enrolledStudents: { $each: students },
            enrolledTeachers: { $each: teachers },
          },
        },
        { new: true },
      )
      .populate('enrolledStudents', '_id name email avatar')
      .populate('enrolledTeachers', '_id name email avatar');

    return {
      message: 'Users enrolled successfully',
      enrolledStudents: updatedSubject.enrolledStudents,
      enrolledTeachers: updatedSubject.enrolledTeachers,
    };
  }

  async getEnrolledUsers(enrollSubjectDto: EnrollSubjectDto) {
    const { role, subjectId } = enrollSubjectDto;
    if (!role || !subjectId) {
      throw new BadRequestException('Role and subjectId are required');
    }

    const subject = await this.subjectModel
      .findById(subjectId)
      .populate(
        role === Role.STUDENT ? 'enrolledStudents' : 'enrolledTeachers',
        'name email avatar role',
      );

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return {
      enrolledUsers:
        role === Role.STUDENT
          ? subject.enrolledStudents
          : subject.enrolledTeachers,
    };
  }

  async getNotEnrolledUsers(subjectId: string) {
    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const notEnrolledUsers = await this.userModel.find(
      {
        $and: [
          {
            _id: {
              $nin: [...subject.enrolledStudents, ...subject.enrolledTeachers],
            },
          },
          { role: { $in: [Role.STUDENT, Role.TEACHER] } },
        ],
      },
      'name email role',
    );

    return notEnrolledUsers;
  }

  async seedSubjects(userId: string) {
    const subjects = await this.subjectModel.insertMany([
      {
        name: 'Mathematics Fundamentals',
        description:
          'Basic concepts of algebra, geometry, and calculus for beginners',
        isActive: true,
        price: 299,
        userId,
      },
      {
        name: 'Advanced Physics',
        description:
          'In-depth study of mechanics, thermodynamics, and quantum physics',
        isActive: true,
        price: 399,
        userId,
      },
      {
        name: 'English Literature',
        description: 'Analysis of classic and contemporary literary works',
        isActive: true,
        price: 249,
        userId,
      },
      {
        name: 'World History',
        description:
          'Comprehensive study of major historical events and civilizations',
        isActive: true,
        price: 279,
        userId,
      },
      {
        name: 'Computer Science Basics',
        description:
          'Introduction to programming, algorithms, and data structures',
        isActive: true,
        price: 349,
        userId,
      },
      {
        name: 'Biology Essentials',
        description: 'Study of living organisms, cells, and ecosystems',
        isActive: true,
        price: 289,
        userId,
      },
      {
        name: 'Chemistry 101',
        description:
          'Basic principles of atomic structure, chemical bonds, and reactions',
        isActive: true,
        price: 299,
        userId,
      },
      {
        name: 'Art History',
        description: 'Survey of major art movements and influential artists',
        isActive: true,
        price: 259,
        userId,
      },
      {
        name: 'Economics Principles',
        description: 'Understanding micro and macroeconomics concepts',
        isActive: true,
        price: 329,
        userId,
      },
      {
        name: 'Psychology Introduction',
        description: 'Basic concepts of human behavior and mental processes',
        isActive: true,
        price: 279,
        userId,
      },
      {
        name: 'Music Theory',
        description: 'Understanding rhythm, melody, harmony, and composition',
        isActive: true,
        price: 269,
        userId,
      },
      {
        name: 'Environmental Science',
        description: 'Study of ecosystems, climate change, and sustainability',
        isActive: true,
        price: 289,
        userId,
      },
      {
        name: 'Spanish Language',
        description: 'Basic to intermediate Spanish language skills',
        isActive: true,
        price: 299,
        userId,
      },
      {
        name: 'Digital Marketing',
        description: 'Modern marketing strategies and social media management',
        isActive: true,
        price: 349,
        userId,
      },
      {
        name: 'Photography Basics',
        description:
          'Understanding camera functions and composition techniques',
        isActive: true,
        price: 279,
        userId,
      },
      {
        name: 'Creative Writing',
        description: 'Developing fiction and non-fiction writing skills',
        isActive: true,
        price: 259,
        userId,
      },
      {
        name: 'Public Speaking',
        description: 'Improving presentation and communication skills',
        isActive: true,
        price: 289,
        userId,
      },
      {
        name: 'Nutrition Science',
        description: 'Understanding dietary needs and healthy eating habits',
        isActive: true,
        price: 269,
        userId,
      },
      {
        name: 'Web Development',
        description: 'Learning HTML, CSS, and JavaScript fundamentals',
        isActive: true,
        price: 399,
        userId,
      },
      {
        name: 'Business Management',
        description: 'Basic principles of organization and leadership',
        isActive: true,
        price: 349,
        userId,
      },
    ]);
    return subjects;
  }
}
