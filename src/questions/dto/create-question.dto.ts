import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ChoiceDto {
  @IsOptional()
  value: any;
  @IsNotEmpty()
  isCorrect: boolean;

  @IsString()
  @IsOptional()
  id?: string;
}

export class CreateQuestionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  answer: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choice: ChoiceDto[];

  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;

  @IsMongoId()
  @IsOptional()
  createdBy: string;
}
