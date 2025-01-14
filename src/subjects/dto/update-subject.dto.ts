import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectDto } from './create-subject.dto';
import { IsMongoId } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
