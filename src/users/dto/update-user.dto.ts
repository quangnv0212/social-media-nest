import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '@/auth/enums/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsMongoId({ message: 'ID is justified by MongoId' })
  @IsNotEmpty({ message: 'ID is required' })
  id: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  role?: Role;
}
