import { UsersService } from 'server/domain/users/users.service';
import { AuthService } from '../auth.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { SignUpCredentials } from '../interfaces/sign-up-credentials.interface';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { authErrorMessages } from '../constants/error-messages';
import { ConfigModule } from 'server/config/config.module';

describe('SERVICE Auth', () => {
  let authService: AuthService;
  let usersService: UsersService;

  let confirmationTokensRepo: Repository<ConfirmationTokenEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);

    confirmationTokensRepo = moduleRef.get<Repository<ConfirmationTokenEntity>>(
      getRepositoryToken(ConfirmationTokenEntity),
    );

    jest
      .spyOn(confirmationTokensRepo, 'create')
      .mockImplementation((e: any) => e);

    jest
      .spyOn(confirmationTokensRepo, 'save')
      .mockImplementation((e: any) => e);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('METHOD signUp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return new user if there are no errors', async () => {
      const creds: SignUpCredentials = {
        username: 'username',
        password: 'hash',
        email: 'email',
      };

      const mockUser = {
        username: 'username',
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);

      expect(await authService.signUp(creds)).toEqual(mockUser);
    });
  });

  describe('METHOD verifyCredentials', () => {
    it('should throw NotFoundException if user with given "username" does not exist', () => {
      jest
        .spyOn(usersService, 'findOneByUsername')
        .mockResolvedValue(undefined);

      const username = 'username';

      const call = authService.verifyCredentianls({
        username,
        password: 'p',
      });

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        authErrorMessages.getUserNameNotExistErr(username),
      );
    });

    it('should throw UnauthorizedException if user is not verified', () => {
      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue({
        verified: false,
      } as any);

      const call = authService.verifyCredentianls({
        username: 'u',
        password: 'p',
      });

      expect(call).rejects.toThrow(UnauthorizedException);
      expect(call).rejects.toThrowError(
        authErrorMessages.getAccountNotVerifiedErr(),
      );
    });

    it('should throw UnauthorizedException if passwords do not match', () => {
      const username = 'username';

      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue({
        verified: true,
        username,
        hash: 'hash',
        salt: 'salt',
      } as any);

      const call = authService.verifyCredentianls({
        username,
        password: 'pass',
      });

      expect(call).rejects.toThrow(UnauthorizedException);
      expect(call).rejects.toThrowError(authErrorMessages.getInvalidPassErr());
    });

    it('should return user entity if credentials are valid', async () => {
      // correct credentials to pass validation
      const hash =
        '$2a$10$tf9asvYBpVTM.cyPpcJpGu0ICGYymf4Emk7id/az0syLB/J.N7weW';
      const salt = '3e0a31067a33d51675bb9';
      const password = 'password';
      const username = 'username';

      const expectedUser = {
        verified: true,
        hash,
        salt,
        username,
      };

      jest
        .spyOn(usersService, 'findOneByUsername')
        .mockResolvedValue(expectedUser as any);

      const resolvedUser = await authService.verifyCredentianls({
        password,
        username,
      });

      expect(resolvedUser).toEqual(expectedUser);
    });
  });
});
