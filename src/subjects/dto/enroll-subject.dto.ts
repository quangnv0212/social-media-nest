import { Role } from '@/auth/enums/role.enum';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export class EnrollSubjectDto {
  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
