import { createMock } from '@golevelup/ts-jest';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { RolesGuard } from '../roles.guard';
import { rolesErrorMessages } from '../constants/error-messages';

describe('GUARD Roles', () => {
  it('should throw UnauthorizedException if user object missing in query', () => {
    const mockReflector = createMock<Reflector>();

    mockReflector.get.mockReturnValue([]);

    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({});

    const guard = new RolesGuard(mockReflector);

    const call = guard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError(
      rolesErrorMessages.getUserUnathorizedErr(),
    );
  });

  it('should throw UnauthorizedException if user does not have enough grants', () => {
    const mockReflector = createMock<Reflector>();

    // make the reflector return grants the allows only admin
    // to access the API
    mockReflector.get.mockReturnValue(['admin']);

    const mockContext = createMock<ExecutionContext>();

    // mock request so user that "makes" request
    // is only granted to get access to Read-Only API
    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        role: 'read',
      },
    });

    const guard = new RolesGuard(mockReflector);

    const call = guard.canActivate(mockContext);

    expect(call).rejects.toThrow(UnauthorizedException);
    expect(call).rejects.toThrowError(
      rolesErrorMessages.getUserHasNoGrantsErr(),
    );
  });

  it('should return "true" if user have enough grants and there is only one grant', async () => {
    const mockReflector = createMock<Reflector>();

    // make the reflector return grants the allows only admin
    // to access the API
    mockReflector.get.mockReturnValue(['admin']);

    const mockContext = createMock<ExecutionContext>();

    // mock request so user that "makes" request
    // is only granted to get access to Admin-Only API
    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        role: 'admin',
      },
    });

    const guard = new RolesGuard(mockReflector);

    const isCanActivate = await guard.canActivate(mockContext);

    expect(isCanActivate).toBeTruthy();
  });

  it('should return "true" if user have enough grants and there are more than one grant', async () => {
    const mockReflector = createMock<Reflector>();

    // make the reflector return grants the allows users
    // with eaither admin or write privilege to access the API
    mockReflector.get.mockReturnValue(['admin', 'write']);

    const mockContext = createMock<ExecutionContext>();

    // mock request so user that "makes" request
    // is only granted to get access to Write-Only API
    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        role: 'write',
      },
    });

    const guard = new RolesGuard(mockReflector);

    expect(await guard.canActivate(mockContext)).toBeTruthy();

    // mock request so user that "makes" request
    // is only granted to get access to Admin-Only API
    mockContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        role: 'admin',
      },
    });

    expect(await guard.canActivate(mockContext)).toBeTruthy();
  });
});
