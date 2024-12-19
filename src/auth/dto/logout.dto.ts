// dto/logout.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
