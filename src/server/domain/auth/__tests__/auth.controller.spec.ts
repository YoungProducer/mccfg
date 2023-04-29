import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UsersService } from 'server/domain/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import {
  UserEntity,
  UserRoles,
} from 'server/domain/users/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SignUpResponseDto } from '../dto/sign-up-response.dto';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { TokensService } from 'server/domain/tokens/tokens.service';
import { RefreshTokenEntity } from 'server/domain/tokens/entities/refresh-token.entity';
import { ConfigModule } from 'server/config/config.module';
import { JWTService } from 'server/domain/tokens/jwt/jwt.service';
import { RefreshService } from 'server/domain/tokens/refresh/refresh.service';
import { SignInResponseDto } from '../dto/sign-in-response.dto';

describe('CONTROLLER Auth', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let tokensService: TokensService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        TokensService,
        JWTService,
        RefreshService,
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    tokensService = moduleRef.get<TokensService>(TokensService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(tokensService).toBeDefined();
  });

  describe('API signUp', () => {
    it('should throw an error if error occurs', async () => {
      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new ConflictException('error'));

      const call = authController.signUp({
        email: 'email',
        password: 'password',
        username: 'username',
      });

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError('error');
    });

    it('should return an expected dto if there are no erros', async () => {
      const expectedUser: UserDto = {
        email: 'email',
        id: 1,
        username: 'username',
        role: UserRoles.READ,
      };

      const userToReturn: UserEntity = {
        ...expectedUser,
        configs: [],
        confirmationToken: null,
        hash: 'hash',
        salt: 'salt',
        verified: false,
        refreshTokens: [],
        role: UserRoles.READ,
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(userToReturn);

      const expectedValue = plainToInstance(SignUpResponseDto, {
        user: expectedUser,
      });

      expect(
        await authController.signUp({
          email: 'email',
          password: 'pass',
          username: 'username',
        }),
      ).toEqual(expectedValue);
    });
  });

  describe('API signIn', () => {
    it('should throw an error if error occurs', () => {
      const exception = UnauthorizedException;
      const errorMsg = 'error';

      jest
        .spyOn(authService, 'verifyCredentianls')
        .mockRejectedValue(new exception(errorMsg));

      const call = authController.signIn({
        password: 'pass',
        username: 'user',
      });

      expect(call).rejects.toThrow(exception);
      expect(call).rejects.toThrowError(errorMsg);
    });

    it('should return an expected dto if user passed validation', async () => {
      const userToReturn = <UserEntity>{
        username: 'username',
        email: 'email',
        hash: 'hash',
        salt: 'salt',
        id: 1,
        role: UserRoles.READ,
      };

      jest
        .spyOn(authService, 'verifyCredentianls')
        .mockResolvedValue(userToReturn);

      const accessToken = 'access';
      const refreshToken = 'refresh';

      jest
        .spyOn(tokensService, 'issueTokensPair')
        .mockResolvedValue([accessToken, refreshToken]);

      const expectedUser: UserDto = {
        username: userToReturn.username,
        email: userToReturn.email,
        id: userToReturn.id,
        role: UserRoles.READ,
      };

      const expected: SignInResponseDto = {
        accessToken,
        refreshToken,
        user: expectedUser,
      };

      const result = await authController.signIn({
        password: 'password',
        username: 'username',
      });

      expect(result).toEqual(expected);
    });
  });
});
