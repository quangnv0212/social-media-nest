import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { Document } from 'mongoose';
import { faker } from '@faker-js/faker';
@Schema()
export class User extends Document {
  @Prop({ required: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: faker.image.avatar() })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
