import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { EnvConfig } from 'server/config/interfaces';
import { JWTService } from 'server/domain/tokens/jwt/jwt.service';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { Inject } from '@nestjs/common';
import { DI_CONFIG } from 'server/config/constants';
import { Reflector } from '@nestjs/core';
import { publicDecoratorToken } from '../decorators/public.decorator';
import { jwtGuardErrorMessages } from './constants/error-messages';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    private readonly jwtService: JWTService,

    @Inject(DI_CONFIG)
    private readonly config: EnvConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      publicDecoratorToken,
      context.getHandler(),
    );

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    return await this.validate(request);
  }

  private async extractToken(req: Request): Promise<string> {
    const tokenString = req.headers.authorization;

    if (!tokenString) {
      throw new UnauthorizedException(
        jwtGuardErrorMessages.getMissingTokenErr(),
      );
    }

    if (!tokenString.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        jwtGuardErrorMessages.getInvalidTokenErr(),
      );
    }

    const token = tokenString.slice('Bearer '.length);

    if (token.split('.').length !== 3) {
      throw new UnauthorizedException(
        jwtGuardErrorMessages.getTokenIsNotJwtErr(),
      );
    }

    return token;
  }

  async validate(req: Request): Promise<boolean> {
    const token = await this.extractToken(req);

    const data = await this.jwtService.verifyToken(
      token,
      this.config.JWT_SECRET,
    );

    const user = instanceToPlain(plainToInstance(UserDto, data));

    req['user'] = user;

    return !!data;
  }
}
