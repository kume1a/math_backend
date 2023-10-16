import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ExceptionMessageCode, RandomGenerator } from '../../shared';
import {
  NewUser,
  SelectableUser,
  SelectableUserOmitPassword,
  User,
} from 'src/entities';
import { Selectable } from 'kysely';
import { RefreshTokenService } from '../refreshToken/refreshToken.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async getByEmail(email: string): Promise<SelectableUser | null> {
    return this.userRepository.getByEmail(email);
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<SelectableUserOmitPassword | null> {
    const userId = await this.refreshTokenService.getUserIdByValue(
      refreshToken,
    );

    if (!userId) {
      return null;
    }

    return this.userRepository.getById(userId);
  }

  async clearRefreshTokensForUser(userId: string): Promise<void> {
    return this.refreshTokenService.deleteAllByUserId(userId);
  }

  async addRefreshTokenByUserId(userId: string, value: string) {
    await this.refreshTokenService.create({ userId, value });
  }

  async deleteRefreshToken(refreshToken: string) {
    return this.refreshTokenService.deleteByValue(refreshToken);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.userRepository.existsByEmail(email);
  }

  async create(params: NewUser): Promise<Selectable<User>> {
    return this.userRepository.createUser(params);
  }

  async getById(id: string): Promise<SelectableUserOmitPassword> {
    const user = await this.userRepository.getById(id);

    if (!user) {
      throw new NotFoundException(ExceptionMessageCode.USER_NOT_FOUND);
    }

    return user;
  }

  async getIdByEmail(email: string): Promise<string> {
    const userId = await this.userRepository.getIdByEmail(email);

    if (!userId) {
      throw new NotFoundException(ExceptionMessageCode.USER_NOT_FOUND);
    }

    return userId;
  }

  async updatePasswordById(id: string, newHashedPassword: string) {
    return this.userRepository.updatePasswordById(id, newHashedPassword);
  }

  async validateUserById(id: string): Promise<void> {
    const userExists = await this.userRepository.existsById(id);

    if (!userExists) {
      throw new NotFoundException(ExceptionMessageCode.USER_NOT_FOUND);
    }
  }
}
