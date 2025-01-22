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
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { EnrollUsersDto } from './dto/enroll-users.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

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

  @Put()
  update(@Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(updateSubjectDto);
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

  @Post('seed')
  @Roles(Role.ADMIN)
  async seedSubjects(@Request() req) {
    return this.subjectsService.seedSubjects(req.user.userId);
  }
}
