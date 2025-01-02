import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubjectsService } from './subjects.service';
import { EnrollUsersDto } from './dto/enroll-users.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Request() req, @Body() createSubjectDto: CreateSubjectDto) {
    createSubjectDto.userId = req.user.userId;
    return this.subjectsService.create({
      ...createSubjectDto,
      userId: req.user.userId,
    });
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('isActive') isActive?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.subjectsService.findAll(
      page,
      limit,
      name,
      minPrice,
      maxPrice,
      isActive,
      sortBy,
      sortOrder,
    );
  }

  @Get('enrolled-users')
  @Roles(Role.ADMIN, Role.TEACHER)
  getEnrolledUsers(
    @Query('role') role: Role,
    @Query('subjectId') subjectId: string,
  ) {
    return this.subjectsService.getEnrolledUsers({
      role,
      subjectId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }

  @Post(':id/enroll')
  @Roles(Role.ADMIN)
  enrollUsers(@Param('id') id: string, @Body() enrollUsersDto: EnrollUsersDto) {
    return this.subjectsService.enrollUsers(id, enrollUsersDto.userIds);
  }

  @Get(':id/not-enrolled-users')
  @Roles(Role.ADMIN)
  getNotEnrolledUsers(@Param('id') id: string) {
    return this.subjectsService.getNotEnrolledUsers(id);
  }
}
