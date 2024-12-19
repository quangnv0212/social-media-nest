import { BadRequestException } from '@nestjs/common';

export class UserNotFoundException extends BadRequestException {
  constructor(id: string) {
    super(`User with id ${id} not found`);
  }
}

export class UserExistsException extends BadRequestException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class IdNotValidException extends BadRequestException {
  constructor(id: string) {
    super(`ID ${id} is not valid`);
  }
}
