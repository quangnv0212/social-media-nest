import {
  IdNotValidException,
  UserExistsException,
  UserNotFoundException,
} from '@/exceptions/user.exception';
import { hashPasswordHelper } from '@/helpers/utils';
import { faker } from '@faker-js/faker';
import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { Role } from '@/auth/enums/role.enum';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUsers() {
    const listNewUsers: CreateUserDto[] = [];
    for (let i = 0; i < 5; i++) {
      const hashPassword = await hashPasswordHelper('123456');
      listNewUsers.push({
        email: faker.internet.email(),
        password: hashPassword,
        name: faker.person.fullName(),
        role: Role.STUDENT,
      });
    }
    for (let i = 0; i < 5; i++) {
      const hashPassword = await hashPasswordHelper('123456');
      listNewUsers.push({
        email: faker.internet.email(),
        password: hashPassword,
        name: faker.person.fullName(),
        role: Role.TEACHER,
      });
    }

    return this.userModel.insertMany(listNewUsers);
  }

  async isEmailExists(email: string) {
    return this.userModel.exists({ email });
  }
  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const isEmailExists = await this.isEmailExists(rest.email);
    if (isEmailExists) {
      throw new UserExistsException(rest.email);
    }
    const hashPassword = await hashPasswordHelper(password);
    return this.userModel.create({
      ...rest,
      password: hashPassword,
    });
  }

  async findAll(
    query: string,
    currentPage?: string | number,
    limit?: string | number,
    excludeRole?: Role[],
    filterRole?: Role,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const { filter, sort, projection, population } = aqp(query);
    delete filter.currentPage;
    delete filter.pageSize;
    delete filter.role;
    delete filter.search;
    delete filter.sortBy;
    delete filter.sortOrder;

    // Handle role filtering
    if (excludeRole) {
      filter.role = { $nin: excludeRole };
    }
    if (filterRole) {
      filter.role = filterRole;
    }

    // Handle search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Handle sorting
    let sortOptions = sort;
    if (sortBy) {
      sortOptions = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1,
      };
    }

    const page = Number(currentPage) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (page - 1) * pageSize;

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sortOptions as any)
      .select(projection)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: page,
        pageSize,
        total: totalItems,
        totalPages,
      },
      result,
    };
  }

  async findOne(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      console.error('FindOne error:', error);
      throw error;
    }
  }
  async findOneById(id: string) {
    return this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async remove(id: string) {
    const checkId = mongoose.Types.ObjectId.isValid(id);
    if (!checkId) {
      throw new IdNotValidException(id);
    }
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return {
      message: 'User deleted successfully',
    };
  }

  async updateAvatar(userId: string, filename: string) {
    const checkId = mongoose.Types.ObjectId.isValid(userId);
    if (!checkId) {
      throw new IdNotValidException(userId);
    }

    const avatarUrl = `${process.env.APP_URL}/uploads/avatars/${filename}`;
    const user = await this.userModel
      .findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true })
      .select('-password');

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Update avatar successfully',
      user,
    };
  }
}
