import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { rolesErrorMessages } from './constants/error-messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    return await this.validate(request, roles);
  }

  private async validate(req: Request, roles: string[]): Promise<boolean> {
    const user: UserDto = req['user'];

    if (!user) {
      throw new UnauthorizedException(
        rolesErrorMessages.getUserUnathorizedErr(),
      );
    }

    if (!roles.includes(user.role)) {
      throw new UnauthorizedException(
        rolesErrorMessages.getUserHasNoGrantsErr(),
      );
    }

    return true;
  }
}
