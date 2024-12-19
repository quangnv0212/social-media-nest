import {
  IdNotValidException,
  UserExistsException,
  UserNotFoundException,
} from '@/exceptions/user.exception';
import { hashPasswordHelper } from '@/helpers/utils';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUsers() {
    const listNewUsers: CreateUserDto[] = [];
    for (let i = 0; i < 10; i++) {
      listNewUsers.push({
        email: faker.internet.email(),
        password: '123456',
        name: faker.person.fullName(),
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
  ) {
    const { filter, sort, projection, population } = aqp(query);
    delete filter.currentPage;
    delete filter.pageSize;

    const page = Number(currentPage) || 1;
    const pageSize = Number(limit) || 10;

    const skip = (page - 1) * pageSize;
    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sort as any)
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
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UserNotFoundException(email);
    }
    return user;
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
    return null;
  }
}
