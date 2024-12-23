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

  @Prop({ default: faker.image.avatar() })
  cover: string;

  @Prop({ default: faker.date.birthdate() })
  birthdate: Date;

  @Prop({ default: faker.location.country() })
  country: string;

  @Prop({ default: faker.location.city() })
  city: string;

  @Prop({ default: faker.location.state() })
  state: string;

  @Prop({ default: faker.location.zipCode() })
  zipCode: string;

  @Prop({ default: faker.phone.imei() })
  phone: string;

  @Prop({ default: faker.lorem.paragraph() })
  bio: string;

  @Prop({ default: faker.lorem.paragraph() })
  skills: string;

  @Prop({ default: faker.lorem.paragraph() })
  education: string;

  @Prop({ default: faker.lorem.paragraph() })
  experience: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
