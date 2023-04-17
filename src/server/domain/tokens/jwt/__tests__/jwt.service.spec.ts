import { Test } from '@nestjs/testing';
import { JWTService } from '../jwt.service';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { jwtErrorMessages } from '../constants/error-messages';
import { UserRoles } from 'server/domain/users/entities/user.entity';

describe('SERVICE JWT', () => {
  let jwtService: JWTService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [JWTService],
    }).compile();

    jwtService = moduleRef.get<JWTService>(JWTService);
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('should return a valid token', async () => {
    const data: UserDto = {
      email: 'email',
      id: 1,
      username: 'username',
      role: UserRoles.READ,
    };

    const token = await jwtService.signToken(data, {
      expiresIn: '3m',
      secret: 'secret',
    });

    expect(token.split('.')).toHaveLength(3);
  });

  it('should return valid data on verify', async () => {
    const secret = 'secret';

    const data: UserDto = {
      email: 'email',
      id: 1,
      username: 'username',
      role: UserRoles.READ,
    };

    const token = await jwtService.signToken(data, {
      expiresIn: '3m',
      secret,
    });

    const verifiedData = await jwtService.verifyToken(token, secret);

    expect(verifiedData).toEqual(expect.objectContaining(data));
  });

  it('should return an error if token is invalid', () => {
    const call = jwtService.verifyToken('dwada.dwad.adad', 'secret');

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError(jwtErrorMessages.getTokenInvalidErr());
  });

  it('should return an error if token is expired', async () => {
    const secret = 'secret';

    const token = await jwtService.signToken(
      {
        email: 'email',
        id: 1,
        username: 'username',
      },
      {
        expiresIn: '1ms',
        secret,
      },
    );

    const call = jwtService.verifyToken(token, secret);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError(jwtErrorMessages.getTokenExpiredErr());
  });
});
