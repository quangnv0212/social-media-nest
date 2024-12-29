import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { multerConfig } from '@/config/multer.config';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    if (req.user.role === Role.TEACHER) {
      this.usersService.create({
        ...createUserDto,
        role: Role.STUDENT,
      });
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll(
    @Query() query: string,
    @Query('currentPage') currentPage: number,
    @Query('pageSize') pageSize: number,
    @Request() req,
  ) {
    if (req.user.role === Role.TEACHER) {
      return this.usersService.findAll(query, currentPage, pageSize, [
        Role.TEACHER,
        Role.ADMIN,
      ]);
    }
    return this.usersService.findAll(query, currentPage, pageSize);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === Role.TEACHER) {
      const userToFind = await this.usersService.findOneById(id);
      if (userToFind.role !== Role.STUDENT) {
        throw new UnauthorizedException('Teachers can only find students');
      }
    }
    return this.usersService.findOneById(id);
  }

  @Put()
  @Roles(Role.ADMIN, Role.TEACHER)
  async update(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    if (req.user.role === Role.TEACHER) {
      const userToUpdate = await this.usersService.findOneById(
        updateUserDto.id,
      );
      if (userToUpdate.role !== Role.STUDENT) {
        throw new UnauthorizedException('Teachers can only update students');
      }
    }
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async remove(@Param('id') id: string, @Request() req) {
    if (req.user.role === Role.TEACHER) {
      const userToDelete = await this.usersService.findOneById(id);
      if (userToDelete.role !== Role.STUDENT) {
        throw new UnauthorizedException('Teachers can only delete students');
      }
    }
    return this.usersService.remove(id);
  }

  @Post('create-users')
  createUsers() {
    return this.usersService.createUsers();
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.usersService.updateAvatar(userId, file.filename);
  }
}
