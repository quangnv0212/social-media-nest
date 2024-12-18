import { hashPasswordHelper } from '@/helpers/utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { faker } from '@faker-js/faker';
import {
  UserNotFoundException,
  UserExistsException,
} from '@/exceptions/user.exception';
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

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
