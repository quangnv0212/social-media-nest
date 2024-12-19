import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query() query: string,
    @Query('currentPage') currentPage: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.usersService.findAll(query, currentPage, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Get user successfully',
      user: this.usersService.findOne(id),
    };
  }

  @Put()
  update(@Body() updateUserDto: UpdateUserDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Update user successfully',
      user: this.usersService.update(updateUserDto.id, updateUserDto),
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete user successfully',
    };
  }

  @Post('create-users')
  createUsers() {
    return this.usersService.createUsers();
  }
}
