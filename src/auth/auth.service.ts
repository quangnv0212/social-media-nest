import { comparePasswordHelper } from '@/helpers/utils';
import { User } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOne(email);
    const isMatch = await comparePasswordHelper(password, user.password);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      message: 'Login successful',
      result: {
        access_token: accessToken,
        refresh_token: refreshToken.token,
      },
    };
  }

  private async createRefreshToken(
    userId: Types.ObjectId,
  ): Promise<RefreshToken> {
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn,
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshToken = await this.refreshTokenModel.create({
      token,
      userId,
      expiresAt,
    });

    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.refreshTokenModel.findOne({
        token: refreshToken,
        isRevoked: false,
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found or revoked');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.usersService.findOne(payload.email);
      const accessToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
      });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string) {
    await this.refreshTokenModel.findOneAndUpdate(
      { token },
      { isRevoked: true },
    );
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      // Verify the refresh token is valid before revoking
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Revoke the refresh token
      await this.revokeRefreshToken(refreshToken);
      return {
        message: 'Logout successful',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  async getProfile(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }
}
