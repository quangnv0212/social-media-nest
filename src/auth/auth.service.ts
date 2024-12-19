import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import { User } from '@/users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { comparePasswordHelper } from '@/helpers/utils';

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
      access_token: accessToken,
      refresh_token: refreshToken.token,
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
}
