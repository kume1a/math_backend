import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ExceptionMessageCode } from '@shared/constant';
import { getContextRequest } from '@shared/util';

import { NO_AUTH_KEY } from '../decorator/noAuth.decorator';
import { getBearerTokenFromRequest } from '../util/getBearerTokenFromRequest';
import { JwtHelper } from '../util/jwt.helper';

@Injectable()
export class HttpJwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtHelper: JwtHelper,
  ) {}

  async canActivate(context: ExecutionContext) {
    const noAuth = this.reflector.getAllAndOverride<boolean>(NO_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (noAuth) {
      return true;
    }

    const req = getContextRequest(context);

    const accessToken = getBearerTokenFromRequest(req);

    if (!accessToken) {
      throw new UnauthorizedException(ExceptionMessageCode.MISSING_TOKEN);
    }

    const payload = this.jwtHelper.getUserPayload(accessToken);

    if (!payload) {
      throw new UnauthorizedException(ExceptionMessageCode.INVALID_TOKEN);
    }

    if (payload.isAdmin) {
      const isAccessTokenValid =
        await this.jwtHelper.isAdminAccessTokenValid(accessToken);

      if (!isAccessTokenValid) {
        throw new ForbiddenException(ExceptionMessageCode.EXPIRED_TOKEN);
      }

      return true;
    }

    const isAccessTokenValid =
      await this.jwtHelper.isAccessTokenValid(accessToken);

    if (!isAccessTokenValid) {
      throw new ForbiddenException(ExceptionMessageCode.EXPIRED_TOKEN);
    }

    return true;
  }
}
