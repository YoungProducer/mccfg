import { UsersService } from 'server/domain/users/users.service';
import { AuthService } from '../auth.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { SignUpCredentials } from '../interfaces/sign-up-credentials.interface';

describe('SERVICE Auth', () => {
  let authService: AuthService;
  let usersService: UsersService;

  let confirmationTokensRepo: Repository<ConfirmationTokenEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
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
});
