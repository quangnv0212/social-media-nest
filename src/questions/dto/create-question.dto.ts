import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestionType } from '../schemas/question.schema';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsNotEmpty()
  @Type(() => String)
  correctAnswer: string | string[];

  @IsString()
  @IsOptional()
  hint?: string;

  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;
}
