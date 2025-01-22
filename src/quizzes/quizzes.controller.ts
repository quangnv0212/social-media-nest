import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    createQuizDto.createdBy = req.user.userId;
    return this.quizzesService.create(createQuizDto);
  }

  @Post(':id/start')
  @Roles(Role.STUDENT)
  startQuiz(@Param('id') id: string, @Request() req) {
    return this.quizzesService.startQuiz(id, req.user.userId);
  }

  //   @Post('attempt/:id/submit')
  //   @Roles(Role.STUDENT)
  //   submitQuiz(
  //     @Param('id') attemptId: string,
  //     @Body() body: { answers: { questionId: string; answer: any }[] },
  //   ) {
  //     return this.quizzesService.submitQuiz(attemptId, body.answers);
  //   }
}
