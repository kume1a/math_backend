import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { UserService, UserValidator } from '@modules/user';
import { ExceptionMessageCode } from '@shared/constant';

import {
  AuthenticationPayload,
  SignUpWithTokenParams,
} from '../authentication.type';
import { JwtHelper, PasswordEncoder } from '../util';

@Injectable()
export class EmailSignUpUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly jwtHelper: JwtHelper,
    private readonly userValidator: UserValidator,
  ) {}

  async call({
    userName,
    email,
    password,
  }: SignUpWithTokenParams): Promise<AuthenticationPayload> {
    await this.userValidator.validateUniqueEmail(email);

    const hashedPassword = await this.passwordEncoder.encode(password);

    const user = await this.userService.create({
      email,
      userName,
      passwordHash: hashedPassword,
      isCompleted: true,
    });

    if (!user) {
      throw new InternalServerErrorException(
        ExceptionMessageCode.COULD_NOT_CREATE_USER,
      );
    }

    const { accessToken, refreshToken } =
      this.jwtHelper.generateAuthenticationTokens({ userId: user.id });

    await this.userService.addRefreshTokenByUserId(user.id, refreshToken);

    return { accessToken, refreshToken, hasEmailVerified: false };
  }
}
