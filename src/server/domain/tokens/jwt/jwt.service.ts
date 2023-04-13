import { Injectable } from '@nestjs/common';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { sign, verify } from './helpers/jwt-async.helper';
import { SignOptions } from './interfaces/sign-options.interface';

@Injectable()
export class JWTService {
  public async signToken<T extends string | object | Buffer = UserDto>(
    data: T,
    options: SignOptions,
  ): Promise<string> {
    const token = await sign(data, options.secret, {
      expiresIn: options.expiresIn,
    });

    return token;
  }

  public async verifyToken<T = UserDto>(
    token: string,
    secret: string,
  ): Promise<T> {
    return await verify(token, secret);
  }
}
