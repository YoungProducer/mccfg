import { Test } from '@nestjs/testing';
import { JWTService } from '../jwt/jwt.service';
import { RefreshService } from '../refresh/refresh.service';
import { TokensService } from '../tokens.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { DeepPartial, Repository } from 'typeorm';
import { ConfigModule } from 'server/config/config.module';
import { UsersService } from 'server/domain/users/users.service';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('SERVICE Tokens', () => {
  let tokensService: TokensService;
  let jwtService: JWTService;
  let refreshService: RefreshService;

  let refreshTokensRepo: Repository<RefreshTokenEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ folder: './configs' })],
      providers: [
        TokensService,
        JWTService,
        RefreshService,
        UsersService,
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    tokensService = moduleRef.get<TokensService>(TokensService);
    jwtService = moduleRef.get<JWTService>(JWTService);
    refreshService = moduleRef.get<RefreshService>(RefreshService);

    refreshTokensRepo = moduleRef.get<Repository<RefreshTokenEntity>>(
      getRepositoryToken(RefreshTokenEntity),
    );
  });

  it('should be defined', () => {
    expect(tokensService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(refreshService).toBeDefined();
  });

  describe('METHOD issueTokensPair', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return tokens pair if there are no errors', async () => {
      const accessToken = 'access';
      const refreshToken = 'refresh';

      jest.spyOn(jwtService, 'signToken').mockResolvedValue(accessToken);
      jest.spyOn(refreshService, 'create').mockResolvedValue(refreshToken);

      const [resultAccess, resultRefresh] = await tokensService.issueTokensPair(
        {
          email: 'email',
          id: 1,
          username: 'user',
        },
      );

      expect(resultAccess).toBe(`Bearer ${accessToken}`);
      expect(resultRefresh).toBe(refreshToken);
    });

    it('should throw an error if refresh service faced issues', () => {
      const accessToken = 'access';

      jest.spyOn(jwtService, 'signToken').mockResolvedValue(accessToken);
      jest
        .spyOn(refreshService, 'create')
        .mockRejectedValue(new ConflictException('error'));

      const call = tokensService.issueTokensPair({
        email: 'email',
        id: 1,
        username: 'user',
      });

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError('error');
    });
  });

  describe('METHOD refresh', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a new tokens pair and remove the previous refresh token', async () => {
      const mockTokensPair = ['access', 'refresh'] as [string, string];

      const spyIssue = jest
        .spyOn(tokensService, 'issueTokensPair')
        .mockResolvedValue(mockTokensPair);

      const user: DeepPartial<UserEntity> = {
        id: 1,
        email: 'email',
        username: 'username',
      };

      const tokenEntityToReturn: DeepPartial<RefreshTokenEntity> = {
        id: 1,
        token: 'token',
        user,
      };

      jest
        .spyOn(refreshService, 'validate')
        .mockResolvedValue(tokenEntityToReturn as RefreshTokenEntity);

      const removeSpy = jest
        .spyOn(refreshTokensRepo, 'remove')
        .mockResolvedValue(undefined);

      const result = await tokensService.refresh('token');

      expect(result).toEqual(mockTokensPair);
      expect(spyIssue).toBeCalledWith(user);
      expect(removeSpy).toBeCalledWith(tokenEntityToReturn);
    });

    it('should throw an error if validation failed', () => {
      const errorMsg = 'error';

      jest
        .spyOn(refreshService, 'validate')
        .mockRejectedValue(new UnauthorizedException(errorMsg));

      const call = tokensService.refresh('token');

      expect(call).rejects.toThrow(UnauthorizedException);
      expect(call).rejects.toThrowError(errorMsg);
    });

    it('should throw an error if "issueTokensPair" failed', () => {
      const errorMsg = 'error';

      jest.spyOn(refreshService, 'validate').mockResolvedValue({} as any);

      jest
        .spyOn(tokensService, 'issueTokensPair')
        .mockRejectedValue(new UnauthorizedException(errorMsg));

      const call = tokensService.refresh('token');

      expect(call).rejects.toThrow(UnauthorizedException);
      expect(call).rejects.toThrowError(errorMsg);
    });
  });
});
