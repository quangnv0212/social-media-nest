import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  IsUrl,
} from 'class-validator';

export class MediaDto {
  @IsUrl()
  url: string;

  @IsEnum(['image', 'video'])
  type: string;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  media?: MediaDto[];
}
