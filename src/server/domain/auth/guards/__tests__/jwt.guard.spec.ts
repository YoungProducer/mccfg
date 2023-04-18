import { JWTService } from 'server/domain/tokens/jwt/jwt.service';
import { JWTGuard } from '../jwt.guard';
import { EnvConfig } from 'server/config/interfaces';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { UserRoles } from 'server/domain/users/entities/user.entity';
import { Reflector } from '@nestjs/core';

describe('GUARD JWT', () => {
  let jwtService: JWTService;
  const config = <EnvConfig>{
    JWT_SECRET: 'secret',
    JWT_EXPIRES_IN: '3m',
  };

  const createJwtGuard = (reflector: Reflector) =>
    new JWTGuard(reflector, jwtService, config);

  beforeAll(() => {
    jwtService = new JWTService();
  });

  it('should throw UnathorizedException if header does not contain token', () => {
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: undefined,
      },
    });

    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue(undefined);

    const jwtGuard = createJwtGuard(mockReflector);

    const call = jwtGuard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError('Missing access token!');
  });

  it('should throw UnathorizedException if token does not starts with "Bearer "', () => {
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: 'token',
      },
    });

    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue(undefined);

    const jwtGuard = createJwtGuard(mockReflector);

    const call = jwtGuard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError('Invalid token type!');
  });

  it('should throw UnauthorizedException if token has invalid number of parts', () => {
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: 'Bearer adwa.adwa',
      },
    });

    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue(undefined);

    const jwtGuard = createJwtGuard(mockReflector);

    const call = jwtGuard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError('Token is not a type of JWT!');
  });

  it('should throw UnathorizedException if token is out of date', async () => {
    const token = await jwtService.signToken(
      {
        email: 'email',
        id: 1,
        username: 'username',
      },
      {
        expiresIn: '1ms',
        secret: config.JWT_SECRET,
      },
    );

    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue(undefined);

    const jwtGuard = createJwtGuard(mockReflector);

    const call = jwtGuard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError('Token is expired!');
  });

  it('should pass validation if token is valid', async () => {
    const userData: UserDto = {
      email: 'email',
      id: 1,
      username: 'username',
      role: UserRoles.READ,
    };

    const token = await jwtService.signToken(userData, {
      expiresIn: config.JWT_EXPIRES_IN,
      secret: config.JWT_SECRET,
    });

    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue(undefined);

    const jwtGuard = createJwtGuard(mockReflector);

    const res = await jwtGuard.canActivate(mockContext);

    expect(res).toBeTruthy();

    const request = mockContext.switchToHttp().getRequest();

    // assure that request has user object after success validation
    expect(request).toHaveProperty('user');
    expect(request['user']).toEqual(userData);
  });

  it('should skip validation if "isPublic" is true', async () => {
    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue(true);

    const mockContext = createMock<ExecutionContext>();

    const jwtGuard = createJwtGuard(mockReflector);

    expect(await jwtGuard.canActivate(mockContext)).toBeTruthy();
  });
});
