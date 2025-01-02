import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class EnrollUsersDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  userIds: Types.ObjectId[];
}
