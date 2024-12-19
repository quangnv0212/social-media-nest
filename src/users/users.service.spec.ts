import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserExistsException,
  UserNotFoundException,
} from '@/exceptions/user.exception';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: '65f2d6a47594b1fd44226e12',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
  };

  const mockUserModel = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      jest.spyOn(model, 'exists').mockResolvedValueOnce(null);
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockUser as any));

      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw UserExistsException if email already exists', async () => {
      jest
        .spyOn(model, 'exists')
        .mockResolvedValueOnce({ _id: 'someId' } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        UserExistsException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      id: '65f2d6a47594b1fd44226e12',
      name: 'Updated Name',
    };

    it('should update user successfully', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockUser as any);

      const result = await service.update(updateUserDto.id, updateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw UserNotFoundException if user not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(null);

      await expect(
        service.update(updateUserDto.id, updateUserDto),
      ).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('remove', () => {
    const userId = '65f2d6a47594b1fd44226e12';

    it('should delete user successfully', async () => {
      jest
        .spyOn(model, 'findByIdAndDelete')
        .mockResolvedValueOnce(mockUser as any);

      const result = await service.remove(userId);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Delete user successfully');
    });

    it('should throw UserNotFoundException if user not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValueOnce(null);

      await expect(service.remove(userId)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
