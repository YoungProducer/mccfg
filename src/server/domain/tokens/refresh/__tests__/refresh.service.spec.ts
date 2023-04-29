import { Test } from '@nestjs/testing';
import { RefreshService } from '../refresh.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../../entities/refresh-token.entity';
import { UsersService } from 'server/domain/users/users.service';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { refreshErrorMessages } from '../constants/error-messages';
import { ConfigModule } from 'server/config/config.module';

jest.mock('@nestjs/common/utils/random-string-generator.util', () => ({
  randomStringGenerator: () => 'token',
}));

describe('SERVICE Refresh', () => {
  let refreshService: RefreshService;
  let usersService: UsersService;

  let refreshTokensRepo: Repository<RefreshTokenEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        RefreshService,
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    refreshService = moduleRef.get<RefreshService>(RefreshService);
    usersService = moduleRef.get<UsersService>(UsersService);

    refreshTokensRepo = moduleRef.get<Repository<RefreshTokenEntity>>(
      getRepositoryToken(RefreshTokenEntity),
    );

    jest.spyOn(refreshTokensRepo, 'create').mockImplementation((e: any) => e);
    jest.spyOn(refreshTokensRepo, 'save').mockImplementation((e: any) => e);
  });

  it('should be defined', () => {
    expect(refreshService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('METHOD create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw NotFoundException if user was not found', () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(undefined);

      const id = 1;

      const call = refreshService.create(id);

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        refreshErrorMessages.getUserNotFoundErr(id),
      );
    });

    it('should return a created token if there are no errors', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({
        id: 1,
      } as any);

      const resultToken = await refreshService.create(1);

      expect(resultToken).toBe('token');
    });
  });

  describe('METHOD validate', () => {
    it('should throw UnathorizedException if token does not exist database', () => {
      jest.spyOn(refreshTokensRepo, 'findOne').mockResolvedValue(undefined);

      const call = refreshService.validate('token');

      expect(call).rejects.toThrow(UnauthorizedException);
      expect(call).rejects.toThrowError(
        refreshErrorMessages.getInvalidTokenErr(),
      );
    });

    it('should return a token entity if token is valud', async () => {
      const expectedEntity = {
        token: 'token',
      };

      jest
        .spyOn(refreshTokensRepo, 'findOne')
        .mockResolvedValue(expectedEntity as any);

      const result = await refreshService.validate('token');

      expect(result).toEqual(expectedEntity);
    });
  });
});
