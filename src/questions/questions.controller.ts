import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

class ChoiceDto {
  @IsNotEmpty()
  value: any;

  @IsNotEmpty()
  isCorrect: boolean;

  @IsString()
  @IsOptional()
  id?: string;
}

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Request() req, @Body() createQuestionDto: CreateQuestionDto) {
    createQuestionDto.createdBy = req.user.userId;
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('subjectId') subjectId?: string,
    @Query('search') search?: string,
  ) {
    return this.questionsService.findAll(page, limit, type, subjectId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Put()
  @Roles(Role.ADMIN, Role.TEACHER)
  update(@Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsService.update(updateQuestionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @Post('seed')
  @Roles(Role.ADMIN)
  seedQuestions(@Request() req) {
    console.log(req.user);
    return this.questionsService.seedQuestions(
      '6790a12f6aa3fc34e58f9087',
      req.user.userId,
    );
  }
}
