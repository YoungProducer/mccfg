import { JWTService } from 'server/domain/tokens/jwt/jwt.service';
import { JWTGuard } from '../jwt.guard';
import { EnvConfig } from 'server/config/interfaces';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { UserDto } from 'server/domain/users/dto/user.dto';

describe('GUARD JWT', () => {
  let jwtGuard: JWTGuard;
  let jwtService: JWTService;
  const config = <EnvConfig>{
    JWT_SECRET: 'secret',
    JWT_EXPIRES_IN: '3m',
  };

  beforeAll(() => {
    jwtService = new JWTService();
    jwtGuard = new JWTGuard(jwtService, config);
  });

  it('should be defined', () => {
    expect(jwtGuard).toBeDefined();
  });

  it('should throw UnathorizedException if header does not contain token', () => {
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: undefined,
      },
    });

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

    const call = jwtGuard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError('Token is expired!');
  });

  it('should pass validation if token is valid', async () => {
    const userData: UserDto = {
      email: 'email',
      id: 1,
      username: 'username',
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

    const res = await jwtGuard.canActivate(mockContext);

    expect(res).toBeTruthy();

    const request = mockContext.switchToHttp().getRequest();

    // assure that request has user object after success validation
    expect(request).toHaveProperty('user');
    expect(request['user']).toEqual(userData);
  });
});
