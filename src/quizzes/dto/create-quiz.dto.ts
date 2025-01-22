import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  totalPoints: number;

  @IsNumber()
  @IsNotEmpty()
  passingScore: number;

  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  questions: string[];

  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
