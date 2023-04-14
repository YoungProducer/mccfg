import { ConfigModule } from 'server/config/config.module';
import { TokensController } from '../tokens.controller';
import { TokensService } from '../tokens.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { UsersService } from 'server/domain/users/users.service';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { JWTService } from '../jwt/jwt.service';
import { RefreshService } from '../refresh/refresh.service';
import { UnauthorizedException } from '@nestjs/common';

describe('CONTROLLER Tokens', () => {
  let tokensController: TokensController;
  let tokensService: TokensService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ folder: './configs' })],
      controllers: [TokensController],
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

    tokensController = moduleRef.get<TokensController>(TokensController);
    tokensService = moduleRef.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(tokensController).toBeDefined();
    expect(tokensService).toBeDefined();
  });

  describe('API refresh', () => {
    it('should populate an error if tokens service', () => {
      const errorMsg = 'error';

      jest
        .spyOn(tokensService, 'refresh')
        .mockRejectedValue(new UnauthorizedException(errorMsg));

      const call = tokensController.refresh({
        refreshToken: 'token',
      });

      expect(call).rejects.toThrow(UnauthorizedException);
      expect(call).rejects.toThrowError('error');
    });

    it('should return a valid dto', async () => {
      const accessToken = 'access';
      const refreshToken = 'refresh';

      jest
        .spyOn(tokensService, 'refresh')
        .mockResolvedValue([accessToken, refreshToken]);

      const result = await tokensController.refresh({
        refreshToken: 'token',
      });

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });
});
