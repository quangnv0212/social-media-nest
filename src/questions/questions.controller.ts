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
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createQuestionDto: CreateQuestionDto) {
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

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
